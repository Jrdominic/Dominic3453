import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, conversationHistory, image } = await req.json(); // Receive image data
    // You might still need an API key for your own AI, if so, store it as a Supabase Edge Function secret.
    // const MY_AI_API_KEY = Deno.env.get('MY_AI_API_KEY'); 
    // if (!MY_AI_API_KEY) throw new Error("MY_AI_API_KEY is not configured");

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
}

Example for HTML:
{
  "type": "html",
  "code": "<!DOCTYPE html>\\n<html>\\n<head>...</head>\\n<body>...</body>\\n</html>",
  "title": "Todo App",
  "description": "A simple todo list application"
}

Example for React (NO exports!):
{
  "type": "react",
  "code": "function TodoApp() {\\n  const [todos, setTodos] = React.useState([]);\\n  // complete component code\\n  return (<div>...</div>);\\n}",
  "title": "Todo App",
  "description": "A feature-rich todo application"
}`;

    const aiMessages: any[] = [
      { role: 'system', parts: [{ type: 'text', text: systemPrompt }] },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role,
        parts: [
          { type: 'text', text: msg.content },
          ...(msg.image ? [{ type: 'image_url', image_url: { url: msg.image } }] : [])
        ]
      })),
    ];

    const userMessageParts: any[] = [{ type: 'text', text: prompt }];
    if (image) {
      userMessageParts.push({ type: 'image_url', image_url: { url: image } });
    }
    aiMessages.push({ role: 'user', parts: userMessageParts });

    console.log('Generating code for prompt:', prompt);
    console.log('Messages sent to AI:', JSON.stringify(aiMessages, null, 2));

    // --- START CUSTOM AI INTEGRATION ---
    // IMPORTANT: Replace 'YOUR_CUSTOM_AI_ENDPOINT_URL' with the actual URL of your AI service.
    // If your AI requires an API key, uncomment the MY_AI_API_KEY lines above and add it to Supabase secrets.
    const response = await fetch('YOUR_CUSTOM_AI_ENDPOINT_URL', { // <--- CHANGE THIS URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any specific headers your custom AI requires, e.g., API keys
        // 'Authorization': `Bearer ${MY_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'your-custom-model-name', // <--- CHANGE THIS TO YOUR CUSTOM MODEL NAME
        messages: aiMessages, // This structure is common, adapt if your AI expects something different
      }),
    });
    // --- END CUSTOM AI INTEGRATION ---

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Custom AI error:', response.status, errorText);
      // Adapt error handling based on your custom AI's responses
      return new Response(
        JSON.stringify({ error: `Custom AI error: ${response.status} - ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    // IMPORTANT: Adapt this line to correctly parse the response structure from your custom AI.
    // For example, if your AI returns { result: { text: "..." } }, you'd use data.result.text
    const content = data.choices[0].message.content; 
    
    console.log('Raw response from custom AI:', content);

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
      console.error('Failed to parse JSON from AI response:', jsonContent);
      // Fallback: treat entire content as HTML
      parsedResponse = {
        type: 'html',
        code: content,
        title: 'Generated Content',
        description: 'Generated based on your request'
      };
    }

    console.log('Parsed response:', parsedResponse);

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-code function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});