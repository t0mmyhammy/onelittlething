'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ChildrenSection from './ChildrenSection';
import FamilyManagement from './FamilyManagement';

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
  userId: string;
}

export default function FamilySettings({ familyId, initialChildren, userId }: FamilySettingsProps) {
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadFamilyMembers();
  }, [familyId]);

  const loadFamilyMembers = async () => {
    const { data: members } = await supabase
      .from('family_members')
      .select('id, user_id, role')
      .eq('family_id', familyId);

    if (members) {
      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();

      const membersWithInfo = members.map((member) => {
        if (user && member.user_id === user.id) {
          return {
            ...member,
            user: {
              email: user.email || '',
              user_metadata: user.user_metadata || {}
            }
          };
        }
        return {
          ...member,
          user: {
            email: 'Family Member',
            user_metadata: { full_name: 'Family Member' }
          }
        };
      });
      setFamilyMembers(membersWithInfo);
    }
    setLoading(false);
  };

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

      {/* Family Members Section */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading...</div>
        ) : (
          <FamilyManagement
            familyId={familyId}
            members={familyMembers}
            currentUserId={userId}
          />
        )}
      </div>
    </div>
  );
}
