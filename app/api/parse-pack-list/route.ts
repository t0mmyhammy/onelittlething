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
    const { text, childrenNames } = await req.json();

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

    // Build prompt for parsing pack list with child assignment intelligence
    const childContext = childrenNames && childrenNames.length > 0
      ? `\n\nChildren in the family: ${childrenNames.join(', ')}\n\nIMPORTANT: If you see child names mentioned near items, assign those items to that child using the assignedToName field. For example:\n- "Emma's swimsuit" → assignedToName: "Emma"\n- "Diapers for Lily" → assignedToName: "Lily"\n- "Mom's sunscreen" → assignedToName: "Mom"\n- "Dad's hiking boots" → assignedToName: "Dad"\n- Items without clear ownership → assignedToName: null (shared/all)`
      : '';

    const systemPrompt = `You are a helpful assistant that extracts packing list items from text and organizes them into categories.

Given any text (emails, notes, existing packing lists, etc.), extract items and group them into logical categories.${childContext}

For each category, provide:
- title: Category name like "Clothing", "Toiletries", "Electronics", "Kids Gear", etc.
- items: Array of items in that category
  - label: Item name (required)
  - quantity: Quantity or count if mentioned (optional)
  - assignedToName: Name of person this item belongs to (e.g., "Emma", "Mom", "Dad") or null if shared/all (optional)

Return ONLY valid JSON in this exact format (no markdown, no code blocks):

{
  "categories": [
    {
      "title": "Category Name",
      "items": [
        {
          "label": "Item name",
          "quantity": "2",
          "assignedToName": "Emma"
        }
      ]
    }
  ]
}

Guidelines:
- Organize items into sensible categories (group similar items together)
- Extract quantities when mentioned (e.g., "3 shirts" → quantity: "3")
- Use standard category names: Clothing, Toiletries, Electronics, Documents, Kids Gear, Beach Items, etc.
- If items don't fit existing categories, create new appropriate ones
- Be concise but specific in item labels
- If the text is already organized by categories, preserve that organization
- Detect child/person names near items and assign ownership accordingly
- Look for patterns like "Emma's", "for Lily", "Mom needs", "Dad's", etc.`;

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
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '';

    // Parse the AI response
    let categories: any[] = [];

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(content);
      categories = parsed.categories || [];
    } catch {
      // Fallback: could not parse JSON
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ categories }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Parse pack list API error:', error);
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
