'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusIcon, EllipsisVerticalIcon, ChevronDownIcon, ChevronUpIcon, SparklesIcon } from '@heroicons/react/24/outline';
import CreatePackListModal from './CreatePackListModal';
import GeneratePackListModal from './GeneratePackListModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { createClient } from '@/lib/supabase/client';

interface PackList {
  id: string;
  name: string;
  duration_days: number | null;
  last_used_at: string;
  is_archived: boolean;
  created_at: string;
}

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
}

interface PackListsViewProps {
  packLists: PackList[];
  archivedPackLists: PackList[];
  familyId: string;
  userId: string;
  children: Child[];
}

export default function PackListsView({
  packLists,
  archivedPackLists,
  familyId,
  userId,
  children,
}: PackListsViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePackListId, setDeletePackListId] = useState<string | null>(null);
  const supabase = createClient();

  const formatLastUsed = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleDuplicate = async (packListId: string) => {
    try {
      // Get the original pack list
      const { data: originalPackList, error: packListError } = await supabase
        .from('pack_lists')
        .select('*')
        .eq('id', packListId)
        .single();

      if (packListError || !originalPackList) {
        alert('Failed to load pack list');
        return;
      }

      // Create new pack list
      const { data: newPackList, error: newPackListError } = await supabase
        .from('pack_lists')
        .insert({
          family_id: originalPackList.family_id,
          created_by_user_id: userId,
          name: `${originalPackList.name} (Copy)`,
          duration_days: originalPackList.duration_days,
        })
        .select()
        .single();

      if (newPackListError || !newPackList) {
        alert('Failed to create duplicate pack list');
        return;
      }

      // Get all categories from original
      const { data: originalCategories, error: categoriesError } = await supabase
        .from('pack_list_categories')
        .select('*')
        .eq('pack_list_id', packListId)
        .order('order_index', { ascending: true });

      if (categoriesError || !originalCategories) {
        alert('Failed to load categories');
        return;
      }

      // Duplicate categories and items
      for (const originalCategory of originalCategories) {
        // Create new category
        const { data: newCategory, error: newCategoryError } = await supabase
          .from('pack_list_categories')
          .insert({
            pack_list_id: newPackList.id,
            title: originalCategory.title,
            order_index: originalCategory.order_index,
          })
          .select()
          .single();

        if (newCategoryError || !newCategory) continue;

        // Get items from original category
        const { data: originalItems, error: itemsError } = await supabase
          .from('pack_list_items')
          .select('*')
          .eq('category_id', originalCategory.id)
          .order('order_index', { ascending: true });

        if (itemsError || !originalItems || originalItems.length === 0) continue;

        // Create new items (unchecked)
        const newItems = originalItems.map((item: any) => ({
          category_id: newCategory.id,
          label: item.label,
          quantity: item.quantity,
          is_complete: false,
          order_index: item.order_index,
        }));

        await supabase.from('pack_list_items').insert(newItems);
      }

      // Refresh page to show new list
      window.location.reload();
    } catch (error) {
      console.error('Duplicate error:', error);
      alert('Failed to duplicate pack list');
    }
    setActiveMenu(null);
  };

  const handleArchive = async (packListId: string) => {
    const { error } = await supabase
      .from('pack_lists')
      .update({ is_archived: true })
      .eq('id', packListId);

    if (!error) {
      window.location.reload();
    }
  };

  const handleUnarchive = async (packListId: string) => {
    const { error } = await supabase
      .from('pack_lists')
      .update({ is_archived: false })
      .eq('id', packListId);

    if (!error) {
      window.location.reload();
    }
  };

  const handleDeleteClick = (packListId: string) => {
    setDeletePackListId(packListId);
    setShowDeleteConfirm(true);
    setActiveMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePackListId) return;

    const { error } = await supabase
      .from('pack_lists')
      .delete()
      .eq('id', deletePackListId);

    if (!error) {
      window.location.reload();
    }
    setShowDeleteConfirm(false);
    setDeletePackListId(null);
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-serif text-gray-900">Pack Lists</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              title="Generate with AI"
            >
              <SparklesIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Generate</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sage text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">New Pack List</span>
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          Reusable checklists for trips and special outings.
        </p>
      </div>

      {/* Pack Lists */}
      <div className="space-y-3">
        {packLists.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500 mb-4">
              No pack lists yet. Create one for your next trip and reuse it every time you go.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-sage text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Create your first pack list
            </button>
          </div>
        ) : (
          packLists.map((packList) => (
            <div
              key={packList.id}
              className="bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
            >
              <Link
                href={`/pack-lists/${packList.id}`}
                className="flex items-center justify-between p-4"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {packList.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {packList.duration_days
                      ? `${packList.duration_days} day${packList.duration_days > 1 ? 's' : ''} · Last used ${formatLastUsed(packList.last_used_at)}`
                      : `Last used ${formatLastUsed(packList.last_used_at)}`}
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveMenu(activeMenu === packList.id ? null : packList.id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                  </button>

                  {activeMenu === packList.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[150px]">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDuplicate(packList.id);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleArchive(packList.id);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Archive
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteClick(packList.id);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Archived Lists Toggle */}
      {archivedPackLists.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>Show archived ({archivedPackLists.length})</span>
            {showArchived ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          {showArchived && (
            <div className="mt-3 space-y-3">
              {archivedPackLists.map((packList) => (
                <div
                  key={packList.id}
                  className="bg-gray-50 rounded-xl border border-gray-200"
                >
                  <Link
                    href={`/pack-lists/${packList.id}`}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-500 mb-1">
                        {packList.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {packList.duration_days
                          ? `${packList.duration_days} day${packList.duration_days > 1 ? 's' : ''} · Last used ${formatLastUsed(packList.last_used_at)}`
                          : `Last used ${formatLastUsed(packList.last_used_at)}`}
                      </p>
                    </div>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveMenu(activeMenu === packList.id ? null : packList.id);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                      </button>

                      {activeMenu === packList.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[150px]">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleUnarchive(packList.id);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Unarchive
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteClick(packList.id);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Pack List Modal */}
      {showCreateModal && (
        <CreatePackListModal
          familyId={familyId}
          userId={userId}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Generate Pack List Modal */}
      {showGenerateModal && (
        <GeneratePackListModal
          familyId={familyId}
          userId={userId}
          children={children}
          onClose={() => setShowGenerateModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          title="Delete Pack List?"
          message="Are you sure you want to delete this pack list? This will also delete all categories and items. This action cannot be undone."
          confirmLabel="Delete Pack List"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeletePackListId(null);
          }}
        />
      )}
    </>
  );
}
