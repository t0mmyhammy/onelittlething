import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import TimelineView from '@/components/TimelineView';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TimelinePage() {
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
    .select('family_id')
    .eq('user_id', user.id)
    .single();

  const familyId = familyMember?.family_id || '';

  // Get children (show all except explicitly archived)
  const { data: children } = await supabase
    .from('children')
    .select('id, name, birthdate, gender, photo_url, label_color, created_at, family_id, archived')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  // Get ALL entries (not limited like dashboard)
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

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Timeline</h1>
          <p className="text-gray-600">
            All your captured moments in one place
          </p>
        </div>

        <TimelineView
          initialEntries={entries || []}
          children={children || []}
          familyId={familyId}
          userId={user.id}
        />
      </main>
    </div>
  );
}
