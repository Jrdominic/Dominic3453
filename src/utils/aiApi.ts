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
  const token = localStorage.getItem('token'); // Get token from local storage

  const response = await fetch('/api/generate-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }), // Add token if available
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate code from AI.');
  }

  return response.json();
};