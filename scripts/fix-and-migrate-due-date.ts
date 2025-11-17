import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAndMigrate() {
  console.log('=== Fixing Schema and Migrating Due Dates ===\n');

  // Step 1: Get all families and their children
  const { data: families, error: familiesError } = await supabase
    .from('families')
    .select('id, name');

  if (familiesError) {
    console.error('Error fetching families:', familiesError);
    return;
  }

  console.log(`Found ${families?.length || 0} families\n`);

  for (const family of families || []) {
    console.log(`\nFamily: ${family.name} (${family.id})`);

    // Get children for this family
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('id, name, birthdate')
      .eq('family_id', family.id)
      .order('birthdate', { ascending: false });

    if (childrenError) {
      console.error('  Error fetching children:', childrenError);
      continue;
    }

    console.log(`  Children: ${children?.length || 0}`);

    if (children && children.length > 0) {
      // Use the youngest child's birthdate as the due date
      const youngestChild = children[0];
      console.log(`  Youngest child: ${youngestChild.name}, birthdate: ${youngestChild.birthdate}`);

      // Check if this is a future birthdate (expected baby) or past (already born)
      const birthdate = new Date(youngestChild.birthdate);
      const today = new Date();

      if (birthdate > today) {
        console.log('  This is an expected baby (future birthdate)');
      } else {
        console.log('  This baby is already born');

        // Calculate if within 3 months postpartum (fourth trimester)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        if (birthdate >= threeMonthsAgo) {
          console.log('  Within fourth trimester - will show Ready for Baby');
        } else {
          console.log('  Past fourth trimester - Ready for Baby may not show');
        }
      }

      // Update the family with the due date
      console.log(`  Updating family due_date to: ${youngestChild.birthdate}`);

      const { error: updateError } = await supabase
        .from('families')
        .update({ due_date: youngestChild.birthdate })
        .eq('id', family.id);

      if (updateError) {
        console.error('  ✗ Error updating due_date:', updateError);
      } else {
        console.log('  ✓ Successfully updated due_date');
      }
    } else {
      console.log('  No children found - skipping');
    }
  }

  console.log('\n=== Migration Complete ===');
  console.log('\nNext: Verify the fixes worked');
  console.log('Run: npx tsx scripts/check-schema.ts');
}

fixAndMigrate().then(() => process.exit(0)).catch(console.error);
