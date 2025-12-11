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

/**
 * Calls the `/api/generate-code` endpoint.
 * Handles:
 *   • Empty or non‑JSON responses → throws a clear error.
 *   • Network failures → returns a mock “placeholder” response so the UI stays usable.
 */
export const generateCode = async (payload: GenerateCodePayload): Promise<GenerateCodeResponse> => {
  const token = localStorage.getItem('token'); // Get token from local storage

  try {
    const response = await fetch('/api/generate-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }), // Add token if available
      },
      body: JSON.stringify(payload),
    });

    // -------------------------------------------------
    // 1️⃣  Non‑OK HTTP status → try to read error text
    // -------------------------------------------------
    if (!response.ok) {
      let errorMsg = `AI service responded with status ${response.status}`;
      try {
        // Some error bodies are JSON, others are plain text
        const errData = await response.json();
        errorMsg += ` – ${errData.error ?? JSON.stringify(errData)}`;
      } catch {
        const txt = await response.text();
        if (txt) errorMsg += ` – ${txt}`;
      }
      throw new Error(errorMsg);
    }

    // -------------------------------------------------
    // 2️⃣  Empty body? → this is the exact issue you saw.
    // -------------------------------------------------
    const text = await response.text();
    if (!text) {
      throw new Error('AI returned an empty response. Check the server logs.');
    }

    // -------------------------------------------------
    // 3️⃣  Try to parse JSON (the API is supposed to return JSON)
    // -------------------------------------------------
    let data: GenerateCodeResponse;
    try {
      data = JSON.parse(text);
    } catch {
      // If parsing fails, the AI might have wrapped the JSON in markdown code fences.
      const jsonMatch = text.match(/```(?:json)?\s*({[\s\S]*})\s*```/);
      if (jsonMatch) {
        try {
          data = JSON.parse(jsonMatch[1]);
        } catch {
          throw new Error('Failed to parse AI response JSON.');
        }
      } else {
        throw new Error('AI response is not valid JSON.');
      }
    }

    // -------------------------------------------------
    // 4️⃣  Basic shape validation (helps catch malformed payloads)
    // -------------------------------------------------
    if (!data || typeof data.code !== 'string' || !['html', 'react'].includes(data.type)) {
      throw new Error('AI returned an unexpected payload structure.');
    }

    return data;
  } catch (e: any) {
    console.error('generateCode error:', e);

    // -------------------------------------------------
    // 5️⃣  Fallback mock – lets the UI continue working.
    // -------------------------------------------------
    // You can remove this block once the real endpoint works.
    return {
      code: `<div style="padding:20px; font-family:sans-serif; text-align:center;">
  <h2>AI unavailable</h2>
  <p>${e.message}</p>
</div>`,
      type: 'html',
      title: 'AI Error',
      description: 'Failed to generate code – showing fallback placeholder.',
    };
  }
};