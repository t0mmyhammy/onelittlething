import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MobileNav from '@/components/MobileNav';
import NameBoardView from '@/components/NameBoardView';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NamesPage() {
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

  if (!familyId) {
    redirect('/dashboard');
  }

  // Get user preferences for profile
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('display_name, profile_photo_url')
    .eq('user_id', user.id)
    .single();

  const displayName = userPrefs?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const profilePhotoUrl = userPrefs?.profile_photo_url;

  // Get children for sibling compatibility
  const { data: children } = await supabase
    .from('children')
    .select('id, name, birthdate')
    .eq('family_id', familyId)
    .order('birthdate', { ascending: true });

  // Get all name ideas
  const { data: names } = await supabase
    .from('baby_name_ideas')
    .select('*')
    .eq('family_id', familyId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <>
      <MobileNav
        userPhotoUrl={profilePhotoUrl || undefined}
        userName={displayName}
        familyDueDate={familyDueDate}
      />

      <NameBoardView
        names={names || []}
        userId={user.id}
        familyId={familyId}
        children={children || []}
      />
    </>
  );
}
