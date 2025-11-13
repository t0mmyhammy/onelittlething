import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { name, type } = await req.json();

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

    if (!name || !name.trim()) {
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const genderContext = type === 'F' ? 'feminine' : type === 'M' ? 'masculine' : 'gender-neutral';

    const systemPrompt = `You are a helpful assistant that provides information about baby names.

For each name, provide:
1. Meaning and what it represents
2. Origin (cultural/linguistic background)
3. Current popularity ranking or trend
4. How it sounds with common sibling names (general compatibility notes)

Keep responses concise, warm, and informative. Focus on interesting facts parents would appreciate.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "meaning": "Brief description of what the name means",
  "origin": "Cultural or linguistic origin",
  "popularity": "Current popularity trend or ranking",
  "siblingCompatibility": "Notes on how it sounds with other names"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please provide information about the ${genderContext} name "${name}".` }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const enhancements = JSON.parse(content);

    return new Response(
      JSON.stringify({ enhancements }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Enhance baby name API error:', error);
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
