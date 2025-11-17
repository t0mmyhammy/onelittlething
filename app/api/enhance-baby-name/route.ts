import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { name, type, siblingNames, lastName } = await req.json();

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

    if (!name || !name.trim()) {
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const genderContext = type === 'F' ? 'feminine' : type === 'M' ? 'masculine' : 'gender-neutral';
    const fullName = lastName ? `${name} ${lastName}` : name;
    const initials = lastName ? `${name[0]}${lastName[0]}` : '';
    const siblingContext = siblingNames && siblingNames.length > 0
      ? `\n\nSibling names: ${siblingNames.join(', ')}`
      : '';

    const systemPrompt = `You are a helpful assistant that provides comprehensive information about baby names.

For each name, provide detailed information that helps parents make an informed decision:

1. **Meaning**: What the name means and symbolizes
2. **Origin**: Cultural, linguistic, or historical background
3. **Popularity**: Current ranking and trend (verify from recent data sources like SSA, The Bump, Nameberry)
4. **Nicknames**: Common shortened versions or pet names
5. **Sibling Compatibility**: How it sounds with the provided sibling names (rhythm, style, similar vs. contrasting)
${lastName ? `6. **Full Name**: Analysis of "${fullName}" - how first and last name flow together\n7. **Initials**: Note if initials "${initials}" form any words or acronyms` : ''}

Keep responses warm, concise, and actionable. Parents appreciate specific details.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "meaning": "Brief description",
  "origin": "Cultural origin",
  "popularity": "Current ranking/trend with year",
  "nicknames": ["Nickname1", "Nickname2"],
  "siblingCompatibility": "Specific notes about how it pairs with sibling names"${lastName ? `,
  "fullNameFlow": "Analysis of first + last name",
  "initials": "Initials and any notes"` : ''}
}`;

    const userPrompt = `Please provide comprehensive information about the ${genderContext} name "${name}".${siblingContext}${lastName ? `\n\nLast name: ${lastName}` : ''}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const enhancements = JSON.parse(content);

    return new Response(
      JSON.stringify({ enhancements }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Enhance baby name API error:', error);
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
