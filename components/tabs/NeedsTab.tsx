'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, Pencil, Check, X, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface InventoryItem {
  id: string;
  child_id: string;
  category: string;
  item_name: string;
  size: string | null;
  fit_notes: string | null;
  brand: string | null;
  state: 'need_it' | 'dont_need_it' | 'hidden';
  next_size_up: boolean;
  photo_url: string | null;
}

interface ChildSize {
  shoe_size: string | null;
  pants_size: string | null;
  shirt_size: string | null;
}

interface NeedsTabProps {
  childId: string;
  childName: string;
  inventoryItems: InventoryItem[];
  childSizes: ChildSize | null;
}

type FilterType = 'all' | 'needs' | 'next_size' | 'hidden';

export default function NeedsTab({ childId, childName, inventoryItems, childSizes }: NeedsTabProps) {
  const supabase = createClient();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Shoes', 'Tops', 'Bottoms']));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>(inventoryItems);

  // Update items when child changes or inventoryItems prop changes
  useEffect(() => {
    setItems(inventoryItems);
  }, [inventoryItems, childId]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const filtered = items.filter(item => {
      if (filter === 'needs') return item.state === 'need_it';
      if (filter === 'next_size') return item.next_size_up;
      if (filter === 'hidden') return item.state === 'hidden';
      return item.state !== 'hidden' || filter === 'all';
    });

    const grouped: { [category: string]: InventoryItem[] } = {};
    filtered.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    // Sort items within each category (needs first, then have, then hidden)
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        const stateOrder = { need_it: 0, dont_need_it: 1, hidden: 2 };
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

  const updateState = async (itemId: string, newState: 'need_it' | 'dont_need_it' | 'hidden') => {
    await supabase
      .from('inventory_items')
      .update({ state: newState })
      .eq('id', itemId);

    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, state: newState } : item
    ));
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
    { id: 'needs', label: 'Only Needs' },
    { id: 'next_size', label: 'Next Size Up' },
    { id: 'hidden', label: 'Hidden' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-serif text-gray-900">{childName}'s Needs</h2>
          <p className="text-sm text-gray-600 mt-1">Track what's needed soon</p>
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
          const needCount = categoryItems.filter(i => i.state === 'need_it').length;

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
                  {needCount > 0 && (
                    <span className="px-2 py-0.5 bg-rose/20 text-rose text-xs font-medium rounded-full">
                      {needCount} needed
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
                    const isNeed = item.state === 'need_it';
                    const isHave = item.state === 'dont_need_it';
                    const isHidden = item.state === 'hidden';

                    return (
                      <div
                        key={item.id}
                        className={`px-5 py-4 transition-all ${
                          isNeed ? 'bg-white' : isHave ? 'bg-gray-50/50' : 'bg-gray-100/50'
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

                          {/* State Toggle */}
                          <div className="flex items-center gap-1 bg-white border border-sand rounded-lg p-1">
                            <button
                              onClick={() => updateState(item.id, 'need_it')}
                              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                isNeed
                                  ? 'bg-rose text-white'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              Need
                            </button>
                            <button
                              onClick={() => updateState(item.id, 'dont_need_it')}
                              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                isHave
                                  ? 'bg-sage text-white'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              Have
                            </button>
                            <button
                              onClick={() => updateState(item.id, 'hidden')}
                              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                isHidden
                                  ? 'bg-gray-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              Hide
                            </button>
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
