import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import MobileNav from '@/components/MobileNav';
import PackListDetailView from '@/components/PackListDetailView';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PackListDetailPage({ params }: { params: { id: string } }) {
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

  // Get the pack list
  const { data: packList } = await supabase
    .from('pack_lists')
    .select('*')
    .eq('id', params.id)
    .eq('family_id', familyId)
    .single();

  if (!packList) {
    notFound();
  }

  // Get categories with items
  const { data: categories } = await supabase
    .from('pack_list_categories')
    .select(`
      *,
      pack_list_items(*)
    `)
    .eq('pack_list_id', params.id)
    .order('order_index', { ascending: true });

  // Sort items within each category by order_index
  const categoriesWithSortedItems = categories?.map((category: any) => ({
    ...category,
    pack_list_items: category.pack_list_items.sort(
      (a: any, b: any) => a.order_index - b.order_index
    ),
  }));

  // Update last_used_at
  await supabase
    .from('pack_lists')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', params.id);

  return (
    <div className="min-h-screen bg-cream">
      <MobileNav
        userPhotoUrl={profilePhotoUrl || undefined}
        userName={displayName}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PackListDetailView
          packList={packList}
          categories={categoriesWithSortedItems || []}
          userId={user.id}
        />
      </main>
    </div>
  );
}
