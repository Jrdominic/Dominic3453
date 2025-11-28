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

export const generateCode = async (payload: GenerateCodePayload): Promise<GenerateCodeResponse> => {
  const response = await fetch('/api/generate-code', { // This will be your new serverless endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate code from AI.');
  }

  return response.json();
};