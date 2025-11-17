import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
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

    const { familyId, daysBack = 7 } = await req.json();

    if (!familyId) {
      return new Response(JSON.stringify({ error: 'Missing familyId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get entries from the past week (or specified days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // First try to get basic entries without relationships
    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .eq('family_id', familyId)
      .gte('entry_date', startDate.toISOString().split('T')[0])
      .order('entry_date', { ascending: true });

    if (error) {
      console.error('Error fetching entries:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return new Response(JSON.stringify({
        error: 'Failed to fetch entries',
        details: error.message,
        hint: error.hint,
        code: error.code
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({
        error: 'No moments found in the past week. Create some memories first!',
        isEmpty: true
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get children names for context
    const { data: children } = await supabase
      .from('children')
      .select('name')
      .eq('family_id', familyId);

    const childrenNames = children?.map(c => c.name).join(', ') || 'your child';

    // Format entries for AI
    const entriesText = entries.map((entry: any) => {
      const date = new Date(entry.entry_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      return `[${date}] ${entry.title}${entry.content ? ' - ' + entry.content : ''}`;
    }).join('\n');

    const systemPrompt = `You are a warm, supportive parenting companion that helps families reflect on their journey.

Your task is to:
1. Create a heartwarming summary that highlights 2-3 SPECIFIC examples from their actual journal entries
2. Reference actual moments by name (e.g., "like when..." or "from [entry title] to...")
3. Generate 2-3 thoughtful reflection questions that help parents:
   - Notice patterns and growth
   - Stay present and mindful
   - Find inspiration for future moments to capture

IMPORTANT: Your summary MUST reference specific entries. Don't be generic - call out actual moments!

Keep the tone warm, encouraging, and personal. Focus on celebrating small wins and fostering mindful parenting.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "summary": "A warm summary that mentions 2-3 specific moments from the entries with details",
  "reflectionQuestions": [
    "Question 1 that encourages reflection",
    "Question 2 that inspires presence",
    "Question 3 that suggests future moments to capture"
  ]
}`;

    const userPrompt = `Based on these family moments from the past ${daysBack} days for ${childrenNames}:

${entriesText}

Please create a weekly highlights summary and reflection questions.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Remove markdown code blocks if present
    let jsonText = content.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const highlights = JSON.parse(jsonText);

    return new Response(
      JSON.stringify({
        ...highlights,
        entryCount: entries.length,
        periodDays: daysBack
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Generate weekly highlights error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to generate highlights',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
