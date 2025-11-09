import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserCircleIcon, HomeIcon, CalendarDaysIcon, LightBulbIcon, TagIcon } from '@heroicons/react/24/outline';
import SizesPageNew from '@/components/SizesPageNew';

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
      <header className="bg-white border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-serif text-gray-900">OneLittleThing</h1>
            <div className="flex items-center gap-6">
              <Link
                href="/settings"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-sand"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-sand flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <span className="text-sm text-gray-700 font-medium">{displayName}</span>
              </Link>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1 border-b border-gray-200">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/timeline"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            >
              <CalendarDaysIcon className="w-4 h-4" />
              Timeline
            </Link>
            <Link
              href="/sizes"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sage border-b-2 border-sage"
            >
              <TagIcon className="w-4 h-4" />
              Sizes & Needs
            </Link>
            <Link
              href="/advice"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            >
              <LightBulbIcon className="w-4 h-4" />
              Liv
            </Link>
          </nav>
        </div>
      </header>

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
