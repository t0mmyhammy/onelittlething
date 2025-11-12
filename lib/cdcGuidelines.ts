// CDC and AAP (American Academy of Pediatrics) age-appropriate guidelines

export interface AgeGuidelines {
  sleep: string;
  feeding: string;
  development: string;
  safety: string;
}

export function getAgeGuidelines(ageInMonths: number): AgeGuidelines {
  if (ageInMonths < 4) {
    // 0-3 months
    return {
      sleep: "Newborns sleep 14-17 hours per day in short bursts. Put baby on back to sleep. Room-sharing (but not bed-sharing) is recommended.",
      feeding: "Breastfeed or formula feed on demand, typically every 2-3 hours. Watch for hunger cues. No water or other liquids needed.",
      development: "Tracks faces, startles at sounds, brings hands to mouth. Tummy time helps build neck strength.",
      safety: "Always place baby on back to sleep. Keep crib free of blankets, pillows, and toys. Car seat should be rear-facing."
    };
  } else if (ageInMonths < 12) {
    // 4-11 months
    return {
      sleep: "Babies need 12-16 hours of sleep per 24 hours (including naps). By 6 months, most babies can sleep through the night.",
      feeding: "Start solid foods around 6 months while continuing breast milk or formula. Introduce one food at a time. No honey before age 1.",
      development: "Rolls over, sits without support, babbles. Stranger anxiety is normal. Explores with hands and mouth.",
      safety: "Baby-proof home as they become mobile. Rear-facing car seat. Watch for choking hazards. Gate off stairs."
    };
  } else if (ageInMonths < 24) {
    // 1-2 years
    return {
      sleep: "Toddlers need 11-14 hours of sleep per 24 hours (including naps). Most take 1-2 naps per day.",
      feeding: "3 meals plus 2-3 snacks. Offer variety. Introduce cow's milk at 12 months. Self-feeding is messy but important.",
      development: "Walks, says first words, copies others. Separation anxiety is common. Points to show objects.",
      safety: "Rear-facing car seat until at least age 2. Secure furniture to walls. Poison-proof home. Watch near water and stairs."
    };
  } else if (ageInMonths < 36) {
    // 2-3 years
    return {
      sleep: "Toddlers need 11-14 hours per 24 hours. Many transition from 2 naps to 1 nap around age 2.",
      feeding: "3 meals plus 2 snacks. Offer healthy choices and let them decide how much. Transition from bottle if still using.",
      development: "Runs, kicks ball, copies adults, plays pretend. 2-word sentences. Shows defiant behavior ('No!' phase).",
      safety: "Forward-facing car seat after age 2 (if they meet height/weight requirements). Supervise near water. Teach pedestrian safety."
    };
  } else if (ageInMonths < 60) {
    // 3-4 years
    return {
      sleep: "Preschoolers need 10-13 hours per 24 hours. Many still nap, though some drop naps by age 4.",
      feeding: "3 meals plus 1-2 snacks. Involve them in meal prep. Limit juice and sugary drinks. Encourage trying new foods.",
      development: "Pedals tricycle, hops, draws circles. Speaks in sentences, plays make-believe, can follow 2-3 step instructions.",
      safety: "Forward-facing car seat with harness. Teach about stranger danger. Supervise outdoor play. Helmet for bikes/scooters."
    };
  } else if (ageInMonths < 84) {
    // 5-6 years
    return {
      sleep: "School-age children need 9-12 hours per night. Establish consistent bedtime routine. Most no longer nap.",
      feeding: "3 balanced meals plus snacks. Encourage water over juice. Teach about healthy food choices. Family meals are beneficial.",
      development: "Counts, writes letters, ties shoes. More independent. Enjoys playing with friends. Understands rules of games.",
      safety: "Booster seat until lap belt fits properly (usually age 8-12). Teach bike safety and traffic rules. Supervise swimming."
    };
  } else if (ageInMonths < 144) {
    // 7-11 years
    return {
      sleep: "School-age children need 9-12 hours per night. Screen time before bed can interfere with sleep quality.",
      feeding: "3 balanced meals. Teach portion control and nutrition. Involve in meal planning. Encourage physical activity.",
      development: "Developing independence, complex thinking. Peer relationships become important. May show mood swings.",
      safety: "Booster seat until seat belt fits properly. Teach internet safety. Supervise outdoor activities. Sports safety gear."
    };
  } else {
    // 12+ years
    return {
      sleep: "Teens need 8-10 hours per night. Many don't get enough due to school/activities. Limit screens before bed.",
      feeding: "Balanced meals with adequate calories for growth. May eat frequently. Teach healthy eating and cooking skills.",
      development: "Puberty changes, seeking independence, complex emotions. Peer pressure. Abstract thinking develops.",
      safety: "Teach safe driving when age-appropriate. Discuss substance abuse, consent, and mental health. Internet safety."
    };
  }
}

export function calculateAgeInMonths(birthdate: string | null): number {
  if (!birthdate) return 0;

  const birth = new Date(birthdate);
  const now = new Date();

  const yearsDiff = now.getFullYear() - birth.getFullYear();
  const monthsDiff = now.getMonth() - birth.getMonth();

  return yearsDiff * 12 + monthsDiff;
}

export function getFieldGuideline(field: string, ageInMonths: number): string | null {
  const guidelines = getAgeGuidelines(ageInMonths);

  // Map field names to guideline categories
  const fieldMap: Record<string, keyof AgeGuidelines> = {
    'wake_time': 'sleep',
    'naps': 'sleep',
    'bedtime': 'sleep',
    'bedtime_routine': 'sleep',
    'screen_time': 'development',
    'meals': 'feeding',
    'allergies': 'safety',
    'medications': 'safety',
    'conditions': 'safety',
    'calming_tips': 'development',
    'dos': 'safety',
    'donts': 'safety',
    'warnings': 'safety',
  };

  const category = fieldMap[field];
  return category ? guidelines[category] : null;
}

// Parenting methodology tips that complement CDC guidelines
export function getParentingTips(field: string, parentingStyles?: string[]): string | null {
  const tips: Record<string, string> = {
    'wake_time': "Consistency is key. Same wake time every day helps regulate your child's internal clock. Gentle wake-up routines with natural light can make mornings easier.",
    'naps': "Watch for sleep cues (rubbing eyes, yawning). Overtired kids have harder time falling asleep. Dark room and white noise can help.",
    'bedtime': "Create a calming routine: bath, pajamas, books, cuddles. Screen-free hour before bed helps. Keep it consistent even on weekends.",
    'bedtime_routine': "The routine itself matters more than timing. Predictability helps kids feel secure. Let them choose one book or one song for control.",
    'meals': "Division of responsibility: Parents decide when, where, and what. Child decides whether and how much. No pressure to clean plate.",
    'screen_time': "Model healthy screen habits yourself. Make screen time a privilege, not a default. Co-view when possible and discuss content.",
    'calming_tips': "Validate feelings first ('I see you're upset'). Then offer tools (deep breaths, counting, hug). Stay calm yourself - kids mirror us.",
    'allergies': "Teach your child to recognize their symptoms. Practice how to ask for help. Never minimize their concerns about feeling 'different.'",
    'dos': "Focus on what they CAN do, not just limits. Give choices within boundaries ('Do you want to play inside or outside?').",
    'donts': "Explain the 'why' in simple terms. Keep rules consistent. Follow through every time - empty threats erode trust.",
    'warnings': "Name fears without judgment. 'You're scared of the dog. That's okay.' Build confidence gradually with small steps.",
  };

  // You can customize tips based on parenting styles if needed
  // For example: if Love & Logic, emphasize natural consequences
  // If Positive Discipline, emphasize connection before correction

  return tips[field] || null;
}
