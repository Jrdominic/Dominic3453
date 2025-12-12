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

/* Read env vars */
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_API_URL; // e.g., http://localhost:11434

// Ensure we have the correct endpoint (append if missing)
const OLLAMA_API_URL = OLLAMA_BASE_URL?.replace(/\/+$/, '') + '/v1/chat/completions';

export const generateCode = async (
  payload: GenerateCodePayload,
): Promise<GenerateCodeResponse> => {
  if (!OLLAMA_BASE_URL) {
    throw new Error(
      "VITE_OLLAMA_API_URL must be configured in your .env (e.g., http://localhost:11434)."
    );
  }

  // 👉 Debug: show the exact URL being called
  console.log('📡 Calling AI endpoint:', OLLAMA_API_URL);

  const systemPrompt = `You are Cortex, an expert code generation AI. Generate complete, working, production‑ready code based on user requests.

CRITICAL RULES:
1. Generate ONLY executable code - HTML, CSS, JavaScript, or React components
2. For simple UIs: Generate a complete HTML file with inline CSS and JavaScript
3. For complex apps: Generate a React component WITHOUT any import/export statements
4. ALWAYS include ALL code – no placeholders
5. Code must run directly in a browser iframe
6. Include responsive design and modern styling
7. Use Tailwind CSS when possible
8. Make it beautiful and functional

CRITICAL - NO MODULE SYNTAX:
- Do NOT use "export" or "import" statements
- React is already available globally
- Just define the component function

OUTPUT FORMAT:
Return ONLY a JSON object:
{
  "type": "html" | "react",
  "code": "complete executable code here",
  "title": "brief title",
  "description": "one‑sentence description"
}`;

  const ollamaMessages: any[] = [
    { role: "system", content: systemPrompt },
    ...(payload.conversationHistory || []).map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: "user", content: payload.prompt },
  ];

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "qwen2.5-coder",
        messages: ollamaMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.message?.content;

    if (!content) {
      throw new Error("AI API returned an empty message content.");
    }

    // Strip possible code fences
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonContent);
    } catch {
      console.error("Failed to parse JSON from AI response:", jsonContent);
      parsedResponse = {
        type: "html",
        code: content,
        title: "Generated Content",
        description: "Generated based on your request",
      };
    }

    return parsedResponse;
  } catch (e: any) {
    console.error("generateCode error:", e);
    throw e;
  }
};