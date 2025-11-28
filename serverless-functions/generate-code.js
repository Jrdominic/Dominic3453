import "https://deno.land/x/xhr@0.1.0/mod.ts"; // This line is for Deno, will be ignored by Node.js environments
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function readDb() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return { users: [] };
  }
}

async function writeDb(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing db.json:', error);
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication token required.' });
    }

    const db = await readDb();
    let user = db.users.find(u => u.token === token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token.' });
    }

    // Daily credit reset logic
    const now = new Date();
    const lastReset = new Date(user.lastCreditReset);
    if (now.toDateString() !== lastReset.toDateString()) {
      user.credits = 4; // Reset to 4 daily credits
      user.lastCreditReset = now.toISOString();
    }

    if (user.credits <= 0) {
      await writeDb(db); // Save potential credit reset
      return res.status(403).json({ error: 'Daily AI credits exhausted. Please try again tomorrow.' });
    }

    const { prompt, conversationHistory, image } = req.body;
    // const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY; // No longer needed if using local AI

    // if (!LOVABLE_API_KEY) {
    //   return res.status(500).json({ error: 'LOVABLE_API_KEY is not configured in the serverless environment.' });
    // }

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

    // --- START LOCAL AI INTEGRATION ---
    // Replace 'http://localhost:YOUR_AI_PORT/YOUR_AI_ENDPOINT' with your actual local AI server URL
    // And adapt the body/headers to match what your local AI expects.
    // The example below assumes your local AI expects a similar 'messages' array.
    const aiResponse = await fetch('http://localhost:5000/generate', { // <--- CHANGE THIS URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any specific headers your local AI requires, e.g., API keys
        // 'X-API-Key': 'your-local-ai-key',
      },
      body: JSON.stringify({
        model: 'your-local-model-name', // <--- CHANGE THIS TO YOUR LOCAL MODEL NAME
        messages: aiMessages,
      }),
    });
    // --- END LOCAL AI INTEGRATION ---

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Local AI error:', aiResponse.status, errorText);
      // Adapt error handling based on your local AI's responses
      return res.status(aiResponse.status).json({ error: `Local AI error: ${aiResponse.status} - ${errorText}` });
    }

    const data = await aiResponse.json();
    const content = data.choices[0].message.content; // <--- ADAPT THIS BASED ON YOUR LOCAL AI'S RESPONSE STRUCTURE

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

    // Decrement credits after successful AI generation
    user.credits -= 1;
    await writeDb(db);

    return res.status(200).json(parsedResponse);

  } catch (error) {
    console.error('Error in generate-code serverless function:', error);
    return res.status(500).json({ error: error.message || 'Unknown error in AI generation.' });
  }
}