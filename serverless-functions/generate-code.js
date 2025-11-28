// This file contains the serverless function logic that was previously in Supabase Edge Functions.
// You need to deploy this code to a serverless platform (e.g., Vercel, Netlify, AWS Lambda)
// and configure it to be accessible at the /api/generate-code endpoint.
// Ensure LOVABLE_API_KEY is set as an environment variable in your serverless deployment.

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  try {
    const { prompt, conversationHistory, image } = req.body;
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY; // Access from environment variables

    if (!LOVABLE_API_KEY) {
      return res.status(500).json({ error: 'LOVABLE_API_KEY is not configured in the serverless environment.' });
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

    const aiMessages = [
      { role: 'system', parts: [{ type: 'text', text: systemPrompt }] },
      ...(conversationHistory || []).map((msg) => ({
        role: msg.role,
        parts: [
          { type: 'text', text: msg.content },
          ...(msg.image ? [{ type: 'image_url', image_url: { url: msg.image } }] : [])
        ]
      })),
    ];

    const userMessageParts = [{ type: 'text', text: prompt }];
    if (image) {
      userMessageParts.push({ type: 'image_url', image_url: { url: image } });
    }
    aiMessages.push({ role: 'user', parts: userMessageParts });

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      if (aiResponse.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again in a moment.' });
      }
      if (aiResponse.status === 402) {
        return res.status(402).json({ error: 'AI credits exhausted. Please add credits to your workspace in Settings → Workspace → Usage.' });
      }
      throw new Error(`Lovable AI error: ${aiResponse.status} - ${errorText}`);
    }

    const data = await aiResponse.json();
    const content = data.choices[0].message.content;

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
      parsedResponse = {
        type: 'html',
        code: content,
        title: 'Generated Content',
        description: 'Generated based on your request'
      };
    }

    return res.status(200).json(parsedResponse);

  } catch (error) {
    console.error('Error in generate-code serverless function:', error);
    return res.status(500).json({ error: error.message || 'Unknown error in AI generation.' });
  }
}