'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, Pencil, Check, X, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface IdeaItem {
  id: string;
  child_id: string;
  category: string;
  item_name: string;
  size: string | null;
  fit_notes: string | null;
  brand: string | null;
  state: 'idea' | 'discussing' | 'approved';
  next_size_up: boolean;
  photo_url: string | null;
}

interface ChildSize {
  shoe_size: string | null;
  pants_size: string | null;
  shirt_size: string | null;
}

interface IdeasTabProps {
  childId: string;
  childName: string;
  inventoryItems: IdeaItem[];
  childSizes: ChildSize | null;
  familyId: string;
}

type FilterType = 'all' | 'ideas' | 'discussing' | 'approved';

export default function IdeasTab({ childId, childName, inventoryItems, childSizes, familyId }: IdeasTabProps) {
  const supabase = createClient();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Shoes', 'Tops', 'Bottoms']));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState<IdeaItem[]>(inventoryItems);

  // Update items when child changes or inventoryItems prop changes
  useEffect(() => {
    setItems(inventoryItems);
  }, [inventoryItems, childId]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const filtered = items.filter(item => {
      if (filter === 'ideas') return item.state === 'idea';
      if (filter === 'discussing') return item.state === 'discussing';
      if (filter === 'approved') return item.state === 'approved';
      return true;
    });

    const grouped: { [category: string]: IdeaItem[] } = {};
    filtered.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    // Sort items within each category (ideas first, then discussing, then approved)
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        const stateOrder = { idea: 0, discussing: 1, approved: 2 };
        return stateOrder[a.state] - stateOrder[b.state];
      });
    });

    return grouped;
  }, [items, filter]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const updateState = async (itemId: string, newState: 'idea' | 'discussing' | 'approved') => {
    await supabase
      .from('inventory_items')
      .update({ state: newState })
      .eq('id', itemId);

    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, state: newState } : item
    ));
  };

  const handleAddToWishlist = async (item: IdeaItem) => {
    const { error } = await supabase
      .from('shopping_list_items')
      .insert({
        child_id: childId,
        family_id: familyId,
        item_name: item.item_name,
        category: item.category,
        size: item.size,
        brand: item.brand,
        notes: item.fit_notes,
        is_completed: false,
        status: 'idle',
        archived: false,
      });

    if (!error) {
      alert(`Added "${item.item_name}" to wishlist!`);
    }
  };

  const getCategorySize = (category: string) => {
    if (!childSizes) return null;

    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('shoe')) {
      const sizes = childSizes.shoe_size?.split('/');
      return { current: sizes?.[0], next: sizes?.[1] };
    } else if (categoryLower.includes('pant') || categoryLower.includes('bottom')) {
      const sizes = childSizes.pants_size?.split('/');
      return { current: sizes?.[0], next: sizes?.[1] };
    } else if (categoryLower.includes('shirt') || categoryLower.includes('top')) {
      const sizes = childSizes.shirt_size?.split('/');
      return { current: sizes?.[0], next: sizes?.[1] };
    }
    return null;
  };

  const filterButtons: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'Show All' },
    { id: 'ideas', label: 'Ideas' },
    { id: 'discussing', label: 'Discussing' },
    { id: 'approved', label: 'Approved' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-serif text-gray-900">{childName}'s Ideas</h2>
          <p className="text-sm text-gray-600 mt-1">Brainstorm and validate gift ideas</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        {filterButtons.map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === btn.id
                ? 'bg-sage text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          const isExpanded = expandedCategories.has(category);
          const categorySize = getCategorySize(category);
          const approvedCount = categoryItems.filter(i => i.state === 'approved').length;

          return (
            <div key={category} className="border border-sand rounded-xl overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">{category}</span>
                  {categorySize && (
                    <span className="text-sm text-gray-500">
                      current {categorySize.current} • next {categorySize.next}
                    </span>
                  )}
                  {approvedCount > 0 && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {approvedCount} approved
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="divide-y divide-sand">
                  {categoryItems.map(item => {
                    const isEditing = editingId === item.id;
                    const isIdea = item.state === 'idea';
                    const isDiscussing = item.state === 'discussing';
                    const isApproved = item.state === 'approved';

                    return (
                      <div
                        key={item.id}
                        className={`px-5 py-4 transition-all ${
                          isIdea ? 'bg-white' : isDiscussing ? 'bg-blue-50/30' : 'bg-green-50/30'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                              {item.size && (
                                <span className="px-2 py-0.5 bg-sand text-gray-700 text-xs rounded-full">
                                  Size {item.size}
                                </span>
                              )}
                              {item.next_size_up && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  Next size
                                </span>
                              )}
                            </div>
                            {item.fit_notes && (
                              <p className="text-sm text-gray-600">{item.fit_notes}</p>
                            )}
                          </div>

                          {/* State Toggle & Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1 bg-white border border-sand rounded-lg p-1">
                              <button
                                onClick={() => updateState(item.id, 'idea')}
                                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                  isIdea
                                    ? 'bg-gray-200 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                Idea
                              </button>
                              <button
                                onClick={() => updateState(item.id, 'discussing')}
                                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                  isDiscussing
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                Discussing
                              </button>
                              <button
                                onClick={() => updateState(item.id, 'approved')}
                                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                  isApproved
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                Approved
                              </button>
                            </div>
                            {isApproved && (
                              <button
                                onClick={() => handleAddToWishlist(item)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sage hover:bg-sage/10 rounded-lg transition-colors border border-sage"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add to Wishlist
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Item Button */}
                  <div className="px-5 py-3 bg-gray-50">
                    <button className="flex items-center gap-2 text-sm text-sage hover:text-rose font-medium">
                      <Plus className="w-4 h-4" />
                      Add {category} item
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
