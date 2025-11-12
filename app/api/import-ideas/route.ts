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
    const { text, childName, childGender, childSizes } = await req.json();

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

    // Build prompt for import parsing
    const systemPrompt = buildImportParsingPrompt(
      text,
      childName,
      childGender,
      childSizes
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
          content: `Parse this list into individual items:\n\n${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
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
    console.error('Import parsing API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function buildImportParsingPrompt(
  text: string,
  childName: string,
  childGender: string | null,
  childSizes: any
): string {
  return `You are a helpful assistant that parses lists of items for children into structured data.

## Task:
Parse the user's pasted text into individual items. Each line or entry should become a separate item. Extract as much detail as possible from each entry.

## Context:
- For: ${childName}${childGender ? ` (${childGender})` : ''}
${childSizes?.shirt_size ? `- Shirt Size: ${childSizes.shirt_size}` : ''}
${childSizes?.pants_size ? `- Pants Size: ${childSizes.pants_size}` : ''}
${childSizes?.shoe_size ? `- Shoe Size: ${childSizes.shoe_size}` : ''}

## Response Format:
Return ONLY a JSON object with this exact structure (no markdown, no code blocks):

{
  "ideas": [
    {
      "name": "Item Name",
      "category": "Category (e.g., Clothing, Toys, Books, etc.)",
      "size": "Size if explicitly mentioned OR if clothing/shoes use ${childSizes?.shirt_size || childSizes?.pants_size || 'null'}, otherwise null",
      "brand": "Brand if mentioned, otherwise null",
      "url": "Product URL if found in the text, otherwise null",
      "notes": "Any additional details, colors, or notes from the original text (excluding URLs)"
    }
  ]
}

## Guidelines:
1. **EXTRACT ALL DETAILS**: Look for sizes, brands, colors, materials, and URLs in each line
2. Each line (or logical item) becomes one idea object
3. If multiple items are on one line, split them into separate objects
4. ${childGender ? `Consider that ${childName} is ${childGender === 'boy' ? 'a boy' : 'a girl'} when categorizing items` : ''}
5. **IMPORTANT - SIZE LOGIC**:
   - If size is explicitly mentioned in the text, use it
   - If item is Clothing, Shoes, or Accessories AND no size mentioned, use the child's size (${childSizes?.shirt_size || childSizes?.pants_size || 'null'})
   - For Toys, Books, Games, or other non-clothing items, size should be null
6. **URL EXTRACTION**:
   - Look for any URLs (http://, https://, www.) in the text
   - Extract the URL and place it in the "url" field
   - Remove the URL from other fields (name, notes)
7. Categories should be general: Clothing, Toys, Books, Shoes, Accessories, Games, etc.
8. Be smart about parsing - handle bullet points, dashes, commas, or numbered lists
9. If brand is mentioned anywhere in the line, extract it
10. Put extra details (colors, materials, specific notes) in the "notes" field
11. Clean up the item name to be concise (e.g., "Winter jacket - size 4T" → name: "Winter jacket", size: "4T")

Examples:
Input: "Winter jacket - size 4T, waterproof"
Output: { "name": "Winter jacket", "category": "Clothing", "size": "4T", "brand": null, "url": null, "notes": "waterproof" }

Input: "Carter's fleece pajamas"
Output: { "name": "Fleece pajamas", "category": "Clothing", "size": "${childSizes?.shirt_size || '4T'}", "brand": "Carter's", "url": null, "notes": null }

Input: "Red mittens, size 2-4"
Output: { "name": "Mittens", "category": "Accessories", "size": "2-4", "brand": null, "url": null, "notes": "red" }

Input: "LEGO Classic set https://www.amazon.com/dp/B0BX7CJZW9"
Output: { "name": "LEGO Classic set", "category": "Toys", "size": null, "brand": "LEGO", "url": "https://www.amazon.com/dp/B0BX7CJZW9", "notes": null }

Input: "Goodnight Moon book"
Output: { "name": "Goodnight Moon", "category": "Books", "size": null, "brand": null, "url": null, "notes": null }

Input: "Nike sneakers size 10 - https://www.target.com/p/kids-sneakers/A-12345"
Output: { "name": "Nike sneakers", "category": "Shoes", "size": "10", "brand": "Nike", "url": "https://www.target.com/p/kids-sneakers/A-12345", "notes": null }

Return ONLY the JSON object, nothing else.`;
}
