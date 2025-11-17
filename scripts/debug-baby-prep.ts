import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugBabyPrep() {
  console.log('=== Baby Prep List Debug ===\n');

  // Get all families with due dates
  const { data: families, error: familiesError } = await supabase
    .from('families')
    .select('id, due_date, created_at');

  if (familiesError) {
    console.error('Error fetching families:', familiesError);
    return;
  }

  console.log(`Found ${families?.length || 0} families\n`);

  for (const family of families || []) {
    console.log(`\nFamily ID: ${family.id}`);
    console.log(`Due Date: ${family.due_date || 'NOT SET'}`);

    // Check family members
    const { data: members } = await supabase
      .from('family_members')
      .select('user_id')
      .eq('family_id', family.id);

    console.log(`Members: ${members?.length || 0}`);

    // Check if baby prep list exists
    const { data: babyPrep, error: babyPrepError } = await supabase
      .from('baby_prep_lists')
      .select('*')
      .eq('family_id', family.id)
      .maybeSingle();

    if (babyPrepError) {
      console.error(`ERROR fetching baby prep list:`, babyPrepError);
    } else if (babyPrep) {
      console.log(`✓ Baby prep list exists: ${babyPrep.id}`);
      console.log(`  Stage: ${babyPrep.stage}`);
      console.log(`  Is second child: ${babyPrep.is_second_child}`);

      // Check tasks
      const { data: tasks } = await supabase
        .from('baby_prep_tasks')
        .select('id')
        .eq('list_id', babyPrep.id);

      console.log(`  Tasks: ${tasks?.length || 0}`);
    } else {
      console.log(`✗ No baby prep list found`);

      // Try to create one
      console.log(`  Attempting to create baby prep list...`);
      const { data: newList, error: createError } = await supabase
        .from('baby_prep_lists')
        .insert({
          family_id: family.id,
          stage: 'second',
          is_second_child: false,
        })
        .select()
        .single();

      if (createError) {
        console.error(`  ✗ Failed to create:`, createError);
      } else {
        console.log(`  ✓ Successfully created: ${newList.id}`);
      }
    }
  }

  // Check for orphaned baby prep lists
  const { data: allBabyPrep } = await supabase
    .from('baby_prep_lists')
    .select('id, family_id');

  console.log(`\n=== Orphaned Baby Prep Lists ===`);
  for (const prep of allBabyPrep || []) {
    const { data: family } = await supabase
      .from('families')
      .select('id')
      .eq('id', prep.family_id)
      .maybeSingle();

    if (!family) {
      console.log(`Orphaned baby prep list: ${prep.id} (family ${prep.family_id} doesn't exist)`);
    }
  }
}

debugBabyPrep().then(() => process.exit(0)).catch(console.error);
