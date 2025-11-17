'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import NameCard from './NameCard';
import NameDetailSheet from './NameDetailSheet';
import AddNameSheet from './AddNameSheet';
import SwipeMode from './SwipeMode';
import TierView from './TierView';
import NameComparisonTable from './NameComparisonTable';

export type NameType = 'first' | 'middle';

export interface BabyName {
  id: string;
  family_id: string;
  name: string;
  type: NameType;
  is_favorite: boolean;
  notes: string | null;
  ai_enhanced_notes: any;
  reactions: any;
  order_index: number;
  tier: number | null; // 1=Love, 2=Like, 3=Maybe
  is_ai_generated: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Child {
  id: string;
  name: string;
  birthdate: string;
}

interface NameBoardViewProps {
  names: BabyName[];
  userId: string;
  familyId: string;
  children: Child[];
  familyLastName?: string;
}

type ViewMode = 'board' | 'swipe' | 'tiers' | 'table';
type Filter = 'all' | 'favorites' | 'first' | 'middle';

export default function NameBoardView({
  names: initialNames,
  userId,
  familyId,
  children,
  familyLastName = '',
}: NameBoardViewProps) {
  const [names, setNames] = useState<BabyName[]>(initialNames);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedNameId, setSelectedNameId] = useState<string | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [lastName, setLastName] = useState(familyLastName);
  const [generatingNames, setGeneratingNames] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const supabase = createClient();

  // Filter names based on current filter
  const filteredNames = names.filter(name => {
    if (filter === 'all') return true;
    if (filter === 'favorites') return name.is_favorite;
    if (filter === 'first') return name.type === 'first';
    if (filter === 'middle') return name.type === 'middle';
    return true;
  });

  const selectedName = names.find(n => n.id === selectedNameId);

  const handleAddName = async (name: string, type: NameType) => {
    const maxOrder = Math.max(...names.map(n => n.order_index), -1);

    const { data, error } = await supabase
      .from('baby_name_ideas')
      .insert({
        family_id: familyId,
        name: name.trim(),
        type,
        order_index: maxOrder + 1,
        created_by: userId,
      })
      .select()
      .single();

    if (!error && data) {
      setNames([...names, data]);
      setShowAddSheet(false);
    }
  };

  const handleUpdateName = async (nameId: string, updates: Partial<BabyName>) => {
    const { error } = await supabase
      .from('baby_name_ideas')
      .update(updates)
      .eq('id', nameId);

    if (!error) {
      setNames(names.map(n => n.id === nameId ? { ...n, ...updates } : n));
    }
  };

  const handleDeleteName = async (nameId: string) => {
    const { error } = await supabase
      .from('baby_name_ideas')
      .delete()
      .eq('id', nameId);

    if (!error) {
      setNames(names.filter(n => n.id !== nameId));
      setSelectedNameId(null);
    }
  };

  const handleToggleFavorite = async (nameId: string) => {
    const name = names.find(n => n.id === nameId);
    if (!name) return;

    await handleUpdateName(nameId, { is_favorite: !name.is_favorite });
  };

  const handleToggleReaction = async (nameId: string, emoji: string) => {
    const name = names.find(n => n.id === nameId);
    if (!name) return;

    const currentReactions = name.reactions || {};
    const userReactions = currentReactions[userId] || [];

    let newUserReactions;
    if (userReactions.includes(emoji)) {
      newUserReactions = userReactions.filter((r: string) => r !== emoji);
    } else {
      newUserReactions = [...userReactions, emoji];
    }

    const newReactions = {
      ...currentReactions,
      [userId]: newUserReactions,
    };

    await handleUpdateName(nameId, { reactions: newReactions });
  };

  const handleEnhanceName = async (nameId: string, addAINote: boolean = false) => {
    const name = names.find(n => n.id === nameId);
    if (!name) return;

    // Get sibling names
    const siblingNames = children
      .filter(c => new Date(c.birthdate) <= new Date())
      .map(c => c.name);

    try {
      const response = await fetch('/api/enhance-baby-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.name,
          type: name.type,
          siblingNames,
          lastName: lastName || undefined,
          generateNote: addAINote,
          existingNotes: name.notes || '',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updates: Partial<BabyName> = { ai_enhanced_notes: data.enhancements };

        // If AI generated a note, append it to existing notes
        if (data.aiNote) {
          const existingNotes = name.notes?.trim() || '';
          const separator = existingNotes ? '\n\n---\n\n' : '';
          updates.notes = existingNotes + separator + '✨ AI Insight: ' + data.aiNote;
        }

        await handleUpdateName(nameId, updates);
      }
    } catch (error) {
      console.error('Failed to enhance name:', error);
    }
  };

  const handleGenerateSimilarNames = async () => {
    setGeneratingNames(true);

    try {
      const response = await fetch('/api/generate-similar-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId,
          count: 20,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to generate names');
        return;
      }

      const { suggestions } = await response.json();

      // Get max order index
      const maxOrder = Math.max(...names.map(n => n.order_index), -1);

      // Insert all suggestions
      const namesToInsert = suggestions.map((suggestion: any, index: number) => ({
        family_id: familyId,
        name: suggestion.name,
        type: suggestion.type,
        notes: suggestion.reasoning,
        is_ai_generated: true,
        order_index: maxOrder + 1 + index,
        created_by: userId,
      }));

      const { data, error } = await supabase
        .from('baby_name_ideas')
        .insert(namesToInsert)
        .select();

      if (!error && data) {
        setNames([...names, ...data]);
        alert(`Added ${data.length} AI-suggested names!`);
      } else {
        console.error('Error inserting names:', error);
        alert('Failed to add names to database');
      }
    } catch (error) {
      console.error('Error generating similar names:', error);
      alert('Failed to generate name suggestions');
    } finally {
      setGeneratingNames(false);
    }
  };

  const handleUpdateTier = async (nameId: string, tier: number | null) => {
    const { error } = await supabase
      .from('baby_name_ideas')
      .update({ tier })
      .eq('id', nameId);

    if (!error) {
      setNames(names.map(n => n.id === nameId ? { ...n, tier } : n));
    }
  };

  const handleEnhanceAll = async () => {
    // Find names that don't have AI enhancements yet
    const unenhancedNames = names.filter(n => !n.ai_enhanced_notes || Object.keys(n.ai_enhanced_notes).length === 0);

    if (unenhancedNames.length === 0) {
      alert('All names are already enhanced!');
      return;
    }

    // Enhance each name sequentially (to avoid rate limits)
    for (const name of unenhancedNames) {
      await handleEnhanceName(name.id, false);
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const handleToggleSelection = (nameId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(nameId)) {
      newSelected.delete(nameId);
    } else {
      newSelected.add(nameId);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Delete ${selectedIds.size} selected names?`)) return;

    const idsToDelete = Array.from(selectedIds);

    const { error } = await supabase
      .from('baby_name_ideas')
      .delete()
      .in('id', idsToDelete);

    if (!error) {
      setNames(names.filter(n => !selectedIds.has(n.id)));
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredNames.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNames.map(n => n.id)));
    }
  };

  const isSwipeMode = viewMode === 'swipe';
  const isTiersMode = viewMode === 'tiers';
  const isTableMode = viewMode === 'table';
  const isBoardMode = viewMode === 'board';

  const getViewModeClass = (mode: ViewMode) => {
    return viewMode === mode
      ? 'bg-sage text-white'
      : 'bg-white text-gray-700 border border-gray-300';
  };

  if (isSwipeMode) {
    return (
      <SwipeMode
        names={filteredNames}
        onBack={() => setViewMode('board')}
        onFavorite={handleToggleFavorite}
      />
    );
  }

  if (isTiersMode) {
    return (
      <TierView
        names={names}
        onBack={() => setViewMode('board')}
        onUpdateTier={handleUpdateTier}
      />
    );
  }

  if (isTableMode) {
    return (
      <NameComparisonTable
        names={names}
        children={children}
        lastName={lastName}
        onBack={() => setViewMode('board')}
        onEnhanceAll={handleEnhanceAll}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="sticky top-0 bg-cream/95 backdrop-blur-sm z-10 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setViewMode('board')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${getViewModeClass('board')}`}
              >
                ◉ Board
              </button>
              <button
                onClick={() => setViewMode('tiers')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${getViewModeClass('tiers')}`}
              >
                ≡ Tiers
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${getViewModeClass('table')}`}
              >
                ☰ Table
              </button>
              <button
                onClick={() => setViewMode('swipe')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${getViewModeClass('swipe')}`}
              >
                ○ Swipe
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleGenerateSimilarNames}
                disabled={generatingNames}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                title="AI will suggest 20 names based on your current list"
              >
                <SparklesIcon className="w-4 h-4" />
                {generatingNames ? 'Generating...' : '✨ Add 20 More'}
              </button>
              <button
                onClick={() => setShowAddSheet(true)}
                className="flex items-center gap-2 px-4 py-2 bg-sage text-white rounded-full hover:opacity-90 transition-opacity font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                Add Name
              </button>
            </div>
          </div>

          {/* Segmented Control Filters */}
          <div className="flex gap-1 bg-gray-200 p-1 rounded-lg">
            {(['all', 'favorites', 'first', 'middle'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                {f === 'all' ? 'All' : f === 'favorites' ? 'Favorites' : f === 'first' ? 'First' : 'Middle'}
              </button>
            ))}
          </div>

          {/* Selection Mode Toolbar */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedIds(new Set());
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectionMode
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {selectionMode ? 'Cancel' : 'Select Multiple'}
            </button>

            {selectionMode && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm text-sage hover:underline font-medium"
                >
                  {selectedIds.size === filteredNames.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedIds.size > 0 && (
                  <>
                    <span className="text-sm text-gray-600">
                      {selectedIds.size} selected
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      Delete {selectedIds.size}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Name Grid */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {filteredNames.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">No names yet</p>
            <button
              onClick={() => setShowAddSheet(true)}
              className="text-sage font-medium hover:underline"
            >
              Add your first name idea
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredNames.map(name => (
              <NameCard
                key={name.id}
                name={name}
                onClick={() => setSelectedNameId(name.id)}
                onToggleFavorite={() => handleToggleFavorite(name.id)}
                onLongPress={() => setSelectedNameId(name.id)}
                selectionMode={selectionMode}
                isSelected={selectedIds.has(name.id)}
                onToggleSelection={() => handleToggleSelection(name.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Name Detail Sheet */}
      {selectedName && (
        <NameDetailSheet
          name={selectedName}
          userId={userId}
          children={children}
          lastName={lastName}
          onClose={() => setSelectedNameId(null)}
          onUpdate={handleUpdateName}
          onDelete={handleDeleteName}
          onToggleReaction={handleToggleReaction}
          onEnhance={handleEnhanceName}
        />
      )}

      {/* Add Name Sheet */}
      {showAddSheet && (
        <AddNameSheet
          onClose={() => setShowAddSheet(false)}
          onAdd={handleAddName}
        />
      )}
    </div>
  );
}
