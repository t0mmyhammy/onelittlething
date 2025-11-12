import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (data.user) {
      // Check if user already has a family
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', data.user.id)
        .single();

      // If new user (no family), create one
      if (!existingMember) {
        const userName = data.user.user_metadata.full_name || data.user.email?.split('@')[0] || 'User';

        try {
          // Use database function to create family and add member atomically
          const { data: familyId, error: familyError } = await supabase
            .rpc('create_family_with_member', {
              family_name: `${userName}'s Family`,
              member_user_id: data.user.id
            });

          if (familyError) {
            console.error('Failed to create family:', familyError);
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(`Database error: ${familyError.message}`)}`);
          }

          console.log('Family created successfully:', familyId);
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
