import { Category, CategoryId, SubCategoryOption } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'chemistry',
    name: 'Chemistry & Science',
    description: 'Molarity, dilutions, stoichiometry, and solution preparation tools',
    icon: 'FlaskConical'
  },
  {
    id: 'laboratory',
    name: 'Laboratory & QC',
    description: 'Analytical quality control, %RSD, assays, and ppm/ppb converters',
    icon: 'Microscope'
  },
  {
    id: 'math',
    name: 'Math & Calculators',
    description: 'Percentages, discounts, ratios, interest, and everyday arithmetic',
    icon: 'Calculator'
  },
  {
    id: 'image',
    name: 'Image & Media',
    description: 'In-browser compression, resizing, color tools, and conversions',
    icon: 'Image'
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    description: 'JSON formatting, Base64 encoding, security tokens, and utilities',
    icon: 'Code2'
  },
  {
    id: 'text',
    name: 'Text & Documents',
    description: 'Word counters, character statistics, case converters, and formatting',
    icon: 'FileText'
  },
  {
    id: 'education',
    name: 'Education & Time',
    description: 'Age calculations, date differences, stopwatch, and study timers',
    icon: 'GraduationCap'
  },
  {
    id: 'daily',
    name: 'Daily Life & Living',
    description: 'Unit conversions, tips, bill splitting, and lifestyle utilities',
    icon: 'Compass'
  }
];

export const SUBCATEGORIES: Record<CategoryId, SubCategoryOption[]> = {
  all: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'solutions', name: 'Solutions & Concentrations' },
    { id: 'qc-statistics', name: 'QC Testing & Statistics' },
    { id: 'percentages-pricing', name: 'Percentages & Pricing' },
    { id: 'conversions-units', name: 'Conversions & Units' },
    { id: 'time-dates', name: 'Timers, Dates & Age' },
    { id: 'text-writing', name: 'Writing & Text Formats' },
    { id: 'media-images', name: 'Image & Media Processing' },
    { id: 'security-data', name: 'Security, Code & JSON' }
  ],
  chemistry: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'solutions', name: 'Solutions Preparation' },
    { id: 'stoichiometry', name: 'Stoichiometry & Dilutions' },
    { id: 'equilibrium', name: 'Acid-Base & pH Equilibrium' }
  ],
  laboratory: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'qc-statistics', name: 'Analytical QC & %RSD Statistics' },
    { id: 'dissolution', name: 'Dissolution & Assays' }
  ],
  math: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'percentages-pricing', name: 'Percentages & Proportions' },
    { id: 'discounts-taxes', name: 'Discounts, Sales & Taxes' },
    { id: 'interest-finance', name: 'Interest & Finance' }
  ],
  image: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'compression', name: 'Compression & Optimization' },
    { id: 'resizing-formats', name: 'Resizing & Formats' }
  ],
  developer: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'json-data', name: 'JSON & Data Formats' },
    { id: 'encoding-crypto', name: 'Base64, UUID & Passwords' }
  ],
  text: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'text-analytics', name: 'Word Counts & Text Analytics' },
    { id: 'case-transform', name: 'Case Conversion & Formatting' },
    { id: 'pdf-tools', name: 'PDF Document Tools' }
  ],
  education: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'age-milestones', name: 'Age & Life Milestones' },
    { id: 'date-calculations', name: 'Calendar & Date Differences' },
    { id: 'stopwatch-timers', name: 'Stopwatches & Precision Timers' }
  ],
  daily: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'unit-conversions', name: 'Universal Unit Conversions' },
    { id: 'dining-bills', name: 'Dining, Tips & Split Bills' },
    { id: 'health-lifestyle', name: 'Health & Lifestyle (BMI)' }
  ]
};
