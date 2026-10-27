import { Category, CategoryId, SubCategoryOption } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'documents',
    name: 'Document Converters',
    description: 'Word, Excel, eBooks, Email, Web, and 40+ document and file conversion tools',
    icon: 'FileText'
  },
  {
    id: 'archive',
    name: 'Archive & Compression',
    description: 'ZIP, 7Z, RAR, TAR, GZ, ISO, DEB, RPM, and 25+ archive extraction & conversion tools',
    icon: 'FolderArchive'
  },
  {
    id: 'conversions',
    name: 'Unit Conversions',
    description: 'Length, weight, volume, temperature, area, speed, pressure, and digital data conversions',
    icon: 'ArrowRightLeft'
  },
  {
    id: 'chemistry',
    name: 'Chemistry & Science',
    description: 'Molarity, dilutions, stoichiometry, analytical QC, chromatography, and assays',
    icon: 'FlaskConical'
  },
  {
    id: 'math',
    name: 'Math & Calculators',
    description: 'Percentages, proportions, retail discounts, sales tax, and arithmetic calculations',
    icon: 'Calculator'
  },
  {
    id: 'finance',
    name: 'Finance & Business Calculators',
    description: 'Compound interest, loan calculations, investments, and financial growth schedules',
    icon: 'TrendingUp'
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
    { id: 'office-docs', name: 'Word & Office' },
    { id: 'spreadsheets', name: 'Spreadsheets & Data' },
    { id: 'ebooks', name: 'eBooks' },
    { id: 'email-files', name: 'Email Files' },
    { id: 'web-markup', name: 'Web & Markup' },
    { id: 'fixed-layout', name: 'Fixed-Layout Documents' },
    { id: 'pdf-organization', name: 'PDF Organization' },
    { id: 'pdf-optimization', name: 'PDF Optimization' },
    { id: 'pdf-conversion', name: 'PDF Conversion' },
    { id: 'pdf-editing', name: 'PDF Editing' },
    { id: 'pdf-security', name: 'PDF Security' },
    { id: 'pdf-intelligence', name: 'PDF Intelligence' },
    { id: 'pdf-tools', name: 'PDF Tools' },
    { id: 'archive-extract', name: 'Archive Converters & Extractors' },
    { id: 'length', name: 'Length & Distance' },
    { id: 'weight', name: 'Weight & Mass' },
    { id: 'volume', name: 'Volume & Capacity' },
    { id: 'temperature', name: 'Temperature' },
    { id: 'area', name: 'Area & Land' },
    { id: 'speed', name: 'Speed & Velocity' },
    { id: 'pressure', name: 'Pressure' },
    { id: 'digital', name: 'Digital Storage' },
    { id: 'solutions', name: 'Solution Preparation' },
    { id: 'stoichiometry', name: 'Stoichiometry & Dilutions' },
    { id: 'equilibrium', name: 'Acid-Base & pH Equilibrium' },
    { id: 'chemistry-conversions', name: 'Chemistry Unit Conversions' },
    { id: 'qc-statistics', name: 'Analytical QC & %RSD Statistics' },
    { id: 'chromatography', name: 'HPLC & Chromatography' },
    { id: 'dissolution', name: 'Dissolution & Assays' },
    { id: 'percentages-proportions', name: 'Percentages & Proportions' },
    { id: 'discounts-taxes', name: 'Discounts, Sales & Taxes' },
    { id: 'interest-loans', name: 'Interest & Loans' },
    { id: 'time-dates', name: 'Timers, Dates & Age' },
    { id: 'text-writing', name: 'Writing & Text Formats' },
    { id: 'media-images', name: 'Image & Media Processing' },
    { id: 'security-data', name: 'Security, Code & JSON' }
  ],
  documents: [
    { id: 'all', name: 'All Document Tools' },
    { id: 'office-docs', name: 'Word & Office' },
    { id: 'spreadsheets', name: 'Spreadsheets & Data' },
    { id: 'ebooks', name: 'eBooks' },
    { id: 'email-files', name: 'Email Files' },
    { id: 'web-markup', name: 'Web & Markup' },
    { id: 'fixed-layout', name: 'Fixed-Layout Documents' },
    { id: 'pdf-organization', name: 'PDF Organization' },
    { id: 'pdf-optimization', name: 'PDF Optimization' },
    { id: 'pdf-conversion', name: 'PDF Conversion' },
    { id: 'pdf-editing', name: 'PDF Editing' },
    { id: 'pdf-security', name: 'PDF Security' },
    { id: 'pdf-intelligence', name: 'PDF Intelligence' }
  ],
  archive: [
    { id: 'all', name: 'All Archive Tools' },
    { id: 'zip-popular', name: 'Standard Archives (ZIP, 7Z, RAR)' },
    { id: 'unix-tar', name: 'Tarballs & Linux (TAR, TAR.GZ, TAR.BZ2, TAR.XZ, TAR.ZST)' },
    { id: 'single-stream', name: 'Stream Compressors (GZIP, BZIP2, XZ, Zstandard, LZMA, Z)' },
    { id: 'installers-packages', name: 'Package & System Archives (DEB, RPM, AR, CAB, WIM, CPIO)' },
    { id: 'disk-images', name: 'Disk Images & macOS (ISO, DMG, XAR, LZH, ARJ)' }
  ],
  conversions: [
    { id: 'all', name: 'All Conversion Types' },
    { id: 'length', name: 'Length & Distance' },
    { id: 'weight', name: 'Weight & Mass' },
    { id: 'volume', name: 'Volume & Capacity' },
    { id: 'temperature', name: 'Temperature' },
    { id: 'area', name: 'Area & Land' },
    { id: 'speed', name: 'Speed & Velocity' },
    { id: 'pressure', name: 'Pressure' },
    { id: 'digital', name: 'Digital Storage' }
  ],
  chemistry: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'solutions', name: 'Solution Preparation' },
    { id: 'stoichiometry', name: 'Stoichiometry & Dilutions' },
    { id: 'equilibrium', name: 'Acid-Base & pH Equilibrium' },
    { id: 'chemistry-conversions', name: 'Chemistry Unit Conversions' },
    { id: 'qc-statistics', name: 'Analytical QC & %RSD Statistics' },
    { id: 'chromatography', name: 'HPLC & Chromatography' },
    { id: 'dissolution', name: 'Dissolution & Assays' }
  ],
  laboratory: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'qc-statistics', name: 'Analytical QC & %RSD Statistics' },
    { id: 'chromatography', name: 'HPLC & Chromatography' },
    { id: 'dissolution', name: 'Dissolution & Assays' }
  ],
  math: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'percentages-proportions', name: 'Percentages & Proportions' },
    { id: 'discounts-taxes', name: 'Discounts, Sales & Taxes' }
  ],
  finance: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'interest-loans', name: 'Interest & Loans' }
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
    { id: 'case-transform', name: 'Case Conversion & Formatting' }
  ],
  education: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'age-milestones', name: 'Age & Life Milestones' },
    { id: 'date-calculations', name: 'Calendar & Date Differences' },
    { id: 'stopwatch-timers', name: 'Stopwatches & Precision Timers' }
  ],
  daily: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'dining-bills', name: 'Dining, Tips & Split Bills' },
    { id: 'health-lifestyle', name: 'Health & Lifestyle (BMI)' }
  ]
};
