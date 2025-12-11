import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");

// CORS headers used by all routes
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, DELETE",
};

async function readDb() {
  try {
    const data = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Error reading db.json:", error);
    return { users: [] };
  }
}

async function writeDb(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("❌ Error writing db.json:", error);
  }
}

/**
 * Handles all auth‑related routes:
 *   POST   /api/auth/signup          → create a new user
 *   POST   /api/auth/signin         → existing user login
 *   DELETE /api/auth/delete-account → delete logged‑in user
 *
 * The function follows the same pattern as `generate-code.js`: plain
 * Fetch‑API `Request` → `Response`.
 */
export default async function handler(req, res) {
  // ---------- CORS pre‑flight ----------
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();
    const db = await readDb();

    // ---------- SIGN‑UP ----------
    if (req.url === "/api/auth/signup") {
      const existing = db.users.find((u) => u.email === email);
      if (existing) {
        return new Response(
          JSON.stringify({ error: "User with this email already exists." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password, // ⚠️ In production you must hash the password!
        credits: 4, // initial daily credits
        lastCreditReset: new Date().toISOString(),
        token: `token-${Date.now()}-${Math.random().toString(36).slice(2, 15)}`,
      };
      db.users.push(newUser);
      await writeDb(db);

      return new Response(
        JSON.stringify({
          user: { id: newUser.id, email: newUser.email, full_name: email.split("@")[0] },
          token: newUser.token,
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---------- SIGN‑IN ----------
    if (req.url === "/api/auth/signin") {
      const user = db.users.find((u) => u.email === email && u.password === password);
      if (!user) {
        return new Response(JSON.stringify({ error: "Invalid credentials." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          user: { id: user.id, email: user.email, full_name: email.split("@")[0] },
          token: user.token,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---------- DELETE ACCOUNT ----------
    if (req.url === "/api/auth/delete-account" && req.method === "DELETE") {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];

      if (!token) {
        return new Response(JSON.stringify({ error: "Authentication token required." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const idx = db.users.findIndex((u) => u.token === token);
      if (idx === -1) {
        return new Response(JSON.stringify({ error: "User not found or invalid token." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const [deleted] = db.users.splice(idx, 1);
      await writeDb(db);
      return new Response(
        JSON.stringify({ message: `Account for ${deleted.email} deleted successfully.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---------- UNKNOWN ROUTE ----------
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Auth handler error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error in authentication." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}