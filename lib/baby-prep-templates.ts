export interface RecommendedTask {
  title: string;
  description?: string;
  timeline: string; // e.g., "Week 28-32" or "Third Trimester"
  category: 'essentials' | 'family_home' | 'money_admin' | 'emotional_community';
  priority?: 'high' | 'medium' | 'low';
  context: 'always' | 'first_baby' | 'second_plus'; // When to show this task
}

export const RECOMMENDED_TASKS: Record<string, RecommendedTask[]> = {
  essentials: [
    // Core Medical & Planning
    {
      title: 'Choose a pediatrician',
      description: 'Research and schedule meet-and-greet appointments',
      timeline: 'Week 28-32',
      category: 'essentials',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Confirm hospital registration',
      description: 'Complete pre-registration paperwork',
      timeline: 'Week 32-36',
      category: 'essentials',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Tour hospital or birthing center',
      description: 'Know where to go and what to expect',
      timeline: 'Week 28-34',
      category: 'essentials',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Create birth plan',
      description: 'Discuss preferences with healthcare provider',
      timeline: 'Week 28-32',
      category: 'essentials',
      context: 'always',
    },

    // Car Seat
    {
      title: 'Purchase infant car seat',
      description: 'Can\'t leave hospital without one',
      timeline: 'Week 32-35',
      category: 'essentials',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Finalize car seat installation',
      description: 'Get it inspected by a certified technician',
      timeline: 'Week 35-37',
      category: 'essentials',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Install second car seat (if needed)',
      description: 'Ensure proper installation for both children',
      timeline: 'Week 35-37',
      category: 'essentials',
      priority: 'high',
      context: 'second_plus',
    },

    // Newborn Basics - Home Supplies
    {
      title: 'Stock up on newborn diapers',
      description: 'Have at least 2-3 packs on hand',
      timeline: 'Week 34-37',
      category: 'essentials',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Stock up on wipes',
      description: 'You\'ll go through these quickly',
      timeline: 'Week 34-37',
      category: 'essentials',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Prepare onesies & sleepers (newborn & 0-3 month)',
      description: 'Wash and organize baby clothes',
      timeline: 'Week 32-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Set up feeding supplies',
      description: 'Bottles, nipples, breast pump (if applicable)',
      timeline: 'Week 34-37',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Install smoke & carbon monoxide detectors',
      description: 'Test all safety equipment',
      timeline: 'Week 30-35',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Set up bassinet or crib',
      description: 'Ensure safe sleep space is ready',
      timeline: 'Week 32-36',
      category: 'essentials',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Practice swaddling',
      description: 'Learn technique before baby arrives',
      timeline: 'Third Trimester',
      category: 'essentials',
      context: 'first_baby',
    },
    {
      title: 'Take infant CPR class',
      description: 'Essential safety knowledge',
      timeline: 'Week 30-35',
      category: 'essentials',
      priority: 'high',
      context: 'first_baby',
    },
  ],

  family_home: [
    {
      title: 'Create a sleep or feeding zone at home',
      description: 'Set up a dedicated space for baby care',
      timeline: 'Week 30-34',
      category: 'family_home',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Wash and store bottles, burp cloths, and onesies',
      description: 'Prepare baby items for use',
      timeline: 'Week 34-36',
      category: 'family_home',
      context: 'always',
    },
    {
      title: 'Deep clean kitchen',
      description: 'Clean before baby arrives',
      timeline: 'Week 34-37',
      category: 'family_home',
      context: 'always',
    },
    {
      title: 'Deep clean nursery',
      description: 'Prepare baby\'s space',
      timeline: 'Week 32-36',
      category: 'family_home',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Deep clean car',
      description: 'Prepare for car seat and baby travels',
      timeline: 'Week 34-37',
      category: 'family_home',
      context: 'always',
    },
    {
      title: 'Childproof common areas',
      description: 'Start thinking about safety for when baby becomes mobile',
      timeline: 'Week 30-35',
      category: 'family_home',
      context: 'always',
    },
    {
      title: 'Stock freezer with easy meals',
      description: 'Prepare freezer meals for postpartum period',
      timeline: 'Week 32-37',
      category: 'family_home',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Set up diaper changing stations',
      description: 'Main one in nursery, backup in living area',
      timeline: 'Week 32-36',
      category: 'family_home',
      context: 'always',
    },

    // Second+ Baby
    {
      title: 'Prepare older child\'s routine adjustments',
      description: 'Plan how schedules will shift with new baby',
      timeline: 'Week 28-34',
      category: 'family_home',
      priority: 'high',
      context: 'second_plus',
    },
    {
      title: 'Create "big sibling kit"',
      description: 'Books, activities, special items for older child',
      timeline: 'Week 32-36',
      category: 'family_home',
      context: 'second_plus',
    },
    {
      title: 'Plan sibling transition gifts',
      description: 'Gift "from baby" to help older child feel special',
      timeline: 'Week 34-37',
      category: 'family_home',
      context: 'second_plus',
    },
    {
      title: 'Pre-pack overnight bag for older child',
      description: 'Ready for caregiver when you go to hospital',
      timeline: 'Week 34-36',
      category: 'family_home',
      priority: 'high',
      context: 'second_plus',
    },
    {
      title: 'Create contact list for older child\'s caregiver',
      description: 'Include routine, meals, nap schedule, comfort items',
      timeline: 'Week 34-36',
      category: 'family_home',
      priority: 'high',
      context: 'second_plus',
    },
    {
      title: 'Pre-stage meals for caregivers',
      description: 'Make it easy for whoever is watching older child',
      timeline: 'Week 35-37',
      category: 'family_home',
      context: 'second_plus',
    },
    {
      title: 'Put picture of older child in hospital bag',
      description: 'Nice to have on your nightstand',
      timeline: 'Week 34-36',
      category: 'family_home',
      context: 'second_plus',
    },
  ],

  money_admin: [
    {
      title: 'Open or update 529 plan',
      description: 'Start saving for college early',
      timeline: 'Second/Third Trimester',
      category: 'money_admin',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Review parental leave plans',
      description: 'Confirm benefits, timing, and paperwork',
      timeline: 'Week 28-32',
      category: 'money_admin',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Coordinate childcare coverage',
      description: 'Arrange care for older child during hospital stay',
      timeline: 'Week 30-35',
      category: 'money_admin',
      priority: 'high',
      context: 'second_plus',
    },
    {
      title: 'Review life insurance coverage',
      description: 'Ensure adequate protection for growing family',
      timeline: 'Second Trimester',
      category: 'money_admin',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Update wills and guardianship',
      description: 'Keep legal documents current',
      timeline: 'Second/Third Trimester',
      category: 'money_admin',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Plan to freeze baby\'s credit',
      description: 'Protect against identity theft from birth',
      timeline: 'Third Trimester',
      category: 'money_admin',
      context: 'always',
    },
    {
      title: 'Review health insurance coverage',
      description: 'Confirm baby will be added, understand out-of-pocket costs',
      timeline: 'Week 28-32',
      category: 'money_admin',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Set up FSA/HSA for dependent care',
      description: 'Take advantage of tax-advantaged accounts',
      timeline: 'Second Trimester',
      category: 'money_admin',
      context: 'always',
    },
    {
      title: 'Create postpartum budget',
      description: 'Plan for diapers, childcare, reduced income during leave',
      timeline: 'Week 28-34',
      category: 'money_admin',
      context: 'always',
    },
    {
      title: 'Research childcare options',
      description: 'Daycare, nanny, family care - start early, waitlists are long',
      timeline: 'Week 20-28',
      category: 'money_admin',
      priority: 'high',
      context: 'always',
    },
  ],

  emotional_community: [
    {
      title: 'Write a welcome letter to your baby',
      description: 'Capture your feelings and hopes before arrival',
      timeline: 'Third Trimester',
      category: 'emotional_community',
      context: 'always',
    },
    {
      title: 'Discuss visitor boundaries with partner',
      description: 'Plan when and how visitors can meet baby',
      timeline: 'Week 28-34',
      category: 'emotional_community',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Organize a meal train',
      description: 'Coordinate support from friends and family',
      timeline: 'Week 32-36',
      category: 'emotional_community',
      context: 'always',
    },
    {
      title: 'Schedule date nights before baby',
      description: 'Enjoy quality time as a couple',
      timeline: 'Throughout',
      category: 'emotional_community',
      context: 'always',
    },
    {
      title: 'Plan self-care days',
      description: 'Rest and pamper yourself before baby arrives',
      timeline: 'Third Trimester',
      category: 'emotional_community',
      context: 'always',
    },
    {
      title: 'Take maternity photos',
      description: 'Capture this special time',
      timeline: 'Week 28-34',
      category: 'emotional_community',
      context: 'always',
    },
    {
      title: 'Create a birth plan',
      description: 'Discuss preferences with healthcare provider',
      timeline: 'Week 28-32',
      category: 'emotional_community',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Join a pregnancy/parenting group',
      description: 'Connect with others in similar life stage',
      timeline: 'Second Trimester',
      category: 'emotional_community',
      context: 'always',
    },
    {
      title: 'Plan postpartum support system',
      description: 'Line up helpers for first weeks at home',
      timeline: 'Week 30-36',
      category: 'emotional_community',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Discuss parenting philosophy with partner',
      description: 'Align on key values and approaches',
      timeline: 'Second Trimester',
      category: 'emotional_community',
      context: 'always',
    },
    {
      title: 'Create list of postpartum warning signs',
      description: 'Know when to call doctor - for physical and mental health',
      timeline: 'Third Trimester',
      category: 'emotional_community',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Plan "last moments" photos with older child',
      description: 'Capture time as family of three/four before baby',
      timeline: 'Week 34-37',
      category: 'emotional_community',
      context: 'second_plus',
    },
    {
      title: 'Read books about becoming a big sibling',
      description: 'Prepare older child for baby\'s arrival',
      timeline: 'Week 28-36',
      category: 'emotional_community',
      priority: 'high',
      context: 'second_plus',
    },
    {
      title: 'Practice baby doll care with older child',
      description: 'Gentle diaper changes, holding, being quiet',
      timeline: 'Week 30-37',
      category: 'emotional_community',
      context: 'second_plus',
    },
  ],
};

// Helper function to get recommended tasks based on family context
export function getRecommendedTasksForFamily(
  category: string,
  hasOlderChildren: boolean
): RecommendedTask[] {
  const tasks = RECOMMENDED_TASKS[category] || [];

  return tasks.filter(task => {
    if (task.context === 'always') return true;
    if (task.context === 'first_baby' && !hasOlderChildren) return true;
    if (task.context === 'second_plus' && hasOlderChildren) return true;
    return false;
  });
}
