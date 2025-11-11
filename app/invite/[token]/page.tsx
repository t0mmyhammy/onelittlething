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
    // Check if user email matches invite
    if (user.email?.toLowerCase() === invite.email.toLowerCase()) {
      // Add user to family
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: invite.family_id,
          user_id: user.id,
          role: 'parent',
        });

      if (!memberError) {
        // Mark invite as accepted
        await supabase
          .from('family_invites')
          .update({
            status: 'accepted',
            accepted_at: new Date().toISOString(),
          })
          .eq('id', invite.id);

        redirect('/dashboard');
      }
    }
  }

  // Not logged in - show sign in/sign up page
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-serif text-gray-900 mb-2 text-center">
          You're Invited!
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          You've been invited to join a family on OneLittleThing
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Sign in or create an account with <strong>{invite.email}</strong> to accept this invitation
          </p>
          
          <Link
            href={`/login?invite=${token}`}
            className="block w-full text-center bg-rose text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>

          <Link
            href={`/signup?invite=${token}`}
            className="block w-full text-center bg-sand text-gray-800 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create Account
          </Link>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          This invitation expires in{' '}
          {Math.max(1, Math.ceil((new Date(invite.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}{' '}
          days
        </p>
      </div>
    </div>
  );
}
