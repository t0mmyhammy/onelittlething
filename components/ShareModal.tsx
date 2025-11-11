'use client';

import { useState, useEffect } from 'react';
import { X, Share2, Check, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SizeCategory {
  id: string;
  category: string;
  current_size: string | null;
  next_size: string | null;
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

export default function ShareModal({ childId, childName, onClose }: ShareModalProps) {
  const supabase = createClient();
  const [sizes, setSizes] = useState<SizeCategory[]>([]);
  const [wishlistItems, setWishlistItems] = useState<ShoppingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [includeSizes, setIncludeSizes] = useState(true);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

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

  const generateText = () => {
    let text = `${childName}'s Sizes & Wishlist\n\n`;

    if (includeSizes && sizes.length > 0) {
      text += `SIZES:\n`;
      sizes.forEach(size => {
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
          {/* Include Sizes Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="include-sizes"
              checked={includeSizes}
              onChange={(e) => setIncludeSizes(e.target.checked)}
              className="w-4 h-4 text-sage border-sand rounded focus:ring-sage"
            />
            <label htmlFor="include-sizes" className="font-medium text-gray-900">
              Include sizes ({sizes.length})
            </label>
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
            disabled={!includeSizes && selectedItems.size === 0}
            className="w-full px-4 py-3 bg-sage text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Share Text
          </button>

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
