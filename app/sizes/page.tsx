import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SizesPageNew from '@/components/SizesPageNew';
import MobileNav from '@/components/MobileNav';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SizesPage() {
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

  const familyId = familyMember.family_id;

  // Get user preferences for profile
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('display_name, profile_photo_url')
    .eq('user_id', user.id)
    .single();

  const displayName = userPrefs?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const profilePhotoUrl = userPrefs?.profile_photo_url;

  // Get children (exclude archived)
  const { data: children } = await supabase
    .from('children')
    .select('id, name, birthdate, gender, photo_url, label_color')
    .eq('family_id', familyId)
    .is('archived', false)
    .order('created_at', { ascending: true });

  // Get sizes for all children
  const { data: sizes } = await supabase
    .from('child_sizes')
    .select('*')
    .in('child_id', children?.map(c => c.id) || []);

  // Get shopping list items
  const { data: shoppingItems } = await supabase
    .from('shopping_list_items')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  // Get inventory items for all children
  const { data: inventoryItems } = await supabase
    .from('inventory_items')
    .select('*')
    .in('child_id', children?.map(c => c.id) || [])
    .order('category', { ascending: true });

  return (
    <div className="min-h-screen bg-cream">
      <MobileNav
        userPhotoUrl={profilePhotoUrl || undefined}
        userName={displayName}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SizesPageNew
          children={children || []}
          sizes={sizes || []}
          inventoryItems={inventoryItems || []}
          shoppingItems={shoppingItems || []}
          familyId={familyId}
        />
      </main>
    </div>
  );
}
