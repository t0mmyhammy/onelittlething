'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserGroupIcon, EnvelopeIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

interface FamilyMember {
  id: string;
  user_id: string;
  role: string;
  user: {
    email: string;
    user_metadata: {
      full_name?: string;
    };
  };
}

interface PendingInvite {
  id: string;
  email: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface FamilyManagementProps {
  familyId: string;
  members: FamilyMember[];
  currentUserId: string;
}

export default function FamilyManagement({ familyId, members, currentUserId }: FamilyManagementProps) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadPendingInvites();
  }, [familyId]);

  const loadPendingInvites = async () => {
    const { data } = await supabase
      .from('family_invites')
      .select('id, email, status, created_at, expires_at')
      .eq('family_id', familyId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) {
      setPendingInvites(data);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setMessage(null);

    try {
      const response = await fetch('/api/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();
      console.log('Invite API response:', data); // Debug logging

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      // Check if there was a warning (email not sent)
      if (data.warning) {
        setMessage({ type: 'error', text: `Invite created but: ${data.warning}` });
      } else {
        setMessage({ type: 'success', text: `Invitation sent to ${email}!` });
      }

      setEmail('');
      loadPendingInvites(); // Refresh the list
    } catch (error: any) {
      console.error('Invite error:', error); // Debug logging
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('family_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Invitation cancelled' });
      loadPendingInvites(); // Refresh the list
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to cancel invitation' });
    }
  };

  const getInitials = (member: FamilyMember): string => {
    const name = member.user.user_metadata?.full_name || member.user.email?.split('@')[0] || 'User';
    return name.charAt(0).toUpperCase();
  };

  const getName = (member: FamilyMember): string => {
    return member.user.user_metadata?.full_name || member.user.email?.split('@')[0] || 'User';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-serif text-gray-900 mb-4 flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5" />
          Family Members
        </h3>

        {/* Current Members */}
        <div className="space-y-2 mb-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-10 h-10 rounded-full bg-sage text-white flex items-center justify-center font-medium">
                {getInitials(member)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {getName(member)}
                  {member.user_id === currentUserId && (
                    <span className="ml-2 text-sm text-gray-500">(You)</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">{member.user.email}</div>
              </div>
              <div className="text-sm text-gray-500 capitalize">{member.role}</div>
            </div>
          ))}
        </div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Pending Invitations
            </h4>
            <div className="space-y-2">
              {pendingInvites.map((invite) => {
                const daysLeft = Math.ceil((new Date(invite.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{invite.email}</div>
                      <div className="text-xs text-amber-700">
                        Expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelInvite(invite.id)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Invite Form */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <EnvelopeIcon className="w-5 h-5" />
            Invite Family Member
          </h4>

          <form onSubmit={handleInvite} className="space-y-3">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none transition-all"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-sage/10 text-sage'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || !email}
              className="w-full bg-sage text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-3">
            They'll receive an email with instructions to join your family.
          </p>
        </div>
      </div>
    </div>
  );
}
