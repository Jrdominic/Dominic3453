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
 *   • Network failures → returns a simple red‑themed HTML page as a graceful fallback.
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
    // 1️⃣  Non‑OK HTTP status → read body once and build error message
    // -------------------------------------------------
    if (!response.ok) {
      const rawBody = await response.text();

      let errorMsg = `AI service responded with status ${response.status}`;
      try {
        const errData = JSON.parse(rawBody);
        errorMsg += ` – ${errData.error ?? JSON.stringify(errData)}`;
      } catch {
        if (rawBody) errorMsg += ` – ${rawBody}`;
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
    // 4️⃣  Basic shape validation
    // -------------------------------------------------
    if (!data || typeof data.code !== 'string' || !['html', 'react'].includes(data.type)) {
      throw new Error('AI returned an unexpected payload structure.');
    }

    return data;
  } catch (e: any) {
    console.error('generateCode error:', e);

    // -------------------------------------------------
    // 5️⃣  Graceful fallback – a simple red website
    // -------------------------------------------------
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Red Website</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
      background-color: #ff0000;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    p {
      font-size: 1.2rem;
    }
    a {
      color: #fff;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div>
    <h1>Welcome to the Red Site</h1>
    <p>This is a simple red‑themed page generated as a fallback.</p>
    <p><a href="/">Back to the app</a></p>
  </div>
</body>
</html>`;

    return {
      code: fallbackHtml,
      type: 'html',
      title: 'Red Website',
      description: 'A simple red‑themed HTML page (fallback when AI is unavailable).',
    };
  }
};