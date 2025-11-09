// Parenting Styles Knowledge Base
// This file contains detailed information about each parenting approach
// to ensure consistent, accurate advice without relying on AI training data

export interface ParentingStyle {
  id: string;
  name: string;
  shortDescription: string;
  corePhilosophy: string;
  corePrinciples: string[];
  approachToDiscipline: string;
  approachToCommunication: string;
  keyPhrases: string[];
  recommendedAgeRange: string;
  whenToUse: string;
  keyBooks?: string[];
}

export const PARENTING_STYLES: Record<string, ParentingStyle> = {
  'taking-cara-babies': {
    id: 'taking-cara-babies',
    name: 'Taking Cara Babies',
    shortDescription: 'Evidence-based infant sleep coaching focused on gentle methods',
    corePhilosophy: 'Babies can learn to sleep well with the right approach. Sleep training doesn\'t mean leaving babies to cry alone—it means teaching them the skill of independent sleep through age-appropriate, responsive methods.',
    corePrinciples: [
      'Sleep is a skill that can be taught',
      'Newborns need different approaches than older babies',
      'Create optimal sleep environments (dark, cool, white noise)',
      'Watch wake windows—don\'t let baby get overtired',
      'Use the 5 S\'s for newborns (Swaddle, Side, Shush, Swing, Suck)',
      'Flexible routines over rigid schedules',
      'Parents need sleep too—it\'s not selfish',
    ],
    approachToDiscipline: 'Not applicable for infants. Focus is on teaching sleep skills, not discipline.',
    approachToCommunication: 'Respond to cries while teaching self-soothing. Use "Check and Console" method—brief, reassuring check-ins without picking up (for older babies).',
    keyPhrases: [
      'Wake windows',
      'Sleep environment',
      'SITBACK method (wait before intervening)',
      'Bedtime routine',
      'Drowsy but awake',
    ],
    recommendedAgeRange: 'Newborn to 24 months (primary focus: 0-12 months)',
    whenToUse: 'Sleep challenges, establishing healthy sleep habits, night wakings, nap transitions',
    keyBooks: ['Taking Cara Babies courses and guides'],
  },

  'love-and-logic': {
    id: 'love-and-logic',
    name: 'Love and Logic',
    shortDescription: 'Discipline through choices and natural consequences',
    corePhilosophy: 'Children learn best through making choices and experiencing natural consequences, delivered with empathy. The goal is to raise responsible, thinking children who make good decisions.',
    corePrinciples: [
      'Give children age-appropriate choices',
      'Allow natural consequences to teach',
      'Use empathy before consequences',
      'Focus on what YOU will do, not what the child must do',
      'Delay consequences when you\'re angry—think first',
      'Model self-care and boundaries',
      'Build thinking skills through questions, not lectures',
    ],
    approachToDiscipline: 'Enforceable statements + empathy + consequences. Example: "I\'ll be happy to discuss this when your voice is as calm as mine" or "Feel free to join us when you\'re ready to be respectful."',
    approachToCommunication: 'Ask questions to promote thinking: "What do you think will happen if...?" Use empathy first: "Oh man, that\'s so sad..." before implementing consequences. Avoid lectures.',
    keyPhrases: [
      'Would you rather... or...?',
      'Feel free to... when...',
      'I\'ll be happy to... when...',
      'What do you think caused that to happen?',
      'How sad...',
      'What ideas do you have for solving this?',
    ],
    recommendedAgeRange: '2+ years (toddlers through teens)',
    whenToUse: 'Power struggles, building decision-making skills, teaching responsibility, defiance',
    keyBooks: ['Parenting with Love and Logic', 'Love and Logic Magic for Early Childhood'],
  },

  'positive-discipline': {
    id: 'positive-discipline',
    name: 'Positive Discipline / Positive Parenting Solutions',
    shortDescription: 'Adlerian approach emphasizing encouragement, routines, and connection',
    corePhilosophy: 'Misbehavior is a child\'s way of communicating unmet needs or seeking belonging. Discipline should teach life skills, not punish. Children do better when they feel better.',
    corePrinciples: [
      'Kind AND firm at the same time',
      'Focus on solutions, not punishment',
      'Understand the belief behind the behavior',
      'Use natural and logical consequences',
      'Encourage rather than praise',
      'Create routines and involve children in solutions',
      'Connection before correction',
    ],
    approachToDiscipline: 'Use family meetings, problem-solving, and logical consequences. Time-out becomes "time-in" for calming down together. Focus on repairing mistakes, not blame.',
    approachToCommunication: 'Validate feelings first, then problem-solve together. Use "I notice..." statements. Ask curious questions: "What happened? How did you feel? What did you learn?"',
    keyPhrases: [
      'What happened?',
      'How did that make you feel?',
      'What ideas do you have to solve this?',
      'Let\'s work on a solution together',
      'I notice... (observation without judgment)',
      'How can we make this right?',
    ],
    recommendedAgeRange: '18 months through teens',
    whenToUse: 'Building cooperation, establishing routines, sibling conflicts, building self-esteem',
    keyBooks: ['Positive Discipline series by Jane Nelsen', 'Positive Parenting Solutions by Amy McCready'],
  },

  'gentle-respectful': {
    id: 'gentle-respectful',
    name: 'Gentle/Respectful Parenting (RIE)',
    shortDescription: 'Connection-first, co-regulation, treating children as whole people',
    corePhilosophy: 'Children are competent, capable beings deserving of respect. Trust the child, observe before intervening, and prioritize connection. Emotions are valid; behaviors may need limits.',
    corePrinciples: [
      'See the child as a whole person, not a problem to fix',
      'Observe more, intervene less (allow struggle)',
      'Sportscasting instead of praising or directing',
      'Slow down—children need time to process',
      'Set limits with respect and empathy',
      'Co-regulate rather than punish',
      'Respect the child\'s bodily autonomy',
    ],
    approachToDiscipline: 'Hold boundaries calmly and empathetically. Acknowledge feelings while maintaining limits: "I hear you\'re upset. I won\'t let you hit." Co-regulate during meltdowns.',
    approachToCommunication: 'Sportscasting: "You\'re stacking those blocks very carefully." Validate emotions: "It\'s hard when your friend takes your toy." Use "I" statements. Narrate rather than direct.',
    keyPhrases: [
      'I see you\'re... (observation)',
      'That\'s hard/frustrating/sad',
      'I won\'t let you... (boundary)',
      'You really wanted...',
      'I\'m here with you',
      'You\'re safe',
    ],
    recommendedAgeRange: 'Birth through early childhood (core RIE: 0-3 years; principles extend)',
    whenToUse: 'Tantrums, big emotions, building trust and connection, respecting child\'s autonomy',
    keyBooks: ['No Bad Kids by Janet Lansbury', 'The RIE Manual by Magda Gerber', 'Elevating Child Care by Janet Lansbury'],
  },

  'montessori': {
    id: 'montessori',
    name: 'Montessori-Informed Parenting',
    shortDescription: 'Independence, prepared environment, following the child',
    corePhilosophy: 'Children have an innate desire to learn and be independent. Create an environment that supports their natural development and "follow the child." The adult\'s role is to observe and facilitate, not direct.',
    corePrinciples: [
      'Follow the child\'s interests and sensitive periods',
      'Prepare the environment for independence',
      'Freedom within limits',
      'Practical life skills are essential learning',
      'Allow concentration—don\'t interrupt',
      'Offer choices, not commands',
      'Model what you want to see',
    ],
    approachToDiscipline: 'Natural and logical consequences. Grace and courtesy lessons. Redirect to appropriate activities. Limits are few but firm. Focus on teaching, not punishing.',
    approachToCommunication: 'Speak respectfully, at eye level. Use real words, not baby talk. Give information: "The water is spilling" rather than "Be careful!" Invite participation: "Would you like to help?"',
    keyPhrases: [
      'Would you like to help?',
      'I\'m going to show you...',
      'You did it!',
      'Let me show you how to do that',
      'This is how we... (grace and courtesy)',
      'I trust you',
    ],
    recommendedAgeRange: 'Birth through elementary (strongest: 18 months - 6 years)',
    whenToUse: 'Building independence, practical life skills, concentration, creating peaceful home environments',
    keyBooks: ['The Montessori Toddler by Simone Davies', 'How to Raise an Amazing Child the Montessori Way by Tim Seldin'],
  },
};

// Helper to get style by ID
export function getParentingStyle(styleId: string): ParentingStyle | null {
  return PARENTING_STYLES[styleId] || null;
}

// Get all available styles
export function getAllParentingStyles(): ParentingStyle[] {
  return Object.values(PARENTING_STYLES);
}

// Build system prompt for AI based on selected style
export function buildStylePrompt(style: ParentingStyle | CustomParentingStyle): string {
  // Check if it's a custom style
  if ('isCustom' in style && style.isCustom) {
    const custom = style as CustomParentingStyle;
    return `
## Parenting Approach: ${custom.name}

${custom.description}

**Core Principles:**
${custom.core_principles.map((p: string) => `- ${p}`).join('\n')}

${custom.approach_to_discipline ? `**Approach to Discipline:**
${custom.approach_to_discipline}` : ''}

${custom.approach_to_communication ? `**Approach to Communication:**
${custom.approach_to_communication}` : ''}

${custom.key_phrases && custom.key_phrases.length > 0 ? `**Key Phrases:**
${custom.key_phrases.map((p: string) => `- "${p}"`).join('\n')}` : ''}

${custom.recommended_age_range ? `**Recommended Age Range:** ${custom.recommended_age_range}` : ''}
`;
  }

  // Standard style - TypeScript now knows it's ParentingStyle
  const standardStyle = style as ParentingStyle;
  return `
## Parenting Approach: ${standardStyle.name}

**Core Philosophy:**
${standardStyle.corePhilosophy}

**Core Principles:**
${standardStyle.corePrinciples.map((p: string) => `- ${p}`).join('\n')}

**Approach to Discipline:**
${standardStyle.approachToDiscipline}

**Approach to Communication:**
${standardStyle.approachToCommunication}

**Key Phrases to Use:**
${standardStyle.keyPhrases.map((p: string) => `- "${p}"`).join('\n')}

**When to Use This Approach:**
${standardStyle.whenToUse}
`;
}

// Custom style interface
export interface CustomParentingStyle {
  id: string;
  name: string;
  description: string;
  core_principles: string[];
  approach_to_discipline?: string;
  approach_to_communication?: string;
  key_phrases?: string[];
  recommended_age_range?: string;
  isCustom: true;
}
