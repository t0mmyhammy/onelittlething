'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
  familyName: string;
  initialChildren: Child[];
  userId: string;
}

export default function FamilySettings({ familyId, familyName, initialChildren, userId }: FamilySettingsProps) {
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(familyName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    loadFamilyMembers();
  }, [familyId]);

  const loadFamilyMembers = async () => {
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select('id, user_id, role')
      .eq('family_id', familyId);

    if (membersError) {
      console.error('Error loading family members:', membersError);
      setLoading(false);
      return;
    }

    if (members && members.length > 0) {
      // Get user info for all members using RPC function
      const userIds = members.map(m => m.user_id);
      const { data: userInfo, error: rpcError } = await supabase.rpc('get_user_info', {
        user_ids: userIds
      });

      if (rpcError) {
        console.error('Error fetching user info:', rpcError);
      }

      console.log('User info from RPC:', userInfo);

      // Map user info to members
      const membersWithInfo = members.map((member) => {
        const info = userInfo?.find((u: any) => u.id === member.user_id);
        console.log('Member:', member.user_id, 'Info:', info);
        return {
          ...member,
          user: {
            email: info?.email || 'Unknown',
            user_metadata: {
              full_name: info?.full_name || info?.email?.split('@')[0] || 'Family Member'
            }
          }
        };
      });

      console.log('Members with info:', membersWithInfo);
      setFamilyMembers(membersWithInfo);
    }
    setLoading(false);
  };

  const handleSaveFamilyName = async () => {
    if (!editedName.trim()) return;

    setIsSavingName(true);
    const { error } = await supabase
      .from('families')
      .update({ name: editedName.trim() })
      .eq('id', familyId);

    if (!error) {
      setIsEditingName(false);
      // Refresh the page to update the name everywhere
      window.location.reload();
    } else {
      console.error('Error updating family name:', error);
    }
    setIsSavingName(false);
  };

  const handleCancelEdit = () => {
    setEditedName(familyName);
    setIsEditingName(false);
  };

  return (
    <div className="space-y-6">
      {/* Family Overview Banner */}
      <div className="bg-gradient-to-r from-sage/10 to-rose/10 rounded-2xl p-6 border border-sage/20">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-2xl font-serif text-gray-900 border-2 border-sage rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-sage"
                  placeholder="Family Name"
                  autoFocus
                />
                <button
                  onClick={handleSaveFamilyName}
                  disabled={isSavingName || !editedName.trim()}
                  className="p-2 text-sage hover:bg-sage/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Save"
                >
                  <CheckIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSavingName}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Cancel"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-serif text-gray-900">{familyName}</h2>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1.5 text-gray-400 hover:text-sage hover:bg-sage/10 rounded-lg transition-colors"
                  title="Edit family name"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            )}
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
