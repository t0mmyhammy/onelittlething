'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface DeleteAccountSectionProps {
  userId: string;
  userName: string;
}

export default function DeleteAccountSection({ userId, userName }: DeleteAccountSectionProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      // Call the delete_user_account RPC function
      const { error: deleteError } = await supabase.rpc('delete_user_account', {
        user_id_param: userId
      });

      if (deleteError) {
        throw deleteError;
      }

      // Sign out (user should already be deleted from auth)
      await supabase.auth.signOut();

      // Redirect to home page
      router.push('/');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-red-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-serif text-gray-900 mb-2">Delete Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete your account and remove yourself from all families.
              <strong className="text-gray-900"> Your captured moments will remain in the family's history.</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4 list-disc list-inside">
              <li>You'll be removed from all families</li>
              <li>Your account and login will be deleted</li>
              <li>Your entries and moments will be preserved</li>
              <li>This action cannot be undone</li>
            </ul>
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <ExclamationTriangleIcon className="w-7 h-7 text-red-600" />
                </div>
                <h2 className="text-xl font-serif text-gray-900">Delete Account?</h2>
              </div>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmText('');
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete your account, <strong>{userName}</strong>?
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800 font-medium mb-2">
                  What will happen:
                </p>
                <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                  <li>Your login will be permanently deleted</li>
                  <li>You'll be removed from all families</li>
                  <li>You won't be able to sign in again</li>
                </ul>
              </div>
              <div className="bg-sage/10 border border-sage/30 rounded-lg p-4">
                <p className="text-sm text-gray-700 font-medium mb-2">
                  What will be kept:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>All your entries and moments</li>
                  <li>Photos you uploaded</li>
                  <li>Family's complete history</li>
                </ul>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-mono"
                autoFocus
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmText('');
                  setError('');
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmText !== 'DELETE'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
