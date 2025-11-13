/**
 * Fix orphaned pack lists and reminders that were created with empty family_id
 * This happened due to a navigation bug that caused familyId to be empty
 *
 * Run with: npx tsx scripts/fix-orphaned-data.ts
 */

import { createClient } from '@supabase/supabase-js';

// Direct credentials from .env.local
const supabaseUrl = 'https://fljfhbnwekoaonudtuqw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsamZoYm53ZWtvYW9udWR0dXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI3NzI5OCwiZXhwIjoyMDc3ODUzMjk4fQ.UksRNoeNBnl3A6NMPVGjEivuI7IKGCZNIaEjx6rj5hc';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixOrphanedData() {
  console.log('🔍 Checking for orphaned pack lists and reminders...\n');

  // First, let's see ALL pack lists and reminders
  const { data: allPackLists } = await supabase
    .from('pack_lists')
    .select('id, name, family_id, created_by_user_id, created_at')
    .order('created_at', { ascending: false });

  console.log(`Found ${allPackLists?.length || 0} total pack lists in database:`);
  allPackLists?.forEach(pl => {
    console.log(`  - "${pl.name}" (Family ID: ${pl.family_id || 'NULL'}, Created: ${new Date(pl.created_at).toLocaleString()})`);
  });

  const { data: allReminders } = await supabase
    .from('reminders')
    .select('id, title, family_id, created_by, created_at')
    .order('created_at', { ascending: false });

  console.log(`\nFound ${allReminders?.length || 0} total reminders in database:`);
  allReminders?.forEach(r => {
    console.log(`  - "${r.title}" (Family ID: ${r.family_id || 'NULL'}, Created: ${new Date(r.created_at).toLocaleString()})`);
  });

  // Find orphaned ones (family_id is null)
  const orphanedPackLists = allPackLists?.filter(pl => !pl.family_id) || [];
  const orphanedReminders = allReminders?.filter(r => !r.family_id) || [];

  console.log(`\n📊 Orphaned data:`);
  console.log(`  Pack lists without family_id: ${orphanedPackLists.length}`);
  console.log(`  Reminders without family_id: ${orphanedReminders.length}`);

  // Check family members to understand the user's family
  if (allPackLists && allPackLists.length > 0) {
    const sampleFamilyId = allPackLists[0].family_id;
    const sampleUserId = allPackLists[0].created_by_user_id;

    console.log(`\n🔍 Checking family membership for debugging:`);
    console.log(`  Family ID: ${sampleFamilyId}`);
    console.log(`  Creator User ID: ${sampleUserId}`);

    const { data: familyMembers } = await supabase
      .from('family_members')
      .select('user_id, role')
      .eq('family_id', sampleFamilyId);

    console.log(`  Family members in this family: ${familyMembers?.length || 0}`);
    familyMembers?.forEach(fm => {
      console.log(`    - User ${fm.user_id} (${fm.role})`);
    });

    // Check if the creator is in the family
    const creatorInFamily = familyMembers?.some(fm => fm.user_id === sampleUserId);
    console.log(`  Creator is in family: ${creatorInFamily ? 'YES' : 'NO'}`);
  }

  if (!orphanedPackLists?.length && !orphanedReminders?.length) {
    console.log('\n✅ No orphaned data found! All pack lists and reminders have valid family_id.');
    console.log('\n💡 If you still don\'t see your data in the app:');
    console.log('  1. Make sure you\'re logged in with the same account');
    console.log('  2. Restart your dev server (Ctrl+C, then npm run dev)');
    console.log('  3. Clear your browser cache and refresh the page');
    return;
  }

  console.log('\n🔧 Fixing orphaned data...\n');

  // Fix pack lists
  let packListsFixed = 0;
  for (const packList of orphanedPackLists || []) {
    if (!packList.created_by_user_id) {
      console.log(`  ⚠️  Cannot fix pack list "${packList.name}" - no creator ID`);
      continue;
    }

    // Get the creator's family
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', packList.created_by_user_id)
      .single();

    if (!familyMember?.family_id) {
      console.log(`  ⚠️  Cannot fix pack list "${packList.name}" - creator not in any family`);
      continue;
    }

    // Update the pack list
    const { error: updateError } = await supabase
      .from('pack_lists')
      .update({ family_id: familyMember.family_id })
      .eq('id', packList.id);

    if (updateError) {
      console.error(`  ❌ Failed to fix pack list "${packList.name}":`, updateError);
    } else {
      console.log(`  ✅ Fixed pack list "${packList.name}" - assigned to family ${familyMember.family_id}`);
      packListsFixed++;
    }
  }

  // Fix reminders
  let remindersFixed = 0;
  for (const reminder of orphanedReminders || []) {
    if (!reminder.created_by) {
      console.log(`  ⚠️  Cannot fix reminder "${reminder.title}" - no creator ID`);
      continue;
    }

    // Get the creator's family
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', reminder.created_by)
      .single();

    if (!familyMember?.family_id) {
      console.log(`  ⚠️  Cannot fix reminder "${reminder.title}" - creator not in any family`);
      continue;
    }

    // Update the reminder
    const { error: updateError } = await supabase
      .from('reminders')
      .update({ family_id: familyMember.family_id })
      .eq('id', reminder.id);

    if (updateError) {
      console.error(`  ❌ Failed to fix reminder "${reminder.title}":`, updateError);
    } else {
      console.log(`  ✅ Fixed reminder "${reminder.title}" - assigned to family ${familyMember.family_id}`);
      remindersFixed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Pack lists fixed: ${packListsFixed}/${orphanedPackLists?.length || 0}`);
  console.log(`  Reminders fixed: ${remindersFixed}/${orphanedReminders?.length || 0}`);
  console.log('\n✨ Done! Your data should now be visible in the app.');
}

fixOrphanedData().catch(console.error);
