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
    const { prompt, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are Cortex, an expert code generation AI. Generate complete, working, production-ready code based on user requests.

CRITICAL RULES:
1. Generate ONLY executable code - HTML, CSS, JavaScript, or React components
2. For simple UIs: Generate a complete HTML file with inline CSS and JavaScript
3. For complex apps: Generate a React component with all necessary imports
4. Always include ALL code - no placeholders, no "// rest of code here" comments
5. Code must be immediately executable without modification
6. Include responsive design and modern styling
7. Use Tailwind CSS classes when possible for styling
8. Make it beautiful and functional

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

Example for React:
{
  "type": "react",
  "code": "import React, { useState } from 'react';\\n\\nfunction TodoApp() {\\n  // complete component code\\n}\\n\\nexport default TodoApp;",
  "title": "Todo App",
  "description": "A feature-rich todo application"
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: prompt }
    ];

    console.log('Generating code for prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace in Settings → Workspace → Usage.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const error = await response.text();
      console.error('Lovable AI error:', error);
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw response:', content);

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
      console.error('Failed to parse JSON:', jsonContent);
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
