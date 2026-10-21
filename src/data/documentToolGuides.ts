import { ToolGuideContent } from './toolGuides';

export const DOCUMENT_TOOL_GUIDES: Record<string, ToolGuideContent> = {
  'abw-converter': {
    title: 'ABW File Format: AbiWord XML Architecture & Document Conversion',
    badge: 'GNOME Office Open Document Standard',
    readingTime: '5 min read',
    overview: [
      'The ABW (.abw) format is the native document storage format for AbiWord, a free, cross-platform word processor created under the GNOME Office project. It uses a structured XML hierarchy to represent text formatting, font styles, embedded images, and tables.',
      'Unlike binary formats like DOC, ABW is human-readable and resistant to file corruption. It incorporates elements such as <abiword>, <section>, <p>, and <c> to specify formatting spans and character properties.',
      'ToolNest provides instant in-browser conversion of AbiWord (.abw) files into standard PDF documents, modern HTML5 webpages, Markdown, or plain text without requiring AbiWord or Linux packages.'
    ],
    principles: [
      {
        heading: 'AbiWord XML Schema & Formatting Blocks',
        description: 'An ABW file is encapsulated within root <abiword> tags, declaring document version, metadata, and styling rules.',
        details: [
          '<section> and <p>: Control page margins, paragraph breaks, and text alignment.',
          '<c props="...">: Inline formatting tags defining font family, size, weight, and color.',
          'Zero-Tracking Execution: Parsed using browser DOMParser with 100% client-side privacy.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload .abw Document', instruction: 'Drop your AbiWord file into the converter or click Browse.' },
      { step: 2, title: 'Choose Target Format', instruction: 'Select PDF, HTML, Markdown, or Plain Text.' },
      { step: 3, title: 'Download Converted File', instruction: 'Click Convert & Download to obtain your converted document.' }
    ],
    examples: [
      {
        title: 'Opening Linux AbiWord File on Windows',
        scenario: 'A researcher received a document written in AbiWord on Ubuntu and needs to read it on Windows.',
        input: 'research_notes.abw (180 KB)',
        output: 'research_notes.pdf (195 KB)',
        explanation: 'The XML document tree is parsed and rendered into a standard vector PDF.'
      }
    ],
    bestPractices: ['Convert ABW documents to PDF for formal distribution and archiving.'],
    faqs: [
      { question: 'Can I open .abw files without Linux?', answer: 'Yes. ToolNest converts ABW files directly into PDF or HTML inside any browser.' }
    ]
  },

  'pages-converter': {
    title: 'Apple Pages Format: iWork Bundle Architecture & Cross-Platform Conversion',
    badge: 'Apple iWork Document Architecture',
    readingTime: '6 min read',
    overview: [
      'The Pages format (.pages) is the native word processing format for Apple Pages on macOS, iOS, and iPadOS. Because Windows and Android lack native support for Pages files, opening them outside the Apple ecosystem has historically posed significant challenges.',
      'Under the hood, a .pages file is an archived package (ZIP format) containing internal index XML files, QuickLook preview caches, embedded fonts, and high-resolution PDF preview renderings.',
      'ToolNest extracts and converts Apple Pages files directly in your web browser into universal PDF, HTML, or plain text without requiring an iCloud account or Mac.'
    ],
    principles: [
      {
        heading: 'iWork Bundle Extraction & Preview Stream',
        description: 'Apple Pages packages store pre-rendered high-fidelity document streams in QuickLook/Preview.pdf or index.xml data records.',
        details: [
          'Direct Extraction: Unpacks the internal vector preview and document text streams.',
          'Windows & Android Access: Converts Apple Pages documents into universally viewable PDF and HTML.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload .pages File', instruction: 'Drag and drop your Apple Pages document into the tool.' },
      { step: 2, title: 'Preview & Select Target', instruction: 'Choose PDF Document or Plain Text.' },
      { step: 3, title: 'Download Output', instruction: 'Download your converted document in one tap.' }
    ],
    examples: [
      {
        title: 'Opening a Resume on Windows',
        scenario: 'A hiring manager on Windows received a resume formatted as resume.pages.',
        input: 'resume.pages (2.4 MB)',
        output: 'resume.pdf (1.8 MB)',
        explanation: 'Extracted in browser memory and saved as a PDF viewable in any PDF reader.'
      }
    ],
    bestPractices: ['Convert Pages documents to PDF before sharing with clients or colleagues on Windows.'],
    faqs: [
      { question: 'Do I need a Mac or Apple ID to convert Pages files here?', answer: 'No. The conversion is performed 100% locally in your web browser.' }
    ]
  },

  'csv-converter': {
    title: 'CSV Format: RFC 4180 Delimited Text & Tabular Data Conversion',
    badge: 'RFC 4180 Data Standard',
    readingTime: '5 min read',
    overview: [
      'Comma-Separated Values (CSV) is the universal tabular data exchange format across spreadsheets, databases, data science pipelines, and financial auditing software.',
      'While simple, CSV files often encounter delimiter mismatches (commas vs semicolons), quotation escaping issues, and character encoding conflicts when imported into software.',
      'ToolNest allows you to convert CSV tables directly into Microsoft Excel (.xlsx), structured JSON arrays for programmers, styled HTML tables, or clean landscape PDF reports.'
    ],
    principles: [
      {
        heading: 'RFC 4180 Parsing & Data Typing',
        description: 'Standard CSV records are delimited by newlines, fields separated by commas, and fields containing special characters wrapped in double quotes.',
        details: [
          'Automatic Type Coercion: Preserves dates, currencies, percentages, and floating-point numbers.',
          'Lossless Spreadsheet Export: Converts raw text records into native OpenXML Excel cells.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload CSV File', instruction: 'Select your .csv data file.' },
      { step: 2, title: 'Choose Target', instruction: 'Select Excel XLSX, PDF Table, JSON, or HTML.' },
      { step: 3, title: 'Export', instruction: 'Click Convert & Download to retrieve the transformed file.' }
    ],
    examples: [
      {
        title: 'Converting Database Export to Excel',
        scenario: 'An accountant received a transaction export in CSV format and needs an formatted Excel sheet.',
        input: 'transactions.csv (1.2 MB, 15,000 rows)',
        output: 'transactions.xlsx (950 KB)',
        explanation: 'Transformed into a native Excel workbook with proper column headers and cell formats.'
      }
    ],
    bestPractices: ['Ensure UTF-8 encoding when exporting CSV files to prevent corrupted foreign currency symbols.'],
    faqs: [
      { question: 'Can this tool convert CSV into JSON for developers?', answer: 'Yes. Select .json as the target to get an array of JSON objects keyed by column headers.' }
    ]
  },

  'docm-converter': {
    title: 'DOCM Format: Macro-Enabled Word Processing & Safe Conversion Guide',
    badge: 'Office Open XML (Macro-Enabled)',
    readingTime: '5 min read',
    overview: [
      'Microsoft Word Macro-Enabled Document (.docm) files are identical in structure to standard DOCX files, but contain embedded Visual Basic for Applications (VBA) macro scripts stored in a vbaProject.bin stream.',
      'Because VBA macros can contain harmful automation or malware, many email servers and corporate firewalls block .docm attachments by default.',
      'ToolNest extracts document text, tables, and styles while neutralizing and stripping macros, converting the document safely into clean PDF, HTML, or plain text without executing code.'
    ],
    principles: [
      {
        heading: 'Macro Quarantine & OpenXML Extraction',
        description: 'The converter inspects the ZIP package, extracts word/document.xml, and ignores executable VBA binary streams.',
        details: [
          '100% Safe: Zero macro execution risk in sandbox environment.',
          'High Fidelity: Preserves all headings, paragraphs, and formatting.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload .docm File', instruction: 'Drop your macro-enabled document into the converter.' },
      { step: 2, title: 'Select Target', instruction: 'Choose PDF Document, HTML, or Text.' },
      { step: 3, title: 'Convert Safely', instruction: 'Download your sanitized, macro-free document.' }
    ],
    examples: [
      {
        title: 'Converting a Corporate Form to PDF',
        scenario: 'An employee received a purchase requisition in DOCM format and needs to submit a signed PDF.',
        input: 'requisition.docm (350 KB)',
        output: 'requisition.pdf (280 KB)',
        explanation: 'Text and tables converted cleanly into PDF while stripping VBA macro code.'
      }
    ],
    bestPractices: ['Always convert DOCM files to PDF or DOCX before emailing to external clients.'],
    faqs: [
      { question: 'Will converting a DOCM file trigger its macros?', answer: 'No. The conversion is purely static text/XML parsing and never executes VBA scripts.' }
    ]
  },

  'epub-converter': {
    title: 'EPUB Format: Digital eBook Container & Document Conversion Guide',
    badge: 'IDPF / W3C Open eBook Standard',
    readingTime: '6 min read',
    overview: [
      'EPUB (Electronic Publication) is the open XML-based digital book standard published by the International Digital Publishing Forum (IDPF) and the W3C. Supported by almost all e-readers (except older Kindles), EPUB files feature reflowable text, chapters, and embedded graphics.',
      'Under the hood, an EPUB file is a ZIP archive containing XHTML chapters, CSS styling rules, an XML spine (content.opf), and a table of contents (toc.ncx).',
      'This tool extracts and compiles all chapters in an EPUB file, converting the book into a printable PDF document, a single continuous HTML webpage, Markdown, or clean text.'
    ],
    principles: [
      {
        heading: 'ZIP Container & OPF Spine Sequencing',
        description: 'The parser reads META-INF/container.xml to locate the root OPF file, determining chapter reading order before extracting XHTML files.',
        details: [
          'Chapter Compilation: Assembles fragmented chapters into a coherent, flowing document.',
          'Print Formatting: Converts reflowable eBook markup into paginated A4/Letter PDF.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload .epub eBook', instruction: 'Select your EPUB file from your device.' },
      { step: 2, title: 'Choose Target', instruction: 'Select PDF Document, HTML Book, Markdown, or Plain Text.' },
      { step: 3, title: 'Download Converted Book', instruction: 'Save your converted book file.' }
    ],
    examples: [
      {
        title: 'Converting an eBook for Printing',
        scenario: 'A student downloaded an open-source textbook in EPUB and wants to print specific chapters as a PDF.',
        input: 'calculus_book.epub (4.2 MB)',
        output: 'calculus_book.pdf (5.1 MB)',
        explanation: 'Compiled all chapters into a beautifully formatted, paginated PDF.'
      }
    ],
    bestPractices: ['Use PDF conversion for fixed page numbers, and HTML/Markdown for editing content.'],
    faqs: [
      { question: 'Can I read converted EPUB files on a smartphone?', answer: 'Yes. Converted PDF and HTML files open natively on all smartphones without eBook reader apps.' }
    ]
  },

  'eml-converter': {
    title: 'EML Format: Internet Email Message Archival & Conversion Guide',
    badge: 'RFC 822 / 2822 Email Standard',
    readingTime: '5 min read',
    overview: [
      'EML (.eml) is the standard electronic mail message format used by Microsoft Outlook Express, Thunderbird, Apple Mail, and webmail export tools. It encapsulates header fields (Subject, From, To, Date), plain text bodies, HTML formatting, and attachments.',
      'In legal compliance, financial discovery, and HR disputes, preserving and converting EML messages into tamper-evident PDF letterheads is a mandatory workflow.',
      'ToolNest parses EML files, renders an official email header block, formats the message body, and produces archival PDF documents or clean HTML.'
    ],
    principles: [
      {
        heading: 'MIME Boundary Parsing & Header Decoupling',
        description: 'The EML parser splits the message into RFC 822 header key-value pairs and multipart MIME body boundaries.',
        details: [
          'Header Verification: Extracts exact transmission timestamps and email addresses.',
          'Letterhead Generation: Draws sender, recipient, subject, and date atop the page.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload .eml Message', instruction: 'Drop your email file into the tool.' },
      { step: 2, title: 'Select Output', instruction: 'Choose PDF Letterhead, HTML Email, or Plain Text.' },
      { step: 3, title: 'Download Output', instruction: 'Save your archival document.' }
    ],
    examples: [
      {
        title: 'Creating Legal PDF Evidence from Email',
        scenario: 'A contract manager needs to submit an email agreement as a formal court exhibit.',
        input: 'agreement_confirmation.eml (65 KB)',
        output: 'agreement_confirmation.pdf (92 KB)',
        explanation: 'Converted into a clean letterhead PDF showing verified headers and message text.'
      }
    ],
    bestPractices: ['Store converted email PDFs alongside the original .eml file for cryptographic audit trails.'],
    faqs: [
      { question: 'Can I convert Thunderbird emails to PDF here?', answer: 'Yes. Simply drag your exported .eml file into the converter.' }
    ]
  },

  'xlsb-converter': {
    title: 'XLSB Format: Excel Binary Workbook Architecture & Conversion',
    badge: 'Microsoft Excel Binary Standard',
    readingTime: '5 min read',
    overview: [
      'The Excel Binary Workbook (.xlsb) format stores spreadsheet data using binary records rather than XML. Developed by Microsoft for massive enterprise spreadsheets, XLSB files open twice as fast and consume roughly 50% less disk space than standard XLSX files.',
      'Because XLSB files are binary, many non-Microsoft applications and data analysis scripts cannot open them without specialized drivers.',
      'ToolNest reads XLSB files via SheetJS in your browser, converting them into universal XLSX workbooks, CSV tables, JSON records, or printable PDF sheets.'
    ],
    principles: [
      {
        heading: 'Binary Record Stream (Brt*) Parsing',
        description: 'XLSB structures cell values into binary token records, bypassing the heavy overhead of XML string serialization.',
        details: [
          'Full Fidelity: Extracts sheet names, numeric values, string tables, and dates.',
          'Fast Conversion: Converts high-row models directly into standard CSV and XLSX.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload .xlsb Workbook', instruction: 'Select your binary spreadsheet file.' },
      { step: 2, title: 'Choose Target', instruction: 'Select XLSX, CSV, PDF Table, or JSON.' },
      { step: 3, title: 'Download Converted File', instruction: 'Save your transformed spreadsheet.' }
    ],
    examples: [
      {
        title: 'Converting a 50 MB Financial Model to CSV',
        scenario: 'A financial analyst needs to load an XLSB model into a Python data pipeline on Linux.',
        input: 'financial_forecast.xlsb (18 MB)',
        output: 'financial_forecast.csv (32 MB)',
        explanation: 'Binary workbook decoded and exported as a clean CSV table.'
      }
    ],
    bestPractices: ['Convert XLSB to XLSX before sharing with external partners who may use older software.'],
    faqs: [
      { question: 'Why use XLSB over XLSX?', answer: 'XLSB files are significantly smaller and open much faster, making them ideal for workbooks with hundreds of thousands of rows.' }
    ]
  },

  'markdown-converter': {
    title: 'Markdown Format: Lightweight Markup Architecture & PDF/HTML Conversion',
    badge: 'CommonMark / GitHub Flavored Markdown',
    readingTime: '5 min read',
    overview: [
      'Markdown (.md) was created by John Gruber and Aaron Swartz in 2004 to enable authors to write using an easy-to-read, plain text formatting syntax that converts cleanly into structured HTML.',
      'Today, Markdown is the undisputed standard for software documentation (README.md), static site generation, note-taking in Obsidian and Notion, and technical writing.',
      'This tool converts Markdown documents into professionally styled HTML webpages, paginated PDF documents with bold and headers, or unformatted text.'
    ],
    principles: [
      {
        heading: 'Syntax Transformation Pipeline',
        description: 'The converter parses Markdown block rules (headers, lists, tables) and inline rules (bold, italics, links, inline code).',
        details: [
          'Semantic Typography: Automatically formats # into H1, ## into H2, and - into bullet lists.',
          'Vector PDF Output: Uses Helvetica typography with crisp vector rendering in PDF.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload .md Document', instruction: 'Select your Markdown file.' },
      { step: 2, title: 'Select Target', instruction: 'Choose Styled HTML, PDF Document, or Plain Text.' },
      { step: 3, title: 'Save File', instruction: 'Download your converted document.' }
    ],
    examples: [
      {
        title: 'Converting README.md to PDF Report',
        scenario: 'A developer needs to print project documentation for an executive review.',
        input: 'README.md (14 KB)',
        output: 'README.pdf (42 KB)',
        explanation: 'Rendered into a clean, modern PDF document with formatted headings.'
      }
    ],
    bestPractices: ['Use Markdown for write-once, publish-anywhere documentation workflows.'],
    faqs: [
      { question: 'Does this tool support GitHub Flavored Markdown (GFM)?', answer: 'Yes. Headings, bold, italics, lists, and tables are parsed accurately.' }
    ]
  },

  'rtf-converter': {
    title: 'Rich Text Format (RTF): Cross-Platform Word Processing Guide',
    badge: 'Microsoft RTF 1.9.1 Standard',
    readingTime: '5 min read',
    overview: [
      'Rich Text Format (.rtf) was created by Microsoft in 1987 as a universal interchange format for cross-platform document sharing between Windows, Macintosh, and Unix systems.',
      'Unlike proprietary binary DOC files, RTF files are plain 7-bit ASCII files containing bracketed control words such as \\rtf1, \\b (bold), \\i (italics), and \\par (paragraph breaks).',
      'ToolNest parses RTF control words and converts documents into clean HTML5, modern PDF, Markdown, or plain text.'
    ],
    principles: [
      {
        heading: 'Control Word Parsing & Bracket Scope',
        description: 'RTF groups formatting properties into curly-bracket scopes { ... } that inherit and override font tables and character styles.',
        details: [
          'Sanitization: Strips binary control tokens while preserving textual paragraphs.',
          'Cross-Platform: Opens clinical reports and legal documents cleanly.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload .rtf File', instruction: 'Drop your RTF file into the tool.' },
      { step: 2, title: 'Select Output', instruction: 'Choose PDF Document, HTML Webpage, or Markdown.' },
      { step: 3, title: 'Download Converted File', instruction: 'Retrieve your converted document.' }
    ],
    examples: [
      {
        title: 'Converting Hospital Lab Report to PDF',
        scenario: 'A physician received an automated diagnostic report saved in report.rtf.',
        input: 'lab_report.rtf (120 KB)',
        output: 'lab_report.pdf (145 KB)',
        explanation: 'Converted into a clean vector PDF suitable for electronic medical records.'
      }
    ],
    bestPractices: ['Convert RTF documents to PDF for tamper-resistant digital archiving.'],
    faqs: [
      { question: 'Why do medical systems use RTF?', answer: 'RTF is universally readable without requiring Microsoft Office licenses or specific word processors.' }
    ]
  },

  'xps-converter': {
    title: 'XPS Format: Microsoft XML Paper Specification & PDF Conversion',
    badge: 'Microsoft XPS / ECMA-388 Standard',
    readingTime: '5 min read',
    overview: [
      'XML Paper Specification (.xps) was developed by Microsoft as an alternative to Adobe PDF for electronic document distribution and print spooling in Windows Vista, 7, 10, and 11.',
      'An XPS file is a ZIP package containing XAML-based fixed page markup (FixedDocumentSequence), font streams, and embedded images, guaranteeing that the document prints identically on any printer.',
      'Because macOS, Linux, iOS, and Android lack native XPS viewers, converting XPS to PDF is essential for universal accessibility.'
    ],
    principles: [
      {
        heading: 'XAML FixedPage Markup & Glyph Extraction',
        description: 'XPS pages represent textual content using <Glyphs UnicodeString="..." /> tags with precise vector coordinates.',
        details: [
          'Coordinate Mapping: Preserves layout positions, margins, and page boundaries.',
          'Universal PDF Output: Generates ISO-compliant PDF documents viewable on all platforms.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload .xps Document', instruction: 'Drop your XPS print document into the tool.' },
      { step: 2, title: 'Select Target', instruction: 'Choose PDF Document or Plain Text.' },
      { step: 3, title: 'Download Output', instruction: 'Save your universal PDF document.' }
    ],
    examples: [
      {
        title: 'Opening an XPS Printout on a Mac',
        scenario: 'A Mac user received a printout file printed via Microsoft XPS Document Writer.',
        input: 'invoice_print.xps (650 KB)',
        output: 'invoice_print.pdf (590 KB)',
        explanation: 'Parsed in browser and converted into a PDF viewable in Apple Preview.'
      }
    ],
    bestPractices: ['Convert XPS to PDF before emailing documents to clients using non-Windows devices.'],
    faqs: [
      { question: 'What is the difference between XPS and OXPS?', answer: 'OXPS (OpenXPS) is the international standardized version of Microsoft XPS (ECMA-388); both are fully supported by ToolNest.' }
    ]
  }
};
