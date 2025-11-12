'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, ShoppingBag, Plus, User, Trash2, Edit2, Check, X, ChevronDown, ChevronUp, Sparkles, Brain, Wand2, CheckCircle, Circle, ExternalLink } from 'lucide-react';
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
  onSwitchToWishlist?: () => void;
}

// Helper component to render notes with clickable links
const NotesDisplay = ({ notes }: { notes: string }) => {
  // Parse markdown links: [text](url)
  const parts = notes.split(/(\[.*?\]\(.*?\))/g);

  return (
    <div className="text-sm text-gray-800 whitespace-pre-wrap">
      {parts.map((part, index) => {
        // Check if this part is a markdown link
        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);

        if (linkMatch) {
          const [, text, url] = linkMatch;
          return (
            <span key={index} className="inline-flex items-center gap-1">
              <span className="font-medium text-gray-900">{text}</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#7B6CF6] hover:text-[#6759F5] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </span>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

export default function IdeasTab({ childId, childName, inventoryItems, childSizes, familyId, onSwitchToWishlist }: IdeasTabProps) {
  const supabase = createClient();
  const [items, setItems] = useState<IdeaItem[]>(inventoryItems);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [userInfo, setUserInfo] = useState<Record<string, { email: string; full_name: string }>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<IdeaItem>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newIdeaForm, setNewIdeaForm] = useState({
    item_name: '',
    category: '',
    brand: '',
    size: '',
    notes: '',
  });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemName: string | null;
  }>({ isOpen: false, itemId: null, itemName: null });
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    item: IdeaItem | null;
    loading: boolean;
    research: string;
    products: Array<{
      name: string;
      brand?: string;
      price: string;
      features: string[];
      url?: string;
    }>;
    selectedProducts: number[];
  }>({ isOpen: false, item: null, loading: false, research: '', products: [], selectedProducts: [] });
  const [aiPromptModal, setAiPromptModal] = useState<{
    isOpen: boolean;
    item: IdeaItem | null;
    additionalContext: string;
    selectedRetailers: string[];
    customRetailers: string;
    budget: string;
  }>({ isOpen: false, item: null, additionalContext: '', selectedRetailers: [], customRetailers: '', budget: '' });

  // Update items when child changes or inventoryItems prop changes
  useEffect(() => {
    setItems(inventoryItems);
  }, [inventoryItems, childId]);

  // Get current user ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        setCurrentUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Fetch user info for all creators
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!items || items.length === 0) return;

      const uniqueUserIds = [...new Set(items.map(item => item.created_by).filter(Boolean))] as string[];
      if (uniqueUserIds.length === 0) return;

      const { data, error } = await supabase.rpc('get_user_info', {
        user_ids: uniqueUserIds
      });

      if (data && !error) {
        const infoMap: Record<string, { email: string; full_name: string }> = {};
        data.forEach((user: any) => {
          infoMap[user.id] = {
            email: user.email,
            full_name: user.full_name
          };
        });
        setUserInfo(infoMap);
      }
    };

    fetchUserInfo();
  }, [items]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string) => {
    setToast(message);
  };

  const getCreatorName = (createdBy: string | null): string => {
    if (!createdBy) return 'Unknown';
    if (createdBy === currentUserId) return 'you';

    const creator = userInfo[createdBy];
    if (creator) {
      // Use full_name if available, otherwise use first part of email
      return creator.full_name || creator.email.split('@')[0];
    }
    return 'Unknown';
  };

  const handleCardClick = (itemId: string) => {
    if (editingId === itemId) return; // Don't toggle if editing
    setExpandedId(expandedId === itemId ? null : itemId);
  };

  const handleEdit = (item: IdeaItem) => {
    setEditingId(item.id);
    setEditForm({
      item_name: item.item_name,
      brand: item.brand,
      size: item.size,
      notes: item.notes,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (itemId: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('inventory_items')
      .update({
        ...editForm,
        modified_by: user?.id,
        modified_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (!error) {
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...editForm } : item
      ));
      setEditingId(null);
      setEditForm({});
      showToast('Changes saved!');
    }
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
      showToast(`Added "${item.item_name}" to wishlist!`);
      // Don't remove from ideas - keep it here
      // Call parent callback to switch to wishlist tab
      if (onSwitchToWishlist) {
        setTimeout(() => {
          onSwitchToWishlist();
        }, 1500);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmModal.itemId) return;

    await supabase
      .from('inventory_items')
      .delete()
      .eq('id', deleteConfirmModal.itemId);

    setItems(prev => prev.filter(i => i.id !== deleteConfirmModal.itemId));
    setDeleteConfirmModal({ isOpen: false, itemId: null, itemName: null });
    showToast('Idea deleted');
  };

  const handleAIResearch = (item: IdeaItem) => {
    // Show prompt modal first
    setAiPromptModal({
      isOpen: true,
      item,
      additionalContext: '',
      selectedRetailers: [],
      customRetailers: '',
      budget: '',
    });
  };

  const startAIResearch = async () => {
    const item = aiPromptModal.item;
    const additionalContext = aiPromptModal.additionalContext;
    const hasExistingNotes = item?.notes && item.notes.trim().length > 0;

    // Combine selected retailers with custom ones
    const allRetailers = [
      ...aiPromptModal.selectedRetailers,
      ...aiPromptModal.customRetailers.split(',').map(r => r.trim()).filter(Boolean)
    ];

    if (!item) return;

    // Close prompt modal and open research modal with loading
    setAiPromptModal({ isOpen: false, item: null, additionalContext: '', selectedRetailers: [], customRetailers: '', budget: '' });
    setAiModal({
      isOpen: true,
      item,
      loading: true,
      research: '',
      products: [],
      selectedProducts: [],
    });

    try {
      const response = await fetch('/api/idea-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: item.item_name,
          category: item.category,
          size: item.size,
          brand: item.brand,
          existingNotes: item.notes,
          additionalContext: hasExistingNotes ? '' : additionalContext, // Only use for initial research
          researchFocus: hasExistingNotes ? additionalContext : null, // Use as focus for re-research
          retailers: allRetailers.length > 0 ? allRetailers : null, // Only search specified retailers
          budget: aiPromptModal.budget || null,
          childName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get research');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAiModal(prev => ({
        ...prev,
        loading: false,
        research: data.research || 'Unable to generate research.',
        products: data.products || [],
      }));
    } catch (error: any) {
      console.error('AI research error:', error);
      setAiModal(prev => ({
        ...prev,
        loading: false,
        research: `Error: ${error.message || 'Unable to generate research. Please try again.'}`,
        products: [],
      }));
    }
  };

  const applyAIResearch = async () => {
    if (!aiModal.item) return;

    const { error } = await supabase
      .from('inventory_items')
      .update({
        notes: aiModal.research,
      })
      .eq('id', aiModal.item.id);

    if (!error) {
      setItems(prev => prev.map(i =>
        i.id === aiModal.item?.id ? { ...i, notes: aiModal.research } : i
      ));
      setAiModal({ isOpen: false, item: null, loading: false, research: '', products: [], selectedProducts: [] });
      showToast('Research added to notes!');
    }
  };

  const toggleProductSelection = (index: number) => {
    setAiModal(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(index)
        ? prev.selectedProducts.filter(i => i !== index)
        : [...prev.selectedProducts, index]
    }));
  };

  const handleAddSelectedProducts = async () => {
    if (!aiModal.item || aiModal.selectedProducts.length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();

    // Get selected products with AI-generated URLs
    const selectedProds = aiModal.selectedProducts.map(index => aiModal.products[index]);

    // Create a separate idea card for each selected product
    const newIdeas = selectedProds.map(product => {
      const productName = product.brand ? `${product.name} by ${product.brand}` : product.name;
      const nameWithLink = product.url ? `[${productName}](${product.url})` : productName;

      const productNotes = `${nameWithLink}
Price: ${product.price}

Key Features:
${product.features.map(f => `• ${f}`).join('\n')}`;

      return {
        child_id: childId,
        item_name: product.name,
        category: aiModal.item?.category || 'General',
        brand: product.brand || null,
        size: aiModal.item?.size || null,
        notes: productNotes,
        state: 'idea' as const,
        next_size_up: false,
        created_by: user?.id,
      };
    });

    // Insert all new idea cards
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(newIdeas)
      .select();

    if (!error && data) {
      setItems(prev => [...data, ...prev]);
      setAiModal({ isOpen: false, item: null, loading: false, research: '', products: [], selectedProducts: [] });
      showToast(`${selectedProds.length} product${selectedProds.length > 1 ? 's' : ''} added as separate idea cards!`);
    }
  };

  const handleAddNewIdea = async () => {
    if (!newIdeaForm.item_name.trim()) {
      alert('Please enter an item name');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        child_id: childId,
        item_name: newIdeaForm.item_name.trim(),
        category: newIdeaForm.category.trim() || 'General',
        brand: newIdeaForm.brand.trim() || null,
        size: newIdeaForm.size.trim() || null,
        notes: newIdeaForm.notes.trim() || null,
        state: 'idea',
        next_size_up: false,
        created_by: user?.id,
      })
      .select()
      .single();

    if (!error && data) {
      setItems(prev => [data, ...prev]);
      setNewIdeaForm({
        item_name: '',
        category: '',
        brand: '',
        size: '',
        notes: '',
      });
      setIsAddingNew(false);
      showToast('Idea added!');
    }
  };

  const handleCancelNewIdea = () => {
    setIsAddingNew(false);
    setNewIdeaForm({
      item_name: '',
      category: '',
      brand: '',
      size: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-sage text-white animate-fadeSlideIn">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">{toast}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-serif text-gray-900">{childName}'s Ideas</h2>
          <p className="text-sm text-gray-600 mt-1">Click any card to expand and edit details</p>
        </div>
        {!isAddingNew && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sage text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Idea
          </button>
        )}
      </div>

      {/* Add New Idea Form */}
      {isAddingNew && (
        <div className="border-2 border-sage rounded-2xl bg-white shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Idea</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newIdeaForm.item_name}
                onChange={(e) => setNewIdeaForm({ ...newIdeaForm, item_name: e.target.value })}
                placeholder="e.g., Winter Jacket, Rain Boots, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newIdeaForm.category}
                  onChange={(e) => setNewIdeaForm({ ...newIdeaForm, category: e.target.value })}
                  placeholder="e.g., Clothing, Shoes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <input
                  type="text"
                  value={newIdeaForm.size}
                  onChange={(e) => setNewIdeaForm({ ...newIdeaForm, size: e.target.value })}
                  placeholder="e.g., 3T, 7"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={newIdeaForm.brand}
                onChange={(e) => setNewIdeaForm({ ...newIdeaForm, brand: e.target.value })}
                placeholder="e.g., Nike, Carter's"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={newIdeaForm.notes}
                onChange={(e) => setNewIdeaForm({ ...newIdeaForm, notes: e.target.value })}
                placeholder="Add details, links, or thoughts..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddNewIdea}
                className="flex-1 px-4 py-2 bg-sage text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Add Idea
              </button>
              <button
                onClick={handleCancelNewIdea}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-sand">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No ideas yet. Start brainstorming!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => {
            const isExpanded = expandedId === item.id;
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className="border-2 border-sand rounded-2xl bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main card - clickable */}
                <button
                  onClick={() => handleCardClick(item.id)}
                  className="w-full p-4 text-left"
                  disabled={isEditing}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.item_name || ''}
                          onChange={(e) => setEditForm({ ...editForm, item_name: e.target.value })}
                          className="flex-1 font-semibold text-gray-900 text-lg border-b-2 border-sage focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h3 className="font-semibold text-gray-900 text-lg">{item.item_name}</h3>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isEditing && (
                        <>
                          {/* AI Research Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAIResearch(item);
                            }}
                            className="p-2 bg-[#F5F4FD] text-[#7B6CF6] rounded-lg hover:bg-[#ECE9FC] hover:text-[#6759F5] hover:scale-105 transition-all duration-200"
                            title="Get AI ideas"
                          >
                            <Wand2 className="w-4 h-4" />
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmModal({
                                isOpen: true,
                                itemId: item.id,
                                itemName: item.item_name
                              });
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete idea"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {item.category && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                        {item.category}
                      </span>
                    )}
                    {item.size && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                        Size {item.size}
                      </span>
                    )}
                    {item.brand && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                        {item.brand}
                      </span>
                    )}
                  </div>
                </button>

                {/* Expanded section */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-sand">
                    {isEditing ? (
                      /* Edit mode */
                      <div className="space-y-3 pt-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
                          <input
                            type="text"
                            value={editForm.brand || ''}
                            onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                            placeholder="Optional"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
                          <input
                            type="text"
                            value={editForm.size || ''}
                            onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                            placeholder="Optional"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                          <textarea
                            value={editForm.notes || ''}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            placeholder="Add details, links, or thoughts..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="flex-1 px-4 py-2 bg-sage text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <div className="space-y-3 pt-4">
                        {item.notes && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Notes:</p>
                            <NotesDisplay notes={item.notes} />
                          </div>
                        )}

                        {item.created_by && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <User className="w-3.5 h-3.5" />
                            <span>Added by {getCreatorName(item.created_by)}</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Details
                          </button>
                          <button
                            onClick={() => handleAddToWishlist(item)}
                            className="flex-1 px-4 py-2 bg-sage text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Add to Wishlist
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setDeleteConfirmModal({ isOpen: false, itemId: null, itemName: null })}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif text-gray-900 mb-2">
              Delete Idea?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{deleteConfirmModal.itemName}</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirmModal({ isOpen: false, itemId: null, itemName: null })}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Prompt Modal */}
      {aiPromptModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setAiPromptModal({ isOpen: false, item: null, additionalContext: '', selectedRetailers: [], customRetailers: '', budget: '' })}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#F5F4FD] rounded-lg">
                <Wand2 className="w-6 h-6 text-[#7B6CF6]" />
              </div>
              <div>
                <h3 className="text-xl font-serif text-gray-900">
                  AI Research
                </h3>
                <p className="text-sm text-gray-600">
                  {aiPromptModal.item?.item_name}
                </p>
              </div>
            </div>

            {/* Retailer Selection */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Where should I search? (select all that apply)</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {['Amazon', 'Target', 'Walmart', 'Nike', 'Pottery Barn Kids', 'Crate & Kids'].map(retailer => (
                  <button
                    key={retailer}
                    onClick={() => {
                      setAiPromptModal(prev => ({
                        ...prev,
                        selectedRetailers: prev.selectedRetailers.includes(retailer)
                          ? prev.selectedRetailers.filter(r => r !== retailer)
                          : [...prev.selectedRetailers, retailer]
                      }));
                    }}
                    className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                      aiPromptModal.selectedRetailers.includes(retailer)
                        ? 'border-[#7B6CF6] bg-[#F5F4FD] text-[#7B6CF6] font-medium'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {aiPromptModal.selectedRetailers.includes(retailer) && '✓ '}
                    {retailer}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={aiPromptModal.customRetailers}
                onChange={(e) => setAiPromptModal(prev => ({ ...prev, customRetailers: e.target.value }))}
                placeholder="Other retailers (comma-separated, e.g., M-Den, Fanatics, Dick's)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">If none selected, I'll search all retailers</p>
            </div>

            {/* Budget */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget (optional)</label>
              <input
                type="text"
                value={aiPromptModal.budget}
                onChange={(e) => setAiPromptModal(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="e.g., Under $50, $20-40, $100 max"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Additional Context */}
            {aiPromptModal.item?.notes && aiPromptModal.item.notes.trim().length > 0 ? (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-amber-800 mb-1">You already have research for this item</p>
                  <p className="text-xs text-amber-700">I'll provide different options and avoid duplicating your existing research.</p>
                </div>
                <p className="text-sm text-gray-700 mb-2 font-medium">
                  What do you want to research differently?
                </p>
                <textarea
                  value={aiPromptModal.additionalContext}
                  onChange={(e) => setAiPromptModal(prev => ({ ...prev, additionalContext: e.target.value }))}
                  placeholder="e.g., Different price range, alternative brands, premium options, sustainable choices, etc."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-4"
                />
              </>
            ) : (
              <>
                <p className="text-sm text-gray-700 mb-2 font-medium">
                  Any other considerations?
                </p>
                <textarea
                  value={aiPromptModal.additionalContext}
                  onChange={(e) => setAiPromptModal(prev => ({ ...prev, additionalContext: e.target.value }))}
                  placeholder="e.g., Eco-friendly options, specific colors, organic materials, etc."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-4"
                />
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={startAIResearch}
                className="flex-1 px-4 py-2.5 bg-[#7B6CF6] text-white rounded-lg hover:bg-[#6759F5] font-medium transition-all flex items-center justify-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Go Research
              </button>
              <button
                onClick={() => setAiPromptModal({ isOpen: false, item: null, additionalContext: '', selectedRetailers: [], customRetailers: '', budget: '' })}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Research Modal */}
      {aiModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => !aiModal.loading && setAiModal({ isOpen: false, item: null, loading: false, research: '', products: [], selectedProducts: [] })}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#F5F4FD] rounded-lg">
                <Wand2 className="w-6 h-6 text-[#7B6CF6]" />
              </div>
              <div>
                <h3 className="text-xl font-serif text-gray-900">
                  AI Research
                </h3>
                <p className="text-sm text-gray-600">
                  {aiModal.item?.item_name}
                </p>
              </div>
            </div>

            {aiModal.loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B6CF6] mb-4"></div>
                <p className="text-gray-600">Researching and generating recommendations...</p>
              </div>
            ) : (
              <>
                {/* TLDR Summary */}
                {aiModal.research && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">TLDR</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {aiModal.research}
                    </p>
                  </div>
                )}

                {/* Product SKUs */}
                {aiModal.products && aiModal.products.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Recommended Products (select one or more)</h4>
                    {aiModal.products.map((product, index) => {
                      const isSelected = aiModal.selectedProducts.includes(index);
                      return (
                        <button
                          key={index}
                          onClick={() => toggleProductSelection(index)}
                          className={`w-full text-left border-2 rounded-xl p-4 transition-all ${
                            isSelected
                              ? 'border-[#7B6CF6] bg-[#F5F4FD]'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <div className="flex-shrink-0 mt-0.5">
                              {isSelected ? (
                                <CheckCircle className="w-5 h-5 text-[#7B6CF6]" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-300" />
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className={`font-semibold text-base ${isSelected ? 'text-[#7B6CF6]' : 'text-gray-900'}`}>
                                    {product.name}
                                  </h5>
                                  {product.brand && (
                                    <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
                                  )}
                                </div>
                                <span className="text-sm font-semibold text-sage ml-3">{product.price}</span>
                              </div>
                              <ul className="space-y-1">
                                {product.features.map((feature, fIndex) => (
                                  <li key={fIndex} className="text-xs text-gray-600 flex items-start gap-1.5">
                                    <span className="text-purple-500 mt-0.5">•</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-3">
                  {aiModal.selectedProducts.length > 0 && (
                    <button
                      onClick={handleAddSelectedProducts}
                      className="flex-1 px-4 py-2.5 bg-[#7B6CF6] text-white rounded-lg hover:bg-[#6759F5] font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Create {aiModal.selectedProducts.length} Idea Card{aiModal.selectedProducts.length > 1 ? 's' : ''}
                    </button>
                  )}
                  <button
                    onClick={() => setAiModal({ isOpen: false, item: null, loading: false, research: '', products: [], selectedProducts: [] })}
                    className={`px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium ${aiModal.selectedProducts.length === 0 ? 'flex-1' : ''}`}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
