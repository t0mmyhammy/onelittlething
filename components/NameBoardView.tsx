'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PlusIcon } from '@heroicons/react/24/outline';
import NameCard from './NameCard';
import NameDetailSheet from './NameDetailSheet';
import AddNameSheet from './AddNameSheet';
import SwipeMode from './SwipeMode';

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

type ViewMode = 'board' | 'swipe';
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

  const handleEnhanceName = async (nameId: string) => {
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
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await handleUpdateName(nameId, { ai_enhanced_notes: data.enhancements });
      }
    } catch (error) {
      console.error('Failed to enhance name:', error);
    }
  };

  const isSwipeMode = viewMode === 'swipe';

  if (isSwipeMode) {
    return (
      <SwipeMode
        names={filteredNames}
        onBack={() => setViewMode('board')}
        onFavorite={handleToggleFavorite}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="sticky top-0 bg-cream/95 backdrop-blur-sm z-10 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('board')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  viewMode === 'board'
                    ? 'bg-sage text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                ◉ Board
              </button>
              <button
                onClick={() => setViewMode('swipe')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !isSwipeMode
                    ? 'bg-white text-gray-700 border border-gray-300'
                    : 'bg-sage text-white'
                }`}
              >
                ○ Swipe
              </button>
            </div>

            {/* Add Name Button */}
            <button
              onClick={() => setShowAddSheet(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sage text-white rounded-full hover:opacity-90 transition-opacity font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Add Name
            </button>
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
