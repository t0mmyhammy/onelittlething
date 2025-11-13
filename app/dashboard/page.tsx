import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EntriesSection from '@/components/EntriesSection';
import OnThisDay from '@/components/OnThisDay';
import QuickEntryForm from '@/components/QuickEntryForm';
import StreakWidget from '@/components/StreakWidget';
import BabyCountdownCard from '@/components/BabyCountdownCard';
import DailyAnchor from '@/components/DailyAnchor';
import MobileNav from '@/components/MobileNav';
import NotificationBanner from '@/components/NotificationBanner';
import { getActiveNotifications } from '@/lib/notifications';

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

  // Get user preferences for profile, onboarding, and notifications
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const displayName = userPrefs?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const profilePhotoUrl = userPrefs?.profile_photo_url;
  const dailyMantra = userPrefs?.daily_mantra;
  const isFamilyCreator = userPrefs?.is_family_creator ?? false;
  const onboardingCompleted = userPrefs?.onboarding_completed ?? false;
  const onboardingDismissed = userPrefs?.onboarding_dismissed ?? false;

  // Get children (show all except explicitly archived)
    const { data: children } = await supabase
      .from('children')
      .select('id, name, birthdate, gender, photo_url, label_color, created_at, family_id, archived')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });

  // Find a child with a future birthdate to use as due date
  const todayStr = new Date().toISOString().split('T')[0];
  const expectedChild = children?.find(child =>
    child.birthdate && child.birthdate > todayStr
  );
  const dueDate = expectedChild?.birthdate || null;

  // Get all entries
  const { data: entries } = await supabase
    .from('entries')
    .select(`
      *,
      entry_children(
        children(*)
      )
    `)
    .eq('family_id', familyId)
    .order('entry_date', { ascending: false });

  // Get "On This Day" entries from previous years
  const today = new Date();
  const monthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const currentYear = today.getFullYear();

  const { data: onThisDayEntries } = await supabase
    .from('entries')
    .select(`
      *,
      entry_children(
        children(*)
      )
    `)
    .eq('family_id', familyId)
    .like('entry_date', `%-${monthDay}`)
    .neq('entry_date', today.toISOString().split('T')[0]) // Exclude today
    .order('entry_date', { ascending: false })
    .limit(3);

  // Check onboarding progress
  const hasChildren = !!(children && children.length > 0);
  const hasMoments = !!(entries && entries.length > 0);

  // Check if user has invited a partner (more than 1 family member)
  const { count: familyMemberCount } = await supabase
    .from('family_members')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', familyId);
  const hasPartner = (familyMemberCount ?? 0) > 1;

  // Get family name
  const { data: familyData } = await supabase
    .from('families')
    .select('name')
    .eq('id', familyId)
    .single();
  const familyName = familyData?.name || 'Your Family';

  // Calculate account age in days
  const accountCreatedAt = new Date(user.created_at);
  const accountAgeDays = Math.floor((Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24));

  // Get dismissed notifications
  const dismissedNotifications = new Set<string>();
  if (userPrefs) {
    Object.keys(userPrefs).forEach(key => {
      if (key.startsWith('notification_dismissed_') && userPrefs[key] === true) {
        dismissedNotifications.add(key.replace('notification_dismissed_', ''));
      }
    });
  }

  // Get active notifications to show
  const activeNotifications = getActiveNotifications({
    userId: user.id,
    isFamilyCreator,
    accountAgeDays,
    hasChildren,
    hasMoments,
    hasPartner,
    dismissedNotifications,
    familyName,
  });

  return (
    <div className="min-h-screen bg-cream">
      <MobileNav
        userPhotoUrl={profilePhotoUrl || undefined}
        userName={displayName}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 animate-fadeSlideIn">
          <h2 className="text-3xl font-serif text-gray-900 mb-2">
            {children && children.length > 0
              ? `Capturing life with ${children.map(c => c.name).join(' & ')}`
              : `Welcome back, ${displayName}!`}
          </h2>
          <p className="text-gray-600 text-sm">
            {children && children.length > 0
              ? `${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — One little thing at a time`
              : 'Add your first child to start capturing moments'}
          </p>
        </div>

        {/* Notification Banner */}
        {activeNotifications.length > 0 && (
          <div className="animate-card-1">
            <NotificationBanner
              userId={user.id}
              notifications={activeNotifications}
            />
          </div>
        )}

        {/* Baby Countdown Card */}
        {dueDate && expectedChild && (
          <div className="mb-8 animate-card-1">
            <BabyCountdownCard
              dueDateISO={dueDate}
              babyName={expectedChild.name}
            />
          </div>
        )}

        {/* Daily Anchor */}
        <div className="mb-8 animate-card-2">
          <DailyAnchor
            userId={user.id}
            initialMantra={dailyMantra}
          />
        </div>

        {/* Quick Entry Form - Primary Action */}
        <div className="mb-8 animate-card-3">
          <QuickEntryForm
            children={children || []}
            familyId={familyId}
            userId={user.id}
          />
        </div>

        {/* Weekly Progress & Streak Widget */}
        <div className="animate-card-4">
          <StreakWidget entries={entries || []} children={children || []} />
        </div>

        {/* On This Day */}
        {onThisDayEntries && onThisDayEntries.length > 0 && (
          <div className="mb-8 animate-card-5">
            <OnThisDay entries={onThisDayEntries} />
          </div>
        )}

        {/* Recent Entries */}
        <div className="animate-fadeSlideIn" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
          <EntriesSection
            initialEntries={entries || []}
            children={children || []}
            familyId={familyId}
            userId={user.id}
          />
        </div>
      </main>
    </div>
  );
}
