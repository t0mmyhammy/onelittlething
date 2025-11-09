'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CustomStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CustomStyleModal({
  isOpen,
  onClose,
  onSuccess,
}: CustomStyleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [corePrinciples, setCorePrinciples] = useState(['']);
  const [approachToDiscipline, setApproachToDiscipline] = useState('');
  const [approachToCommunication, setApproachToCommunication] = useState('');
  const [keyPhrases, setKeyPhrases] = useState(['']);
  const [recommendedAgeRange, setRecommendedAgeRange] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  if (!isOpen) return null;

  const addPrinciple = () => {
    setCorePrinciples([...corePrinciples, '']);
  };

  const removePrinciple = (index: number) => {
    setCorePrinciples(corePrinciples.filter((_, i) => i !== index));
  };

  const updatePrinciple = (index: number, value: string) => {
    const updated = [...corePrinciples];
    updated[index] = value;
    setCorePrinciples(updated);
  };

  const addKeyPhrase = () => {
    setKeyPhrases([...keyPhrases, '']);
  };

  const removeKeyPhrase = (index: number) => {
    setKeyPhrases(keyPhrases.filter((_, i) => i !== index));
  };

  const updateKeyPhrase = (index: number, value: string) => {
    const updated = [...keyPhrases];
    updated[index] = value;
    setKeyPhrases(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Filter out empty principles and phrases
      const filteredPrinciples = corePrinciples.filter(p => p.trim());
      const filteredPhrases = keyPhrases.filter(p => p.trim());

      if (filteredPrinciples.length === 0) {
        throw new Error('Please add at least one core principle');
      }

      const { error: insertError } = await supabase
        .from('custom_parenting_styles')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          core_principles: filteredPrinciples,
          approach_to_discipline: approachToDiscipline.trim() || null,
          approach_to_communication: approachToCommunication.trim() || null,
          key_phrases: filteredPhrases.length > 0 ? filteredPhrases : null,
          recommended_age_range: recommendedAgeRange.trim() || null,
        });

      if (insertError) throw insertError;

      // Reset form
      setName('');
      setDescription('');
      setCorePrinciples(['']);
      setApproachToDiscipline('');
      setApproachToCommunication('');
      setKeyPhrases(['']);
      setRecommendedAgeRange('');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create custom style');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-serif text-gray-900">Create Custom Parenting Style</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Attachment Parenting, My Family's Approach"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief overview of this parenting style..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Core Principles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Core Principles <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {corePrinciples.map((principle, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={principle}
                    onChange={(e) => updatePrinciple(index, e.target.value)}
                    placeholder="e.g., Connection before correction"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                  />
                  {corePrinciples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrinciple(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPrinciple}
                className="flex items-center gap-2 text-sm text-sage hover:text-sage/80 font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                Add Another Principle
              </button>
            </div>
          </div>

          {/* Approach to Discipline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approach to Discipline
            </label>
            <textarea
              value={approachToDiscipline}
              onChange={(e) => setApproachToDiscipline(e.target.value)}
              rows={3}
              placeholder="How should the AI coach approach discipline questions?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Approach to Communication */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approach to Communication
            </label>
            <textarea
              value={approachToCommunication}
              onChange={(e) => setApproachToCommunication(e.target.value)}
              rows={3}
              placeholder="How should parents communicate with their children?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Key Phrases */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Phrases
            </label>
            <div className="space-y-2">
              {keyPhrases.map((phrase, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={phrase}
                    onChange={(e) => updateKeyPhrase(index, e.target.value)}
                    placeholder='e.g., "I hear you..."'
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                  />
                  {keyPhrases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeKeyPhrase(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addKeyPhrase}
                className="flex items-center gap-2 text-sm text-sage hover:text-sage/80 font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                Add Another Phrase
              </button>
            </div>
          </div>

          {/* Recommended Age Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommended Age Range
            </label>
            <input
              type="text"
              value={recommendedAgeRange}
              onChange={(e) => setRecommendedAgeRange(e.target.value)}
              placeholder="e.g., 0-3 years, Toddlers through teens"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                loading || !name.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-sage hover:bg-sage/90'
              }`}
            >
              {loading ? 'Creating...' : 'Create Style'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
