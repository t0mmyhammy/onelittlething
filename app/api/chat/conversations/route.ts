import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parentingStyle = searchParams.get('parentingStyle');

    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get conversation for this user and parenting style
    let query = supabase
      .from('chat_conversations')
      .select('id, title, parenting_style, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (parentingStyle) {
      query = query.eq('parenting_style', parentingStyle);
    }

    const { data: conversations, error } = await query.limit(1);

    if (error) {
      console.error('Error fetching conversations:', error);
      return new Response('Error fetching conversations', { status: 500 });
    }

    return new Response(JSON.stringify(conversations), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    return new Response(error.message || 'Internal server error', {
      status: 500,
    });
  }
}

// Get messages for a specific conversation
export async function POST(req: Request) {
  try {
    const { conversationId } = await req.json();

    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Verify conversation belongs to user and get messages
    const { data: conversation } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (!conversation) {
      return new Response('Conversation not found', { status: 404 });
    }

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return new Response('Error fetching messages', { status: 500 });
    }

    return new Response(JSON.stringify(messages), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return new Response(error.message || 'Internal server error', {
      status: 500,
    });
  }
}
