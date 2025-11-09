import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { conversationId, messages, customTitle } = await req.json();

    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Verify conversation belongs to user
    const { data: conversation } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (!conversation) {
      return new Response('Conversation not found', { status: 404 });
    }

    // Generate key takeaways using OpenAI
    const conversationText = messages
      .map((msg: any) => `${msg.role === 'user' ? 'Parent' : 'Liv'}: ${msg.content}`)
      .join('\n\n');

    const summaryPrompt = `Below is a conversation between a parent and Liv, a parenting coach. Generate a concise summary with key takeaways that the parent can reference later.

Format your response as:
**Title:** [Short descriptive title]

**Key Takeaways:**
- [Actionable point 1]
- [Actionable point 2]
- [Actionable point 3]
[etc.]

Conversation:
${conversationText}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes parenting conversations into actionable takeaways.',
        },
        {
          role: 'user',
          content: summaryPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const summary = response.choices[0].message.content || '';

    // Extract title and takeaways from the summary
    const titleMatch = summary.match(/\*\*Title:\*\*\s*(.+?)(?=\n|$)/);
    const takeawaysMatch = summary.match(/\*\*Key Takeaways:\*\*\s*([\s\S]+)/);

    const title = customTitle || (titleMatch ? titleMatch[1].trim() : 'Saved Conversation');
    const keyTakeaways = takeawaysMatch ? takeawaysMatch[1].trim() : summary;

    // Save to database
    const { data: savedAdvice, error } = await supabase
      .from('saved_advice')
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        title,
        key_takeaways: keyTakeaways,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error saving advice:', error);
      return new Response('Error saving advice', { status: 500 });
    }

    return new Response(JSON.stringify(savedAdvice), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Save conversation error:', error);
    return new Response(error.message || 'Internal server error', {
      status: 500,
    });
  }
}
