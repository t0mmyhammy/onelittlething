'use client';

import { useState, useMemo } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { FireIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface Child {
  id: string;
  name: string;
  photo_url: string | null;
}

interface Entry {
  entry_date: string;
  entry_children?: Array<{
    children: {
      id: string;
      name: string;
    };
  }>;
}

interface StreakWidgetProps {
  entries: Entry[];
  children: Child[];
}

export default function StreakWidget({ entries, children }: StreakWidgetProps) {
  const [showChildrenBreakdown, setShowChildrenBreakdown] = useState(false);

  // Get today's date at start of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate streak data for all entries or filtered by child
  const calculateStreakData = (entriesForCalc: Entry[]) => {
    // Get unique dates from entries (already in YYYY-MM-DD format from database)
    const entryDates = new Set(
      entriesForCalc.map((entry) => entry.entry_date)
    );

    // Get current week (Sunday to today/Saturday)
    const last7Days = [];
    const currentDay = new Date(today);
    const dayOfWeek = currentDay.getDay(); // 0 = Sunday, 6 = Saturday

    // Start from last Sunday
    const startDate = new Date(currentDay);
    startDate.setDate(startDate.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      last7Days.push({
        date: date,
        dateStr: dateStr,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfMonth: date.getDate(),
        hasEntry: entryDates.has(dateStr),
      });
    }

    // Check if today has an entry
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayHasEntry = entryDates.has(todayStr);

    // Calculate current streak (counting backwards from today)
    let currentStreak = 0;
    for (let i = 0; i <= 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const expectedDateStr = `${year}-${month}-${day}`;

      if (entryDates.has(expectedDateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Check if yesterday had an entry (to determine if streak is continuing or broken)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    const yesterdayHasEntry = entryDates.has(yesterdayStr);

    return {
      last7Days,
      currentStreak,
      todayHasEntry,
      yesterdayHasEntry,
      hasAnyEntries: entryDates.size > 0,
    };
  };

  const overallStreakData = useMemo(() => calculateStreakData(entries), [entries]);

  const childrenStreakData = useMemo(() => {
    return children.map((child) => {
      const childEntries = entries.filter((entry) =>
        entry.entry_children?.some((ec) => ec.children.id === child.id)
      );
      return {
        child,
        ...calculateStreakData(childEntries),
      };
    });
  }, [entries, children]);

  const renderWeekView = (streakData: any, isChildRow = false) => {
    return (
      <div className="grid grid-cols-7 gap-2">
        {streakData.last7Days.map((day: any, index: number) => {
          const isToday = day.date.toDateString() === today.toDateString();
          return (
            <div
              key={index}
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                isToday && !isChildRow ? 'bg-sage/10 ring-2 ring-sage/30' : ''
              }`}
            >
              {!isChildRow && (
                <>
                  <span className="text-xs font-medium text-gray-500 mb-1">
                    {day.dayOfWeek}
                  </span>
                  <span className="text-sm font-medium text-gray-700 mb-2">
                    {day.dayOfMonth}
                  </span>
                </>
              )}
              {day.hasEntry ? (
                <CheckCircleIcon className={`w-6 h-6 text-sage ${isChildRow ? 'mt-1' : ''} animate-pulse-once`} />
              ) : (
                <div className={`w-6 h-6 rounded-full border-2 border-gray-200 ${isChildRow ? 'mt-1' : ''} hover:border-sage/30 transition-colors`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getMotivationalMessage = () => {
    // If today is already logged
    if (overallStreakData.todayHasEntry) {
      return `Your streak is now ${overallStreakData.currentStreak} ${overallStreakData.currentStreak === 1 ? 'day' : 'days'}`;
    }

    // No entries ever
    if (!overallStreakData.hasAnyEntries) {
      return 'Start your first streak today';
    }

    // Has entries and yesterday was logged (continuing streak)
    if (overallStreakData.yesterdayHasEntry) {
      return 'Keep your streak going';
    }

    // Has entries but yesterday wasn't logged (broken streak, needs restart)
    if (overallStreakData.hasAnyEntries && overallStreakData.currentStreak === 0) {
      return 'Restart your streak today';
    }

    // Default fallback
    return 'Capture a moment today';
  };

  // Calculate weekly count for progress bar
  const weeklyCount = overallStreakData.last7Days.filter(day => day.hasEntry).length;
  const goal = 7;
  const progress = Math.min((weeklyCount / goal) * 100, 100);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FireIcon className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-serif text-gray-900">This Week's Progress</h3>
        </div>
        {children.length > 0 && (
          <button
            onClick={() => setShowChildrenBreakdown(!showChildrenBreakdown)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>By child</span>
            {showChildrenBreakdown ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Progress bar with count */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold text-gray-900">{weeklyCount}</span>
            <span className="text-sm text-gray-500">out of {goal} moments</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sage to-rose h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Overall Week View */}
        {renderWeekView(overallStreakData)}

        {/* Motivational message with streak info */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-700 text-center font-medium">
            {weeklyCount === 0 && "🌤 You're building a beautiful rhythm"}
            {weeklyCount === 1 && "✨ Great start! One moment at a time"}
            {weeklyCount === 2 && "🌱 You're growing something meaningful"}
            {weeklyCount === 3 && "🌟 Keep the momentum going — you're doing great"}
            {weeklyCount === 4 && "🔥 You're on fire this week!"}
            {weeklyCount === 5 && "💫 Almost there — what a week this has been"}
            {weeklyCount === 6 && "🌈 One more day to complete your week!"}
            {weeklyCount >= 7 && "🎉 Amazing! You've captured every day this week"}
          </p>
          {overallStreakData.currentStreak > 1 && (
            <p className="text-xs text-sage font-semibold text-center mt-1.5 animate-fade-in">
              {overallStreakData.currentStreak} day streak — Keep it going!
            </p>
          )}
        </div>
      </div>

      {/* Children Breakdown */}
      {showChildrenBreakdown && children.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
          {childrenStreakData.map(({ child, last7Days, currentStreak }) => (
            <div key={child.id}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{child.name}</span>
                <span className="text-xs text-gray-500">
                  {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                </span>
              </div>
              {renderWeekView({ last7Days }, true)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
