/**
 * Dynamic color generation utility for charts
 * Generates distinct colors for unlimited categories while maintaining consistency
 */

interface ColorTheme {
  light: string[];
  dark: string[];
}

// Base color palettes for different themes
const COLOR_PALETTES: {
  tactics: ColorTheme;
  contacts: ColorTheme;
  notReached: ColorTheme;
  teams: ColorTheme;
  general: ColorTheme;
} = {
  tactics: {
    light: [
      '#10B981', '#059669', '#047857', '#065F46', '#064E3B', // Greens
      '#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A', '#1D4D8B', // Blues
      '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#553C9A', // Purples
      '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F', // Ambers
    ],
    dark: [
      '#34D399', '#10B981', '#059669', '#047857', '#065F46', // Greens
      '#60A5FA', '#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A', // Blues
      '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', // Purples
      '#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E', // Ambers
    ]
  },
  contacts: {
    light: [
      '#3B82F6', '#1D4ED8', '#1E40AF', // Blues
      '#EF4444', '#DC2626', '#B91C1C', // Reds
      '#A855F7', '#9333EA', '#7C3AED', // Purples
      '#10B981', '#059669', '#047857', // Greens
      '#F59E0B', '#D97706', '#B45309', // Ambers
      '#EC4899', '#DB2777', '#BE185D', // Pinks
    ],
    dark: [
      '#60A5FA', '#3B82F6', '#2563EB', // Blues
      '#F87171', '#EF4444', '#DC2626', // Reds
      '#C084FC', '#A855F7', '#9333EA', // Purples
      '#34D399', '#10B981', '#059669', // Greens
      '#FBBF24', '#F59E0B', '#D97706', // Ambers
      '#F472B6', '#EC4899', '#DB2777', // Pinks
    ]
  },
  notReached: {
    light: [
      '#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12', // Oranges
      '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D', // Reds
      '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F', // Ambers
    ],
    dark: [
      '#FB923C', '#F97316', '#EA580C', '#C2410C', '#9A3412', // Oranges
      '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#991B1B', // Reds
      '#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E', // Ambers
    ]
  },
  teams: {
    light: [
      '#10B981', '#059669', '#047857', '#065F46', '#064E3B',
      '#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A', '#1D4D8B',
      '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#553C9A',
      '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F',
      '#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843',
    ],
    dark: [
      '#34D399', '#10B981', '#059669', '#047857', '#065F46',
      '#60A5FA', '#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A',
      '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6',
      '#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E',
      '#F472B6', '#EC4899', '#DB2777', '#BE185D', '#9D174D',
    ]
  },
  general: {
    light: [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
      '#14B8A6', '#F43F5E', '#8B5A2B', '#0EA5E9', '#A3A3A3',
      '#22C55E', '#D946EF', '#FF6B6B', '#4ECDC4', '#45B7D1',
    ],
    dark: [
      '#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA',
      '#F472B6', '#22D3EE', '#A3E635', '#FB923C', '#818CF8',
      '#2DD4BF', '#FB7185', '#D4A574', '#0EA5E9', '#D1D5DB',
      '#4ADE80', '#E879F9', '#FF8E8E', '#7EDDD6', '#65C3E8',
    ]
  }
};

// Hash function to generate consistent colors based on category name
function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Generate additional colors if needed using HSL color space
function generateAdditionalColors(count: number, theme: 'light' | 'dark' = 'light'): string[] {
  const colors: string[] = [];
  const saturation = theme === 'light' ? 70 : 80;
  const lightness = theme === 'light' ? 50 : 65;
  
  for (let i = 0; i < count; i++) {
    const hue = (i * 137.508) % 360; // Golden angle approximation for good distribution
    colors.push(`hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`);
  }
  
  return colors;
}

/**
 * Get a consistent color for a category name
 */
export function getCategoryColor(
  categoryName: string,
  categoryType: 'tactics' | 'contacts' | 'notReached' | 'teams' | 'general' = 'general',
  theme: 'light' | 'dark' = 'light'
): string {
  const palette = COLOR_PALETTES[categoryType][theme];
  const hash = hashStringToNumber(categoryName.toLowerCase().trim());
  const index = hash % palette.length;
  return palette[index];
}

/**
 * Generate a consistent color palette for a list of categories
 */
export function generateColorPalette(
  categories: string[],
  categoryType: 'tactics' | 'contacts' | 'notReached' | 'teams' | 'general' = 'general',
  theme: 'light' | 'dark' = 'light'
): Record<string, string> {
  const palette = COLOR_PALETTES[categoryType][theme];
  const colorMap: Record<string, string> = {};
  
  // First, try to use the predefined palette
  categories.forEach((category, index) => {
    if (index < palette.length) {
      colorMap[category] = palette[index];
    }
  });
  
  // If we need more colors, generate them
  const remainingCategories = categories.slice(palette.length);
  if (remainingCategories.length > 0) {
    const additionalColors = generateAdditionalColors(remainingCategories.length, theme);
    remainingCategories.forEach((category, index) => {
      colorMap[category] = additionalColors[index];
    });
  }
  
  return colorMap;
}

/**
 * Generate colors for chart data with fallback
 */
export function generateChartColors(
  data: Array<{ name: string; [key: string]: unknown }>,
  categoryType: 'tactics' | 'contacts' | 'notReached' | 'teams' | 'general' = 'general',
  theme: 'light' | 'dark' = 'light'
): Array<{ name: string; color: string; [key: string]: unknown }> {
  if (!data || data.length === 0) return [];
  
  const categories = data.map(item => item.name || 'Unknown');
  const colorMap = generateColorPalette(categories, categoryType, theme);
  
  return data.map(item => ({
    ...item,
    color: colorMap[item.name] || getCategoryColor(item.name || 'Unknown', categoryType, theme)
  }));
}

/**
 * Legacy compatibility - get colors for specific predefined categories
 */
export function getLegacyChartColors() {
  return {
    TACTIC: {
      SMS: getCategoryColor('SMS', 'tactics', 'light'),
      PHONE: getCategoryColor('Phone', 'tactics', 'light'),
      CANVAS: getCategoryColor('Canvas', 'tactics', 'light'),
    },
    CONTACT: {
      SUPPORT: getCategoryColor('Support', 'contacts', 'light'),
      OPPOSE: getCategoryColor('Oppose', 'contacts', 'light'),
      UNDECIDED: getCategoryColor('Undecided', 'contacts', 'light'),
    },
    NOT_REACHED: {
      NOT_HOME: getCategoryColor('Not Home', 'notReached', 'light'),
      REFUSAL: getCategoryColor('Refusal', 'notReached', 'light'),
      BAD_DATA: getCategoryColor('Bad Data', 'notReached', 'light'),
    },
    TEAM: {
      TEAM_1: getCategoryColor('Team 1', 'teams', 'light'),
      TEAM_2: getCategoryColor('Team 2', 'teams', 'light'),
      TEAM_3: getCategoryColor('Team 3', 'teams', 'light'),
      TEAM_4: getCategoryColor('Team 4', 'teams', 'light'),
      TEAM_5: getCategoryColor('Team 5', 'teams', 'light'),
      DEFAULT: getCategoryColor('Default', 'teams', 'light'),
    }
  };
}