import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { conversationId, role, content } = await req.json();

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

    // Save message
    const { error } = await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      role,
      content,
    });

    if (error) {
      console.error('Error saving message:', error);
      return new Response('Error saving message', { status: 500 });
    }

    // Update conversation timestamp
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Message save error:', error);
    return new Response(error.message || 'Internal server error', {
      status: 500,
    });
  }
}
