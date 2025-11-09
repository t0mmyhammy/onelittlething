'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAllParentingStyles } from '@/lib/parentingStyles';
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ParentingStyleSelectorProps {
  selectedStyle: string;
  customStyles: any[];
  onStyleChange: (styleId: string) => void;
  onCreateCustomStyle: () => void;
}

export default function ParentingStyleSelector({
  selectedStyle,
  customStyles,
  onStyleChange,
  onCreateCustomStyle,
}: ParentingStyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const allPredefinedStyles = getAllParentingStyles();
  const supabase = createClient();

  const handleStyleChange = async (styleId: string) => {
    setIsOpen(false);
    onStyleChange(styleId);

    // Update user preferences in database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          selected_parenting_style: styleId,
        });
    }
  };

  const getStyleName = (styleId: string) => {
    // Check predefined styles
    const predefined = allPredefinedStyles.find(s => s.id === styleId);
    if (predefined) return predefined.name;

    // Check custom styles
    const custom = customStyles.find(s => s.id === styleId);
    if (custom) return custom.name;

    return 'Select Style';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-sage rounded-lg hover:bg-sage/5 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">
          {getStyleName(selectedStyle)}
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Parenting Approaches
              </div>

              {allPredefinedStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedStyle === style.id
                      ? 'bg-sage/10 text-sage font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">{style.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {style.shortDescription}
                  </div>
                </button>
              ))}

              {customStyles.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide mt-2 border-t border-gray-100 pt-4">
                    Your Custom Styles
                  </div>

                  {customStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleStyleChange(style.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedStyle === style.id
                          ? 'bg-sage/10 text-sage font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="font-medium text-sm">{style.name}</div>
                      {style.description && (
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {style.description}
                        </div>
                      )}
                    </button>
                  ))}
                </>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  onCreateCustomStyle();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 mt-2 border-t border-gray-100 pt-4 text-sm font-medium text-sage hover:bg-sage/5 rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Create Custom Style
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
