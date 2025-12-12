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

const OLLAMA_API_KEY = import.meta.env.VITE_OLLAMA_API_KEY;
const OLLAMA_API_URL = import.meta.env.VITE_OLLAMA_API_URL || "http://localhost:11434/api/chat";

export const generateCode = async (
  payload: GenerateCodePayload,
): Promise<GenerateCodeResponse> => {
  if (!OLLAMA_API_KEY && OLLAMA_API_URL !== "http://localhost:11434/api/chat") {
    throw new Error("OLLAMA_API_KEY is not configured for remote Ollama API. Please set VITE_OLLAMA_API_KEY in your .env file.");
  }

  const systemPrompt = `You are Cortex, an expert code generation AI. Generate complete, working, production-ready code based on user requests.

CRITICAL RULES:
1. Generate ONLY executable code - HTML, CSS, JavaScript, or React components
2. For simple UIs: Generate a complete HTML file with inline CSS and JavaScript
3. For complex apps: Generate a React component WITHOUT any import/export statements
4. Always include ALL code - no placeholders, no "// rest of code here" comments
5. Code must be immediately executable in a browser iframe without modification
6. Include responsive design and modern styling
7. Use Tailwind CSS classes when possible for styling
8. Make it beautiful and functional

CRITICAL - NO MODULE SYNTAX:
- DO NOT use "export default" or "export" statements
- DO NOT use "import" statements (React is already available globally)
- For React: Just define the function component, it will be auto-detected
- The code runs directly in a browser, not in a module system

OUTPUT FORMAT:
Return ONLY a JSON object with this structure:
{
  "type": "html" | "react",
  "code": "complete executable code here",
  "title": "brief title of what was created",
  "description": "one sentence description"
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
  if (OLLAMA_API_KEY && OLLAMA_API_URL !== "http://localhost:11434/api/chat") {
    headers["Authorization"] = `Bearer ${OLLAMA_API_KEY}`;
  }

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        model: "llama3",
        messages: ollamaMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama API error:", response.status, errorText);
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.message?.content;

    if (!content) {
      throw new Error("Ollama API returned an empty message content.");
    }

    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Failed to parse JSON from Ollama response:", jsonContent);
      parsedResponse = {
        type: "html",
        code: content,
        title: "Generated Content",
        description: "Generated based on your request",
      };
    }

    return parsedResponse;
  } catch (e: any) {
    console.error('generateCode error:', e);
    throw e;
  }
};