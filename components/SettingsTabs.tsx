'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import PersonalSettings from './PersonalSettings';
import FamilySettings from './FamilySettings';

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
  gender: string | null;
  photo_url: string | null;
  created_at: string;
  family_id: string;
}

interface UserPrefs {
  display_name: string | null;
  profile_photo_url: string | null;
}

interface SettingsTabsProps {
  user: any;
  initialUserPrefs: UserPrefs | null;
  familyId: string;
  initialChildren: Child[];
}

type Tab = 'profile' | 'family';

export default function SettingsTabs({
  user,
  initialUserPrefs,
  familyId,
  initialChildren,
}: SettingsTabsProps) {
  const router = useRouter();

  // Initialize tab from URL hash
  const getInitialTab = (): Tab => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (hash === 'family') return 'family';
    }
    return 'profile';
  };

  const [activeTab, setActiveTab] = useState<Tab>(getInitialTab());

  // Update URL hash when tab changes
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Listen for hash changes (e.g., browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'family' || hash === 'profile') {
        setActiveTab(hash as Tab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-sand">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account, profile, and family
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex gap-8">
            <button
              onClick={() => handleTabChange('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-rose text-rose'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => handleTabChange('family')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'family'
                  ? 'border-rose text-rose'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Family
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <PersonalSettings user={user} initialUserPrefs={initialUserPrefs} />
        )}

        {activeTab === 'family' && (
          <FamilySettings familyId={familyId} initialChildren={initialChildren} userId={user.id} />
        )}
      </main>
    </div>
  );
}
