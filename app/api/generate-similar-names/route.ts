import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { familyId, count = 20 } = await request.json();

    if (!familyId) {
      return NextResponse.json({ error: 'Missing familyId' }, { status: 400 });
    }

    // Get all favorite names
    const { data: favoriteNames } = await supabase
      .from('baby_name_ideas')
      .select('name, type, notes')
      .eq('family_id', familyId)
      .eq('is_favorite', true);

    if (!favoriteNames || favoriteNames.length === 0) {
      return NextResponse.json({
        error: 'No favorite names found. Please favorite some names first to get AI suggestions.'
      }, { status: 400 });
    }

    // Get children for sibling name context
    const { data: children } = await supabase
      .from('children')
      .select('name')
      .eq('family_id', familyId);

    const siblingNames = children?.map(c => c.name) || [];

    // Create the AI prompt
    const firstNames = favoriteNames.filter(n => n.type === 'first').map(n => n.name);
    const middleNames = favoriteNames.filter(n => n.type === 'middle').map(n => n.name);

    const prompt = `Based on these favorite baby names, suggest ${count} similar names that match the style, origin, and vibe:

Favorite First Names: ${firstNames.length > 0 ? firstNames.join(', ') : 'None yet'}
Favorite Middle Names: ${middleNames.length > 0 ? middleNames.join(', ') : 'None yet'}
${siblingNames.length > 0 ? `Sibling Names: ${siblingNames.join(', ')}` : ''}

Please suggest ${count} total names (mix of first and middle names) that:
1. Match the cultural/ethnic origins
2. Have similar popularity levels (classic vs trendy)
3. Share similar vibes (modern, traditional, nature-inspired, etc.)
4. Would work well with the sibling names if any
5. Are diverse enough to give good options

Return ONLY a JSON array with this exact structure:
[
  {
    "name": "Name",
    "type": "first" or "middle",
    "reasoning": "Brief 1-sentence explanation of why this fits"
  }
]

Make sure to return valid JSON only, no markdown or extra text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a baby name expert who suggests names based on patterns and preferences. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0].message.content?.trim() || '';

    // Remove markdown code blocks if present
    let jsonText = responseText;
    if (responseText.startsWith('```')) {
      jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const suggestions = JSON.parse(jsonText);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating similar names:', error);
    return NextResponse.json(
      { error: 'Failed to generate name suggestions' },
      { status: 500 }
    );
  }
}
