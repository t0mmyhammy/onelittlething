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
  archived?: boolean | null;
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

  // Get family name (could be fetched from database in future)
  const getFamilyName = () => {
    if (initialChildren.length > 0) {
      const firstChildName = initialChildren[0].name.split(' ').pop() || 'Family';
      return `The ${firstChildName} Family`;
    }
    return 'Your Family';
  };

  return (
    <div className="space-y-6">
      {/* Family Overview Banner */}
      <div className="bg-gradient-to-r from-sage/10 to-rose/10 rounded-2xl p-6 border border-sage/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif text-gray-900 mb-1">{getFamilyName()}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{initialChildren.filter(c => !c.archived).length} {initialChildren.filter(c => !c.archived).length === 1 ? 'child' : 'children'}</span>
              <span>·</span>
              <span>{familyMembers.length} {familyMembers.length === 1 ? 'member' : 'members'}</span>
            </div>
          </div>
          {/* Member avatars */}
          <div className="flex -space-x-2">
            {familyMembers.slice(0, 3).map((member, idx) => {
              const name = member.user?.user_metadata?.full_name || member.user?.email?.split('@')[0] || 'User';
              const initial = name.charAt(0).toUpperCase();
              return (
                <div
                  key={member.id}
                  className="w-10 h-10 rounded-full bg-sage text-white border-2 border-white flex items-center justify-center font-medium shadow-sm"
                  style={{ zIndex: 10 - idx }}
                  title={name}
                >
                  {initial}
                </div>
              );
            })}
            {familyMembers.length > 3 && (
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 border-2 border-white flex items-center justify-center font-medium shadow-sm text-xs">
                +{familyMembers.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-serif text-gray-900 mb-2">Children</h2>
        <p className="text-gray-600 mb-6">
          Manage your children's profiles
        </p>

        <ChildrenSection
          initialChildren={initialChildren}
          familyId={familyId}
        />
      </div>

      {/* Family Members Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
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
