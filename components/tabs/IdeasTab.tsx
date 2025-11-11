'use client';

import { useState, useMemo, useEffect } from 'react';
import { Lightbulb, Search, ShoppingBag, Plus, User, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface IdeaItem {
  id: string;
  child_id: string;
  category: string;
  item_name: string;
  size: string | null;
  notes: string | null;
  brand: string | null;
  state: 'idea' | 'research';
  next_size_up: boolean;
  photo_url: string | null;
  created_by: string | null;
  created_at: string;
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

type FilterType = 'all' | 'idea' | 'research';

export default function IdeasTab({ childId, childName, inventoryItems, childSizes, familyId }: IdeasTabProps) {
  const supabase = createClient();
  const [filter, setFilter] = useState<FilterType>('all');
  const [items, setItems] = useState<IdeaItem[]>(inventoryItems);
  const [userEmail, setUserEmail] = useState<string>('');

  // Update items when child changes or inventoryItems prop changes
  useEffect(() => {
    setItems(inventoryItems);
  }, [inventoryItems, childId]);

  // Get current user email
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filter === 'idea') return item.state === 'idea';
      if (filter === 'research') return item.state === 'research';
      return true;
    }).sort((a, b) => {
      // Sort by state (idea first, then research), then by created_at
      const stateOrder = { idea: 0, research: 1 };
      if (stateOrder[a.state] !== stateOrder[b.state]) {
        return stateOrder[a.state] - stateOrder[b.state];
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [items, filter]);

  const updateState = async (itemId: string, newState: 'idea' | 'research') => {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('inventory_items')
      .update({
        state: newState,
        modified_by: user?.id,
        modified_at: new Date().toISOString()
      })
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
        notes: item.notes,
        is_completed: false,
        status: 'idle',
        archived: false,
      });

    if (!error) {
      // Remove from ideas after adding to wishlist
      await supabase
        .from('inventory_items')
        .delete()
        .eq('id', item.id);

      setItems(prev => prev.filter(i => i.id !== item.id));
      alert(`Added "${item.item_name}" to wishlist!`);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this idea?')) return;

    await supabase
      .from('inventory_items')
      .delete()
      .eq('id', itemId);

    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const filterButtons: { id: FilterType; label: string; icon: any }[] = [
    { id: 'all', label: 'Show All', icon: null },
    { id: 'idea', label: 'Ideas', icon: Lightbulb },
    { id: 'research', label: 'Research', icon: Search },
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
        {filterButtons.map(btn => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === btn.id
                  ? 'bg-sage text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-sand">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No ideas yet. Start brainstorming!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => {
            const isIdea = item.state === 'idea';
            const isResearch = item.state === 'research';

            return (
              <div
                key={item.id}
                className={`border-2 rounded-xl p-4 transition-all hover:shadow-md ${
                  isIdea
                    ? 'border-yellow-200 bg-yellow-50/30'
                    : 'border-blue-200 bg-blue-50/30'
                }`}
              >
                {/* Header with status badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isIdea ? (
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <Search className="w-5 h-5 text-blue-600" />
                    )}
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wide ${
                      isIdea
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.state}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete idea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Item name and details */}
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{item.item_name}</h3>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-2 py-1 bg-white/60 border border-sand text-gray-700 text-xs rounded-md font-medium">
                    {item.category}
                  </span>
                  {item.size && (
                    <span className="px-2 py-1 bg-white/60 border border-sand text-gray-700 text-xs rounded-md">
                      Size {item.size}
                    </span>
                  )}
                  {item.brand && (
                    <span className="px-2 py-1 bg-white/60 border border-sand text-gray-700 text-xs rounded-md">
                      {item.brand}
                    </span>
                  )}
                  {item.next_size_up && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-medium">
                      Next size
                    </span>
                  )}
                </div>

                {item.notes && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.notes}</p>
                )}

                {/* Creator info */}
                {item.created_by && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                    <User className="w-3.5 h-3.5" />
                    <span>Added by {item.created_by === userEmail ? 'you' : 'your partner'}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-sand/50">
                  <button
                    onClick={() => updateState(item.id, 'idea')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isIdea
                        ? 'bg-yellow-200 text-yellow-900'
                        : 'bg-white/60 text-gray-700 hover:bg-white border border-sand'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4 inline mr-1" />
                    Idea
                  </button>
                  <button
                    onClick={() => updateState(item.id, 'research')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isResearch
                        ? 'bg-blue-200 text-blue-900'
                        : 'bg-white/60 text-gray-700 hover:bg-white border border-sand'
                    }`}
                  >
                    <Search className="w-4 h-4 inline mr-1" />
                    Research
                  </button>
                  <button
                    onClick={() => handleAddToWishlist(item)}
                    className="px-4 py-2 bg-sage text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
                    title="Add to wishlist and remove from ideas"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="hidden sm:inline">Wishlist</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
