'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { BabyName } from './NameBoardView';
import TierNameCard from './TierNameCard';

interface TierViewProps {
  names: BabyName[];
  onBack: () => void;
  onUpdateTier: (nameId: string, tier: number | null) => void;
}

const TIERS = [
  { id: 1, label: 'Love', color: 'rose', emoji: '❤️' },
  { id: 2, label: 'Like', color: 'amber', emoji: '👍' },
  { id: 3, label: 'Maybe', color: 'gray', emoji: '🤔' },
  { id: null, label: 'Unranked', color: 'slate', emoji: '📋' },
] as const;

function DroppableTierContainer({
  tierId,
  children,
  className
}: {
  tierId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: tierId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-sage/10 border-sage' : ''}`}
    >
      {children}
    </div>
  );
}

export default function TierView({ names, onBack, onUpdateTier }: TierViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // This helps with the drag feedback
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      const nameId = active.id as string;
      let targetTier: number | null = null;

      // Check if we dropped over a tier container or a name card
      const overId = over.id as string;

      if (overId.startsWith('tier-')) {
        // Dropped on tier container
        const tierStr = overId.replace('tier-', '');
        targetTier = tierStr === 'null' ? null : parseInt(tierStr);
      } else {
        // Dropped on another name card - find which tier it's in
        const targetName = names.find(n => n.id === overId);
        if (targetName) {
          targetTier = targetName.tier;
        }
      }

      // Only update if we actually have a valid tier and it's different
      const draggedName = names.find(n => n.id === nameId);
      if (draggedName && draggedName.tier !== targetTier) {
        onUpdateTier(nameId, targetTier);
      }
    }

    setActiveId(null);
  };

  const getNamesByTier = (tier: number | null) => {
    return names.filter(n => n.tier === tier);
  };

  const activeName = names.find(n => n.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-cream">
        {/* Header */}
        <div className="sticky top-0 bg-cream/95 backdrop-blur-sm z-10 border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Back
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Rank Your Names</h2>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Tier Columns */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {TIERS.map((tier) => {
              const tierNames = getNamesByTier(tier.id);
              const tierId = `tier-${tier.id}`;

              return (
                <SortableContext
                  key={tierId}
                  id={tierId}
                  items={tierNames.map(n => n.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="bg-white rounded-xl border-2 border-gray-200 min-h-[400px]">
                    {/* Tier Header */}
                    <div className={`p-4 border-b-2 border-gray-200 bg-gradient-to-br from-${tier.color}-50 to-${tier.color}-100`}>
                      <div className="flex items-center gap-2 justify-center">
                        <span className="text-2xl">{tier.emoji}</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {tier.label}
                        </h3>
                      </div>
                      <p className="text-center text-sm text-gray-600 mt-1">
                        {tierNames.length} {tierNames.length === 1 ? 'name' : 'names'}
                      </p>
                    </div>

                    {/* Names List - Droppable */}
                    <DroppableTierContainer
                      tierId={tierId}
                      className="p-3 space-y-2 min-h-[300px] transition-colors"
                    >
                      {tierNames.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                          Drag names here
                        </div>
                      ) : (
                        tierNames.map((name) => (
                          <TierNameCard key={name.id} name={name} />
                        ))
                      )}
                    </DroppableTierContainer>
                  </div>
                </SortableContext>
              );
            })}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeName && (
            <div className="bg-white rounded-lg p-3 shadow-xl border-2 border-sage">
              <p className="font-semibold text-gray-900">{activeName.name}</p>
              <span className="text-xs text-gray-500">
                {activeName.type === 'first' ? 'First' : 'Middle'}
              </span>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
