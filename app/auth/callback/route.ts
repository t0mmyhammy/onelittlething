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

        // Create family
        const { data: family } = await supabase
          .from('families')
          .insert({ name: `${userName}'s Family` })
          .select()
          .single();

        if (family) {
          // Add user as family member
          await supabase.from('family_members').insert({
            family_id: family.id,
            user_id: data.user.id,
            role: 'parent',
          });

          // Create user preferences
          await supabase.from('user_preferences').insert({
            user_id: data.user.id,
          });
        }
      }
    }
  }

  // Redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}
