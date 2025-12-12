// @ts-ignore
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, conversationHistory, image } = await req.json(); // Receive image data
    // @ts-ignore
    const OLLAMA_API_KEY = Deno.env.get("OLLAMA_API_KEY");
    // Default to local Ollama endpoint if OLLAMA_API_URL is not set
    // @ts-ignore
    const OLLAMA_API_URL = Deno.env.get("OLLAMA_API_URL") || "http://localhost:11434/api/chat"; 
    
    // If a remote Ollama URL is used, an API key is expected
    if (OLLAMA_API_URL !== "http://localhost:11434/api/chat" && !OLLAMA_API_KEY) {
      throw new Error("OLLAMA_API_KEY is not configured for remote Ollama API.");
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

    // Ollama's /api/chat endpoint typically expects 'content' directly, not 'parts'.
    // Image handling for Ollama's /api/chat endpoint is not standard in this format,
    // so images from the client will be ignored for the Ollama call for now.
    const ollamaMessages: any[] = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: prompt },
    ];

    console.log("Generating code for prompt:", prompt);
    console.log("Messages sent to Ollama:", JSON.stringify(ollamaMessages, null, 2));

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    // Only include Authorization header if an API key is provided and it's not the default local URL
    if (OLLAMA_API_KEY && OLLAMA_API_URL !== "http://localhost:11434/api/chat") {
      headers["Authorization"] = `Bearer ${OLLAMA_API_KEY}`;
    }

    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        model: "llama3", // Default Ollama model, you can change this
        messages: ollamaMessages,
        stream: false, // Ollama /api/chat endpoint typically returns full response, not stream by default
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `Ollama API error: ${response.status} - ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.message?.content; // Extract content from Ollama's response structure
    
    if (!content) {
      throw new Error("Ollama API returned an empty message content.");
    }

    // Extract JSON from markdown code blocks if present
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
      // Fallback: treat entire content as HTML
      parsedResponse = {
        type: "html",
        code: content,
        title: "Generated Content",
        description: "Generated based on your request",
      };
    }

    console.log("Parsed response:", parsedResponse);

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-code function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});