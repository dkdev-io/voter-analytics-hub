
export interface QueryParams {
  tactic?: string;
  resultType?: string;
  person?: string;
  date?: string;
  endDate?: string;
  team?: string;
  searchQuery?: string;
}

export const RESULT_TYPES = [
  "Attempts",
  "Contacts",
  "Supporters",
  "Not Home",
  "Refused",
  "Bad Data",
  "Undecided"
];

// Colors for the pie charts
export const CHART_COLORS = {
  // Tactic colors (greens)
  TACTIC: {
    SMS: '#8AE8A4',     // Light green
    PHONE: '#38D167',   // Medium green
    CANVAS: '#0D7335',  // Dark green
  },
  // Contact types colors
  CONTACT: {
    SUPPORT: '#3B82F6',   // Blue
    OPPOSE: '#EF4444',    // Red
    UNDECIDED: '#A855F7', // Purple
  },
  // Not reached colors (oranges)
  NOT_REACHED: {
    NOT_HOME: '#FFA94D',   // Light orange
    REFUSAL: '#F97316',    // Medium orange
    BAD_DATA: '#C2410C',   // Dark orange
  },
  // Line chart colors
  LINE: {
    ATTEMPTS: '#38D167',   // Green
    CONTACTS: '#3B82F6',   // Blue
    ISSUES: '#F97316',     // Orange
  },
  // Team colors (greens)
  TEAM: {
    TEAM_1: '#8AE8A4', // Light green
    TEAM_2: '#38D167', // Medium green
    TEAM_3: '#0D7335', // Dark green
    TEAM_4: '#B6F2C7', // Lighter green
    TEAM_5: '#65E88F', // Light medium green
    DEFAULT: '#4ADA75', // Default green
  }
};

// Interface for metric data
export interface VoterMetrics {
  tactics: {
    sms: number;
    phone: number;
    canvas: number;
  };
  contacts: {
    support: number;
    oppose: number;
    undecided: number;
  };
  notReached: {
    notHome: number;
    refusal: number;
    badData: number;
  };
  teamAttempts?: {
    [key: string]: number;
  };
  byDate?: Array<{
    date: string;
    attempts: number;
    contacts: number;
    issues: number;
  }>;
}
