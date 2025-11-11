'use client';

import { useState, useEffect } from 'react';
import { X, Share2, Check, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SizeCategory {
  id: string;
  category: string;
  current_size: string | null;
  next_size: string | null;
  notes: string | null;
  need_status: string | null;
}

interface ShoppingItem {
  id: string;
  item_name: string;
  url: string | null;
  price: number | null;
  brand: string | null;
  size: string | null;
  color: string | null;
}

interface ShareModalProps {
  childId: string;
  childName: string;
  onClose: () => void;
}

interface Child {
  id: string;
  name: string;
  family_id: string;
}

export default function ShareModal({ childId, childName, onClose }: ShareModalProps) {
  const supabase = createClient();
  const [sizes, setSizes] = useState<SizeCategory[]>([]);
  const [wishlistItems, setWishlistItems] = useState<ShoppingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [duplicateToChildId, setDuplicateToChildId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [childId]);

  const loadData = async () => {
    // Load sizes
    const { data: sizesData } = await supabase
      .from('child_size_categories')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: true });

    if (sizesData) {
      setSizes(sizesData);
    }

    // Load wishlist items (active only)
    const { data: wishlistData } = await supabase
      .from('shopping_list_items')
      .select('id, item_name, url, price, brand, size, color')
      .eq('child_id', childId)
      .eq('archived', false)
      .neq('status', 'purchased')
      .order('created_at', { ascending: false });

    if (wishlistData) {
      setWishlistItems(wishlistData);
    }

    // Load all children in the same family
    const { data: childData } = await supabase
      .from('children')
      .select('id, name, family_id')
      .eq('id', childId)
      .single();

    if (childData) {
      const { data: siblingsData } = await supabase
        .from('children')
        .select('id, name, family_id')
        .eq('family_id', childData.family_id)
        .neq('id', childId)
        .is('archived', false)
        .order('created_at', { ascending: true });

      if (siblingsData) {
        setAllChildren(siblingsData);
      }
    }
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleSize = (sizeId: string) => {
    setSelectedSizes(prev => {
      const next = new Set(prev);
      if (next.has(sizeId)) {
        next.delete(sizeId);
      } else {
        next.add(sizeId);
      }
      return next;
    });
  };

  const generateText = () => {
    let text = `${childName}'s Sizes & Wishlist\n\n`;

    const selectedSizesList = sizes.filter(size => selectedSizes.has(size.id));
    if (selectedSizesList.length > 0) {
      text += `SIZES:\n`;
      selectedSizesList.forEach(size => {
        if (size.current_size || size.next_size) {
          text += `• ${size.category}: `;
          if (size.current_size) {
            text += `${size.current_size}`;
          }
          if (size.next_size) {
            text += ` (next: ${size.next_size})`;
          }
          text += `\n`;
        }
      });
      text += `\n`;
    }

    const selectedWishlist = wishlistItems.filter(item => selectedItems.has(item.id));
    if (selectedWishlist.length > 0) {
      text += `WISHLIST:\n`;
      selectedWishlist.forEach((item, index) => {
        text += `${index + 1}. ${item.item_name}`;
        if (item.brand) {
          text += ` (${item.brand})`;
        }
        if (item.size) {
          text += ` - Size ${item.size}`;
        }
        if (item.color) {
          text += ` - ${item.color}`;
        }
        if (item.price) {
          text += ` - $${item.price.toFixed(2)}`;
        }
        if (item.url) {
          text += `\n   ${item.url}`;
        }
        text += `\n`;
      });
    }

    setGeneratedText(text);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDuplicate = async () => {
    if (!duplicateToChildId) return;

    const targetChild = allChildren.find(c => c.id === duplicateToChildId);
    if (!targetChild) return;

    try {
      // Duplicate selected sizes
      const selectedSizesList = sizes.filter(size => selectedSizes.has(size.id));
      if (selectedSizesList.length > 0) {
        const sizesToInsert = selectedSizesList.map(size => ({
          child_id: duplicateToChildId,
          category: size.category,
          current_size: size.current_size,
          next_size: size.next_size,
          notes: size.notes,
          need_status: size.need_status,
        }));

        await supabase
          .from('child_size_categories')
          .upsert(sizesToInsert, {
            onConflict: 'child_id,category',
            ignoreDuplicates: false
          });
      }

      // Duplicate selected wishlist items
      const selectedWishlist = wishlistItems.filter(item => selectedItems.has(item.id));
      if (selectedWishlist.length > 0) {
        const itemsToInsert = selectedWishlist.map(item => ({
          child_id: duplicateToChildId,
          family_id: targetChild.family_id,
          item_name: item.item_name,
          url: item.url,
          price: item.price,
          brand: item.brand,
          size: item.size,
          color: item.color,
          is_completed: false,
          status: 'idle',
          archived: false,
        }));

        await supabase
          .from('shopping_list_items')
          .insert(itemsToInsert);
      }

      alert(`Successfully duplicated ${selectedSizes.size} sizes and ${selectedItems.size} items to ${targetChild.name}!`);
      setDuplicateToChildId('');
      setSelectedSizes(new Set());
      setSelectedItems(new Set());
    } catch (error) {
      alert('Error duplicating items. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-sand flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-sage" />
            <h2 className="text-xl font-serif text-gray-900">Share {childName}'s Info</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Size Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Select sizes to share:</h3>
            {sizes.length === 0 ? (
              <p className="text-sm text-gray-500">No sizes tracked yet</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sizes.map(size => (
                  <label
                    key={size.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSizes.has(size.id)}
                      onChange={() => toggleSize(size.id)}
                      className="mt-0.5 w-4 h-4 text-sage border-sand rounded focus:ring-sage"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{size.category}</div>
                      <div className="text-sm text-gray-600">
                        {size.current_size && `Current: ${size.current_size}`}
                        {size.current_size && size.next_size && ' • '}
                        {size.next_size && `Next: ${size.next_size}`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Items Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Select wishlist items to share:</h3>
            {wishlistItems.length === 0 ? (
              <p className="text-sm text-gray-500">No active wishlist items</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {wishlistItems.map(item => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="mt-0.5 w-4 h-4 text-sage border-sand rounded focus:ring-sage"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{item.item_name}</div>
                      <div className="text-sm text-gray-600">
                        {[item.brand, item.size ? `Size ${item.size}` : null, item.price ? `$${item.price.toFixed(2)}` : null]
                          .filter(Boolean)
                          .join(' • ')}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={generateText}
            disabled={selectedSizes.size === 0 && selectedItems.size === 0}
            className="w-full px-4 py-3 bg-sage text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Share Text
          </button>

          {/* Duplicate Section */}
          {allChildren.length > 0 && (selectedSizes.size > 0 || selectedItems.size > 0) && (
            <div className="border-t border-sand pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Duplicate to another child:</h3>
              <div className="flex gap-2">
                <select
                  value={duplicateToChildId}
                  onChange={(e) => setDuplicateToChildId(e.target.value)}
                  className="flex-1 px-4 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none"
                >
                  <option value="">Select child...</option>
                  {allChildren.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleDuplicate}
                  disabled={!duplicateToChildId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Duplicate
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Will copy {selectedSizes.size} sizes and {selectedItems.size} items to the selected child
              </p>
            </div>
          )}

          {/* Generated Text */}
          {generatedText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Generated Text:</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-sage hover:bg-sage/10 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">{generatedText}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-sand flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
