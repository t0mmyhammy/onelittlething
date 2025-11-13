import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CareInfoPageClient from '@/components/CareInfoPageClient';
import MobileNav from '@/components/MobileNav';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CareInfoPage() {
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

  // Temporarily disabled - debugging navigation issue
  // if (!familyMember || !familyMember.family_id) {
  //   redirect('/dashboard');
  // }

  const familyId = familyMember?.family_id || '';
  console.log('Care Info - Family ID:', familyId || '(empty)');
  const familyDueDate = (familyMember as any)?.families?.due_date || null;

  // Get children (exclude archived)
  const { data: children } = await supabase
    .from('children')
    .select('id, name, birthdate, gender, photo_url')
    .eq('family_id', familyId)
    .is('archived', false)
    .order('created_at', { ascending: true });

  // Get child care info for all children
  const { data: childCareInfo } = await supabase
    .from('child_care_info')
    .select('*')
    .in('child_id', (children || []).map(c => c.id));

  // Get family care info
  const { data: familyCareInfo } = await supabase
    .from('family_care_info')
    .select('*')
    .eq('family_id', familyId)
    .single();

  // Get user preferences for navigation
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('display_name, profile_photo_url')
    .eq('user_id', user.id)
    .single();

  const displayName = userPrefs?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const profilePhotoUrl = userPrefs?.profile_photo_url;

  return (
    <div className="min-h-screen bg-[#FAF9F8]">
      <MobileNav
        userPhotoUrl={profilePhotoUrl || undefined}
        userName={displayName}
        familyDueDate={familyDueDate}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CareInfoPageClient
          children={children || []}
          childCareInfo={childCareInfo || []}
          familyCareInfo={familyCareInfo}
          familyId={familyId}
        />
      </main>
    </div>
  );
}
