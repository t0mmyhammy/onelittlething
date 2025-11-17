'use client';

import { useState } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDroppable } from '@dnd-kit/core';

interface Child {
  id: string;
  name: string;
  birthdate: string;
}

interface FamilyFitSpotlightProps {
  children: Child[];
  lastName: string;
  parentNames: string[];
  spotlightName: string | null;
  onUpdateParentNames: (names: string[]) => void;
}

export default function FamilyFitSpotlight({
  children,
  lastName,
  parentNames,
  spotlightName,
  onUpdateParentNames,
}: FamilyFitSpotlightProps) {
  const [isEditingParents, setIsEditingParents] = useState(false);
  const [editedParentNames, setEditedParentNames] = useState(parentNames.join(', '));

  const { setNodeRef, isOver } = useDroppable({
    id: 'family-fit-spotlight',
  });

  const siblingNames = children
    .filter(c => new Date(c.birthdate) <= new Date())
    .map(c => c.name);

  const handleSaveParentNames = () => {
    const names = editedParentNames
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    onUpdateParentNames(names);
    setIsEditingParents(false);
  };

  const handleCancelEdit = () => {
    setEditedParentNames(parentNames.join(', '));
    setIsEditingParents(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-2xl border-2 p-6 mb-6 transition-all ${
        isOver ? 'border-sage bg-sage/5 scale-[1.02]' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">See Family Fit</h3>
        {!isEditingParents && parentNames.length === 0 && (
          <button
            onClick={() => setIsEditingParents(true)}
            className="text-sm text-sage hover:text-sage/80 font-medium flex items-center gap-1"
          >
            <PencilIcon className="w-4 h-4" />
            Add Parent Names
          </button>
        )}
      </div>

      {/* Parent Names Editor */}
      {isEditingParents ? (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parent Names (comma separated)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={editedParentNames}
              onChange={(e) => setEditedParentNames(e.target.value)}
              placeholder="e.g., Tom, Natalia"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
            />
            <button
              onClick={handleSaveParentNames}
              className="p-2 bg-sage text-white rounded-lg hover:bg-sage/90"
            >
              <CheckIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        parentNames.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Parents:</span>
            <span className="text-sm font-medium text-gray-900">{parentNames.join(', ')}</span>
            <button
              onClick={() => setIsEditingParents(true)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </div>
        )
      )}

      {/* Spotlight Display */}
      <div className="text-center">
        {spotlightName ? (
          <div className="bg-gradient-to-r from-purple-50 to-sage/10 rounded-xl p-8 border-2 border-sage/20">
            <p className="text-sm text-gray-600 mb-3">Your Family Could Be:</p>
            <div className="flex items-center justify-center gap-3 flex-wrap text-2xl font-serif">
              {parentNames.map((parent, i) => (
                <span key={i} className="text-gray-900">
                  {parent}
                  {i < parentNames.length - 1 && ','}
                </span>
              ))}
              {parentNames.length > 0 && siblingNames.length > 0 && <span className="text-gray-400">,</span>}
              {siblingNames.map((sibling, i) => (
                <span key={sibling} className="text-gray-900">
                  {sibling}
                  {i < siblingNames.length - 1 && ','}
                </span>
              ))}
              {(parentNames.length > 0 || siblingNames.length > 0) && <span className="text-gray-400">and</span>}
              <span className="text-sage font-bold">{spotlightName}</span>
              <span className="text-gray-900">{lastName}</span>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <p className="text-gray-500 mb-2">
              👋 Drag a name here to see your family fit
            </p>
            <p className="text-sm text-gray-400">
              {parentNames.length > 0 && `${parentNames.join(', ')}, `}
              {siblingNames.length > 0 && `${siblingNames.join(', ')}, `}
              <span className="text-sage font-medium">____</span> {lastName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
