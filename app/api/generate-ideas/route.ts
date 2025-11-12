import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

// Initialize Perplexity client
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai',
});

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, childName, childGender, childSizes, favoriteRetailers } = await req.json();

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
    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('PERPLEXITY_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build prompt for idea generation
    const hasRetailerRestriction = favoriteRetailers && favoriteRetailers.length > 0;
    const systemPrompt = buildIdeaGenerationPrompt(
      prompt,
      childName,
      childGender,
      childSizes,
      favoriteRetailers
    );

    // Call Perplexity API
    const response = await perplexity.chat.completions.create({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Search ${hasRetailerRestriction ? `ONLY these retailers: ${favoriteRetailers.join(', ')}` : 'the web'} now for: ${prompt}. Find 4-6 specific, currently available products for ${childName}. Return results as JSON with this structure: {"ideas": [{"name": "Product Name", "category": "Category", "size": "Size", "brand": "Brand", "rationale": "Why it's good", "url": "Direct product URL"}]}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || '';

    // Parse the AI response
    let ideas: any[] = [];

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(content);
      ideas = parsed.ideas || [];
    } catch {
      // Fallback: could not parse JSON
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        ideas
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Idea generation API error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.response?.data || error.toString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function buildIdeaGenerationPrompt(
  prompt: string,
  childName: string,
  childGender: string | null,
  childSizes: any,
  favoriteRetailers: string[] | null
): string {
  const hasRetailerRestriction = favoriteRetailers && favoriteRetailers.length > 0;
  const defaultSize = childSizes?.shirt_size || childSizes?.pants_size || '4T';

  return `You are a shopping assistant finding products for children.

Context:
- Child: ${childName}${childGender ? ` (${childGender})` : ''}
- Sizes: ${[childSizes?.shirt_size, childSizes?.pants_size, childSizes?.shoe_size].filter(Boolean).join(', ') || 'Not specified'}

Instructions:
1. Search the web for 4-6 specific, real products
2. ${childGender ? `Find products appropriate for ${childGender === 'boy' ? 'boys' : 'girls'}` : 'Find age-appropriate products'}
3. Include real product URLs from your search results
4. Vary your recommendations (different types, brands, retailers)
5. Return ONLY valid JSON (no markdown, no code blocks):

{
  "ideas": [
    {
      "name": "Product Name",
      "category": "Category",
      "size": "${defaultSize}",
      "brand": "Brand",
      "rationale": "Why it's good (1 sentence)",
      "url": "https://retailer.com/product-url"
    }
  ]
}`;
}
