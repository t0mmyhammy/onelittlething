'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  PlusIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  XMarkIcon,
  EyeSlashIcon,
  EyeIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import ImportItemsToPackListModal from './ImportItemsToPackListModal';

interface PackListItem {
  id: string;
  label: string;
  quantity: number | null;
  is_complete: boolean;
  completed_by_user_id: string | null;
  assigned_to: string | null;
  assigned_type: 'child' | 'parent' | 'all' | null;
  order_index: number;
}

interface PackListCategory {
  id: string;
  title: string;
  order_index: number;
  pack_list_items: PackListItem[];
}

interface PackList {
  id: string;
  name: string;
  duration_days: number | null;
  participants: string[];
  updated_at: string;
}

interface Child {
  id: string;
  name: string;
  label_color?: string | null;
}

interface FamilyMember {
  user_id: string;
  role: string;
}

interface PackListDetailViewProps {
  packList: PackList;
  categories: PackListCategory[];
  userId: string;
  children: Child[];
  familyMembers: FamilyMember[];
}

export default function PackListDetailView({
  packList: initialPackList,
  categories: initialCategories,
  userId,
  children,
  familyMembers,
}: PackListDetailViewProps) {
  const [packList, setPackList] = useState(initialPackList);
  const [categories, setCategories] = useState(initialCategories);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [personFilter, setPersonFilter] = useState<string | null>(null); // null = all, child ID, or "parent"
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(packList.name);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const supabase = createClient();

  // Filter participants (children going on trip)
  const participantChildren = children.filter(child => packList.participants?.includes(child.id));

  // Calculate assignment stats
  const getAssignmentStats = () => {
    const allItems = categories.flatMap(cat => cat.pack_list_items);

    const stats = {
      children: participantChildren.map(child => ({
        id: child.id,
        name: child.name,
        count: allItems.filter(item => item.assigned_to === child.id).length,
      })),
      parents: allItems.filter(item => item.assigned_type === 'parent').length,
      shared: allItems.filter(item => item.assigned_type === 'all' || item.assigned_type === null).length,
    };

    return stats;
  };

  const assignmentStats = getAssignmentStats();

  const handleUpdateTitle = async () => {
    if (titleValue.trim() === packList.name) {
      setEditingTitle(false);
      return;
    }

    const { error } = await supabase
      .from('pack_lists')
      .update({ name: titleValue.trim() })
      .eq('id', packList.id);

    if (!error) {
      setPackList({ ...packList, name: titleValue.trim() });
    }
    setEditingTitle(false);
  };

  const handleAddCategory = async () => {
    if (!newCategoryTitle.trim()) return;

    const maxOrder = Math.max(...categories.map(c => c.order_index), -1);

    const { data, error } = await supabase
      .from('pack_list_categories')
      .insert({
        pack_list_id: packList.id,
        title: newCategoryTitle.trim(),
        order_index: maxOrder + 1,
      })
      .select()
      .single();

    if (!error && data) {
      setCategories([...categories, { ...data, pack_list_items: [] }]);
      setNewCategoryTitle('');
      setShowNewCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Delete this category and all its items?')) return;

    const { error } = await supabase
      .from('pack_list_categories')
      .delete()
      .eq('id', categoryId);

    if (!error) {
      setCategories(categories.filter(c => c.id !== categoryId));
    }
  };

  const handleRenameCategory = async (categoryId: string, newTitle: string) => {
    const { error } = await supabase
      .from('pack_list_categories')
      .update({ title: newTitle })
      .eq('id', categoryId);

    if (!error) {
      setCategories(categories.map(c =>
        c.id === categoryId ? { ...c, title: newTitle } : c
      ));
    }
  };

  const handleToggleItem = async (categoryId: string, itemId: string, isComplete: boolean) => {
    const { error } = await supabase
      .from('pack_list_items')
      .update({
        is_complete: !isComplete,
        completed_by_user_id: !isComplete ? userId : null,
        completed_at: !isComplete ? new Date().toISOString() : null,
      })
      .eq('id', itemId);

    if (!error) {
      setCategories(categories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              pack_list_items: category.pack_list_items.map(item =>
                item.id === itemId
                  ? { ...item, is_complete: !isComplete, completed_by_user_id: !isComplete ? userId : null }
                  : item
              ),
            }
          : category
      ));
    }
  };

  const handleAddItem = async (categoryId: string, label: string, quantity: string) => {
    if (!label.trim()) return;

    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const maxOrder = Math.max(...category.pack_list_items.map(i => i.order_index), -1);

    const { data, error } = await supabase
      .from('pack_list_items')
      .insert({
        category_id: categoryId,
        label: label.trim(),
        quantity: quantity ? parseInt(quantity) : null,
        order_index: maxOrder + 1,
      })
      .select()
      .single();

    if (!error && data) {
      setCategories(categories.map(c =>
        c.id === categoryId
          ? { ...c, pack_list_items: [...c.pack_list_items, data] }
          : c
      ));
    }
  };

  const handleDeleteItem = async (categoryId: string, itemId: string) => {
    const { error } = await supabase
      .from('pack_list_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      setCategories(categories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              pack_list_items: category.pack_list_items.filter(item => item.id !== itemId),
            }
          : category
      ));
    }
  };

  const getVisibleItems = (items: PackListItem[]) => {
    let filtered = items;

    // Filter by person
    if (personFilter !== null) {
      if (personFilter === 'parent') {
        filtered = filtered.filter(item =>
          item.assigned_type === 'parent' || item.assigned_type === 'all' || item.assigned_type === null
        );
      } else {
        // It's a child ID
        filtered = filtered.filter(item =>
          item.assigned_to === personFilter || item.assigned_type === 'all' || item.assigned_type === null
        );
      }
    }

    // Filter by completion status
    return hideCompleted ? filtered.filter(item => !item.is_complete) : filtered;
  };

  const getCompletedCount = (items: PackListItem[]) => {
    return items.filter(item => item.is_complete).length;
  };

  const handleAssignItem = async (itemId: string, categoryId: string, assignTo: string | null, assignType: 'child' | 'parent' | 'all' | null) => {
    const { error } = await supabase
      .from('pack_list_items')
      .update({
        assigned_to: assignTo,
        assigned_type: assignType,
      })
      .eq('id', itemId);

    if (!error) {
      setCategories(categories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              pack_list_items: category.pack_list_items.map(item =>
                item.id === itemId
                  ? { ...item, assigned_to: assignTo, assigned_type: assignType }
                  : item
              ),
            }
          : category
      ));
    }
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedItemIds(new Set());
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItemIds);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItemIds(newSelected);
  };

  const handleBulkAssign = async (assignTo: string | null, assignType: 'child' | 'parent' | 'all' | null) => {
    const itemIds = Array.from(selectedItemIds);

    const { error } = await supabase
      .from('pack_list_items')
      .update({
        assigned_to: assignTo,
        assigned_type: assignType,
      })
      .in('id', itemIds);

    if (!error) {
      // Update local state
      setCategories(categories.map(category => ({
        ...category,
        pack_list_items: category.pack_list_items.map(item =>
          selectedItemIds.has(item.id)
            ? { ...item, assigned_to: assignTo, assigned_type: assignType }
            : item
        ),
      })));

      // Exit select mode
      setSelectMode(false);
      setSelectedItemIds(new Set());
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/pack-lists"
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
        >
          ← Back to Pack Lists
        </Link>

        {editingTitle ? (
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpdateTitle();
                if (e.key === 'Escape') {
                  setTitleValue(packList.name);
                  setEditingTitle(false);
                }
              }}
              className="text-3xl font-serif text-gray-900 border-b-2 border-sage focus:outline-none flex-1"
              autoFocus
            />
            <button
              onClick={handleUpdateTitle}
              className="p-2 text-sage hover:bg-sage/10 rounded-lg"
            >
              <CheckIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <h1
            onClick={() => setEditingTitle(true)}
            className="text-3xl font-serif text-gray-900 mb-2 cursor-pointer hover:text-sage transition-colors"
          >
            {packList.name}
          </h1>
        )}

        {packList.duration_days && (
          <p className="text-gray-600 text-sm">{packList.duration_days} days</p>
        )}
      </div>

      {/* Assignment Stats */}
      {(participantChildren.length > 0 || familyMembers.length > 0) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {assignmentStats.children.map((child) => (
              <div key={child.id} className="flex items-center gap-2">
                <span className="font-medium text-gray-700">{child.name}:</span>
                <span className="text-gray-600">{child.count} item{child.count !== 1 ? 's' : ''}</span>
              </div>
            ))}
            {familyMembers.length > 0 && assignmentStats.parents > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Parents:</span>
                <span className="text-gray-600">{assignmentStats.parents} item{assignmentStats.parents !== 1 ? 's' : ''}</span>
              </div>
            )}
            {assignmentStats.shared > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Shared:</span>
                <span className="text-gray-600">{assignmentStats.shared} item{assignmentStats.shared !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Person Tabs */}
      {(participantChildren.length > 0 || familyMembers.length > 0) && (
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setPersonFilter(null)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                personFilter === null
                  ? 'bg-sage text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {participantChildren.map((child) => (
              <button
                key={child.id}
                onClick={() => setPersonFilter(child.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  personFilter === child.id
                    ? 'bg-sage text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {child.name}
              </button>
            ))}
            {familyMembers.length > 0 && (
              <button
                onClick={() => setPersonFilter('parent')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  personFilter === 'parent'
                    ? 'bg-sage text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Parents
              </button>
            )}
          </div>
        </div>
      )}

      {/* Global Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setHideCompleted(!hideCompleted)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {hideCompleted ? (
              <>
                <EyeIcon className="w-4 h-4" />
                Show completed
              </>
            ) : (
              <>
                <EyeSlashIcon className="w-4 h-4" />
                Hide completed
              </>
            )}
          </button>

          {participantChildren.length > 0 && (
            <button
              onClick={toggleSelectMode}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                selectMode
                  ? 'bg-sage text-white hover:opacity-90'
                  : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <CheckIcon className="w-4 h-4" />
              {selectMode ? 'Cancel selection' : 'Select items'}
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            Import items
          </button>
          <button
            onClick={() => setShowNewCategory(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-sage rounded-lg hover:opacity-90 transition-opacity"
          >
            <PlusIcon className="w-4 h-4" />
            Add category
          </button>
        </div>
      </div>

      {/* New Category Input */}
      {showNewCategory && (
        <div className="bg-white rounded-xl p-4 mb-4 border-2 border-sage">
          <input
            type="text"
            value={newCategoryTitle}
            onChange={(e) => setNewCategoryTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCategory();
              if (e.key === 'Escape') {
                setNewCategoryTitle('');
                setShowNewCategory(false);
              }
            }}
            placeholder="Category name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent mb-3"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-sage text-white rounded-lg hover:opacity-90 text-sm font-medium"
            >
              Add
            </button>
            <button
              onClick={() => {
                setNewCategoryTitle('');
                setShowNewCategory(false);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500 mb-4">
              Start with the basics: clothing, essentials, and toys. Add categories that match how your family packs.
            </p>
            <button
              onClick={() => setShowNewCategory(true)}
              className="px-6 py-3 bg-sage text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Add your first category
            </button>
          </div>
        ) : (
          categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              hideCompleted={hideCompleted}
              selectMode={selectMode}
              selectedItemIds={selectedItemIds}
              onToggleItem={handleToggleItem}
              onToggleItemSelection={toggleItemSelection}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onDeleteCategory={handleDeleteCategory}
              onRenameCategory={handleRenameCategory}
              onAssignItem={handleAssignItem}
              getVisibleItems={getVisibleItems}
              getCompletedCount={getCompletedCount}
              children={participantChildren}
            />
          ))
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectMode && selectedItemIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border-2 border-sage p-4 z-50 max-w-md w-full mx-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedItemIds.size} item{selectedItemIds.size !== 1 ? 's' : ''} selected
            </span>
            <select
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'all') {
                  handleBulkAssign(null, 'all');
                } else if (value === 'parent') {
                  handleBulkAssign(null, 'parent');
                } else if (value) {
                  handleBulkAssign(value, 'child');
                }
              }}
              defaultValue=""
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sage focus:border-sage"
            >
              <option value="" disabled>Assign to...</option>
              <option value="all">All (Shared)</option>
              {participantChildren.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
              {familyMembers.length > 0 && (
                <option value="parent">Parents</option>
              )}
            </select>
          </div>
        </div>
      )}

      {/* Import Items Modal */}
      {showImportModal && (
        <ImportItemsToPackListModal
          packListId={packList.id}
          children={participantChildren}
          onClose={() => setShowImportModal(false)}
          onImportComplete={() => {
            setShowImportModal(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

// Category Card Component
function CategoryCard({
  category,
  hideCompleted,
  selectMode,
  selectedItemIds,
  onToggleItem,
  onToggleItemSelection,
  onAddItem,
  onDeleteItem,
  onDeleteCategory,
  onRenameCategory,
  onAssignItem,
  getVisibleItems,
  getCompletedCount,
  children,
}: {
  category: PackListCategory;
  hideCompleted: boolean;
  selectMode: boolean;
  selectedItemIds: Set<string>;
  onToggleItem: (categoryId: string, itemId: string, isComplete: boolean) => void;
  onToggleItemSelection: (itemId: string) => void;
  onAddItem: (categoryId: string, label: string, quantity: string) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onRenameCategory: (categoryId: string, newTitle: string) => void;
  onAssignItem: (itemId: string, categoryId: string, assignTo: string | null, assignType: 'child' | 'parent' | 'all' | null) => void;
  getVisibleItems: (items: PackListItem[]) => PackListItem[];
  getCompletedCount: (items: PackListItem[]) => number;
  children: Child[];
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(category.title);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [showNewItem, setShowNewItem] = useState(false);

  const visibleItems = getVisibleItems(category.pack_list_items);
  const completedCount = getCompletedCount(category.pack_list_items);
  const hiddenCount = category.pack_list_items.length - visibleItems.length;

  const handleSaveTitle = () => {
    if (titleValue.trim() && titleValue.trim() !== category.title) {
      onRenameCategory(category.id, titleValue.trim());
    }
    setEditingTitle(false);
  };

  const handleAddItem = () => {
    if (newItemLabel.trim()) {
      onAddItem(category.id, newItemLabel, newItemQuantity);
      setNewItemLabel('');
      setNewItemQuantity('');
      setShowNewItem(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-3">
        {editingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') {
                  setTitleValue(category.title);
                  setEditingTitle(false);
                }
              }}
              className="text-lg font-semibold text-gray-900 border-b border-sage focus:outline-none flex-1"
              autoFocus
            />
          </div>
        ) : (
          <h3
            onClick={() => setEditingTitle(true)}
            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-sage transition-colors"
          >
            {category.title}
          </h3>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
              <button
                onClick={() => {
                  setEditingTitle(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Rename
              </button>
              <button
                onClick={() => {
                  onDeleteCategory(category.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {visibleItems.map((item) => {
          const assignedChild = item.assigned_to ? children.find(c => c.id === item.assigned_to) : null;
          const isSelected = selectedItemIds.has(item.id);

          return (
            <div
              key={item.id}
              onClick={() => selectMode ? onToggleItemSelection(item.id) : onToggleItem(category.id, item.id, item.is_complete)}
              className={`flex items-center gap-3 p-2 rounded-lg group transition-colors cursor-pointer ${
                isSelected ? 'bg-sage/10 hover:bg-sage/20' : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectMode ? isSelected : item.is_complete}
                onChange={() => {}} // Handled by parent div onClick
                onClick={(e) => e.stopPropagation()} // Allow clicking checkbox directly
                className="w-5 h-5 text-sage border-gray-300 rounded focus:ring-sage cursor-pointer pointer-events-none"
              />
              <div className="flex-1 flex items-center gap-2">
                <span className={`${!selectMode && item.is_complete ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {item.label}
                </span>
                {assignedChild && (
                  <span className="text-xs bg-sage/20 text-sage px-2 py-0.5 rounded-full whitespace-nowrap">
                    {assignedChild.name}
                  </span>
                )}
                {item.assigned_type === 'parent' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                    Parents
                  </span>
                )}
              </div>
              {item.quantity && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  x{item.quantity}
                </span>
              )}
              {/* Assignment Dropdown - hidden in select mode */}
              {!selectMode && children.length > 0 && (
                <select
                  value={item.assigned_to || item.assigned_type || 'all'}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'all') {
                      onAssignItem(item.id, category.id, null, 'all');
                    } else if (value === 'parent') {
                      onAssignItem(item.id, category.id, null, 'parent');
                    } else {
                      onAssignItem(item.id, category.id, value, 'child');
                    }
                  }}
                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-sage focus:border-sage opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="all">All</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                  <option value="parent">Parents</option>
                </select>
              )}
              {!selectMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(category.id, item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-opacity"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}

        {hideCompleted && hiddenCount > 0 && (
          <p className="text-xs text-gray-500 italic py-2">
            {hiddenCount} item{hiddenCount > 1 ? 's' : ''} hidden
          </p>
        )}
      </div>

      {/* Add Item */}
      {showNewItem ? (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newItemLabel}
              onChange={(e) => setNewItemLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem();
                if (e.key === 'Escape') {
                  setNewItemLabel('');
                  setNewItemQuantity('');
                  setShowNewItem(false);
                }
              }}
              placeholder="Item name"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              autoFocus
            />
            <input
              type="number"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              placeholder="Qty"
              min="1"
              className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-sage text-white rounded-lg hover:opacity-90 text-sm font-medium"
            >
              Add
            </button>
            <button
              onClick={() => {
                setNewItemLabel('');
                setNewItemQuantity('');
                setShowNewItem(false);
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNewItem(true)}
          className="mt-3 pt-3 border-t border-gray-200 w-full flex items-center gap-2 text-sm text-gray-600 hover:text-sage transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add item
        </button>
      )}
    </div>
  );
}
