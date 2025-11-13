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
    // Pediatrician
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

    // Hospital Bags - Mom
    {
      title: 'Pack comfortable slippers for hospital',
      description: 'Soft slippers for hard hospital floors',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack cozy socks',
      description: 'Multiple pairs for comfort',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack loose, comfortable clothes',
      description: 'Easy to change into and comfortable for recovery',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack zip-up or button-down top',
      description: 'For easy monitoring and nursing',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Choose going-home outfit (loose fitting)',
      description: 'Something comfortable that isn\'t tight',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack light robe or hoodie',
      description: 'For comfort and easy access',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack extra underwear',
      description: 'Hospital provides some, but having your own helps',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },

    // Toiletries
    {
      title: 'Pack toothbrushes & toothpaste',
      description: 'For both parents',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack face wash & moisturizer',
      description: 'Your regular skincare routine',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack chapstick',
      description: 'Hospital air is very dry',
      timeline: 'Week 34-36',
      category: 'essentials',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Pack hair ties & brush',
      description: 'To keep hair manageable',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack deodorant',
      description: 'For both parents',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack hand lotion',
      description: 'Hospital air is very drying',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack travel-size body wash/shampoo',
      description: 'First shower after birth feels incredible',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },

    // Sleep & Personal
    {
      title: 'Pack phone chargers (extra long cord)',
      description: 'Essential for staying connected',
      timeline: 'Week 34-36',
      category: 'essentials',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Pack eye mask & earplugs',
      description: 'For better rest in a busy hospital',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Bring pillow from home',
      description: 'Especially important for partner',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack water bottle with straw',
      description: 'Stay hydrated easily',
      timeline: 'Week 34-36',
      category: 'essentials',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Pack snacks that hold up well',
      description: 'Protein bars, gummies, nuts',
      timeline: 'Week 34-36',
      category: 'essentials',
      priority: 'high',
      context: 'always',
    },
    {
      title: 'Prepare folder for paperwork',
      description: 'Birth certificate, insurance forms, etc.',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },

    // Comfort & Vibes
    {
      title: 'Pack small blanket',
      description: 'Hospital rooms can get cold',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack portable speaker or headphones',
      description: 'For music, meditation, or entertainment',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack gum or mints',
      description: 'Freshen up easily',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack frictionless outfit for partner',
      description: 'Comfortable clothes for sleeping',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },

    // Longer Stay Items
    {
      title: 'Pack extra set of comfy clothes',
      description: 'For C-section, induction, or complications',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack more substantial snacks',
      description: 'For longer hospital stays',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack extra-long phone charger',
      description: 'Helpful for extended stays',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack slippers you don\'t mind getting dirty',
      description: 'For longer stays',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack portable fan',
      description: 'Temperature control for comfort',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },
    {
      title: 'Pack compression socks',
      description: 'Helps circulation after longer stays',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'always',
    },

    // Second+ Baby Additions
    {
      title: 'Pack extra clothes for logistics',
      description: 'Won\'t be going home as quickly with older child',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'second_plus',
    },
    {
      title: 'Prepare partner\'s extended bag',
      description: 'More snacks, entertainment, overnight clothes for shuttling',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'second_plus',
    },
    {
      title: 'Pack backup chargers',
      description: 'One always disappears with the toddler',
      timeline: 'Week 34-36',
      category: 'essentials',
      context: 'second_plus',
    },

    // Car Seat
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

    // Newborn Basics
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
