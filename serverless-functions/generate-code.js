import "https://deno.land/x/xhr@0.1.0/mod.ts";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function readDb() {
  try {
    const data = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading db.json:", error);
    return { users: [] };
  }
}

async function writeDb(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing db.json:", error);
  }
}

/**
 * Server‑less handler for `/api/generate-code`
 * Now uses the **hard‑coded** local GPT‑4All endpoint.
 */
export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---------- AUTH & DAILY CREDITS ----------
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Authentication token required." });
    }

    const db = await readDb();
    const user = db.users.find((u) => u.token === token);
    if (!user) {
      return res.status(401).json({ error: "Invalid authentication token." });
    }

    // Reset daily credits if a new day started
    const now = new Date();
    const lastReset = new Date(user.lastCreditReset);
    if (now.toDateString() !== lastReset.toDateString()) {
      user.credits = 4;
      user.lastCreditReset = now.toISOString();
    }

    if (user.credits <= 0) {
      await writeDb(db);
      return res
        .status(403)
        .json({ error: "Daily AI credits exhausted. Please try again tomorrow." });
    }

    // ---------- INPUT ----------
    const { prompt, conversationHistory, image } = await req.json();

    // ---------- BUILD MESSAGES ----------
    const systemPrompt = `You are Cortex, an expert code‑generation AI. Generate complete, working, production‑ready code based on user requests.

CRITICAL RULES:
1. Generate ONLY executable code - HTML, CSS, JavaScript, or React components
2. For simple UIs: Generate a complete HTML file with inline CSS and JavaScript
3. For complex apps: Generate a React component WITHOUT any import/export statements
4. ALWAYS include ALL code - no placeholders
5. Code must run directly in a browser iframe
6. Use Tailwind CSS classes whenever possible
7. Make it beautiful and functional

CRITICAL - NO MODULE SYNTAX:
- DO NOT use "export" or "import" statements
- For React: just define the function component; it will be auto‑detected

OUTPUT FORMAT:
Return ONLY a JSON object:
{
  "type": "html" | "react",
  "code": "complete executable code",
  "title": "short title",
  "description": "one‑sentence description"
}`;

    const aiMessages = [
      { role: "system", parts: [{ type: "text", text: systemPrompt }] },
      ...(conversationHistory || []).map((msg) => ({
        role: msg.role,
        parts: [
          { type: "text", text: msg.content },
          ...(msg.image
            ? [{ type: "image_url", image_url: { url: msg.image } }]
            : []),
        ],
      })),
      {
        role: "user",
        parts: [
          { type: "text", text: prompt },
          ...(image ? [{ type: "image_url", image_url: { url: image } }] : []),
        ],
      },
    ];

    // ---------- CALL LOCAL GPT‑4ALL ----------
    // **Hard‑coded URL as requested**
    const localAiUrl = "http://localhost:4891/v1/chat/completions";

    const aiResponse = await fetch(localAiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt4all", // identifier – GPT‑4All ignores it
        messages: aiMessages.map((m) => ({
          role: m.role,
          content: m.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join(" "),
        })),
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("Local AI error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: `Local AI error ${aiResponse.status}` }),
        {
          status: aiResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiData = await aiResponse.json();

    // ---------- EXTRACT JSON FROM AI RESPONSE ----------
    let content = aiData.choices?.[0]?.message?.content ?? "";
    const jsonMatch = content.match(/```(?:json)?\s*({[\s\S]*})\s*```/);
    if (jsonMatch) content = jsonMatch[1];

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", e);
      parsed = {
        type: "html",
        code: content,
        title: "Generated Content",
        description: "Generated by local GPT‑4All",
      };
    }

    // ---------- DECREMENT CREDITS ----------
    user.credits -= 1;
    await writeDb(db);

    // ---------- RETURN RESULT ----------
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate‑code function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}