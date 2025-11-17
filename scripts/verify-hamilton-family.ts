import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyHamiltonFamily() {
  console.log('=== Verifying Hamilton Family Setup ===\n');

  const familyId = 'e1b65436-4859-4bbc-b225-0ce8294f3ebe'; // Hamilton Family

  // Check family
  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('*')
    .eq('id', familyId)
    .single();

  if (familyError) {
    console.error('Error fetching family:', familyError);
    return;
  }

  console.log('Family:', family);
  console.log('\nDue Date:', family.due_date);

  // Check children
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('family_id', familyId)
    .order('birthdate', { ascending: true });

  console.log('\nChildren:', children?.length);
  children?.forEach((child, i) => {
    console.log(`  ${i + 1}. ${child.name} - birthdate: ${child.birthdate}`);
  });

  // Check if older children exist (born already)
  const today = new Date();
  const hasOlderChildren = children?.some(c => new Date(c.birthdate) <= today) || false;
  console.log('\nHas older children (already born):', hasOlderChildren);

  // Check baby prep list
  const { data: babyPrep, error: babyPrepError } = await supabase
    .from('baby_prep_lists')
    .select('*')
    .eq('family_id', familyId)
    .maybeSingle();

  if (babyPrepError) {
    console.error('\nError fetching baby prep list:', babyPrepError);
  } else if (babyPrep) {
    console.log('\n✓ Baby prep list exists:', babyPrep.id);
    console.log('  Stage:', babyPrep.stage);
    console.log('  Is second child:', babyPrep.is_second_child);

    // Check tasks
    const { data: tasks } = await supabase
      .from('baby_prep_tasks')
      .select('category, title, is_complete')
      .eq('list_id', babyPrep.id);

    console.log(`  Tasks: ${tasks?.length || 0}`);
    if (tasks && tasks.length > 0) {
      const tasksByCategory = tasks.reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('  Tasks by category:', tasksByCategory);
    }
  } else {
    console.log('\n✗ No baby prep list found');
    console.log('  Attempting to create one...');

    const { data: newList, error: createError } = await supabase
      .from('baby_prep_lists')
      .insert({
        family_id: familyId,
        stage: 'second',
        is_second_child: hasOlderChildren,
      })
      .select()
      .single();

    if (createError) {
      console.error('  ✗ Failed to create:', createError);
    } else {
      console.log('  ✓ Successfully created:', newList.id);
    }
  }

  // Check sidebar visibility logic
  console.log('\n=== Sidebar Visibility Check ===');
  const dueDate = new Date(family.due_date);
  const nineMonthsFromNow = new Date();
  nineMonthsFromNow.setMonth(today.getMonth() + 9);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  console.log('Today:', today.toISOString().split('T')[0]);
  console.log('Due date:', family.due_date);
  console.log('3 months ago:', threeMonthsAgo.toISOString().split('T')[0]);
  console.log('9 months from now:', nineMonthsFromNow.toISOString().split('T')[0]);

  const shouldShow = dueDate >= threeMonthsAgo && dueDate <= nineMonthsFromNow;
  console.log('\nShould show "Ready for Baby":', shouldShow);
  console.log('  Due date >= 3 months ago:', dueDate >= threeMonthsAgo);
  console.log('  Due date <= 9 months from now:', dueDate <= nineMonthsFromNow);
}

verifyHamiltonFamily().then(() => process.exit(0)).catch(console.error);
