import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdvicePageClient from '@/components/AdvicePageClient';
import MobileNav from '@/components/MobileNav';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdvicePage() {
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

  if (!familyMember || !familyMember.family_id) {
    redirect('/dashboard');
  }

  // Get children for context (exclude archived)
  const { data: children } = await supabase
    .from('children')
    .select('id, name, birthdate')
    .eq('family_id', familyMember.family_id)
    .is('archived', false)
    .order('created_at', { ascending: true });

  // Get user preferences for profile and parenting style
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('display_name, profile_photo_url, selected_parenting_style')
    .eq('user_id', user.id)
    .single();

  // Get custom parenting styles
  const { data: customStyles } = await supabase
    .from('custom_parenting_styles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false});

  const displayName = userPrefs?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const profilePhotoUrl = userPrefs?.profile_photo_url;
  const selectedStyle = userPrefs?.selected_parenting_style || 'love-and-logic';

  return (
    <div className="min-h-screen bg-cream">
      <MobileNav
        userPhotoUrl={profilePhotoUrl || undefined}
        userName={displayName}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdvicePageClient
          children={children || []}
          initialSelectedStyle={selectedStyle}
          initialCustomStyles={customStyles || []}
        />
      </main>
    </div>
  );
}
