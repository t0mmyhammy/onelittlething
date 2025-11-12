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
      "size": "Size if mentioned, otherwise ${childSizes?.shirt_size || childSizes?.pants_size || 'null'}",
      "brand": "Brand if mentioned, otherwise null",
      "notes": "Any additional details, colors, or notes from the original text"
    }
  ]
}

## Guidelines:
1. **EXTRACT ALL DETAILS**: Look for sizes, brands, colors, materials in each line
2. Each line (or logical item) becomes one idea object
3. If multiple items are on one line, split them into separate objects
4. ${childGender ? `Consider that ${childName} is ${childGender === 'boy' ? 'a boy' : 'a girl'} when categorizing items` : ''}
5. Use the provided sizes as defaults if not specified in the text
6. Categories should be general: Clothing, Toys, Books, Shoes, Accessories, etc.
7. Be smart about parsing - handle bullet points, dashes, commas, or numbered lists
8. If brand is mentioned anywhere in the line, extract it
9. Put extra details (colors, materials, specific notes) in the "notes" field
10. Clean up the item name to be concise (e.g., "Winter jacket - size 4T" → name: "Winter jacket", size: "4T")

Examples:
Input: "Winter jacket - size 4T, waterproof"
Output: { "name": "Winter jacket", "category": "Clothing", "size": "4T", "brand": null, "notes": "waterproof" }

Input: "Carter's fleece pajamas"
Output: { "name": "Fleece pajamas", "category": "Clothing", "size": "${childSizes?.shirt_size || '4T'}", "brand": "Carter's", "notes": null }

Input: "Red mittens, size 2-4"
Output: { "name": "Mittens", "category": "Accessories", "size": "2-4", "brand": null, "notes": "red" }

Return ONLY the JSON object, nothing else.`;
}
