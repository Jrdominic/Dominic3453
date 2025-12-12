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
 * Calls the Supabase Edge Function for code generation.
 * The Edge Function handles the actual call to the Ollama API.
 */
export const generateCode = async (
  payload: GenerateCodePayload,
): Promise<GenerateCodeResponse> => {
  const SUPABASE_EDGE_FUNCTION_URL = '/functions/v1/generate-code';

  try {
    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: payload.prompt,
        conversationHistory: payload.conversationHistory,
        image: payload.image, // Pass image to Edge Function, it will decide if Ollama can use it
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `AI service responded with status ${response.status}`);
    }

    const data: GenerateCodeResponse = await response.json();

    if (
      !data ||
      typeof data.code !== 'string' ||
      !['html', 'react'].includes(data.type)
    ) {
      throw new Error('AI returned an unexpected payload structure.');
    }

    return data;
  } catch (e: any) {
    console.error('generateCode error:', e);
    throw e; // Re-throw the error to be handled by the calling component (ChatInterface)
  }
};