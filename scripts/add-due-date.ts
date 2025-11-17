import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDueDate() {
  console.log('Adding due_date column to families table...\n');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE families
      ADD COLUMN IF NOT EXISTS due_date DATE;

      COMMENT ON COLUMN families.due_date IS 'Expected due date for baby countdown feature. Null if not expecting.';
    `
  });

  if (error) {
    console.error('Error adding column:', error);
    console.log('\nTrying alternative method...');

    // Alternative: use the SQL editor API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'ALTER TABLE families ADD COLUMN IF NOT EXISTS due_date DATE;'
      })
    });

    if (!response.ok) {
      console.error('Alternative method failed:', await response.text());
    } else {
      console.log('✓ Column added successfully');
    }
  } else {
    console.log('✓ Column added successfully');
  }

  // Verify
  const { data: families } = await supabase
    .from('families')
    .select('*')
    .limit(1);

  console.log('\nFamilies table columns:', Object.keys(families?.[0] || {}));
}

addDueDate().then(() => process.exit(0)).catch(console.error);
