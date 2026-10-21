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
    { id: 'office-docs', name: 'Word & Office Documents' },
    { id: 'spreadsheets', name: 'Spreadsheets & Data Tables' },
    { id: 'ebooks', name: 'eBooks & Digital Readers' },
    { id: 'email-web', name: 'Email, HTML & Web Data' },
    { id: 'archive-extract', name: 'Archive Converters & Extractors' },
    { id: 'conversions-units', name: 'Universal Unit Conversions' },
    { id: 'solutions', name: 'Solutions & Concentrations' },
    { id: 'qc-statistics', name: 'QC Testing & Statistics' },
    { id: 'chromatography', name: 'HPLC & Chromatography' },
    { id: 'percentages-pricing', name: 'Percentages & Pricing' },
    { id: 'time-dates', name: 'Timers, Dates & Age' },
    { id: 'text-writing', name: 'Writing & Text Formats' },
    { id: 'media-images', name: 'Image & Media Processing' },
    { id: 'security-data', name: 'Security, Code & JSON' }
  ],
  documents: [
    { id: 'all', name: 'All Document Tools' },
    { id: 'office-docs', name: 'Word & Office (DOCX, DOC, DOCM, DOT, ODT, RTF)' },
    { id: 'spreadsheets', name: 'Spreadsheets & Data (XLSX, XLS, XLSB, ODS, CSV)' },
    { id: 'ebooks', name: 'eBooks (EPUB, MOBI, FB2, LIT, PDB)' },
    { id: 'email-web', name: 'Email & Web (EML, MSG, HTML, MHTML, XML, MD)' },
    { id: 'fixed-media', name: 'Fixed Layout & Graphics (XPS, OXPS, PRN, GIF, SWF)' }
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
    { id: 'length', name: 'Length & Distance (m, ft, km, mi, in)' },
    { id: 'weight', name: 'Weight & Mass (kg, lb, g, oz, t)' },
    { id: 'volume', name: 'Volume & Capacity (L, gal, mL, fl oz)' },
    { id: 'temperature', name: 'Temperature (°C, °F, K, °R)' },
    { id: 'area', name: 'Area & Land (m², ft², ac, ha)' },
    { id: 'speed', name: 'Speed & Velocity (km/h, mph, m/s, knots)' },
    { id: 'pressure', name: 'Pressure (bar, psi, kPa, atm, mmHg)' },
    { id: 'digital', name: 'Digital Storage (MB, GB, TB, Bytes)' }
  ],
  chemistry: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'conversions-units', name: 'Metric & Volume Conversions' },
    { id: 'solutions', name: 'Solutions Preparation' },
    { id: 'stoichiometry', name: 'Stoichiometry & Dilutions' },
    { id: 'equilibrium', name: 'Acid-Base & pH Equilibrium' }
  ],
  laboratory: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'qc-statistics', name: 'Analytical QC & %RSD Statistics' },
    { id: 'chromatography', name: 'HPLC & Chromatography' },
    { id: 'dissolution', name: 'Dissolution & Assays' }
  ],
  math: [
    { id: 'all', name: 'All Subcategories' },
    { id: 'conversions-units', name: 'Unit Conversions & Measurement' },
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
    { id: 'pdf-converters', name: 'PDF Converters (To & From PDF)' },
    { id: 'pdf-editors', name: 'PDF Editors (Rotate, Watermark, Numbers, Crop)' },
    { id: 'pdf-security', name: 'PDF Security (Protect, Unlock, Redact, Compare)' },
    { id: 'pdf-tools', name: 'PDF Document Tools (Merge/Split)' },
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
    { id: 'conversions-units', name: 'Universal Unit Conversions' },
    { id: 'dining-bills', name: 'Dining, Tips & Split Bills' },
    { id: 'health-lifestyle', name: 'Health & Lifestyle (BMI)' }
  ]
};
