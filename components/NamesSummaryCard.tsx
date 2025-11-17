'use client';

import Link from 'next/link';
import { ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface NamesSummaryCardProps {
  firstNameCount: number;
  middleNameCount: number;
  dueDate: string | null;
}

export default function NamesSummaryCard({
  firstNameCount,
  middleNameCount,
  dueDate,
}: NamesSummaryCardProps) {
  // Calculate days until due date
  const daysUntilDue = dueDate
    ? Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const totalNames = firstNameCount + middleNameCount;

  return (
    <Link
      href="/names"
      className="block bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-300 transition-all hover:shadow-lg group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 font-serif">
              Name Ideas
            </h3>
            <p className="text-sm text-purple-700">
              Building your perfect list
            </p>
          </div>
        </div>
        <ChevronRightIcon className="w-6 h-6 text-purple-400 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* First Names */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {firstNameCount}
          </div>
          <div className="text-sm text-gray-600">First Name Ideas</div>
        </div>

        {/* Middle Names */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {middleNameCount}
          </div>
          <div className="text-sm text-gray-600">Middle Name Ideas</div>
        </div>
      </div>

      {/* Due Date Countdown */}
      {dueDate && daysUntilDue !== null && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Time to decide</div>
              <div className="text-2xl font-bold text-gray-900">
                {daysUntilDue > 0 ? (
                  <>
                    {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''} until due date
                  </>
                ) : daysUntilDue === 0 ? (
                  'Due today! 🎉'
                ) : (
                  `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} past due`
                )}
              </div>
            </div>
            <div className="text-4xl">
              {daysUntilDue > 0 ? '⏳' : '👶'}
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-4 flex items-center justify-between text-purple-700 font-medium">
        <span>
          {totalNames === 0
            ? 'Start adding names'
            : 'View all names & swipe mode'}
        </span>
        <span className="text-lg">→</span>
      </div>
    </Link>
  );
}
