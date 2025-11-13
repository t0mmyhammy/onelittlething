import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TimelineView from '@/components/TimelineView';
import MobileNav from '@/components/MobileNav';
import QuickEntryForm from '@/components/QuickEntryForm';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TimelinePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's family
  const { data: familyMember } = await supabase
    .from('family_members')
    .select('family_id, families(due_date)')
    .eq('user_id', user.id)
    .single();

  const familyId = familyMember?.family_id || '';
  const familyDueDate = (familyMember as any)?.families?.due_date || null;

  // Temporarily disabled - debugging navigation issue
  // If user has no family, redirect to dashboard to set up
  // if (!familyId) {
  //   console.error('Timeline: No family_id found, should redirect to dashboard');
  //   redirect('/dashboard');
  // }

  // Temporary: Show error instead of redirect
  if (!familyId) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center border border-gray-200">
          <h1 className="text-2xl font-serif text-gray-900 mb-4">No Family Found</h1>
          <p className="text-gray-600 mb-4">
            You need to be part of a family to access this page.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Family ID: {familyId || '(empty)'}
            <br />
            User ID: {user.id}
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-sage text-white rounded-lg hover:opacity-90"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }
  // Get user preferences for profile
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('display_name, profile_photo_url')
    .eq('user_id', user.id)
    .single();

  const displayName = userPrefs?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const profilePhotoUrl = userPrefs?.profile_photo_url;

  // Get children (show all except explicitly archived)
  const { data: children } = await supabase
    .from('children')
    .select('id, name, birthdate, gender, photo_url, label_color, created_at, family_id, archived')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  // Get ALL entries (not limited like dashboard)
  const { data: entries } = await supabase
    .from('entries')
    .select(`
      *,
      entry_children(
        children(*)
      )
    `)
    .eq('family_id', familyId)
    .order('entry_date', { ascending: false });

  return (
    <div className="min-h-screen bg-cream">
      <MobileNav
        userPhotoUrl={profilePhotoUrl || undefined}
        userName={displayName}
        familyDueDate={familyDueDate}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Timeline</h1>
          <p className="text-gray-600">
            All your captured moments in one place
          </p>
        </div>

        {/* Quick Entry Form */}
        <div className="mb-8">
          <QuickEntryForm
            children={children || []}
            familyId={familyId}
            userId={user.id}
          />
        </div>

        <TimelineView
          initialEntries={entries || []}
          children={children || []}
          familyId={familyId}
          userId={user.id}
        />
      </main>
    </div>
  );
}
