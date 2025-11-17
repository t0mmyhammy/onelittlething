'use client';

import { useState } from 'react';
import { ChevronLeftIcon, SparklesIcon, TrashIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { BabyName, NameType } from './NameBoardView';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Child {
  id: string;
  name: string;
  birthdate: string;
}

interface NameComparisonTableProps {
  names: BabyName[];
  children: Child[];
  lastName: string;
  onBack: () => void;
  onEnhanceAll: () => Promise<void>;
  onDelete: (nameId: string) => Promise<void>;
  onOpenComments: (nameId: string) => void;
  onUpdateOrder: (nameId: string, newIndex: number) => Promise<void>;
}

interface SortableRowProps {
  name: BabyName;
  idx: number;
  enhanced: any;
  nicknames: string[];
  lastName: string;
  siblingNames: string[];
  onDelete: (nameId: string) => Promise<void>;
  onOpenComments: (nameId: string) => void;
}

function SortableRow({
  name,
  idx,
  enhanced,
  nicknames,
  lastName,
  siblingNames,
  onDelete,
  onOpenComments,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: name.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Better vibe detection - check for explicit vibe field first, then fallback to smart detection
  const getVibe = () => {
    if (enhanced.vibe) return enhanced.vibe;

    const origin = (enhanced.origin || '').toLowerCase();
    const meaning = (enhanced.meaning || '').toLowerCase();
    const popularity = (enhanced.popularity || '').toLowerCase();

    // Check origin for style indicators
    if (origin.includes('vintage') || origin.includes('old-fashioned')) return 'Vintage';
    if (origin.includes('modern') || origin.includes('contemporary')) return 'Modern';
    if (origin.includes('classic') || origin.includes('timeless')) return 'Classic';
    if (origin.includes('trendy') || popularity.includes('trending')) return 'Trendy';
    if (origin.includes('traditional')) return 'Traditional';

    // Check meaning for nature/spiritual themes
    if (meaning.includes('nature') || meaning.includes('flower') || meaning.includes('tree')) return 'Nature';
    if (meaning.includes('spiritual') || meaning.includes('divine') || meaning.includes('god')) return 'Spiritual';

    // Check popularity for rarity
    if (popularity.includes('rare') || popularity.includes('uncommon')) return 'Unique';
    if (popularity.includes('top 10') || popularity.includes('top 20')) return 'Popular';
    if (popularity.includes('top 100')) return 'Common';

    return 'Classic';
  };

  const vibe = getVibe();

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
    >
      {/* Name - Sticky with drag handle */}
      <td className={`px-4 py-3 font-semibold text-gray-900 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mr-1"
          >
            ⋮⋮
          </div>
          {name.name}
          {name.is_favorite && <span className="text-sm">⭐</span>}
          {name.is_ai_generated && (
            <span className="text-xs text-purple-600">✨</span>
          )}
        </div>
      </td>

      {/* Meaning */}
      <td className="px-4 py-3 text-gray-700">
        {enhanced.meaning || '—'}
      </td>

      {/* Popularity */}
      <td className="px-4 py-3 text-gray-700">
        {enhanced.popularity || '—'}
      </td>

      {/* Nicknames */}
      <td className="px-4 py-3">
        {nicknames.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {nicknames.map((nick: string, i: number) => (
              <span
                key={i}
                className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {nick}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      {/* Origin */}
      <td className="px-4 py-3 text-gray-700">
        {enhanced.origin || '—'}
      </td>

      {/* Vibe */}
      <td className="px-4 py-3">
        <span className="inline-block px-3 py-1 bg-sage/20 text-sage rounded-full text-xs font-medium">
          {vibe}
        </span>
      </td>

      {/* Flow with Last Name */}
      {lastName && (
        <td className="px-4 py-3 text-gray-700">
          {enhanced.fullNameFlow || `${name.name} ${lastName}`}
        </td>
      )}

      {/* Flow with Siblings */}
      {siblingNames.map(sibName => (
        <td key={sibName} className="px-4 py-3 text-gray-700">
          {enhanced.siblingCompatibility || '—'}
        </td>
      ))}

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onOpenComments(name.id)}
            className="p-2 text-gray-500 hover:text-sage hover:bg-sage/10 rounded-lg transition-colors"
            title="View comments"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(name.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete name"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function NameComparisonTable({
  names,
  children,
  lastName,
  onBack,
  onEnhanceAll,
  onDelete,
  onOpenComments,
  onUpdateOrder,
}: NameComparisonTableProps) {
  const [enhancing, setEnhancing] = useState(false);
  const [activeTab, setActiveTab] = useState<NameType>('first');

  // Get names with AI enhancements only (since we need the data for comparison)
  const enhancedNames = names
    .filter(n => n.ai_enhanced_notes && Object.keys(n.ai_enhanced_notes).length > 0)
    .filter(n => n.type === activeTab);
  const unenhancedCount = names.filter(n => n.type === activeTab).length - enhancedNames.length;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleEnhanceAll = async () => {
    setEnhancing(true);
    await onEnhanceAll();
    setEnhancing(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = enhancedNames.findIndex(n => n.id === active.id);
      const newIndex = enhancedNames.findIndex(n => n.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onUpdateOrder(active.id as string, newIndex);
      }
    }
  };

  // Get sibling names for column headers
  const siblingNames = children
    .filter(c => new Date(c.birthdate) <= new Date())
    .map(c => c.name);

  if (enhancedNames.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="sticky top-0 bg-cream/95 backdrop-blur-sm z-10 border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <p className="text-xl text-gray-600 mb-4">No enhanced names yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Click "Enhance All Names" to generate comparison data for all {names.length} names, or enhance individual names from the Board view.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleEnhanceAll}
                disabled={enhancing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full hover:opacity-90 font-medium disabled:opacity-50"
              >
                <SparklesIcon className="w-5 h-5" />
                {enhancing ? 'Enhancing...' : `Enhance All ${names.length} Names`}
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="sticky top-0 bg-cream/95 backdrop-blur-sm z-10 border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between w-full gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Back
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Name Comparison Table</h2>
          {unenhancedCount > 0 && (
            <button
              onClick={handleEnhanceAll}
              disabled={enhancing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full hover:opacity-90 font-medium text-sm disabled:opacity-50"
            >
              <SparklesIcon className="w-4 h-4" />
              {enhancing ? 'Enhancing...' : `Enhance ${unenhancedCount} More`}
            </button>
          )}
          {unenhancedCount === 0 && <div className="w-20" />}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex gap-1 px-4">
          <button
            onClick={() => setActiveTab('first')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'first'
                ? 'border-sage text-sage'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            First Names
          </button>
          <button
            onClick={() => setActiveTab('middle')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'middle'
                ? 'border-sage text-sage'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Middle Names
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full py-6 overflow-x-auto">
        <div className="bg-white shadow-sm border-y border-gray-200">
          <table className="w-full text-sm min-w-max">
            <thead className="bg-sage text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold sticky left-0 bg-sage z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Name</th>
                <th className="px-4 py-3 text-left font-semibold min-w-[200px]">Meaning</th>
                <th className="px-4 py-3 text-left font-semibold min-w-[120px]">Popularity</th>
                <th className="px-4 py-3 text-left font-semibold min-w-[150px]">Nicknames</th>
                <th className="px-4 py-3 text-left font-semibold min-w-[100px]">Origin</th>
                <th className="px-4 py-3 text-left font-semibold min-w-[120px]">Vibe</th>
                {lastName && (
                  <th className="px-4 py-3 text-left font-semibold min-w-[180px]">
                    Flow with {lastName}
                  </th>
                )}
                {siblingNames.map(sibName => (
                  <th key={sibName} className="px-4 py-3 text-left font-semibold min-w-[180px]">
                    Flow with {sibName}
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-semibold min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={enhancedNames.map(n => n.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="divide-y divide-gray-200">
                  {enhancedNames.map((name, idx) => {
                    const enhanced = name.ai_enhanced_notes || {};
                    const nicknames = enhanced.nicknames || [];

                    return (
                      <SortableRow
                        key={name.id}
                        name={name}
                        idx={idx}
                        enhanced={enhanced}
                        nicknames={nicknames}
                        lastName={lastName}
                        siblingNames={siblingNames}
                        onDelete={onDelete}
                        onOpenComments={onOpenComments}
                      />
                    );
                  })}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>

        {/* Info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            Showing {enhancedNames.length} name{enhancedNames.length !== 1 ? 's' : ''} with AI enhancements.
            Names without enhancements won't appear in this table.
          </p>
        </div>
      </div>
    </div>
  );
}
