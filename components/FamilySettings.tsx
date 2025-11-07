'use client';

import ChildrenSection from './ChildrenSection';
import { UserPlusIcon } from '@heroicons/react/24/outline';

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
  gender: string | null;
  photo_url: string | null;
  created_at: string;
  family_id: string;
}

interface FamilySettingsProps {
  familyId: string;
  initialChildren: Child[];
}

export default function FamilySettings({ familyId, initialChildren }: FamilySettingsProps) {
  return (
    <div className="space-y-8">
      {/* Children Section */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-serif text-gray-900 mb-2">Children</h2>
        <p className="text-gray-600 mb-8">
          Manage your children's profiles
        </p>

        <ChildrenSection
          initialChildren={initialChildren}
          familyId={familyId}
        />
      </div>

      {/* Family Members Section - Coming Soon */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border-2 border-dashed border-gray-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <UserPlusIcon className="w-8 h-8 text-gray-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-serif text-gray-900 mb-2">Invite Family Members</h2>
            <p className="text-gray-600 mb-4">
              Share your family's moments with your partner. Invite up to 2 parents to collaborate on capturing memories.
            </p>
            <div className="bg-amber/10 border border-amber/30 rounded-lg p-4">
              <p className="text-sm text-amber-900 font-medium">
                🚧 Coming Soon
              </p>
              <p className="text-sm text-amber-800 mt-1">
                This feature is currently in development. You'll soon be able to invite a co-parent to view and add moments together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
