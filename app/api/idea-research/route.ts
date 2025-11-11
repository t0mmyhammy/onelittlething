import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { itemName, category, size, brand, existingNotes, childName, additionalContext } = await req.json();

    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Build prompt for idea research
    const systemPrompt = buildIdeaResearchPrompt(itemName, category, size, brand, existingNotes, childName, additionalContext);

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
  additionalContext: string | null
): string {
  return `You are a helpful shopping assistant that provides product recommendations for children's items.

## Task:
Provide a brief TLDR summary and recommend 3-5 specific products for this item.

## Context:
- Item: ${itemName}
- For: ${childName}
${category ? `- Category: ${category}` : ''}
${size ? `- Size: ${size}` : ''}
${brand ? `- Preferred Brand: ${brand}` : ''}
${existingNotes ? `- Existing Notes: ${existingNotes}` : ''}
${additionalContext ? `- Special Considerations: ${additionalContext}` : ''}

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
      "url": ""
    }
  ]
}

## Guidelines:
1. TLDR should be concise, friendly, and helpful - like advice from a friend
2. Recommend 3-5 specific, real products
3. Include realistic price ranges (e.g., "$25-35", "$50")
4. List 3-4 key features for each product
5. Leave URL empty (will be filled by user)
6. Focus on popular, well-reviewed options
7. If brand specified, prioritize that brand but include alternatives
8. Consider the child's age and appropriate products
9. If special considerations are provided, factor those into your recommendations
10. Focus on value and quality

Return ONLY the JSON object, nothing else.`;
}
