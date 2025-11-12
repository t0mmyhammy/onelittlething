import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

// Initialize Perplexity client (uses OpenAI SDK with custom base URL)
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai',
});

export const runtime = 'edge';
export const maxDuration = 60; // 60 second timeout for web search

export async function POST(req: Request) {
  try {
    const { itemName, category, size, brand, existingNotes, childName, additionalContext, researchFocus, retailers, budget } = await req.json();

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

    // Build prompt for idea research
    const systemPrompt = buildIdeaResearchPrompt(
      itemName,
      category,
      size,
      brand,
      existingNotes,
      childName,
      additionalContext,
      researchFocus,
      retailers,
      budget
    );

    // Call Perplexity API with web search capabilities
    const response = await perplexity.chat.completions.create({
      model: 'sonar', // Perplexity's web-search model (sonar or sonar-pro)
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: (() => {
            let message = researchFocus
              ? `Search ${retailers && retailers.length > 0 ? 'ONLY these retailers: ' + retailers.join(', ') : 'the web'} now for: ${itemName} ${researchFocus}. `
              : `Search ${retailers && retailers.length > 0 ? 'ONLY these retailers: ' + retailers.join(', ') : 'the web'} now for: ${itemName}. `;

            if (budget) {
              message += `Budget: ${budget}. `;
            }

            message += `Find 3-5 real, currently available products for ${childName}. `;

            if (!retailers || retailers.length === 0) {
              message += `Prioritize specialized stores when relevant. `;
            }

            message += `Include exact product page URLs from each retailer.`;

            return message;
          })(),
        },
      ],
      temperature: 0.3, // Lower for more factual, accurate results
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '';

    // Parse the AI response to extract tldr and products
    let tldr = '';
    let products: Array<{
      name: string;
      price: string;
      features: string[];
      url?: string;
      brand?: string;
    }> = [];

    try {
      // Try to parse if AI returns JSON
      const parsed = JSON.parse(content);
      tldr = parsed.tldr || '';
      products = parsed.products || [];
    } catch {
      // Fallback: use content as tldr
      tldr = content;
      products = [];
    }

    return new Response(
      JSON.stringify({
        research: tldr,
        products
      }),
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
  childName: string,
  additionalContext: string | null,
  researchFocus: string | null,
  retailers: string[] | null,
  budget: string | null
): string {
  const hasExistingNotes = existingNotes && existingNotes.trim().length > 0;
  const hasRetailerRestriction = retailers && retailers.length > 0;

  return `You are a helpful shopping assistant with real-time web search capabilities. ${hasRetailerRestriction ? `You must ONLY search the following retailers: ${retailers.join(', ')}.` : 'You can search the entire internet RIGHT NOW to find actual, currently available products from ANY retailer.'}

## Task:
${hasExistingNotes && researchFocus
  ? `The user already has research on this item. ${hasRetailerRestriction ? `SEARCH ONLY ${retailers.join(', ')}` : 'SEARCH THE WEB'} NOW for DIFFERENT products focused on: "${researchFocus}". Do NOT repeat the existing research - provide NEW insights and DIFFERENT product recommendations.`
  : `${hasRetailerRestriction ? `SEARCH ONLY ${retailers.join(', ')}` : 'SEARCH THE WEB NOW across ALL retailers'} and provide a brief TLDR summary and recommend 3-5 specific products that are currently available for purchase.${hasRetailerRestriction ? '' : ' Include diverse sources - specialized stores, brand websites, department stores, online retailers, etc.'}`
}

## Context:
- Item: ${itemName}
- For: ${childName}
${category ? `- Category: ${category}` : ''}
${size ? `- Size: ${size}` : ''}
${brand ? `- Preferred Brand: ${brand}` : ''}
${budget ? `- Budget: ${budget}` : ''}
${hasRetailerRestriction ? `- ONLY search these retailers: ${retailers.join(', ')}` : ''}
${hasExistingNotes ? `- Previous Research (DO NOT REPEAT): ${existingNotes}` : ''}
${additionalContext ? `- Special Considerations: ${additionalContext}` : ''}
${researchFocus ? `- NEW Research Focus: ${researchFocus}` : ''}

## Response Format:
Return ONLY a JSON object with this exact structure (no markdown, no code blocks):

{
  "tldr": "A brief 2-3 sentence summary of what to know when shopping for this item. Focus on key considerations like sizing, quality, typical price range, or important features.",
  "products": [
    {
      "name": "Specific Product Name",
      "brand": "Brand Name",
      "price": "$XX-XX",
      "features": ["Key feature 1", "Key feature 2", "Key feature 3"],
      "url": "https://www.amazon.com/product-url"
    }
  ]
}

## Guidelines:
1. **USE YOUR WEB SEARCH**: ${hasRetailerRestriction ? `Search ONLY ${retailers.join(', ')} - DO NOT search other retailers` : 'Search across ALL retailers RIGHT NOW for real products'}
2. ${hasRetailerRestriction ? `**RETAILER RESTRICTION**: You must ONLY return products from: ${retailers.join(', ')}. Ignore products from any other retailers.` : '**PRIORITIZE SPECIALIZED RETAILERS** when relevant:'}${!hasRetailerRestriction ? '\n   - University merchandise → Search university bookstores, campus stores, Fanatics\n   - Baby/nursery items → Search Babylist, Pottery Barn Kids, Crate & Kids, West Elm Kids\n   - Athletic wear → Search Nike.com, Adidas.com, Dick\'s Sporting Goods, Academy Sports\n   - Toys → Search Target, specialist toy stores, brand websites\n   - General items → Include Amazon, Walmart, Target, but also specialty shops' : ''}
3. ${budget ? `**BUDGET CONSTRAINT**: ${budget} - Only recommend products within this budget` : 'TLDR should be concise, friendly, and helpful - based on current market research'}
4. Recommend 3-5 specific products${hasRetailerRestriction ? ` from ${retailers.join(', ')} ONLY` : ' from DIVERSE SOURCES'}
${hasExistingNotes && researchFocus ? '5. DO NOT recommend products already mentioned in previous research - search for DIFFERENT options' : '5. Include current price ranges from your search results'}
6. List 3-4 key features for each product based on actual product descriptions
7. **CRITICAL - GET REAL URLs FROM YOUR SEARCH**:
   - Extract the ACTUAL product page URL from your search results
   - Must be a direct link to the product detail page (not category/search pages)
   - Examples of GOOD URLs:
     * https://www.amazon.com/dp/B0BX7CJZW9
     * https://www.nike.com/t/revolution-7-kids-shoe-abc123
     * https://mdenstore.com/products/michigan-wolverines-toddler-hoodie
     * https://www.potterybarnkids.com/products/organic-crib-sheet
   - Examples of BAD URLs: /search?q=, /category/, /browse/
   - Every URL must link to a specific product you actually found
8. Focus on popular, well-reviewed products with good ratings when available
9. If brand specified, prioritize that brand but include alternatives${hasRetailerRestriction ? ` (from the allowed retailers only)` : ' from different retailers'}
10. Consider the child's age and appropriate products for their developmental stage
11. ${hasRetailerRestriction ? `**STRICT ENFORCEMENT**: Double-check that ALL products are from: ${retailers.join(', ')}` : '**VARY YOUR SOURCES** - try to include products from at least 2-3 different retailers'}

Return ONLY the JSON object, nothing else.`;
}
