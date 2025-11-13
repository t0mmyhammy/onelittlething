import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitePage({ params }: PageProps) {
  const supabase = await createClient();
  const { token } = await params;

  console.log('Invite page - token from URL:', token);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current user:', user?.email || 'not logged in');

  // Get invite (without families join to avoid RLS issues for anonymous users)
  const { data: invite, error: inviteError } = await supabase
    .from('family_invites')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single();

  // Log for debugging
  console.log('Invite query result:', { invite, inviteError });
  if (inviteError) {
    console.error('Invite lookup error:', inviteError);
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has expired.
          </p>
          <Link
            href="/"
            className="inline-block bg-sage text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Check if expired
  const isExpired = new Date(invite.expires_at) < new Date();
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-4">Invitation Expired</h1>
          <p className="text-gray-600 mb-6">
            This invitation has expired. Please ask for a new invitation.
          </p>
          <Link
            href="/"
            className="inline-block bg-sage text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // If user is logged in, accept invite automatically
  if (user) {
    // Add user to family (don't check email match - trust the user who clicked the link)
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: invite.family_id,
        user_id: user.id,
        role: 'parent',
      })
      .select()
      .single();

    // Only mark as accepted if successfully added (will fail if already a member)
    if (!memberError) {
      // Mark invite as accepted
      await supabase
        .from('family_invites')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invite.id);

      // Create user preferences if they don't exist
      const { error: prefsError } = await supabase
        .from('user_preferences')
        .insert({ user_id: user.id })
        .select()
        .single();

      // Ignore error if preferences already exist
      if (prefsError && !prefsError.message.includes('duplicate')) {
        console.error('Error creating preferences:', prefsError);
      }
    }

    // Redirect to dashboard even if already a member
    redirect('/dashboard');
  }

  // Not logged in - show simple sign in page
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">
            You're Invited!
          </h1>
          <p className="text-gray-600">
            Join your family on OneLittleThing
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href={`/login?invite=${token}`}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or use email</span>
            </div>
          </div>

          <Link
            href={`/login?invite=${token}`}
            className="block w-full text-center bg-sage text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Sign In with Email
          </Link>

          <p className="text-sm text-gray-600 text-center">
            Don't have an account?{' '}
            <Link href={`/signup?invite=${token}`} className="text-sage font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-xs text-gray-500 text-center mt-8">
          This invitation expires in{' '}
          {Math.max(1, Math.ceil((new Date(invite.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}{' '}
          days
        </p>
      </div>
    </div>
  );
}
