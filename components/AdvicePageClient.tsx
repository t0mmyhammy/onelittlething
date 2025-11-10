'use client';

import { useState } from 'react';
import AIChat from './AIChat';
import CustomStyleModal from './CustomStyleModal';
import SavedAdviceList from './SavedAdviceList';

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
}

interface AdvicePageClientProps {
  children: Child[];
  initialSelectedStyle: string;
  initialCustomStyles: any[];
}

export default function AdvicePageClient({
  children,
  initialSelectedStyle,
  initialCustomStyles,
}: AdvicePageClientProps) {
  const [selectedStyle, setSelectedStyle] = useState(initialSelectedStyle);
  const [customStyles, setCustomStyles] = useState(initialCustomStyles);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [chatKey, setChatKey] = useState(0); // Force re-render of chat when style changes

  const handleStyleChange = (styleId: string) => {
    setSelectedStyle(styleId);
    // Force chat to reload with new style
    setChatKey(prev => prev + 1);
  };

  const handleCustomStyleCreated = async () => {
    // Refresh custom styles list
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const { data } = await supabase
      .from('custom_parenting_styles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setCustomStyles(data);
    }
  };

  return (
    <>
      <div className="mb-4 md:mb-6">
        <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-2">
          Chat with Liv
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Your wise older sister who's been there. Get personalized advice for those everyday moments that matter.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat takes up 2 columns on desktop, full width on mobile */}
        <div className="lg:col-span-2">
          <AIChat
            key={chatKey}
            children={children}
            selectedStyle={selectedStyle}
            customStyles={customStyles}
            onStyleChange={handleStyleChange}
            onCreateCustomStyle={() => setShowCustomModal(true)}
          />
        </div>

        {/* Saved advice - Hidden on mobile */}
        <div className="hidden lg:block lg:col-span-1">
          <SavedAdviceList />
        </div>
      </div>

      <CustomStyleModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSuccess={handleCustomStyleCreated}
      />
    </>
  );
}
