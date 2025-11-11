import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user already has a family
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', data.user.id)
        .single();

      // If new user (no family), create one
      if (!existingMember) {
        const userName = data.user.user_metadata.full_name || data.user.email?.split('@')[0] || 'User';

        // Use database function to create family and add member atomically
        const { error: familyError } = await supabase
          .rpc('create_family_with_member', {
            family_name: `${userName}'s Family`,
            member_user_id: data.user.id
          });

        if (familyError) {
          console.error('Failed to create family:', familyError);
        }

        // Create user preferences (optional)
        await supabase.from('user_preferences').insert({
          user_id: data.user.id,
        });
      }
    }
  }

  // Redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}
