import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MobileNav from '@/components/MobileNav';
import ReadyForBabyView from '@/components/ReadyForBabyView';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReadyForBabyPage() {
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

  // Temporarily disabled - debugging navigation issue
  // If user has no family, redirect to dashboard to set up
  // if (!familyId) {
  //   console.error('User has no family_id, redirecting to dashboard');
  //   redirect('/dashboard');
  // }
  console.log('Ready for Baby - Family ID:', familyId || '(empty)');

  // Get user preferences for profile
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('display_name, profile_photo_url')
    .eq('user_id', user.id)
    .single();

  const displayName = userPrefs?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const profilePhotoUrl = userPrefs?.profile_photo_url;

  // Check if family has existing born children (not expected babies)
  const { data: existingChildren } = await supabase
    .from('children')
    .select('id, birthdate')
    .eq('family_id', familyId)
    .lte('birthdate', new Date().toISOString());

  const hasOlderChildren = (existingChildren?.length || 0) > 0;

  // Get or create baby prep list for this family
  let { data: babyPrepList, error: fetchError } = await supabase
    .from('baby_prep_lists')
    .select('*')
    .eq('family_id', familyId)
    .single();

  // Log fetch result for debugging
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching baby prep list:', fetchError);
  }

  // If no list exists, create one
  if (!babyPrepList) {
    console.log('Creating new baby prep list for family:', familyId);

    const { data: newList, error: insertError } = await supabase
      .from('baby_prep_lists')
      .insert({
        family_id: familyId,
        stage: 'second', // Default to second trimester
        is_second_child: hasOlderChildren,
      })
      .select()
      .single();

    if (insertError) {
      console.error('CRITICAL: Failed to create baby prep list:', insertError);
      console.error('Family ID:', familyId);
      console.error('Has older children:', hasOlderChildren);
      // Don't throw, let component handle null state gracefully
    } else {
      console.log('Successfully created baby prep list:', newList?.id);
      babyPrepList = newList;
    }
  } else if (babyPrepList && babyPrepList.is_second_child !== hasOlderChildren) {
    // Update if the status has changed
    await supabase
      .from('baby_prep_lists')
      .update({ is_second_child: hasOlderChildren })
      .eq('id', babyPrepList.id);

    babyPrepList.is_second_child = hasOlderChildren;
  }

  // Final check - log warning if still null
  if (!babyPrepList) {
    console.error('WARNING: babyPrepList is null after fetch/create attempts');
    console.error('Family ID:', familyId);
    console.error('User ID:', user.id);
  }

  // Get all tasks for this list
  const { data: tasks } = await supabase
    .from('baby_prep_tasks')
    .select('*')
    .eq('list_id', babyPrepList?.id || '')
    .order('order_index', { ascending: true });

  // Get all name ideas for this family
  const { data: nameIdeas } = await supabase
    .from('baby_name_ideas')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  // Get all comments for name ideas
  const nameIdeaIds = nameIdeas?.map(n => n.id) || [];
  const { data: comments } = nameIdeaIds.length > 0
    ? await supabase
        .from('baby_name_comments')
        .select('*')
        .in('name_id', nameIdeaIds)
        .order('created_at', { ascending: true })
    : { data: [] };

  return (
    <div className="min-h-screen bg-cream">
      <MobileNav
        userPhotoUrl={profilePhotoUrl || undefined}
        userName={displayName}
        familyDueDate={familyDueDate}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReadyForBabyView
          babyPrepList={babyPrepList || null}
          tasks={tasks || []}
          nameIdeas={nameIdeas || []}
          comments={comments || []}
          userId={user.id}
          familyId={familyId}
        />
      </main>
    </div>
  );
}
