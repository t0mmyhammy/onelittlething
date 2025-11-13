import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MobileNav from '@/components/MobileNav';
import RemindersView from '@/components/RemindersView';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RemindersPage() {
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

  // If user has no family, redirect to dashboard to set up
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

  // Get children for linking
  const { data: children } = await supabase
    .from('children')
    .select('id, name, photo_url')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  // Get all reminders with related data
  const { data: reminders } = await supabase
    .from('reminders')
    .select(`
      *,
      reminder_subtasks(*)
    `)
    .eq('family_id', familyId)
    .order('due_date', { ascending: true, nullsFirst: false });

  // Get family members for assignment
  const { data: familyMembersRaw } = await supabase
    .from('family_members')
    .select(`
      user_id,
      role,
      user:user_id (
        id,
        email
      )
    `)
    .eq('family_id', familyId);

  // Transform the data to ensure user is a single object, not an array
  const familyMembers = familyMembersRaw?.map((member: any) => ({
    user_id: member.user_id,
    role: member.role,
    user: Array.isArray(member.user) ? member.user[0] : member.user,
  })) || [];

  return (
    <div className="min-h-screen bg-cream">
      <MobileNav
        userPhotoUrl={profilePhotoUrl || undefined}
        userName={displayName}
        familyDueDate={familyDueDate}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Reminders</h1>
          <p className="text-gray-600">
            Shared notes and tasks for your family
          </p>
        </div>

        <RemindersView
          initialReminders={reminders || []}
          children={children || []}
          familyId={familyId}
          userId={user.id}
          familyMembers={familyMembers || []}
        />
      </main>
    </div>
  );
}
