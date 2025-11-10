import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TimelineView from '@/components/TimelineView';
import MobileNav from '@/components/MobileNav';

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
    .select('family_id')
    .eq('user_id', user.id)
    .single();

  const familyId = familyMember?.family_id || '';

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

  // Get ALL entries (not limited like dashboard) with creator info
  const { data: entries } = await supabase
    .from('entries')
    .select(`
      *,
      entry_children(
        children(*)
      ),
      creator:created_by (
        id,
        email,
        user_metadata
      )
    `)
    .eq('family_id', familyId)
    .order('entry_date', { ascending: false });

  return (
    <div className="min-h-screen bg-cream">
      <MobileNav
        userPhotoUrl={profilePhotoUrl || undefined}
        userName={displayName}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Timeline</h1>
          <p className="text-gray-600">
            All your captured moments in one place
          </p>
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
