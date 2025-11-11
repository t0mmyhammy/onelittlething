import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { itemName, category, size, brand, existingNotes, childName } = await req.json();

    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Build prompt for idea research
    const systemPrompt = buildIdeaResearchPrompt(itemName, category, size, brand, existingNotes, childName);

    // Call OpenAI API (non-streaming for structured response)
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Please provide helpful research and recommendations for "${itemName}" for ${childName}.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const research = response.choices[0]?.message?.content || 'Unable to generate research.';

    return new Response(
      JSON.stringify({ research }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Idea research API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function buildIdeaResearchPrompt(
  itemName: string,
  category: string | null,
  size: string | null,
  brand: string | null,
  existingNotes: string | null,
  childName: string
): string {
  return `You are a helpful shopping assistant that provides practical research and recommendations for children's items.

## Task:
Generate helpful research and buying recommendations for a specific item.

## Context:
- Item: ${itemName}
- For: ${childName}
${category ? `- Category: ${category}` : ''}
${size ? `- Size: ${size}` : ''}
${brand ? `- Preferred Brand: ${brand}` : ''}
${existingNotes ? `- Existing Notes: ${existingNotes}` : ''}

## Guidelines:
1. Provide 3-4 paragraphs of helpful information
2. Include practical tips like:
   - Best features to look for
   - Price range expectations
   - Top-rated brands or specific products
   - Where to buy (online or in-store)
   - Common pitfalls to avoid
   - Size/fit considerations
3. Keep recommendations specific and actionable
4. Write in a warm, helpful tone like you're giving advice to a friend
5. Focus on value and quality over luxury
6. If brand is specified, include info about that brand but also suggest alternatives
7. Be concise but comprehensive - aim for 150-200 words total

Format your response as flowing paragraphs, not bullet points.`;
}
