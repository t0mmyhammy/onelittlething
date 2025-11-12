interface ChildCareInfo {
  id: string;
  child_id: string;
  routines: any;
  routines_notes: string | null;
  routines_redacted_fields: string[];
  health: any;
  health_notes: string | null;
  health_redacted_fields: string[];
  comfort: any;
  comfort_notes: string | null;
  comfort_redacted_fields: string[];
  safety: any;
  safety_notes: string | null;
  safety_redacted_fields: string[];
  contacts: any;
  contacts_notes: string | null;
  contacts_redacted_fields: string[];
}

interface FamilyCareInfo {
  id: string;
  family_id: string;
  home_base: any;
  home_base_notes: string | null;
  home_base_redacted_fields: string[];
  house_rules: any;
  house_rules_notes: string | null;
  house_rules_redacted_fields: string[];
  schedule: any;
  schedule_notes: string | null;
  schedule_redacted_fields: string[];
  emergency: any;
  emergency_notes: string | null;
  emergency_redacted_fields: string[];
}

interface Child {
  id: string;
  name: string;
  birthdate: string | null;
  gender: string | null;
}

type GuideType = 'child' | 'family' | 'babysitter' | 'school' | 'grandparent';

// Helper to check if a field is redacted
function isRedacted(field: string, redactedFields: string[]): boolean {
  return redactedFields?.includes(field) || false;
}

// Helper to format a section with field checking
function formatField(label: string, value: any, field: string, redactedFields: string[]): string {
  if (!value || isRedacted(field, redactedFields)) return '';
  return `**${label}:** ${value}\n`;
}

// Generate Child Guide (full child info)
export function generateChildGuide(child: Child, careInfo: ChildCareInfo): string {
  let guide = `# Care Guide for ${child.name}\n\n`;

  if (child.birthdate) {
    const age = calculateAge(child.birthdate);
    guide += `**Age:** ${age}\n\n`;
  }

  // Routines Section
  const routinesData = careInfo.routines || {};
  const routinesFields = careInfo.routines_redacted_fields || [];

  if (Object.keys(routinesData).length > 0) {
    guide += `## Daily Routines\n\n`;
    guide += formatField('Wake Time', routinesData.wake_time, 'wake_time', routinesFields);
    guide += formatField('Nap Schedule', routinesData.naps, 'naps', routinesFields);
    guide += formatField('Meal Times', routinesData.meals, 'meals', routinesFields);
    guide += formatField('Bedtime', routinesData.bedtime, 'bedtime', routinesFields);
    guide += formatField('Bedtime Routine', routinesData.bedtime_routine, 'bedtime_routine', routinesFields);
    guide += formatField('Screen Time Rules', routinesData.screen_time, 'screen_time', routinesFields);
    guide += formatField('Potty/Diaper', routinesData.potty, 'potty', routinesFields);
    if (careInfo.routines_notes) guide += `\n*Notes:* ${careInfo.routines_notes}\n`;
    guide += '\n';
  }

  // Health Section
  const healthData = careInfo.health || {};
  const healthFields = careInfo.health_redacted_fields || [];

  if (Object.keys(healthData).length > 0) {
    guide += `## Health Information\n\n`;

    if (healthData.allergies && !isRedacted('allergies', healthFields)) {
      const allergies = Array.isArray(healthData.allergies) ? healthData.allergies : [];
      if (allergies.length > 0) {
        guide += `**⚠️ ALLERGIES:** ${allergies.join(', ')}\n`;
        guide += formatField('If Exposed', healthData.allergy_reaction, 'allergy_reaction', healthFields);
      }
    }

    guide += formatField('Daily Medications', healthData.medications, 'medications', healthFields);
    guide += formatField('As-Needed Medications', healthData.as_needed_meds, 'as_needed_meds', healthFields);
    guide += formatField('Medical Conditions', healthData.conditions, 'conditions', healthFields);
    if (careInfo.health_notes) guide += `\n*Notes:* ${careInfo.health_notes}\n`;
    guide += '\n';
  }

  // Comfort Section
  const comfortData = careInfo.comfort || {};
  const comfortFields = careInfo.comfort_redacted_fields || [];

  if (Object.keys(comfortData).length > 0) {
    guide += `## Comfort & Behavior\n\n`;
    guide += formatField('How to Calm Them', comfortData.calming_tips, 'calming_tips', comfortFields);
    guide += formatField('Comfort Items', comfortData.comfort_items, 'comfort_items', comfortFields);
    guide += formatField('Favorites', comfortData.favorites, 'favorites', comfortFields);
    guide += formatField('Dislikes/Triggers', comfortData.dislikes, 'dislikes', comfortFields);
    guide += formatField('Behavioral Notes', comfortData.behavior, 'behavior', comfortFields);
    if (careInfo.comfort_notes) guide += `\n*Notes:* ${careInfo.comfort_notes}\n`;
    guide += '\n';
  }

  // Safety Section
  const safetyData = careInfo.safety || {};
  const safetyFields = careInfo.safety_redacted_fields || [];

  if (Object.keys(safetyData).length > 0) {
    guide += `## Safety Rules\n\n`;
    guide += formatField('✅ Things They CAN Do', safetyData.dos, 'dos', safetyFields);
    guide += formatField('❌ Things They CANNOT Do', safetyData.donts, 'donts', safetyFields);
    guide += formatField('⚠️ Safety Warnings', safetyData.warnings, 'warnings', safetyFields);
    guide += formatField('Car Seat Info', safetyData.car_seat, 'car_seat', safetyFields);
    if (careInfo.safety_notes) guide += `\n*Notes:* ${careInfo.safety_notes}\n`;
    guide += '\n';
  }

  // Contacts Section
  const contactsData = careInfo.contacts || {};
  const contactsFields = careInfo.contacts_redacted_fields || [];

  if (Object.keys(contactsData).length > 0) {
    guide += `## Emergency Contacts\n\n`;

    if (contactsData.parent1_name && !isRedacted('parent1_name', contactsFields)) {
      guide += `**Parent 1:** ${contactsData.parent1_name}\n`;
      if (contactsData.parent1_phone) guide += `- Phone: ${contactsData.parent1_phone}\n`;
      if (contactsData.parent1_email) guide += `- Email: ${contactsData.parent1_email}\n`;
      guide += '\n';
    }

    if (contactsData.parent2_name && !isRedacted('parent2_name', contactsFields)) {
      guide += `**Parent 2:** ${contactsData.parent2_name}\n`;
      if (contactsData.parent2_phone) guide += `- Phone: ${contactsData.parent2_phone}\n`;
      if (contactsData.parent2_email) guide += `- Email: ${contactsData.parent2_email}\n`;
      guide += '\n';
    }

    if (contactsData.doctor_name && !isRedacted('doctor_name', contactsFields)) {
      guide += `**Pediatrician:** ${contactsData.doctor_name}\n`;
      if (contactsData.doctor_phone) guide += `- Phone: ${contactsData.doctor_phone}\n`;
      if (contactsData.doctor_clinic) guide += `- Clinic: ${contactsData.doctor_clinic}\n`;
      guide += '\n';
    }

    guide += formatField('Other Emergency Contacts', contactsData.emergency_contacts, 'emergency_contacts', contactsFields);
    guide += formatField('Authorized Pickup', contactsData.authorized_pickup, 'authorized_pickup', contactsFields);
    if (careInfo.contacts_notes) guide += `\n*Notes:* ${careInfo.contacts_notes}\n`;
    guide += '\n';
  }

  guide += `---\n\n*Generated from OneLittleThing on ${new Date().toLocaleDateString()}*\n`;

  return guide;
}

// Generate Family Guide (family info only)
export function generateFamilyGuide(familyInfo: FamilyCareInfo): string {
  let guide = `# Family Care Guide\n\n`;

  // Home Base Section
  const homeData = familyInfo.home_base || {};
  const homeFields = familyInfo.home_base_redacted_fields || [];

  if (Object.keys(homeData).length > 0) {
    guide += `## Home Information\n\n`;

    if (homeData.street_address && !isRedacted('street_address', homeFields)) {
      guide += `**Address:**\n${homeData.street_address}\n`;
      if (homeData.city) guide += `${homeData.city}, ${homeData.state || ''} ${homeData.zip_code || ''}\n`;
      guide += '\n';
    }

    guide += formatField('Wi-Fi Network', homeData.wifi_network, 'wifi', homeFields);
    if (homeData.wifi_password && !isRedacted('wifi', homeFields)) {
      guide += `**Wi-Fi Password:** ${homeData.wifi_password}\n`;
    }
    guide += formatField('Door Codes & Keys', homeData.access, 'access', homeFields);
    guide += formatField('Parking', homeData.parking, 'parking', homeFields);
    if (familyInfo.home_base_notes) guide += `\n*Notes:* ${familyInfo.home_base_notes}\n`;
    guide += '\n';
  }

  // House Rules Section
  const rulesData = familyInfo.house_rules || {};
  const rulesFields = familyInfo.house_rules_redacted_fields || [];

  if (Object.keys(rulesData).length > 0) {
    guide += `## House Rules\n\n`;
    guide += formatField('Screen Time', rulesData.screen_rules, 'screen_rules', rulesFields);
    guide += formatField('Food & Snacks', rulesData.food_rules, 'food_rules', rulesFields);
    guide += formatField('Pets', rulesData.pet_rules, 'pet_rules', rulesFields);
    guide += formatField('Visitors', rulesData.visitor_rules, 'visitor_rules', rulesFields);
    guide += formatField('Off-Limits Areas', rulesData.off_limits, 'off_limits', rulesFields);
    if (familyInfo.house_rules_notes) guide += `\n*Notes:* ${familyInfo.house_rules_notes}\n`;
    guide += '\n';
  }

  // Schedule Section
  const scheduleData = familyInfo.schedule || {};
  const scheduleFields = familyInfo.schedule_redacted_fields || [];

  if (Object.keys(scheduleData).length > 0) {
    guide += `## Schedule\n\n`;

    if (scheduleData.school_name && !isRedacted('school_name', scheduleFields)) {
      guide += `**School/Daycare:** ${scheduleData.school_name}\n`;
      if (scheduleData.school_address) guide += `Address: ${scheduleData.school_address}\n`;
      if (scheduleData.school_dropoff) guide += `Drop-off: ${scheduleData.school_dropoff}\n`;
      if (scheduleData.school_pickup) guide += `Pickup: ${scheduleData.school_pickup}\n`;
      guide += '\n';
    }

    guide += formatField('Weekly Activities', scheduleData.activities, 'activities', scheduleFields);
    guide += formatField('Transportation', scheduleData.transportation, 'transportation', scheduleFields);
    guide += formatField('Homework Rules', scheduleData.homework, 'homework', scheduleFields);
    if (familyInfo.schedule_notes) guide += `\n*Notes:* ${familyInfo.schedule_notes}\n`;
    guide += '\n';
  }

  // Emergency Section
  const emergencyData = familyInfo.emergency || {};
  const emergencyFields = familyInfo.emergency_redacted_fields || [];

  if (Object.keys(emergencyData).length > 0) {
    guide += `## Emergency Information\n\n`;
    guide += formatField('Emergency Plan', emergencyData.emergency_plan, 'emergency_plan', emergencyFields);

    if (emergencyData.hospital_name && !isRedacted('hospital_name', emergencyFields)) {
      guide += `**Nearest Hospital:** ${emergencyData.hospital_name}\n`;
      if (emergencyData.hospital_address) guide += `Address: ${emergencyData.hospital_address}\n`;
      if (emergencyData.hospital_distance) guide += `Distance: ${emergencyData.hospital_distance}\n`;
      guide += '\n';
    }

    guide += formatField('Urgent Care', emergencyData.urgent_care, 'urgent_care', emergencyFields);

    if (emergencyData.insurance_provider && !isRedacted('insurance', emergencyFields)) {
      guide += `**Insurance:** ${emergencyData.insurance_provider}\n`;
      if (emergencyData.insurance_policy) guide += `Policy #: ${emergencyData.insurance_policy}\n`;
      if (emergencyData.insurance_group) guide += `Group #: ${emergencyData.insurance_group}\n`;
      guide += '\n';
    }

    guide += `**Poison Control:** 1-800-222-1222 (24/7)\n\n`;

    if (familyInfo.emergency_notes) guide += `*Notes:* ${familyInfo.emergency_notes}\n`;
    guide += '\n';
  }

  guide += `---\n\n*Generated from OneLittleThing on ${new Date().toLocaleDateString()}*\n`;

  return guide;
}

// Generate Babysitter Pack (essential child + family info)
export function generateBabysitterPack(
  children: Child[],
  childCareInfos: ChildCareInfo[],
  familyInfo: FamilyCareInfo
): string {
  let guide = `# Babysitter Guide\n\n`;

  // Add each child's essential info
  children.forEach(child => {
    const careInfo = childCareInfos.find(info => info.child_id === child.id);
    if (!careInfo) return;

    guide += `## ${child.name}\n\n`;

    // Only include essential sections: routines, health, comfort, safety
    const routinesData = careInfo.routines || {};
    const routinesFields = careInfo.routines_redacted_fields || [];

    if (Object.keys(routinesData).length > 0) {
      guide += formatField('Bedtime', routinesData.bedtime, 'bedtime', routinesFields);
      guide += formatField('Meals', routinesData.meals, 'meals', routinesFields);
    }

    const healthData = careInfo.health || {};
    const healthFields = careInfo.health_redacted_fields || [];

    if (healthData.allergies && !isRedacted('allergies', healthFields)) {
      const allergies = Array.isArray(healthData.allergies) ? healthData.allergies : [];
      if (allergies.length > 0) {
        guide += `**⚠️ ALLERGIES:** ${allergies.join(', ')}\n`;
      }
    }

    const comfortData = careInfo.comfort || {};
    const comfortFields = careInfo.comfort_redacted_fields || [];
    guide += formatField('How to Calm', comfortData.calming_tips, 'calming_tips', comfortFields);

    const safetyData = careInfo.safety || {};
    const safetyFields = careInfo.safety_redacted_fields || [];
    guide += formatField('Safety Rules', safetyData.donts, 'donts', safetyFields);

    guide += '\n';
  });

  // Add essential family info
  guide += `## Home & Emergency Info\n\n`;

  const homeData = familyInfo.home_base || {};
  const homeFields = familyInfo.home_base_redacted_fields || [];
  guide += formatField('Wi-Fi', `${homeData.wifi_network} / ${homeData.wifi_password}`, 'wifi', homeFields);

  const emergencyData = familyInfo.emergency || {};
  const emergencyFields = familyInfo.emergency_redacted_fields || [];
  guide += formatField('Emergency Plan', emergencyData.emergency_plan, 'emergency_plan', emergencyFields);

  guide += `**Poison Control:** 1-800-222-1222\n\n`;

  guide += `---\n\n*Generated from OneLittleThing on ${new Date().toLocaleDateString()}*\n`;

  return guide;
}

// Main generator function
export function generateGuide(
  type: GuideType,
  options: {
    child?: Child;
    children?: Child[];
    childCareInfo?: ChildCareInfo;
    childCareInfos?: ChildCareInfo[];
    familyInfo?: FamilyCareInfo;
  }
): string {
  switch (type) {
    case 'child':
      if (!options.child || !options.childCareInfo) {
        throw new Error('Child and childCareInfo required for child guide');
      }
      return generateChildGuide(options.child, options.childCareInfo);

    case 'family':
      if (!options.familyInfo) {
        throw new Error('FamilyInfo required for family guide');
      }
      return generateFamilyGuide(options.familyInfo);

    case 'babysitter':
      if (!options.children || !options.childCareInfos || !options.familyInfo) {
        throw new Error('Children, childCareInfos, and familyInfo required for babysitter pack');
      }
      return generateBabysitterPack(options.children, options.childCareInfos, options.familyInfo);

    case 'school':
    case 'grandparent':
      // These can be similar to babysitter but with different fields emphasized
      if (!options.children || !options.childCareInfos || !options.familyInfo) {
        throw new Error('Children, childCareInfos, and familyInfo required');
      }
      return generateBabysitterPack(options.children, options.childCareInfos, options.familyInfo);

    default:
      throw new Error(`Unknown guide type: ${type}`);
  }
}

// Helper to calculate age from birthdate
function calculateAge(birthdate: string): string {
  const birth = new Date(birthdate);
  const now = new Date();

  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();

  if (years === 0) {
    return `${months} months`;
  } else if (months < 0) {
    return `${years - 1} years, ${12 + months} months`;
  } else {
    return `${years} years, ${months} months`;
  }
}
