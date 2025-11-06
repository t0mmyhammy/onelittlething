'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChildAdded: () => void;
  familyId: string;
}

export default function AddChildModal({ isOpen, onClose, onChildAdded, familyId }: AddChildModalProps) {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  // Check if birthdate is in the future (parse as local date to avoid timezone issues)
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const isUnborn = birthdate && parseLocalDate(birthdate) > new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate familyId
    if (!familyId || familyId.trim() === '') {
      setError('Family ID is missing. Please refresh the page and try again.');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('children')
        .insert({
          family_id: familyId,
          name: name.trim(),
          birthdate: birthdate || null,
          gender: gender || null,
        });

      if (insertError) throw insertError;

      // Reset form
      setName('');
      setBirthdate('');
      setGender('');
      onChildAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add child');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-gray-900">Add a Child</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-2">
              Child's Name
            </label>
            <input
              id="childName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose focus:border-transparent outline-none transition-all"
              placeholder="Alex"
            />
          </div>

          <div>
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-2">
              {isUnborn ? 'Due Date' : 'Birthdate'} <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              id="birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (gender === 'boy') {
                    setGender('');
                  } else {
                    setGender('boy');
                  }
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 border-2 rounded-lg transition-all ${
                  gender === 'boy'
                    ? 'border-rose bg-rose/10 text-rose'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                } cursor-pointer`}
              >
                <span className="text-3xl font-bold">♂</span>
                <span className="text-sm font-medium">Boy</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (gender === 'girl') {
                    setGender('');
                  } else {
                    setGender('girl');
                  }
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 border-2 rounded-lg transition-all ${
                  gender === 'girl'
                    ? 'border-rose bg-rose/10 text-rose'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                } cursor-pointer`}
              >
                <span className="text-3xl font-bold">♀</span>
                <span className="text-sm font-medium">Girl</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all ${
                name.trim() && !loading
                  ? 'bg-rose hover:scale-[1.02]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Adding...' : 'Add Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
