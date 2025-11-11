import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsTabs from '@/components/SettingsTabs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
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
    .select('family_id, families(name)')
    .eq('user_id', user.id)
    .single();

  const familyId = familyMember?.family_id || '';
  const familyName = (familyMember?.families as any)?.name || 'Your Family';

  // Get children (show all except explicitly archived)
  const { data: children } = await supabase
    .from('children')
    .select('id, name, birthdate, gender, photo_url, label_color, created_at, family_id, archived')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  // Get user preferences
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('display_name, profile_photo_url')
    .eq('user_id', user.id)
    .single();

  return (
    <SettingsTabs
      user={user}
      initialUserPrefs={userPrefs}
      familyId={familyId}
      familyName={familyName}
      initialChildren={children || []}
    />
  );
}
