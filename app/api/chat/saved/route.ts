import { createClient } from '@/lib/supabase/server';

// Get all saved advice for the user
export async function GET(req: Request) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data: savedAdvice, error } = await supabase
      .from('saved_advice')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved advice:', error);
      return new Response('Error fetching saved advice', { status: 500 });
    }

    return new Response(JSON.stringify(savedAdvice), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Get saved advice error:', error);
    return new Response(error.message || 'Internal server error', {
      status: 500,
    });
  }
}

// Delete saved advice
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response('ID required', { status: 400 });
    }

    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Verify ownership and delete
    const { error } = await supabase
      .from('saved_advice')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting saved advice:', error);
      return new Response('Error deleting saved advice', { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Delete saved advice error:', error);
    return new Response(error.message || 'Internal server error', {
      status: 500,
    });
  }
}
