import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build prompt for parsing reminders
    const systemPrompt = `You are a helpful assistant that extracts action items and tasks from text.

Given any text (emails, meeting notes, voice transcriptions, etc.), extract actionable reminders.

For each reminder, provide:
- title: A clear, concise action item (required)
- notes: Additional context or details (optional)
- category: A category like "Shopping", "Home", "Kids", "Health", "Work", etc. (optional)
- priority: Either "low", "medium", or "high" based on urgency (optional)

Return ONLY valid JSON in this exact format (no markdown, no code blocks):

{
  "reminders": [
    {
      "title": "Action item description",
      "notes": "Additional context",
      "category": "Category name",
      "priority": "medium"
    }
  ]
}

Guidelines:
- Extract only clear, actionable tasks
- Be concise but specific in titles
- If no clear action items exist, return empty array
- Infer priority from language like "urgent", "ASAP", "when you can", etc.
- Group related items when appropriate`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '';

    // Parse the AI response
    let reminders: any[] = [];

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(content);
      reminders = parsed.reminders || [];
    } catch {
      // Fallback: could not parse JSON
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ reminders }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Parse reminders API error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
