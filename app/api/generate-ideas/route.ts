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
          content: `Generate 4-6 idea recommendations for: ${prompt}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 1200,
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
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
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

  return `You are a helpful shopping assistant specializing in finding great ideas for children. ${hasRetailerRestriction ? `You must ONLY search the following retailers: ${favoriteRetailers.join(', ')}.` : 'You can search any retailer to find the best options.'}

## Task:
Based on the user's request, generate 4-6 specific, actionable product ideas with real product recommendations.

## Context:
- For: ${childName}${childGender ? ` (${childGender})` : ''}
${childSizes?.shirt_size ? `- Shirt Size: ${childSizes.shirt_size}` : ''}
${childSizes?.pants_size ? `- Pants Size: ${childSizes.pants_size}` : ''}
${childSizes?.shoe_size ? `- Shoe Size: ${childSizes.shoe_size}` : ''}
${hasRetailerRestriction ? `- Preferred Retailers: ${favoriteRetailers.join(', ')}` : ''}

## Response Format:
Return ONLY a JSON object with this exact structure (no markdown, no code blocks):

{
  "ideas": [
    {
      "name": "Specific Product or Item Name",
      "category": "Category (e.g., Clothing, Toys, Books, etc.)",
      "size": "${childSizes?.shirt_size || childSizes?.pants_size || '4T'}",
      "brand": "Brand Name (if applicable)",
      "rationale": "Brief 1-sentence explanation of why this is a good fit",
      "url": "https://www.retailer.com/direct-product-url"
    }
  ]
}

## Guidelines:
1. **USE YOUR WEB SEARCH**: ${hasRetailerRestriction ? `Search ONLY ${favoriteRetailers.join(', ')}` : 'Search across ALL retailers for the best options'}
2. Focus on specific, real products that are currently available
3. ${childGender ? `**GENDER-APPROPRIATE**: The child is ${childGender === 'boy' ? 'a boy' : 'a girl'}. Recommend products appropriate for ${childGender === 'boy' ? 'boys' : 'girls'}.` : 'Consider age-appropriate products'}
4. Include size information when relevant (use provided sizes or infer from context)
5. Rationale should be concise and friendly - explain why it's a good choice
6. **CRITICAL - REAL URLs**: Extract ACTUAL product page URLs from search results
   - Must be direct links to product pages
   - Examples of GOOD URLs: https://www.target.com/p/product-name/A-12345, https://www.amazon.com/dp/B0BX7CJZW9
   - Do NOT include category pages or search URLs
7. Vary your recommendations - different types, brands, styles
8. ${hasRetailerRestriction ? `**STRICT**: Only recommend products from ${favoriteRetailers.join(', ')}` : 'Include a mix of well-known and specialty retailers when appropriate'}
9. Provide 4-6 ideas (not more, not less)
10. Be specific - "Carter's Fleece Hoodie" not just "hoodie"

Return ONLY the JSON object, nothing else.`;
}
