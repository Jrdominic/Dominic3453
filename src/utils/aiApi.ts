interface GenerateCodePayload {
  prompt: string;
  conversationHistory: Array<{ role: string; content: string; image?: string }>;
  image?: string;
}

interface GenerateCodeResponse {
  code: string;
  type: 'html' | 'react';
  title: string;
  description: string;
}

const normalizeType = (type: string | undefined): GenerateCodeResponse['type'] => {
  if (!type) return 'html';
  const lowered = type.toLowerCase();
  if (lowered.includes('react')) return 'react';
  if (lowered.includes('html') || lowered.includes('markup')) return 'html';
  return 'html';
};

const sanitizeReactCode = (code: string) => {
  if (!code) return '';

  // Remove common module syntax that breaks inline Babel execution
  let cleaned = code
    .replace(/import\s+[^;]+;?/g, '')
    .replace(/export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/g, 'function $1')
    .replace(/export\s+default\s+([A-Z][A-Za-z0-9_]*)/g, '$1')
    .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
    .replace(/export\s+\{[^}]+\};?/g, '');

  // Ensure the code is trimmed to avoid leading whitespace issues
  cleaned = cleaned.trim();

  return cleaned;
};

/* Environment variables (set in .env) */
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_API_URL; // e.g., http://localhost:11434 or http://localhost:11434/v1
const OLLAMA_API_KEY = import.meta.env.VITE_OLLAMA_API_KEY || 'ollama'; // any non‑empty key

/* ---------------------------------------------------------
   Build the final endpoint (bullet‑proof):
   1. Remove trailing slashes from the base URL.
   2. Ensure the base ends with exactly one "/v1".
   3. Append "/chat/completions".
   This works for both:
     - base: http://localhost:11434      → http://localhost:11434/v1/chat/completions
     - base: http://localhost:11434/v1 → http://localhost:11434/v1/chat/completions
   ---------------------------------------------------------- */
const sanitizedBase = OLLAMA_BASE_URL?.replace(/\/+$/g, '');
const baseWithV1 = sanitizedBase?.endsWith('/v1')
  ? sanitizedBase
  : sanitizedBase
  ? `${sanitizedBase}/v1`
  : undefined;
const OLLAMA_ENDPOINT = baseWithV1 ? `${baseWithV1}/chat/completions` : undefined;

export const generateCode = async (
  payload: GenerateCodePayload,
): Promise<GenerateCodeResponse> => {
  if (!OLLAMA_ENDPOINT) {
    throw new Error(
      'VITE_OLLAMA_API_URL must be defined in your .env (e.g., http://localhost:11434 or http://localhost:11434/v1).'
    );
  }

  // Debug: show the exact URL being called
  console.log('📡 Calling Ollama endpoint:', OLLAMA_ENDPOINT);

  const systemPrompt = `You are Cortex, an expert code generation AI. Generate complete, production‑ready code based on user requests.

CRITICAL RULES:
1. Output ONLY executable code (HTML, CSS, JavaScript, or a React component).
2. For simple UIs generate a full HTML file with inline CSS/JS.
3. For complex apps generate a React component **without any import/export statements**.
4. Include EVERY line of code – no placeholders or comments like "// …".
5. The code must run directly in a browser iframe.
6. Ensure responsive design and modern styling.
7. Use Tailwind CSS classes whenever possible.
8. Make it beautiful and functional.

NO MODULE SYNTAX:
- Do NOT use "import" or "export".
- React is globally available; just define the component function.

OUTPUT FORMAT:
Return ONLY a JSON object:
{
  "type": "html" | "react",
  "code": "complete executable code here",
  "title": "brief title",
  "description": "one‑sentence description"
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(payload.conversationHistory || []).map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: payload.prompt },
  ];

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OLLAMA_API_KEY}`,
  };

  try {
    const response = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'qwen2.5-coder:7b',
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('AI API error:', response.status, err);
      throw new Error(`AI API error: ${response.status} - ${err}`);
    }

    const data = await response.json();

    // Correct parsing for OpenAI‑compatible response
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('Raw AI response:', data);
      throw new Error('AI API returned empty content.');
    }

    // If Ollama wraps the JSON in markdown fences, extract it
    let jsonString = content;
    const match = content.match(/```(?:json)?\s*({[\s\S]*})\s*```/);
    if (match) jsonString = match[1];

    let parsed: GenerateCodeResponse;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse JSON from AI response:', jsonString);
      // Fallback: treat whole response as raw HTML/React code
      parsed = {
        type: 'html',
        code: content,
        title: 'Generated Content',
        description: 'Result generated by Ollama',
      };
    }

    const normalizedType = normalizeType(parsed.type);

    return {
      code: normalizedType === 'react' ? sanitizeReactCode(parsed.code) : parsed.code,
      type: normalizedType,
      title: parsed.title || 'Generated App',
      description: parsed.description || 'Result generated by Ollama',
    };
  } catch (err: any) {
    console.error('generateCode error:', err);
    throw err;
  }
};