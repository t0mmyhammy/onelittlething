'use client';

import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { BabyName } from './NameBoardView';

interface Child {
  id: string;
  name: string;
  birthdate: string;
}

interface NameComparisonTableProps {
  names: BabyName[];
  children: Child[];
  lastName: string;
  onBack: () => void;
}

export default function NameComparisonTable({
  names,
  children,
  lastName,
  onBack,
}: NameComparisonTableProps) {
  // Get names with AI enhancements only (since we need the data for comparison)
  const enhancedNames = names.filter(n => n.ai_enhanced_notes && Object.keys(n.ai_enhanced_notes).length > 0);

  // Get sibling names for column headers
  const siblingNames = children
    .filter(c => new Date(c.birthdate) <= new Date())
    .map(c => c.name);

  if (enhancedNames.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="sticky top-0 bg-cream/95 backdrop-blur-sm z-10 border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <p className="text-xl text-gray-600 mb-4">No enhanced names yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Use the "Learn more about this name" button on individual names to generate comparison data.
            </p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-sage text-white rounded-full hover:opacity-90 font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="sticky top-0 bg-cream/95 backdrop-blur-sm z-10 border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Back
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Name Comparison Table</h2>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 py-6 overflow-x-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sage text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold sticky left-0 bg-sage z-10">Name</th>
                <th className="px-4 py-3 text-left font-semibold min-w-[200px]">Meaning</th>
                <th className="px-4 py-3 text-left font-semibold min-w-[120px]">Popularity</th>
                <th className="px-4 py-3 text-left font-semibold min-w-[150px]">Nicknames</th>
                <th className="px-4 py-3 text-left font-semibold min-w-[100px]">Origin</th>
                <th className="px-4 py-3 text-left font-semibold min-w-[120px]">Vibe</th>
                {lastName && (
                  <th className="px-4 py-3 text-left font-semibold min-w-[180px]">
                    Flow with {lastName}
                  </th>
                )}
                {siblingNames.map(sibName => (
                  <th key={sibName} className="px-4 py-3 text-left font-semibold min-w-[180px]">
                    Flow with {sibName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enhancedNames.map((name, idx) => {
                const enhanced = name.ai_enhanced_notes || {};
                const nicknames = enhanced.nicknames || [];

                // Extract vibe from origin or notes
                const vibe = enhanced.origin?.includes('classic') ? 'Classic' :
                           enhanced.origin?.includes('modern') ? 'Modern' :
                           enhanced.origin?.includes('trendy') ? 'Trendy' :
                           enhanced.origin?.includes('traditional') ? 'Traditional' :
                           enhanced.popularity?.includes('popular') ? 'Popular' :
                           'Unique';

                return (
                  <tr key={name.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {/* Name - Sticky */}
                    <td className={`px-4 py-3 font-semibold text-gray-900 sticky left-0 z-10 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        {name.name}
                        {name.is_favorite && <span className="text-sm">⭐</span>}
                        {name.is_ai_generated && (
                          <span className="text-xs text-purple-600">✨</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {name.type === 'first' ? 'First' : 'Middle'}
                      </div>
                    </td>

                    {/* Meaning */}
                    <td className="px-4 py-3 text-gray-700">
                      {enhanced.meaning || '—'}
                    </td>

                    {/* Popularity */}
                    <td className="px-4 py-3 text-gray-700">
                      {enhanced.popularity || '—'}
                    </td>

                    {/* Nicknames */}
                    <td className="px-4 py-3">
                      {nicknames.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {nicknames.map((nick: string, i: number) => (
                            <span
                              key={i}
                              className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {nick}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Origin */}
                    <td className="px-4 py-3 text-gray-700">
                      {enhanced.origin || '—'}
                    </td>

                    {/* Vibe */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-3 py-1 bg-sage/20 text-sage rounded-full text-xs font-medium">
                        {vibe}
                      </span>
                    </td>

                    {/* Flow with Last Name */}
                    {lastName && (
                      <td className="px-4 py-3 text-gray-700">
                        {enhanced.fullNameFlow || `${name.name} ${lastName}`}
                      </td>
                    )}

                    {/* Flow with Siblings */}
                    {siblingNames.map(sibName => (
                      <td key={sibName} className="px-4 py-3 text-gray-700">
                        {enhanced.siblingCompatibility || '—'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            Showing {enhancedNames.length} name{enhancedNames.length !== 1 ? 's' : ''} with AI enhancements.
            Names without enhancements won't appear in this table.
          </p>
        </div>
      </div>
    </div>
  );
}
