'use client';

import { useState } from 'react';
import { Ruler, Lightbulb, Gift, Share2 } from 'lucide-react';
import ChildProfileBar from './ChildProfileBar';
import SizesTab from './tabs/SizesTab';
import IdeasTab from './tabs/IdeasTab';
import WishlistTab from './tabs/WishlistTab';
import ShareModal from './ShareModal';

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
  gender: string | null;
  photo_url: string | null;
  label_color: string | null;
}

interface ChildSize {
  child_id: string;
  shoe_size: string | null;
  pants_size: string | null;
  shirt_size: string | null;
  notes: string | null;
  favorite_colors: string | null;
  favorite_styles: string | null;
  favorite_brands: string | null;
}

interface InventoryItem {
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

interface ShoppingItem {
  id: string;
  child_id: string;
  family_id: string;
  item_name: string;
  category: string | null;
  is_completed: boolean;
  notes: string | null;
  url: string | null;
  color: string | null;
  size: string | null;
  brand: string | null;
  price: number | null;
  status?: 'idle' | 'selected' | 'reserved' | 'purchased';
  reserved_by?: string | null;
}

interface SizesPageNewProps {
  children: Child[];
  sizes: ChildSize[];
  inventoryItems: InventoryItem[];
  shoppingItems: ShoppingItem[];
  familyId: string;
}

type TabType = 'sizes' | 'ideas' | 'wishlist';

export default function SizesPageNew({
  children,
  sizes,
  inventoryItems,
  shoppingItems,
  familyId,
}: SizesPageNewProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.id || '');
  const [activeTab, setActiveTab] = useState<TabType>('sizes');
  const [showShareModal, setShowShareModal] = useState(false);

  const selectedChild = children.find(c => c.id === selectedChildId);
  const childSizes = sizes.find(s => s.child_id === selectedChildId) || null;
  const childInventory = inventoryItems.filter(i => i.child_id === selectedChildId);
  const childShopping = shoppingItems.filter(i => i.child_id === selectedChildId);

  if (children.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-sand p-8 text-center">
        <h2 className="text-xl font-serif text-gray-900 mb-2">No children yet</h2>
        <p className="text-gray-600 mb-4">Add a child from the settings page to get started.</p>
        <a href="/settings" className="text-sage hover:text-rose font-medium">
          Go to Settings →
        </a>
      </div>
    );
  }

  const tabs = [
    { id: 'sizes' as TabType, label: 'Sizes', icon: Ruler },
    { id: 'ideas' as TabType, label: 'Ideas', icon: Lightbulb },
    { id: 'wishlist' as TabType, label: 'Wishlist', icon: Gift },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Left sidebar - Child Profile Bar - Desktop only */}
      <div className="hidden lg:block">
        <ChildProfileBar
          children={children}
          selectedChildId={selectedChildId}
          onSelectChild={setSelectedChildId}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 min-w-0">
        {/* Mobile: Child selector buttons */}
        <div className="lg:hidden mb-4">
          <div className="bg-white rounded-xl border border-sand p-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Child
            </label>
            <div className="flex gap-2 flex-wrap">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedChildId === child.id
                      ? 'bg-sage text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-2xl border-b border-sand">
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-white text-sage border-t-2 border-x-2 border-sage -mb-px'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-sage hover:bg-sage/10 rounded-lg transition-colors mr-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-sand border-t-0 p-4 lg:p-6">
          {activeTab === 'sizes' && (
            <SizesTab
              childId={selectedChildId}
              childSizes={childSizes}
              childName={selectedChild?.name || ''}
              familyId={familyId}
            />
          )}
          {activeTab === 'ideas' && (
            <IdeasTab
              childId={selectedChildId}
              childName={selectedChild?.name || ''}
              inventoryItems={childInventory}
              childSizes={childSizes}
              familyId={familyId}
              onSwitchToWishlist={() => setActiveTab('wishlist')}
            />
          )}
          {activeTab === 'wishlist' && (
            <WishlistTab
              childId={selectedChildId}
              childName={selectedChild?.name || ''}
              shoppingItems={childShopping}
              familyId={familyId}
            />
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && selectedChild && (
        <ShareModal
          childId={selectedChildId}
          childName={selectedChild.name}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
