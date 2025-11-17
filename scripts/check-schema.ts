import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('=== Checking Database Schema ===\n');

  // Check families table columns
  const { data: familiesData, error: familiesError } = await supabase
    .from('families')
    .select('*')
    .limit(1);

  if (familiesError) {
    console.error('Error querying families:', familiesError);
  } else {
    console.log('Families table columns:', Object.keys(familiesData?.[0] || {}));
  }

  // Check if baby_prep_lists table exists
  const { data: babyPrepData, error: babyPrepError } = await supabase
    .from('baby_prep_lists')
    .select('*')
    .limit(1);

  if (babyPrepError) {
    console.error('\nBaby prep lists table:', babyPrepError.message);
  } else {
    console.log('\nBaby prep lists table exists');
    console.log('Columns:', Object.keys(babyPrepData?.[0] || {}));
  }

  // Check if baby_prep_tasks table exists
  const { data: tasksData, error: tasksError } = await supabase
    .from('baby_prep_tasks')
    .select('*')
    .limit(1);

  if (tasksError) {
    console.error('\nBaby prep tasks table:', tasksError.message);
  } else {
    console.log('\nBaby prep tasks table exists');
    console.log('Columns:', Object.keys(tasksData?.[0] || {}));
  }

  // Check if baby_name_ideas table exists
  const { data: namesData, error: namesError } = await supabase
    .from('baby_name_ideas')
    .select('*')
    .limit(1);

  if (namesError) {
    console.error('\nBaby name ideas table:', namesError.message);
  } else {
    console.log('\nBaby name ideas table exists');
  }
}

checkSchema().then(() => process.exit(0)).catch(console.error);
