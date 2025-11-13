import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

interface ParsedReminder {
  title: string;
  notes?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

export async function POST(req: Request) {
  try {
    const { familyId, userId, reminders } = await req.json();

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

    // Verify user belongs to the family
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .eq('family_id', familyId)
      .single();

    if (!familyMember) {
      return new Response(JSON.stringify({ error: 'User not in family' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!reminders || !Array.isArray(reminders) || reminders.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Reminders array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Transform parsed reminders into database format
    const reminderInserts = reminders.map((reminder: ParsedReminder) => ({
      family_id: familyId,
      created_by: userId,
      title: reminder.title,
      notes: reminder.notes || null,
      category: reminder.category || null,
      // Note: We don't set due_date or assigned_to from AI parsing
      // Users can add those after import if needed
    }));

    // Bulk insert reminders
    const { data, error } = await supabase
      .from('reminders')
      .insert(reminderInserts)
      .select();

    if (error) {
      console.error('Error inserting reminders:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create reminders' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: data?.length || 0,
        reminders: data
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Import reminders API error:', error);
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
