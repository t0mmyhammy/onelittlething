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
    const { tripType, durationDays, familyId, children } = await req.json();

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

    if (!tripType || !tripType.trim()) {
      return new Response(
        JSON.stringify({ error: 'Trip type is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch existing pack lists to learn from
    const { data: existingLists } = await supabase
      .from('pack_lists')
      .select(`
        id,
        name,
        duration_days,
        pack_list_categories (
          title,
          pack_list_items (
            label,
            quantity
          )
        )
      `)
      .eq('family_id', familyId)
      .limit(5);

    // Build context about children
    const childrenContext = children && children.length > 0
      ? children.map((child: any) => {
          const age = child.age || calculateAge(child.birthdate);
          return `${child.name} (${age} years old)`;
        }).join(', ')
      : 'No children specified';

    // Build context from existing lists
    let existingListsContext = '';
    if (existingLists && existingLists.length > 0) {
      existingListsContext = '\n\nHere are some of the family\'s existing pack lists for reference:\n';
      existingLists.forEach((list: any) => {
        existingListsContext += `\n"${list.name}" (${list.duration_days || 'N/A'} days):\n`;
        if (list.pack_list_categories) {
          list.pack_list_categories.forEach((cat: any) => {
            existingListsContext += `  ${cat.title}: `;
            if (cat.pack_list_items) {
              const items = cat.pack_list_items
                .map((item: any) => item.quantity ? `${item.label} (${item.quantity})` : item.label)
                .join(', ');
              existingListsContext += items + '\n';
            }
          });
        }
      });
    }

    // Build prompt for pack list generation
    const systemPrompt = `You are a helpful assistant that creates packing lists for family trips.

Given a trip type, duration, and family context, suggest a comprehensive packing list organized into categories.

Context:
- Trip type: ${tripType}
- Duration: ${durationDays || 'Not specified'} days
- Children: ${childrenContext}${existingListsContext}

Instructions:
1. Create 4-8 categories appropriate for this trip (e.g., "Clothing", "Toiletries", "Electronics", "Kids Gear", "Beach Items", "Hiking Gear", etc.)
2. For each category, suggest 5-15 items
3. Include quantities where helpful (e.g., "Socks (3 pairs)")
4. Tailor suggestions to the children's ages (e.g., diapers for babies, activities for toddlers)
5. Consider the trip duration when suggesting quantities
6. If existing lists are provided, learn from their patterns and categories
7. Return ONLY valid JSON (no markdown, no code blocks):

{
  "categories": [
    {
      "title": "Category Name",
      "items": [
        {
          "label": "Item name",
          "quantity": "2" // optional, omit if not applicable
        }
      ]
    }
  ]
}

Make the list practical, comprehensive but not overwhelming, and age-appropriate.`;

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
          content: `Generate a packing list for: ${tripType}`,
        },
      ],
      temperature: 0.7,
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
    console.error('Generate pack list API error:', error);
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

function calculateAge(birthdate: string | null): number {
  if (!birthdate) return 0;
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
