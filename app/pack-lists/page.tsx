import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MobileNav from '@/components/MobileNav';
import PackListsView from '@/components/PackListsView';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PackListsPage() {
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

  // Get user preferences for profile
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('display_name, profile_photo_url')
    .eq('user_id', user.id)
    .single();

  const displayName = userPrefs?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const profilePhotoUrl = userPrefs?.profile_photo_url;

  // Get all pack lists (exclude archived by default)
  const { data: packLists } = await supabase
    .from('pack_lists')
    .select('*')
    .eq('family_id', familyId)
    .eq('is_archived', false)
    .order('last_used_at', { ascending: false });

  // Get archived pack lists
  const { data: archivedPackLists } = await supabase
    .from('pack_lists')
    .select('*')
    .eq('family_id', familyId)
    .eq('is_archived', true)
    .order('last_used_at', { ascending: false });

  // Get children for AI pack list generation
  const { data: children } = await supabase
    .from('children')
    .select('id, name, birthdate')
    .eq('family_id', familyId)
    .order('birthdate', { ascending: true });

  return (
    <div className="min-h-screen bg-cream">
      <MobileNav
        userPhotoUrl={profilePhotoUrl || undefined}
        userName={displayName}
        familyDueDate={familyDueDate}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PackListsView
          packLists={packLists || []}
          archivedPackLists={archivedPackLists || []}
          familyId={familyId}
          userId={user.id}
          children={children || []}
        />
      </main>
    </div>
  );
}
