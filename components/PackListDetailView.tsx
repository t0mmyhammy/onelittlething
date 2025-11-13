'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  PlusIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  XMarkIcon,
  EyeSlashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface PackListItem {
  id: string;
  label: string;
  quantity: number | null;
  is_complete: boolean;
  completed_by_user_id: string | null;
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
  updated_at: string;
}

interface PackListDetailViewProps {
  packList: PackList;
  categories: PackListCategory[];
  userId: string;
}

export default function PackListDetailView({
  packList: initialPackList,
  categories: initialCategories,
  userId,
}: PackListDetailViewProps) {
  const [packList, setPackList] = useState(initialPackList);
  const [categories, setCategories] = useState(initialCategories);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(packList.name);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const supabase = createClient();

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
    return hideCompleted ? items.filter(item => !item.is_complete) : items;
  };

  const getCompletedCount = (items: PackListItem[]) => {
    return items.filter(item => item.is_complete).length;
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

      {/* Global Controls */}
      <div className="flex items-center justify-between mb-6">
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

        <button
          onClick={() => setShowNewCategory(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-sage rounded-lg hover:opacity-90 transition-opacity"
        >
          <PlusIcon className="w-4 h-4" />
          Add category
        </button>
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
              onToggleItem={handleToggleItem}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onDeleteCategory={handleDeleteCategory}
              onRenameCategory={handleRenameCategory}
              getVisibleItems={getVisibleItems}
              getCompletedCount={getCompletedCount}
            />
          ))
        )}
      </div>
    </>
  );
}

// Category Card Component
function CategoryCard({
  category,
  hideCompleted,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onDeleteCategory,
  onRenameCategory,
  getVisibleItems,
  getCompletedCount,
}: {
  category: PackListCategory;
  hideCompleted: boolean;
  onToggleItem: (categoryId: string, itemId: string, isComplete: boolean) => void;
  onAddItem: (categoryId: string, label: string, quantity: string) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onRenameCategory: (categoryId: string, newTitle: string) => void;
  getVisibleItems: (items: PackListItem[]) => PackListItem[];
  getCompletedCount: (items: PackListItem[]) => number;
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
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group"
          >
            <input
              type="checkbox"
              checked={item.is_complete}
              onChange={() => onToggleItem(category.id, item.id, item.is_complete)}
              className="w-5 h-5 text-sage border-gray-300 rounded focus:ring-sage cursor-pointer"
            />
            <span className={`flex-1 ${item.is_complete ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {item.label}
            </span>
            {item.quantity && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                x{item.quantity}
              </span>
            )}
            <button
              onClick={() => onDeleteItem(category.id, item.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-opacity"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}

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
