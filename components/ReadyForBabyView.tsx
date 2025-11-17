'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeSlashIcon,
  EyeIcon,
  SparklesIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  InformationCircleIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import RecommendedTasksModal from './RecommendedTasksModal';
import { getRecommendedTasksForFamily, RecommendedTask } from '@/lib/baby-prep-templates';
import Link from 'next/link';
import NamesSummaryCard from './NamesSummaryCard';

interface BabyPrepList {
  id: string;
  family_id: string;
  due_date: string | null;
  stage: 'first' | 'second' | 'third' | 'fourth' | null;
  is_second_child: boolean;
  baby_named: boolean;
  hide_names: boolean;
  created_at: string;
  updated_at: string;
}

interface BabyPrepTask {
  id: string;
  list_id: string;
  category: 'essentials' | 'family_home' | 'money_admin' | 'emotional_community' | 'name_ideas';
  title: string;
  description: string | null;
  is_complete: boolean;
  completed_by: string | null;
  completed_at: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface BabyNameIdea {
  id: string;
  family_id: string;
  name: string;
  type: 'F' | 'M' | 'N';
  notes: string | null;
  ai_enhanced_notes: any;
  reactions: any;
  is_favorite: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface BabyNameComment {
  id: string;
  name_id: string;
  user_id: string | null;
  comment_text: string;
  created_at: string;
}

interface ReadyForBabyViewProps {
  babyPrepList: BabyPrepList | null;
  tasks: BabyPrepTask[];
  firstNameCount: number;
  middleNameCount: number;
  dueDate: string | null;
  userId: string;
  familyId: string;
}

const CATEGORY_CONFIG = {
  essentials: {
    title: 'The Essentials',
    icon: '👶',
    color: 'amber',
    defaultTasks: [
      { title: 'Choose a pediatrician', description: 'Research and schedule meet-and-greet appointments' },
      { title: 'Confirm hospital registration', description: 'Complete pre-registration paperwork' },
      { title: 'Pack hospital bags', description: 'Prepare bags for mom, dad, and baby' },
      { title: 'Finalize car seat installation', description: 'Get it inspected by a certified technician' },
      { title: 'Stock up on newborn basics', description: 'Diapers, wipes, onesies, and feeding supplies' },
    ],
  },
  family_home: {
    title: 'Family & Home',
    icon: '🏠',
    color: 'sage',
    defaultTasks: [
      { title: 'Create a sleep or feeding zone at home', description: 'Set up a dedicated space for baby care' },
      { title: 'Wash and store bottles, burp cloths, and onesies', description: 'Prepare baby items for use' },
      { title: 'Deep clean key areas', description: 'Kitchen, nursery, and car' },
      { title: 'Prepare older kids\' routines', description: 'Discuss changes and maintain stability' },
      { title: 'Plan sibling transition gifts', description: 'Help older siblings feel included' },
    ],
  },
  money_admin: {
    title: 'Money & Admin',
    icon: '💸',
    color: 'blue',
    defaultTasks: [
      { title: 'Update or open 529 plan', description: 'Start saving for college' },
      { title: 'Review parental leave plans', description: 'Confirm benefits and timing' },
      { title: 'Adjust childcare coverage for sibling', description: 'Plan for older kids during hospital stay' },
      { title: 'Review life insurance coverage', description: 'Ensure adequate protection' },
      { title: 'Update wills and guardianship', description: 'Keep legal documents current' },
      { title: 'Freeze new baby\'s credit', description: 'Protect against identity theft' },
    ],
  },
  emotional_community: {
    title: 'Emotional & Community Prep',
    icon: '💛',
    color: 'rose',
    defaultTasks: [
      { title: 'Create a short "welcome letter" to your baby', description: 'Capture your feelings before arrival' },
      { title: 'Discuss boundaries for visitors', description: 'Plan when and how visitors can meet baby' },
      { title: 'Organize a meal train', description: 'Coordinate support from friends and family' },
      { title: 'Schedule downtime or self-care days', description: 'Plan rest before baby arrives' },
      { title: 'Add ideas for meaningful photos or rituals', description: 'Capture special moments' },
    ],
  },
};

export default function ReadyForBabyView({
  babyPrepList: initialBabyPrepList,
  tasks: initialTasks,
  firstNameCount,
  middleNameCount,
  dueDate,
  userId,
  familyId,
}: ReadyForBabyViewProps) {
  const [babyPrepList, setBabyPrepList] = useState(initialBabyPrepList);
  const [tasks, setTasks] = useState(initialTasks);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['essentials', 'family_home', 'money_admin', 'emotional_community', 'name_ideas'])
  );
  const [hideCompleted, setHideCompleted] = useState(false);
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});

  const getTasksByCategory = (category: string) => {
    return tasks.filter(t => t.category === category);
  };

  const getCompletedCount = (category: string) => {
    return tasks.filter(t => t.category === category && t.is_complete).length;
  };

  const getVisibleTasks = (category: string) => {
    const categoryTasks = getTasksByCategory(category);
    return hideCompleted ? categoryTasks.filter(t => !t.is_complete) : categoryTasks;
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const { error } = await supabase
      .from('baby_prep_tasks')
      .update({
        is_complete: !task.is_complete,
        completed_by: !task.is_complete ? userId : null,
        completed_at: !task.is_complete ? new Date().toISOString() : null,
      })
      .eq('id', taskId);

    if (!error) {
      setTasks(tasks.map(t =>
        t.id === taskId
          ? { ...t, is_complete: !t.is_complete, completed_by: !t.is_complete ? userId : null, completed_at: !t.is_complete ? new Date().toISOString() : null }
          : t
      ));
    }
  };

  const handleAddTask = async (category: string) => {
    const title = newTaskInputs[category];
    if (!title?.trim() || !babyPrepList) return;

    const maxOrder = Math.max(...getTasksByCategory(category).map(t => t.order_index), -1);

    const { data, error } = await supabase
      .from('baby_prep_tasks')
      .insert({
        list_id: babyPrepList.id,
        category,
        title: title.trim(),
        order_index: maxOrder + 1,
      })
      .select()
      .single();

    if (!error && data) {
      setTasks([...tasks, data]);
      setNewTaskInputs({ ...newTaskInputs, [category]: '' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('baby_prep_tasks')
      .delete()
      .eq('id', taskId);

    if (!error) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };





  const initializeDefaultTasks = async (category: keyof typeof CATEGORY_CONFIG) => {
    if (!babyPrepList) return;

    const config = CATEGORY_CONFIG[category];
    const existingTasks = getTasksByCategory(category);

    if (existingTasks.length > 0) return;

    const tasksToInsert = config.defaultTasks.map((task, index) => ({
      list_id: babyPrepList.id,
      category,
      title: task.title,
      description: task.description,
      order_index: index,
    }));

    const { data, error } = await supabase
      .from('baby_prep_tasks')
      .insert(tasksToInsert)
      .select();

    if (!error && data) {
      setTasks([...tasks, ...data]);
    }
  };

  const handleShowRecommendations = (category: string) => {
    if (!babyPrepList) {
      console.error('Cannot show recommendations: babyPrepList is null');
      alert('Unable to load recommendations. Please refresh the page.');
      return;
    }
    setRecommendationsCategory(category);
    setShowRecommendationsModal(true);
  };

  const handleAddRecommendedTasks = async (recommendedTasks: RecommendedTask[]) => {
    console.log('handleAddRecommendedTasks called');
    console.log('babyPrepList:', babyPrepList);
    console.log('recommendationsCategory:', recommendationsCategory);

    if (!babyPrepList || !recommendationsCategory) {
      console.error('Missing babyPrepList or recommendationsCategory');
      console.error('babyPrepList is null:', !babyPrepList);
      console.error('recommendationsCategory is null:', !recommendationsCategory);
      alert(`Cannot add tasks: ${!babyPrepList ? 'Baby prep list not found' : 'Category not set'}`);
      return;
    }

    console.log('Adding recommended tasks:', recommendedTasks);
    console.log('Category:', recommendationsCategory);

    const existingTasks = getTasksByCategory(recommendationsCategory);
    const maxOrder = Math.max(...existingTasks.map(t => t.order_index), -1);

    const tasksToInsert = recommendedTasks.map((task, index) => ({
      list_id: babyPrepList.id,
      category: recommendationsCategory,
      title: task.title,
      description: task.description || null,
      order_index: maxOrder + 1 + index,
    }));

    console.log('Tasks to insert:', tasksToInsert);

    const { data, error } = await supabase
      .from('baby_prep_tasks')
      .insert(tasksToInsert)
      .select();

    if (error) {
      console.error('Error inserting tasks:', error);
      alert('Failed to add tasks. Please try again.');
      return;
    }

    if (data) {
      console.log('Successfully inserted tasks:', data);
      setTasks([...tasks, ...data]);
    }
  };

  const handleGenerateHospitalBags = async () => {
    if (!babyPrepList) return;

    setGeneratingHospitalBags(true);

    try {
      const response = await fetch('/api/generate-hospital-bags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId,
          hasOlderChildren,
          templateId: 'hospital-bags',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedPackListIds(data.packListIds || []);
      } else {
        console.error('Failed to generate hospital bags');
      }
    } catch (error) {
      console.error('Error generating hospital bags:', error);
    } finally {
      setGeneratingHospitalBags(false);
    }
  };

  const handleToggleBabyNamed = async () => {
    if (!babyPrepList) return;

    const newValue = !babyPrepList.baby_named;

    const { error } = await supabase
      .from('baby_prep_lists')
      .update({ baby_named: newValue })
      .eq('id', babyPrepList.id);

    if (!error) {
      setBabyPrepList({ ...babyPrepList, baby_named: newValue });
    }
  };

  const handleToggleHideNames = async () => {
    if (!babyPrepList) return;

    const newValue = !babyPrepList.hide_names;

    const { error } = await supabase
      .from('baby_prep_lists')
      .update({ hide_names: newValue })
      .eq('id', babyPrepList.id);

    if (!error) {
      setBabyPrepList({ ...babyPrepList, hide_names: newValue });
    }
  };



  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-900 mb-2">Ready for Baby</h1>
        <p className="text-gray-600">
          A calm, supportive guide to help you prepare — practically and emotionally — for your baby's arrival.
        </p>
      </div>

      {/* Error State - Baby Prep List Not Found */}
      {!babyPrepList && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium mb-2">Unable to load your baby prep list</p>
          <p className="text-red-700 text-sm mb-3">
            There was an error creating or loading your preparation checklist. This could be due to a database permission issue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Only show content if babyPrepList exists */}
      {babyPrepList && (
        <>
          {/* Names Summary Card - Links to /names */}
          <div className="mb-6">
            <NamesSummaryCard
              firstNameCount={firstNameCount}
              middleNameCount={middleNameCount}
              dueDate={dueDate}
            />
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
          </div>

          {/* Sections */}
          <div className="space-y-4">
        {/* The Essentials */}
        {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map((category) => {
          const config = CATEGORY_CONFIG[category];
          const categoryTasks = getTasksByCategory(category);
          const visibleTasks = getVisibleTasks(category);
          const completedCount = getCompletedCount(category);
          const totalCount = categoryTasks.length;
          const isExpanded = expandedSections.has(category);

          return (
            <div key={category} className="bg-white rounded-xl border border-gray-200">
              {/* Section Header */}
              <div className="flex items-center">
                <button
                  onClick={() => {
                    toggleSection(category);
                    if (categoryTasks.length === 0) {
                      initializeDefaultTasks(category);
                    }
                  }}
                  className="flex-1 flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-tl-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
                      <p className="text-sm text-gray-500">
                        {totalCount > 0 && `${completedCount} of ${totalCount} complete`}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowRecommendations(category);
                  }}
                  className="p-4 hover:bg-blue-50 transition-colors rounded-tr-xl group"
                  title="See recommended tasks"
                >
                  <InformationCircleIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </button>
              </div>

              {/* Section Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4">
                  <div className="space-y-2">
                    {visibleTasks.map((task) => {
                      const isHospitalBagsTask = task.title.toLowerCase().includes('pack hospital bags');

                      return (
                        <div key={task.id}>
                          <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg group">
                            <input
                              type="checkbox"
                              checked={task.is_complete}
                              onChange={() => handleToggleTask(task.id)}
                              className="w-5 h-5 text-sage border-gray-300 rounded focus:ring-sage cursor-pointer mt-0.5"
                            />
                            <div className="flex-1">
                              <p className={`${task.is_complete ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-xs text-red-600 hover:text-red-700 transition-opacity"
                            >
                              Delete
                            </button>
                          </div>

                          {/* Special auto-generate button for hospital bags */}
                          {isHospitalBagsTask && !task.is_complete && (
                            <div className="ml-8 mt-2 mb-2">
                              {generatedPackListIds.length > 0 ? (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <p className="text-sm text-green-800 mb-2">
                                    ✓ Created {generatedPackListIds.length} hospital bag pack lists!
                                  </p>
                                  <Link
                                    href="/pack-lists"
                                    className="text-sm text-sage hover:underline font-medium"
                                  >
                                    View Pack Lists →
                                  </Link>
                                </div>
                              ) : (
                                <button
                                  onClick={handleGenerateHospitalBags}
                                  disabled={generatingHospitalBags}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sage to-sage/80 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <RocketLaunchIcon className="w-4 h-4" />
                                  {generatingHospitalBags ? 'Generating...' : `Auto-generate ${hasOlderChildren ? '5' : '3'} Pack Lists`}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {hideCompleted && totalCount - visibleTasks.length > 0 && (
                      <p className="text-xs text-gray-500 italic py-2">
                        {totalCount - visibleTasks.length} item{totalCount - visibleTasks.length > 1 ? 's' : ''} hidden
                      </p>
                    )}
                  </div>

                  {/* Add New Task */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTaskInputs[category] || ''}
                        onChange={(e) => setNewTaskInputs({ ...newTaskInputs, [category]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTask(category);
                        }}
                        placeholder="Add a new task..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                      />
                      <button
                        onClick={() => handleAddTask(category)}
                        className="px-4 py-2 bg-sage text-white rounded-lg hover:opacity-90 text-sm font-medium flex items-center gap-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

          {/* Banner Reminder */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>Coming soon:</strong> We'll automatically organize these tasks by trimester based on your due date. For now, all features are visible to explore.
            </p>
          </div>
        </>
      )}

      {/* Recommendations Modal */}
      {showRecommendationsModal && recommendationsCategory && babyPrepList && (
        <RecommendedTasksModal
          category={recommendationsCategory}
          categoryTitle={CATEGORY_CONFIG[recommendationsCategory as keyof typeof CATEGORY_CONFIG]?.title || ''}
          recommendedTasks={getRecommendedTasksForFamily(recommendationsCategory, hasOlderChildren)}
          onClose={() => {
            setShowRecommendationsModal(false);
            setRecommendationsCategory(null);
          }}
          onAddTasks={handleAddRecommendedTasks}
        />
      )}
    </>
  );
}
