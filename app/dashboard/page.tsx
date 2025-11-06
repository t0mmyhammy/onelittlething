import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ChildrenSection from '@/components/ChildrenSection';
import EntriesSection from '@/components/EntriesSection';
import { UserCircleIcon } from '@heroicons/react/24/outline';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
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
    .select('family_id, families(*)')
    .eq('user_id', user.id)
    .single();

  // If user doesn't have a family, create one
  let familyId: string;
  if (!familyMember || !familyMember.family_id) {
    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    
    // Try using RPC function first (if it exists)
    let newFamilyId: string | null = null;
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'create_family_with_member',
      {
        family_name: `${userName}'s Family`,
        member_user_id: user.id,
      }
    );
    
    if (!rpcError && rpcResult) {
      newFamilyId = rpcResult;
    } else {
      // Fallback: try direct insert if RPC function doesn't exist
      console.log('RPC function not available, using direct insert:', rpcError);
      
      // Insert family
      const { data: newFamily, error: familyError } = await supabase
        .from('families')
        .insert({ name: `${userName}'s Family` })
        .select('id')
        .single();
      
      if (familyError || !newFamily) {
        console.error('Family creation error:', familyError);
        return (
          <div className="min-h-screen bg-cream flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-serif text-gray-900 mb-4">Error</h1>
              <p className="text-gray-600 mb-2">Unable to create family.</p>
              <p className="text-sm text-gray-500">
                {familyError?.message || rpcError?.message || JSON.stringify(familyError || rpcError) || 'Unknown error'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Make sure you've run the create_family_with_member function in SQL Editor
              </p>
              <a
                href="/dashboard"
                className="mt-4 inline-block px-4 py-2 bg-rose text-white rounded-lg hover:opacity-90"
              >
                Refresh Page
              </a>
            </div>
          </div>
        );
      }
      
      // Add user as family member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: newFamily.id,
          user_id: user.id,
          role: 'parent',
        });
      
      if (memberError) {
        console.error('Family member creation error:', memberError);
        // Try to clean up the family if member creation fails
        await supabase.from('families').delete().eq('id', newFamily.id);
        return (
          <div className="min-h-screen bg-cream flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-serif text-gray-900 mb-4">Error</h1>
              <p className="text-gray-600 mb-2">Unable to add you to family.</p>
              <p className="text-sm text-gray-500">{memberError.message}</p>
              <a
                href="/dashboard"
                className="mt-4 inline-block px-4 py-2 bg-rose text-white rounded-lg hover:opacity-90"
              >
                Refresh Page
              </a>
            </div>
          </div>
        );
      }
      
      newFamilyId = newFamily.id;
    }
    
    if (!newFamilyId) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-serif text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-2">Family ID not returned.</p>
            <a
              href="/dashboard"
              className="mt-4 inline-block px-4 py-2 bg-rose text-white rounded-lg hover:opacity-90"
            >
              Refresh Page
            </a>
          </div>
        </div>
      );
    }
    
    familyId = newFamilyId;
  } else {
    familyId = familyMember.family_id;
  }

  // Get user preferences for profile
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('display_name, profile_photo_url')
    .eq('user_id', user.id)
    .single();

  const displayName = userPrefs?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const profilePhotoUrl = userPrefs?.profile_photo_url;

  // Get children
    const { data: children } = await supabase
      .from('children')
      .select('id, name, birthdate, gender, photo_url, created_at, family_id')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });

  // Get recent entries
  const { data: entries } = await supabase
    .from('entries')
    .select(`
      *,
      entry_children(
        children(*)
      )
    `)
    .eq('family_id', familyId)
    .order('entry_date', { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif text-gray-900">OneLittleThing</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
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
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-serif text-gray-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600">
            {children && children.length > 0
              ? `Capturing moments for ${children.map(c => c.name).join(', ')}`
              : 'Add your first child to start capturing moments'}
          </p>
        </div>

        {/* Children Section */}
        <ChildrenSection
          initialChildren={children || []}
          familyId={familyId}
        />

        {/* Recent Entries */}
        <EntriesSection
          initialEntries={entries || []}
          children={children || []}
          familyId={familyId}
          userId={user.id}
        />
      </main>
    </div>
  );
}
