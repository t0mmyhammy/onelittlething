import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { category, currentSize, nextSize, childAge, childName, existingNotes } = await req.json();

    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Build prompt for size recommendations
    const systemPrompt = buildSizeRecommendationsPrompt(category, currentSize, nextSize, childAge, childName, existingNotes);

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
          content: `Please provide 3-4 helpful recommendations for tracking ${category} sizes for ${childName}.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content || '';

    // Parse the response into an array of recommendations
    // Split by bullet points, numbers, or newlines
    const recommendations = content
      .split(/[\n•\-\d\.]+/)
      .map(line => line.trim())
      .filter(line => line.length > 10 && line.length < 200) // Filter out empty lines and too short/long items
      .slice(0, 4); // Limit to 4 recommendations

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Size recommendations API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function buildSizeRecommendationsPrompt(
  category: string,
  currentSize: string | null,
  nextSize: string | null,
  childAge: string,
  childName: string,
  existingNotes: string | null
): string {
  return `You are a helpful assistant that provides practical advice for tracking children's clothing sizes.

## Task:
Generate 3-4 brief, actionable recommendations for tracking ${category} sizes for a child.

## Context:
- Child: ${childName}${childAge ? ` (${childAge})` : ''}
- Category: ${category}
- Current Size: ${currentSize || 'Not set'}
- Next Size: ${nextSize || 'Not set'}
${existingNotes ? `- Existing Notes: ${existingNotes}` : ''}

## Guidelines:
1. Keep each recommendation concise (15-40 words)
2. Focus on practical tips like:
   - Typical size progression timelines
   - Shopping tips (when to buy next size, sales timing)
   - Fit considerations (room to grow, seasonal changes)
   - Brand-specific insights if relevant
   - Age-appropriate sizing tips
3. Make recommendations specific to the clothing category
4. Consider the child's age in your suggestions
5. Return ONLY the recommendations as a numbered or bulleted list
6. Do NOT include any preamble or conclusion
7. Each recommendation should be a complete, standalone tip

Example format:
1. [Recommendation about timing]
2. [Recommendation about fit]
3. [Recommendation about shopping]
4. [Recommendation about tracking]`;
}
