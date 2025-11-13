import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const inviteToken = requestUrl.searchParams.get('invite');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (data.user) {
      // If there's an invite token, redirect to invite page (don't create family)
      if (inviteToken) {
        return NextResponse.redirect(`${origin}/invite/${inviteToken}`);
      }

      // Check if user already has a family
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', data.user.id)
        .single();

      // If new user (no family) and no invite, create their own family
      if (!existingMember) {
        const userName = data.user.user_metadata.full_name || data.user.email?.split('@')[0] || 'User';

        try {
          // Create family directly
          const { data: family, error: familyError } = await supabase
            .from('families')
            .insert({ name: `${userName}'s Family` })
            .select('id')
            .single();

          if (familyError) {
            console.error('Failed to create family:', familyError);
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(`Database error: ${familyError.message}`)}`);
          }

          // Add user as family member
          const { error: memberError } = await supabase
            .from('family_members')
            .insert({
              family_id: family.id,
              user_id: data.user.id,
              role: 'parent'
            });

          if (memberError) {
            console.error('Failed to add family member:', memberError);
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(`Member error: ${memberError.message}`)}`);
          }

          // Create user preferences
          await supabase.from('user_preferences').insert({
            user_id: data.user.id,
          });

          console.log('Family created successfully:', family.id);
        } catch (err: any) {
          console.error('Exception creating family:', err);
          return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(`Setup error: ${err.message}`)}`);
        }
      }
    }
  }

  // Redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}
