import { DocumentToolConfig } from '../tools/documents/DocumentConverterTool';

export const DOCUMENT_TOOLS_CONFIG: Record<string, DocumentToolConfig> = {
  'abw-converter': {
    id: 'abw-converter',
    name: 'ABW Converter (AbiWord)',
    shortDescription: 'Convert AbiWord documents (.abw) to PDF, HTML, Markdown, or plain text.',
    primaryExtension: '.abw',
    supportedExtensions: ['.abw'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Print-ready PDF with preserved typography' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'Clean semantic HTML5 structure' },
      { id: 'md', name: 'Markdown', extension: 'md', mimeType: 'text/markdown', description: 'Clean Markdown with headings and lists' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Raw extracted text' }
    ],
    technicalDetails: {
      formatFamily: 'AbiWord XML Word Processor',
      mimeType: 'application/x-abiword',
      typicalUseCases: ['Open-source word processing', 'GNOME Office documents', 'Lightweight text editing'],
      specifications: 'XML-based document container storing styling, fonts, and paragraph properties in XML tree'
    }
  },

  'pages-converter': {
    id: 'pages-converter',
    name: 'Apple iWork Pages Converter',
    shortDescription: 'Convert Apple Pages documents (.pages) to PDF, HTML, or plain text on Windows & Android.',
    primaryExtension: '.pages',
    supportedExtensions: ['.pages'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Formatted PDF copy' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'Web readable HTML' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted text content' }
    ],
    technicalDetails: {
      formatFamily: 'Apple iWork Suite',
      mimeType: 'application/x-iwork-pages-sffpages',
      typicalUseCases: ['macOS & iPadOS word processing', 'Resume creation', 'School and office reports'],
      specifications: 'ZIP bundle containing Preview.pdf, index.xml, and media assets'
    }
  },

  'aw-converter': {
    id: 'aw-converter',
    name: 'AW Converter (Applix Words)',
    shortDescription: 'Extract and convert legacy Applix Words documents (.aw) to modern PDF, HTML, and text.',
    primaryExtension: '.aw',
    supportedExtensions: ['.aw'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Modern PDF document' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'HTML document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Plain text stream' }
    ],
    technicalDetails: {
      formatFamily: 'ApplixWare / Vistasource Office',
      mimeType: 'application/applixware',
      typicalUseCases: ['Historical Unix documentation', 'Legacy office software archival'],
      specifications: 'Proprietary binary/text compound stream with embedded formatting tags'
    }
  },

  'csv-converter': {
    id: 'csv-converter',
    name: 'CSV Converter (Comma-Separated)',
    shortDescription: 'Convert CSV data tables to Excel XLSX, JSON, HTML tables, TSV, or PDF tables.',
    primaryExtension: '.csv',
    supportedExtensions: ['.csv'],
    category: 'documents',
    defaultTarget: 'xlsx',
    availableTargets: [
      { id: 'xlsx', name: 'Excel Workbook', extension: 'xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'Modern Microsoft Excel workbook' },
      { id: 'pdf', name: 'PDF Table', extension: 'pdf', mimeType: 'application/pdf', description: 'Formatted landscape PDF table' },
      { id: 'json', name: 'JSON Array', extension: 'json', mimeType: 'application/json', description: 'Structured JSON objects for developers' },
      { id: 'html', name: 'HTML Table', extension: 'html', mimeType: 'text/html', description: 'Styled HTML data table' }
    ],
    technicalDetails: {
      formatFamily: 'RFC 4180 Delimited Text',
      mimeType: 'text/csv',
      typicalUseCases: ['Database exports', 'Financial spreadsheets', 'Machine learning datasets'],
      specifications: 'Comma-delimited records with optional double-quoted escape fields'
    }
  },

  'dbk-converter': {
    id: 'dbk-converter',
    name: 'DBK Converter (DocBook XML)',
    shortDescription: 'Convert DocBook XML books and articles (.dbk) to HTML, Markdown, PDF, or text.',
    primaryExtension: '.dbk',
    supportedExtensions: ['.dbk', '.xml'],
    category: 'documents',
    defaultTarget: 'html',
    availableTargets: [
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'HTML article format' },
      { id: 'md', name: 'Markdown', extension: 'md', mimeType: 'text/markdown', description: 'Clean Markdown' },
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Printable PDF document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Raw text' }
    ],
    technicalDetails: {
      formatFamily: 'OASIS DocBook Standard',
      mimeType: 'application/docbook+xml',
      typicalUseCases: ['Technical book authoring', 'Linux documentation project', 'Hardware manual publishing'],
      specifications: 'Semantic XML schema designed for structural technical books and papers'
    }
  },

  'docm-converter': {
    id: 'docm-converter',
    name: 'DOCM Converter (Word Macro-Enabled)',
    shortDescription: 'Safely convert Word Macro-Enabled documents (.docm) to PDF, DOCX, or text without executing macros.',
    primaryExtension: '.docm',
    supportedExtensions: ['.docm'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Macro-free secure PDF' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'Web HTML document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted plain text' }
    ],
    technicalDetails: {
      formatFamily: 'Microsoft Office Open XML (Macro-Enabled)',
      mimeType: 'application/vnd.ms-word.document.macroEnabled.12',
      typicalUseCases: ['Corporate automated forms', 'Financial templates', 'Secured document conversion'],
      specifications: 'OpenXML ZIP container containing word/document.xml and quarantined vbaProject.bin'
    }
  },

  'dot-converter': {
    id: 'dot-converter',
    name: 'DOT Converter (Word 97-2003 Template)',
    shortDescription: 'Convert legacy Word template files (.dot) to modern PDF, HTML, or plain text.',
    primaryExtension: '.dot',
    supportedExtensions: ['.dot'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Converted PDF layout' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'HTML document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted text content' }
    ],
    technicalDetails: {
      formatFamily: 'Legacy Microsoft Word Binary Template',
      mimeType: 'application/msword',
      typicalUseCases: ['Letterheads', 'Invoice templates', 'Legal document boilerplates'],
      specifications: 'Compound File Binary Format (CFBF) with WordDocument stream'
    }
  },

  'dotm-converter': {
    id: 'dotm-converter',
    name: 'DOTM Converter (Word Macro Template)',
    shortDescription: 'Convert Word Macro-Enabled templates (.dotm) into clean PDF, HTML, or text securely.',
    primaryExtension: '.dotm',
    supportedExtensions: ['.dotm'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Macro-safe PDF' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'HTML document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Clean text' }
    ],
    technicalDetails: {
      formatFamily: 'Microsoft Office OpenXML Macro Template',
      mimeType: 'application/vnd.ms-word.template.macroEnabled.12',
      typicalUseCases: ['Enterprise automated templates', 'Form generators', 'Contract frameworks'],
      specifications: 'ZIP OpenXML structure with macro quarantine security validation'
    }
  },

  'dotx-converter': {
    id: 'dotx-converter',
    name: 'DOTX Converter (Word Modern Template)',
    shortDescription: 'Convert modern Word document templates (.dotx) into PDF, HTML, Markdown, or text.',
    primaryExtension: '.dotx',
    supportedExtensions: ['.dotx'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Rendered PDF document' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'Web HTML document' },
      { id: 'md', name: 'Markdown', extension: 'md', mimeType: 'text/markdown', description: 'Markdown format' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted plain text' }
    ],
    technicalDetails: {
      formatFamily: 'Microsoft Office OpenXML Template',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
      typicalUseCases: ['Office stationary', 'Resume templates', 'Business proposal designs'],
      specifications: 'Standard ISO/IEC 29500 OpenXML template container'
    }
  },

  'epub-converter': {
    id: 'epub-converter',
    name: 'EPUB Converter (Electronic Publication)',
    shortDescription: 'Convert EPUB digital eBooks (.epub) to PDF, HTML, Markdown, or plain text.',
    primaryExtension: '.epub',
    supportedExtensions: ['.epub'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Printable formatted eBook' },
      { id: 'html', name: 'HTML Book', extension: 'html', mimeType: 'text/html', description: 'All chapters in one readable webpage' },
      { id: 'md', name: 'Markdown', extension: 'md', mimeType: 'text/markdown', description: 'Markdown book text' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Plain text for screen readers' }
    ],
    technicalDetails: {
      formatFamily: 'IDPF / W3C Open eBook Standard',
      mimeType: 'application/epub+zip',
      typicalUseCases: ['eBook reading', 'Publishing textbooks', 'Offline documentation'],
      specifications: 'ZIP archive containing OEBPS package, content.opf, and XHTML chapter chapters'
    }
  },

  'eml-converter': {
    id: 'eml-converter',
    name: 'EML Converter (Email Message)',
    shortDescription: 'Convert email files (.eml) into formatted PDF reports, HTML emails, or text archives.',
    primaryExtension: '.eml',
    supportedExtensions: ['.eml'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Letterhead', extension: 'pdf', mimeType: 'application/pdf', description: 'Archival PDF with headers, date, and body' },
      { id: 'html', name: 'HTML Email', extension: 'html', mimeType: 'text/html', description: 'Formatted email body' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Raw headers and message text' }
    ],
    technicalDetails: {
      formatFamily: 'RFC 822 / RFC 2822 Internet Message',
      mimeType: 'message/rfc822',
      typicalUseCases: ['Legal email discovery', 'Outlook / Thunderbird backups', 'Customer support exports'],
      specifications: 'MIME-encoded headers with multipart plain text and HTML bodies'
    }
  },

  'xlsb-converter': {
    id: 'xlsb-converter',
    name: 'XLSB Converter (Excel Binary Workbook)',
    shortDescription: 'Convert Excel Binary Workbooks (.xlsb) into XLSX, CSV, JSON, HTML, or PDF tables.',
    primaryExtension: '.xlsb',
    supportedExtensions: ['.xlsb'],
    category: 'documents',
    defaultTarget: 'xlsx',
    availableTargets: [
      { id: 'xlsx', name: 'Excel XLSX', extension: 'xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'Standard XML Excel workbook' },
      { id: 'csv', name: 'CSV Table', extension: 'csv', mimeType: 'text/csv', description: 'Comma-separated values' },
      { id: 'pdf', name: 'PDF Table', extension: 'pdf', mimeType: 'application/pdf', description: 'Printable PDF spreadsheet' },
      { id: 'json', name: 'JSON Data', extension: 'json', mimeType: 'application/json', description: 'Structured JSON objects' }
    ],
    technicalDetails: {
      formatFamily: 'Microsoft Excel Binary Workbook',
      mimeType: 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
      typicalUseCases: ['Large financial models', 'High-row data analytics', 'Fast-loading enterprise workbooks'],
      specifications: 'ZIP package containing binary records (Brt*) instead of XML for compact storage'
    }
  },

  'xlt-converter': {
    id: 'xlt-converter',
    name: 'XLT Converter (Excel 97-2003 Template)',
    shortDescription: 'Convert legacy Excel template spreadsheets (.xlt) to modern XLSX, CSV, or PDF.',
    primaryExtension: '.xlt',
    supportedExtensions: ['.xlt'],
    category: 'documents',
    defaultTarget: 'xlsx',
    availableTargets: [
      { id: 'xlsx', name: 'Excel XLSX', extension: 'xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'Modern Excel spreadsheet' },
      { id: 'csv', name: 'CSV Table', extension: 'csv', mimeType: 'text/csv', description: 'Comma-separated data' },
      { id: 'pdf', name: 'PDF Table', extension: 'pdf', mimeType: 'application/pdf', description: 'Printable spreadsheet' }
    ],
    technicalDetails: {
      formatFamily: 'Legacy Microsoft Excel BIFF8 Template',
      mimeType: 'application/vnd.ms-excel',
      typicalUseCases: ['Invoice templates', 'Expense report sheets', 'Historical financial tables'],
      specifications: 'Binary Interchange File Format (BIFF8) compound spreadsheet'
    }
  },

  'xml-converter': {
    id: 'xml-converter',
    name: 'XML Converter (Extensible Markup)',
    shortDescription: 'Convert XML files to JSON, CSV data tables, HTML views, or PDF documents.',
    primaryExtension: '.xml',
    supportedExtensions: ['.xml'],
    category: 'documents',
    defaultTarget: 'json',
    availableTargets: [
      { id: 'json', name: 'JSON Format', extension: 'json', mimeType: 'application/json', description: 'Clean JSON data structure' },
      { id: 'csv', name: 'CSV Table', extension: 'csv', mimeType: 'text/csv', description: 'Flattened tabular records' },
      { id: 'html', name: 'HTML Document', extension: 'html', mimeType: 'text/html', description: 'Readable HTML' },
      { id: 'pdf', name: 'PDF Report', extension: 'pdf', mimeType: 'application/pdf', description: 'Structured PDF report' }
    ],
    technicalDetails: {
      formatFamily: 'W3C XML Standard',
      mimeType: 'application/xml',
      typicalUseCases: ['API payloads', 'Database exports', 'System configurations', 'RSS feeds'],
      specifications: 'Hierarchical tree of tagged markup elements with attributes'
    }
  },

  'fb2-converter': {
    id: 'fb2-converter',
    name: 'FB2 Converter (FictionBook 2.0)',
    shortDescription: 'Convert FictionBook eBooks (.fb2) into PDF, HTML, Markdown, or plain text.',
    primaryExtension: '.fb2',
    supportedExtensions: ['.fb2'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Book', extension: 'pdf', mimeType: 'application/pdf', description: 'Printable eBook with headings' },
      { id: 'html', name: 'HTML Book', extension: 'html', mimeType: 'text/html', description: 'Web readable book' },
      { id: 'md', name: 'Markdown', extension: 'md', mimeType: 'text/markdown', description: 'Clean Markdown' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted text' }
    ],
    technicalDetails: {
      formatFamily: 'FictionBook XML eBook Standard',
      mimeType: 'application/x-fictionbook+xml',
      typicalUseCases: ['Digital literature', 'Russian / Eastern European eBooks', 'Mobile reading'],
      specifications: 'Single-file XML document describing book metadata, sections, and paragraphs'
    }
  },

  'gif-converter': {
    id: 'gif-converter',
    name: 'GIF Converter (Graphics Interchange)',
    shortDescription: 'Convert animated or static GIF files (.gif) to PNG, JPEG, WebP, or PDF.',
    primaryExtension: '.gif',
    supportedExtensions: ['.gif'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Document containing the image' },
      { id: 'txt', name: 'Data Metadata', extension: 'txt', mimeType: 'text/plain', description: 'Dimensions and metadata summary' }
    ],
    technicalDetails: {
      formatFamily: 'CompuServe 89a Bitmap',
      mimeType: 'image/gif',
      typicalUseCases: ['Web graphics', 'Animated short clips', 'Documentation illustrations'],
      specifications: '8-bit indexed palette image format with LZW compression and multi-frame animation'
    }
  },

  'html-converter': {
    id: 'html-converter',
    name: 'HTML Converter (HyperText Markup)',
    shortDescription: 'Convert HTML webpages (.html) to Markdown, PDF documents, plain text, or Word.',
    primaryExtension: '.html',
    supportedExtensions: ['.html'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Print-ready PDF layout' },
      { id: 'md', name: 'Markdown', extension: 'md', mimeType: 'text/markdown', description: 'Semantic Markdown text' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Clean text without tags' }
    ],
    technicalDetails: {
      formatFamily: 'W3C HTML5 Standard',
      mimeType: 'text/html',
      typicalUseCases: ['Web article conversion', 'Documentation scraping', 'Offline page archiving'],
      specifications: 'Document Object Model (DOM) tree structured with semantic tags'
    }
  },

  'htm-converter': {
    id: 'htm-converter',
    name: 'HTM Converter (HyperText Document)',
    shortDescription: 'Convert .htm webpages into Markdown, PDF, or clean text in your browser.',
    primaryExtension: '.htm',
    supportedExtensions: ['.htm'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Printable PDF layout' },
      { id: 'md', name: 'Markdown', extension: 'md', mimeType: 'text/markdown', description: 'Semantic Markdown' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Text without tags' }
    ],
    technicalDetails: {
      formatFamily: 'Legacy 8.3 HTML Standard',
      mimeType: 'text/html',
      typicalUseCases: ['Legacy Windows web pages', 'Help system documentation', 'Intranet web pages'],
      specifications: '3-letter extension alias for standard HTML'
    }
  },

  'kwd-converter': {
    id: 'kwd-converter',
    name: 'KWD Converter (KWord Document)',
    shortDescription: 'Convert KWord documents (.kwd) from KOffice and Calligra to PDF, HTML, or text.',
    primaryExtension: '.kwd',
    supportedExtensions: ['.kwd'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Rendered PDF document' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'HTML document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted text' }
    ],
    technicalDetails: {
      formatFamily: 'KDE KOffice / Calligra Suite',
      mimeType: 'application/x-kword',
      typicalUseCases: ['Linux desktop word processing', 'Historical document archival'],
      specifications: 'Compressed tar/zip container with maindoc.xml structure'
    }
  },

  'lit-converter': {
    id: 'lit-converter',
    name: 'LIT Converter (Microsoft Reader)',
    shortDescription: 'Extract and convert Microsoft Reader eBooks (.lit) to PDF, HTML, or plain text.',
    primaryExtension: '.lit',
    supportedExtensions: ['.lit'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF eBook', extension: 'pdf', mimeType: 'application/pdf', description: 'Formatted PDF book' },
      { id: 'html', name: 'HTML Book', extension: 'html', mimeType: 'text/html', description: 'Web readable format' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Text stream' }
    ],
    technicalDetails: {
      formatFamily: 'Microsoft Reader ITOL / CHM',
      mimeType: 'application/x-ms-reader',
      typicalUseCases: ['Vintage digital reading', 'Pocket PC eBook archival'],
      specifications: 'Internal compressed HTML/XML stream based on Microsoft LZX compression'
    }
  },

  'log-converter': {
    id: 'log-converter',
    name: 'LOG Converter (System & Server Log)',
    shortDescription: 'Convert server and system log files (.log) into CSV tables, JSON arrays, or PDF reports.',
    primaryExtension: '.log',
    supportedExtensions: ['.log'],
    category: 'documents',
    defaultTarget: 'csv',
    availableTargets: [
      { id: 'csv', name: 'CSV Table', extension: 'csv', mimeType: 'text/csv', description: 'Delimited spreadsheet table' },
      { id: 'json', name: 'JSON Records', extension: 'json', mimeType: 'application/json', description: 'Structured JSON objects' },
      { id: 'pdf', name: 'PDF Report', extension: 'pdf', mimeType: 'application/pdf', description: 'Formatted PDF log report' },
      { id: 'html', name: 'HTML Viewer', extension: 'html', mimeType: 'text/html', description: 'Color-coded log table' }
    ],
    technicalDetails: {
      formatFamily: 'Plain Text Diagnostic Stream',
      mimeType: 'text/plain',
      typicalUseCases: ['Apache / Nginx access logs', 'Application crash telemetry', 'Syslog auditing'],
      specifications: 'Chronological timestamped text lines with severity levels and messages'
    }
  },

  'markdown-converter': {
    id: 'markdown-converter',
    name: 'Markdown MD Converter',
    shortDescription: 'Convert Markdown documents (.md) to HTML webpages, styled PDF reports, or plain text.',
    primaryExtension: '.md',
    supportedExtensions: ['.md', '.markdown'],
    category: 'documents',
    defaultTarget: 'html',
    availableTargets: [
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'Styled HTML5 document' },
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Formatted typography PDF' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Unformatted plain text' }
    ],
    technicalDetails: {
      formatFamily: 'CommonMark / GitHub Flavored Markdown',
      mimeType: 'text/markdown',
      typicalUseCases: ['Software documentation (README.md)', 'Blogging & static sites', 'Notes in Obsidian/Notion'],
      specifications: 'Lightweight plain text formatting syntax for headings, lists, and links'
    }
  },

  'pub-converter': {
    id: 'pub-converter',
    name: 'Microsoft Publisher PUB Converter',
    shortDescription: 'Extract text, formatting, and layout from Microsoft Publisher files (.pub) into PDF or HTML.',
    primaryExtension: '.pub',
    supportedExtensions: ['.pub'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Converted PDF layout' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'HTML document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted text stream' }
    ],
    technicalDetails: {
      formatFamily: 'Microsoft Publisher Desktop Publishing',
      mimeType: 'application/x-mspublisher',
      typicalUseCases: ['Flyers, brochures, and banners', 'Newsletters', 'Print layout inspection on Mac/Linux'],
      specifications: 'Proprietary compound document structure with text frames, shapes, and fonts'
    }
  },

  'docx-converter': {
    id: 'docx-converter',
    name: 'Microsoft Word DOCX Converter',
    shortDescription: 'Convert Word documents (.docx) to PDF, HTML, Markdown, or clean text without Word.',
    primaryExtension: '.docx',
    supportedExtensions: ['.docx'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'High-fidelity PDF document' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'Semantic HTML5 with styling' },
      { id: 'md', name: 'Markdown', extension: 'md', mimeType: 'text/markdown', description: 'Markdown with headings and lists' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Clean text without formatting' }
    ],
    technicalDetails: {
      formatFamily: 'Office Open XML Document (ECMA-376 / ISO 29500)',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      typicalUseCases: ['Academic theses', 'Business contracts', 'Corporate correspondence', 'Legal briefs'],
      specifications: 'ZIP container enclosing word/document.xml, word/styles.xml, and media assets'
    }
  },

  'mhtml-converter': {
    id: 'mhtml-converter',
    name: 'MHTML Converter (Web Archive)',
    shortDescription: 'Unpack MHTML web archives (.mhtml, .mht) into standard HTML, PDF, or text.',
    primaryExtension: '.mhtml',
    supportedExtensions: ['.mhtml', '.mht'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Complete web page in PDF' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'Unbundled standalone HTML' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted article text' }
    ],
    technicalDetails: {
      formatFamily: 'RFC 2557 MIME Encapsulation of Aggregate HTML',
      mimeType: 'multipart/related',
      typicalUseCases: ['Full webpage offline saving in Chrome/Edge', 'Receipt and invoice archival'],
      specifications: 'Single file containing HTML document, CSS stylesheets, and base64 encoded images'
    }
  },

  'mobi-converter': {
    id: 'mobi-converter',
    name: 'MOBI Converter (Mobipocket / Kindle)',
    shortDescription: 'Convert Amazon Kindle and Mobipocket eBooks (.mobi) into PDF, HTML, or plain text.',
    primaryExtension: '.mobi',
    supportedExtensions: ['.mobi'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Formatted eBook in PDF' },
      { id: 'html', name: 'HTML Book', extension: 'html', mimeType: 'text/html', description: 'Readable HTML eBook' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Clean text content' }
    ],
    technicalDetails: {
      formatFamily: 'Mobipocket / PalmDOC Standard',
      mimeType: 'application/x-mobipocket-ebook',
      typicalUseCases: ['Kindle eBook reading', 'Legacy digital book collections'],
      specifications: 'Palm Database (PDB) header with compressed PalmDOC and EXTH metadata records'
    }
  },

  'xlsx-converter': {
    id: 'xlsx-converter',
    name: 'Excel XLSX Converter',
    shortDescription: 'Convert Excel spreadsheets (.xlsx) to CSV, JSON, HTML tables, or PDF reports.',
    primaryExtension: '.xlsx',
    supportedExtensions: ['.xlsx'],
    category: 'documents',
    defaultTarget: 'csv',
    availableTargets: [
      { id: 'csv', name: 'CSV Table', extension: 'csv', mimeType: 'text/csv', description: 'Comma-separated values' },
      { id: 'pdf', name: 'PDF Table', extension: 'pdf', mimeType: 'application/pdf', description: 'Landscape PDF report' },
      { id: 'json', name: 'JSON Records', extension: 'json', mimeType: 'application/json', description: 'JSON objects per row' },
      { id: 'html', name: 'HTML Table', extension: 'html', mimeType: 'text/html', description: 'Interactive HTML data table' }
    ],
    technicalDetails: {
      formatFamily: 'Office Open XML Spreadsheet',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      typicalUseCases: ['Financial statements', 'Scientific data logs', 'Inventory audits', 'Sales sheets'],
      specifications: 'ZIP container with xl/worksheets/sheet1.xml and sharedStrings.xml'
    }
  },

  'xls-converter': {
    id: 'xls-converter',
    name: 'Excel XLS Converter (Excel 97-2003)',
    shortDescription: 'Convert legacy Excel spreadsheets (.xls) to modern XLSX, CSV, JSON, or PDF.',
    primaryExtension: '.xls',
    supportedExtensions: ['.xls'],
    category: 'documents',
    defaultTarget: 'xlsx',
    availableTargets: [
      { id: 'xlsx', name: 'Modern XLSX', extension: 'xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'Modern Excel format' },
      { id: 'csv', name: 'CSV Table', extension: 'csv', mimeType: 'text/csv', description: 'Comma-separated values' },
      { id: 'pdf', name: 'PDF Table', extension: 'pdf', mimeType: 'application/pdf', description: 'Printable PDF table' },
      { id: 'json', name: 'JSON Records', extension: 'json', mimeType: 'application/json', description: 'JSON structure' }
    ],
    technicalDetails: {
      formatFamily: 'Microsoft Excel 97-2003 Binary Interchange (BIFF8)',
      mimeType: 'application/vnd.ms-excel',
      typicalUseCases: ['Legacy accounting exports', 'Archival data analysis', 'Old payroll reports'],
      specifications: 'Compound Document File containing Workbook stream and binary cell records'
    }
  },

  'doc-converter': {
    id: 'doc-converter',
    name: 'Microsoft Word DOC Converter',
    shortDescription: 'Convert legacy Word 97-2003 documents (.doc) into PDF, HTML, or plain text.',
    primaryExtension: '.doc',
    supportedExtensions: ['.doc'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Universal PDF document' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'HTML document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted clean text' }
    ],
    technicalDetails: {
      formatFamily: 'Microsoft Word 97-2003 Binary File Format',
      mimeType: 'application/msword',
      typicalUseCases: ['Legacy legal documents', 'Historical reports', 'Old Word attachments'],
      specifications: 'OLE Compound File Binary Format with WordDocument stream and FIB block'
    }
  },

  'odc-converter': {
    id: 'odc-converter',
    name: 'OpenDocument Chart ODC Converter',
    shortDescription: 'Extract and convert OpenDocument Chart files (.odc) to CSV, JSON, or HTML.',
    primaryExtension: '.odc',
    supportedExtensions: ['.odc'],
    category: 'documents',
    defaultTarget: 'csv',
    availableTargets: [
      { id: 'csv', name: 'CSV Data', extension: 'csv', mimeType: 'text/csv', description: 'Extracted chart series data' },
      { id: 'json', name: 'JSON Data', extension: 'json', mimeType: 'application/json', description: 'Structured chart series JSON' },
      { id: 'pdf', name: 'PDF Report', extension: 'pdf', mimeType: 'application/pdf', description: 'Data table in PDF' }
    ],
    technicalDetails: {
      formatFamily: 'OASIS OpenDocument Chart Standard',
      mimeType: 'application/vnd.oasis.opendocument.chart',
      typicalUseCases: ['LibreOffice Calc charts', 'OpenOffice scientific plots'],
      specifications: 'ZIP container containing content.xml with chart:chart and table:table tags'
    }
  },

  'odt-converter': {
    id: 'odt-converter',
    name: 'OpenDocument Text ODT Converter',
    shortDescription: 'Convert OpenDocument Text (.odt) to PDF, HTML, Markdown, or plain text.',
    primaryExtension: '.odt',
    supportedExtensions: ['.odt'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'High-quality PDF layout' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'Semantic HTML5 document' },
      { id: 'md', name: 'Markdown', extension: 'md', mimeType: 'text/markdown', description: 'Markdown with headings' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted text' }
    ],
    technicalDetails: {
      formatFamily: 'OASIS OpenDocument Text (ISO/IEC 26300)',
      mimeType: 'application/vnd.oasis.opendocument.text',
      typicalUseCases: ['LibreOffice Writer documents', 'Linux desktop publishing', 'European public sector documents'],
      specifications: 'ZIP container storing content.xml, styles.xml, and embedded media'
    }
  },

  'ods-converter': {
    id: 'ods-converter',
    name: 'OpenDocument Spreadsheet ODS Converter',
    shortDescription: 'Convert OpenDocument Spreadsheets (.ods) into Excel XLSX, CSV, JSON, or PDF.',
    primaryExtension: '.ods',
    supportedExtensions: ['.ods'],
    category: 'documents',
    defaultTarget: 'xlsx',
    availableTargets: [
      { id: 'xlsx', name: 'Excel XLSX', extension: 'xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'Microsoft Excel workbook' },
      { id: 'csv', name: 'CSV Table', extension: 'csv', mimeType: 'text/csv', description: 'Comma-separated values' },
      { id: 'pdf', name: 'PDF Table', extension: 'pdf', mimeType: 'application/pdf', description: 'Printable PDF spreadsheet' },
      { id: 'json', name: 'JSON Records', extension: 'json', mimeType: 'application/json', description: 'JSON structure' }
    ],
    technicalDetails: {
      formatFamily: 'OASIS OpenDocument Spreadsheet (ISO/IEC 26300)',
      mimeType: 'application/vnd.oasis.opendocument.spreadsheet',
      typicalUseCases: ['LibreOffice Calc tables', 'Open data portals', 'Public administration sheets'],
      specifications: 'ZIP container containing content.xml with table:table and table:row structures'
    }
  },

  'msg-converter': {
    id: 'msg-converter',
    name: 'Outlook MSG Converter',
    shortDescription: 'Convert Outlook email files (.msg) into EML, PDF reports, HTML, or plain text.',
    primaryExtension: '.msg',
    supportedExtensions: ['.msg'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Letterhead', extension: 'pdf', mimeType: 'application/pdf', description: 'Archival PDF with headers, date, and body' },
      { id: 'html', name: 'HTML Email', extension: 'html', mimeType: 'text/html', description: 'Formatted email body' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Clean text' }
    ],
    technicalDetails: {
      formatFamily: 'Microsoft Outlook Compound File (CFBF)',
      mimeType: 'application/vnd.ms-outlook',
      typicalUseCases: ['Corporate email archival', 'Legal audit discovery', 'Transferring emails to non-Windows systems'],
      specifications: 'OLE container storing MAPI property streams (__substg1.0_*) for Subject, Body, and Recipients'
    }
  },

  'oxps-converter': {
    id: 'oxps-converter',
    name: 'OXPS Converter (OpenXPS Document)',
    shortDescription: 'Convert OpenXPS print documents (.oxps) to PDF or plain text.',
    primaryExtension: '.oxps',
    supportedExtensions: ['.oxps'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Standard PDF document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted text stream' }
    ],
    technicalDetails: {
      formatFamily: 'Open XML Paper Specification (ECMA-388)',
      mimeType: 'application/oxps',
      typicalUseCases: ['Windows 8/10/11 print spooling', 'Virtual printer printouts', 'Fixed document publishing'],
      specifications: 'ZIP container holding FixedDocumentSequence and XAML pages'
    }
  },

  'pdb-converter': {
    id: 'pdb-converter',
    name: 'PDB Converter (Palm OS Database / eBook)',
    shortDescription: 'Convert Palm OS Database and eBook files (.pdb) into PDF, HTML, or plain text.',
    primaryExtension: '.pdb',
    supportedExtensions: ['.pdb'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF eBook', extension: 'pdf', mimeType: 'application/pdf', description: 'Formatted PDF document' },
      { id: 'html', name: 'HTML Book', extension: 'html', mimeType: 'text/html', description: 'HTML document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted text records' }
    ],
    technicalDetails: {
      formatFamily: 'Palm OS Database / AportisDoc',
      mimeType: 'application/x-palm-database',
      typicalUseCases: ['Vintage PalmPilot reading', 'Legacy mobile medical reference texts'],
      specifications: '32-byte header, record count, record index list, and LZ77/uncompressed text records'
    }
  },

  'prn-converter': {
    id: 'prn-converter',
    name: 'Print File PRN Converter',
    shortDescription: 'Extract printable text and PostScript layout from PRN print files into PDF or text.',
    primaryExtension: '.prn',
    supportedExtensions: ['.prn'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Print-ready PDF' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted text stream' }
    ],
    technicalDetails: {
      formatFamily: 'Printer Spool File (PostScript / PCL / Raw)',
      mimeType: 'application/octet-stream',
      typicalUseCases: ['Printer redirection files', 'Legacy accounting print spool exports', 'Plotter data inspection'],
      specifications: 'Raw printer command stream with embedded text and graphics codes'
    }
  },

  'rtf-converter': {
    id: 'rtf-converter',
    name: 'Rich Text Format RTF Converter',
    shortDescription: 'Convert Rich Text Format documents (.rtf) to PDF, HTML, Markdown, or plain text.',
    primaryExtension: '.rtf',
    supportedExtensions: ['.rtf'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Printable PDF layout' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'Semantic HTML with bold and italics' },
      { id: 'md', name: 'Markdown', extension: 'md', mimeType: 'text/markdown', description: 'Clean Markdown' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Clean text' }
    ],
    technicalDetails: {
      formatFamily: 'Microsoft Rich Text Format (RTF 1.9.1)',
      mimeType: 'application/rtf',
      typicalUseCases: ['Cross-platform document exchange', 'Wordpad notes', 'Clinical report exports'],
      specifications: '7-bit ASCII control word syntax with bracket groups and font/color tables'
    }
  },

  'sxw-converter': {
    id: 'sxw-converter',
    name: 'StarOffice SXW Converter',
    shortDescription: 'Convert legacy StarOffice and OpenOffice 1.x documents (.sxw) to PDF, HTML, or text.',
    primaryExtension: '.sxw',
    supportedExtensions: ['.sxw'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Rendered PDF document' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'HTML document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted plain text' }
    ],
    technicalDetails: {
      formatFamily: 'StarOffice / OpenOffice.org 1.0 XML',
      mimeType: 'application/vnd.sun.xml.writer',
      typicalUseCases: ['Pre-ODF document archival', 'Historical Sun Microsystems office files'],
      specifications: 'ZIP archive holding content.xml with older Sun XML schema'
    }
  },

  'swf-converter': {
    id: 'swf-converter',
    name: 'SWF Converter (Shockwave Flash)',
    shortDescription: 'Extract embedded vector graphics, frames, and metadata from Flash files (.swf) into PDF or text.',
    primaryExtension: '.swf',
    supportedExtensions: ['.swf'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Report', extension: 'pdf', mimeType: 'application/pdf', description: 'Document with extracted media and metadata' },
      { id: 'txt', name: 'Header Summary', extension: 'txt', mimeType: 'text/plain', description: 'Tag summary and frame counts' }
    ],
    technicalDetails: {
      formatFamily: 'Adobe Shockwave Flash (SWF v10-v30)',
      mimeType: 'application/x-shockwave-flash',
      typicalUseCases: ['Flash web game preservation', 'Vector banner graphics recovery', 'Educational simulations'],
      specifications: 'Header (FWS / CWS / ZWS) with frame rates, bounding rectangles, and DefineBits tags'
    }
  },

  'txt-converter': {
    id: 'txt-converter',
    name: 'Text TXT Converter',
    shortDescription: 'Convert plain text files (.txt) into styled PDF documents, HTML webpages, or Markdown.',
    primaryExtension: '.txt',
    supportedExtensions: ['.txt'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Styled PDF with line wraps and typography' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'Clean HTML webpage' },
      { id: 'md', name: 'Markdown', extension: 'md', mimeType: 'text/markdown', description: 'Markdown formatted text' }
    ],
    technicalDetails: {
      formatFamily: 'Universal Plain Text',
      mimeType: 'text/plain',
      typicalUseCases: ['Notes and transcripts', 'Source code documentation', 'Terminal printouts'],
      specifications: 'Raw UTF-8 / ASCII characters with newline breaks'
    }
  },

  'wpd-converter': {
    id: 'wpd-converter',
    name: 'WordPerfect WPD Converter',
    shortDescription: 'Extract and convert Corel WordPerfect documents (.wpd) into PDF, HTML, or plain text.',
    primaryExtension: '.wpd',
    supportedExtensions: ['.wpd'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Rendered PDF document' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'HTML document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted text stream' }
    ],
    technicalDetails: {
      formatFamily: 'Corel WordPerfect Word Processing',
      mimeType: 'application/vnd.wordperfect',
      typicalUseCases: ['Legal industry briefs and pleadings', 'Government documents', 'Law firm document archives'],
      specifications: 'File header starting with 0xFF 0x57 0x50 0x43 (\\xFFWPC) with packet data stream'
    }
  },

  'wps-converter': {
    id: 'wps-converter',
    name: 'WPS Converter (Microsoft Works / Kingsoft)',
    shortDescription: 'Convert Microsoft Works (.wps) and Kingsoft WPS documents into PDF, HTML, or text.',
    primaryExtension: '.wps',
    supportedExtensions: ['.wps'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Formatted PDF copy' },
      { id: 'html', name: 'HTML Webpage', extension: 'html', mimeType: 'text/html', description: 'HTML document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted text stream' }
    ],
    technicalDetails: {
      formatFamily: 'Microsoft Works / Kingsoft Office',
      mimeType: 'application/vnd.ms-works',
      typicalUseCases: ['Historical home PC documents', 'Old school assignments', 'WPS office mobile files'],
      specifications: 'Compound file document with text stream records and font definitions'
    }
  },

  'xhtml-converter': {
    id: 'xhtml-converter',
    name: 'XHTML Converter (Extensible HTML)',
    shortDescription: 'Convert XHTML documents (.xhtml) to standard HTML5, PDF, Markdown, or plain text.',
    primaryExtension: '.xhtml',
    supportedExtensions: ['.xhtml'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Printable PDF document' },
      { id: 'html', name: 'HTML5 Webpage', extension: 'html', mimeType: 'text/html', description: 'Clean modern HTML5' },
      { id: 'md', name: 'Markdown', extension: 'md', mimeType: 'text/markdown', description: 'Semantic Markdown' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Clean text' }
    ],
    technicalDetails: {
      formatFamily: 'W3C XHTML 1.0 / 1.1 Standard',
      mimeType: 'application/xhtml+xml',
      typicalUseCases: ['Strict web markup', 'EPUB chapter content', 'XML data pipelines'],
      specifications: 'Strict XML-conforming formulation of HTML with closed tags and lowercase syntax'
    }
  },

  'xps-converter': {
    id: 'xps-converter',
    name: 'XPS Converter (XML Paper Specification)',
    shortDescription: 'Convert Microsoft XPS print documents (.xps) to PDF or plain text without Microsoft Viewer.',
    primaryExtension: '.xps',
    supportedExtensions: ['.xps'],
    category: 'documents',
    defaultTarget: 'pdf',
    availableTargets: [
      { id: 'pdf', name: 'PDF Document', extension: 'pdf', mimeType: 'application/pdf', description: 'Standard PDF document' },
      { id: 'txt', name: 'Plain Text', extension: 'txt', mimeType: 'text/plain', description: 'Extracted text stream' }
    ],
    technicalDetails: {
      formatFamily: 'Microsoft XML Paper Specification',
      mimeType: 'application/vnd.ms-xpsdocument',
      typicalUseCases: ['Windows printer spools', 'Legal document distribution', 'Architectural drawings'],
      specifications: 'ZIP container enclosing FixedDocumentSequence and XAML vector glyph pages'
    }
  }
};
