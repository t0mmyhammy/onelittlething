'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserGroupIcon, EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

interface FamilyManagementProps {
  familyId: string;
  members: FamilyMember[];
  currentUserId: string;
}

export default function FamilyManagement({ familyId, members, currentUserId }: FamilyManagementProps) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = createClient();

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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      setMessage({ type: 'success', text: `Invitation sent to ${email}!` });
      setEmail('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSending(false);
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

        {/* Invite Form */}
        <div className="border-t border-gray-200 pt-6">
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
