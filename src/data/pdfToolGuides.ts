import { ToolGuideContent } from './toolGuides';

export const PDF_EXTENDED_TOOL_GUIDES: Record<string, ToolGuideContent> = {
  'pdf-remove-pages': {
    title: 'PDF Page Removal: Operations, Structure & Best Practices',
    badge: 'PDF Organization & Document Hygiene',
    readingTime: '4 min read',
    overview: [
      'Document sanitization often necessitates excising non-relevant pages, draft revisions, internal separator sheets, or outdated disclosure notices before customer release.',
      'This tool reads PDF cross-reference tables locally, decouples unneeded page object references, and creates a pristine new document stream with remaining pages.'
    ],
    principles: [
      {
        heading: 'Object Reference Pruning',
        description: 'Rather than blacking out pages, removing pages updates the /Pages dictionary and /Count attribute, physically eliminating unreferenced data.',
        details: [
          'Guarantees excised data cannot be recovered by inspection of PDF stream tags.',
          'Automatically re-indexes page reference numbers.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload Document', instruction: 'Drag and drop your multi-page PDF into the browser workspace.' },
      { step: 2, title: 'Select Pages to Remove', instruction: 'Click individual page preview thumbnails or type ranges like "2, 4-6".' },
      { step: 3, title: 'Download Cleaned PDF', instruction: 'Click "Remove Pages & Download" to retrieve the sanitized file.' }
    ],
    examples: [
      {
        title: 'Removing Draft Watermarked Cover',
        scenario: 'A finalized 12-page validation report contains an unwanted cover page and back-cover appendix.',
        input: 'Pages: 1, 12 selected for deletion',
        output: '10-page finalized report starting cleanly on page 2.',
        explanation: 'The new document starts directly with the executive summary.'
      }
    ],
    bestPractices: [
      'Always verify that at least one page remains in the final document.',
      'Check page numbers on the visual cards to avoid accidentally deleting critical data.'
    ],
    faqs: [
      {
        question: 'Are deleted pages recoverable?',
        answer: 'No. The newly generated PDF only includes the streams of the remaining pages.'
      }
    ]
  },

  'pdf-extract-pages': {
    title: 'PDF Page Extraction: Segment Splitting & Archiving',
    badge: 'PDF Organization & Content Extraction',
    readingTime: '4 min read',
    overview: [
      'Extracting specific chapters, single certificates of analysis, or invoice pages from voluminous PDF binders is essential for compliance and recordkeeping.',
      'Extract pages into either a single consolidated PDF or a ZIP archive containing individual one-page PDF files.'
    ],
    principles: [
      {
        heading: 'Independent Stream Reconstitution',
        description: 'Each extracted page inherits necessary font descriptors, resource dictionaries, and media boxes to ensure standalone rendering.',
        details: [
          'Preserves vector fonts and embedded raster images at native resolution.',
          'Zero re-compression artifacts.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Choose Document', instruction: 'Select the source PDF document.' },
      { step: 2, title: 'Pick Pages', instruction: 'Select pages visually or input ranges such as "1-3, 5".' },
      { step: 3, title: 'Select Output Format', instruction: 'Choose Single Merged PDF or Separate PDFs (ZIP archive).' },
      { step: 4, title: 'Export', instruction: 'Click Extract to save your chosen pages.' }
    ],
    examples: [
      {
        title: 'Extracting Certificates of Analysis',
        scenario: 'A 50-page regulatory dossier has COA certificates on pages 42 through 45.',
        input: 'Range: 42-45',
        output: 'A compact 4-page standalone COA document.',
        explanation: 'Isolates the release certificates without sending full dossiers to vendors.'
      }
    ],
    bestPractices: [
      'Use ZIP mode when you need to distribute individual pages to different team members.'
    ],
    faqs: [
      {
        question: 'Does page extraction change the original file?',
        answer: 'Never. The original file remains untouched on your local disk.'
      }
    ]
  },

  'pdf-organize': {
    title: 'Visual PDF Organization: Page Reordering & Layout',
    badge: 'PDF Organization & Binder Assembly',
    readingTime: '4 min read',
    overview: [
      'Reordering scanned pages, fixing upside-down orientation, duplicating contract exhibits, or inserting blank separator pages can be completed entirely visually.',
      'Runs locally in browser memory without sending private records over the internet.'
    ],
    principles: [
      {
        heading: 'Non-Destructive Page Tree Manipulation',
        description: 'PDF pages are treated as modular nodes in an array, allowing rapid transposition and rotation angle specification.',
        details: [
          'Rotation angles are written to the /Rotate metadata key without re-rasterizing text.',
          'Blank pages are constructed with ISO standard dimensions.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Open Document', instruction: 'Upload your PDF to populate the page cards grid.' },
      { step: 2, title: 'Organize', instruction: 'Use Move Left/Right buttons, rotate icons, or duplicate pages.' },
      { step: 3, title: 'Save', instruction: 'Click "Save & Download Organized PDF".' }
    ],
    examples: [
      {
        title: 'Fixing Scanned Duplex Order',
        scenario: 'A double-sided batch was scanned with reverse odd/even page order.',
        input: 'Reordered page cards in visual workspace',
        output: 'Chronologically sequenced PDF document',
        explanation: 'Fixes scan feeding order errors in seconds.'
      }
    ],
    bestPractices: [
      'Review page numbers before compiling to ensure exhibit flow.'
    ],
    faqs: [
      {
        question: 'Does rotating a page reduce resolution?',
        answer: 'No. Page rotation modifies the viewport orientation matrix without altering image or text streams.'
      }
    ]
  },

  'pdf-scan': {
    title: 'Camera Scan to PDF: Capture, Filters & Multi-Page PDF',
    badge: 'Document Capture & Mobile Scanning',
    readingTime: '4 min read',
    overview: [
      'Transform physical lab records, equipment logbooks, invoices, and certificates into multi-page PDF documents using your computer or mobile camera.',
      'Features real-time contrast enhancement, grayscale, and document threshold filters for crisp text reproduction.'
    ],
    principles: [
      {
        heading: 'Adaptive Document Thresholding',
        description: 'Luminance filtering separates ink strokes from paper background shadows and uneven room lighting.',
        details: [
          'High-contrast mode eliminates shadows while retaining fine pen ink.',
          'Standard A4 and US Letter page bounding boxes auto-fit captured imagery.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Activate Camera', instruction: 'Allow camera permissions and position document in frame.' },
      { step: 2, title: 'Capture Pages', instruction: 'Click "Capture Page" for each physical page.' },
      { step: 3, title: 'Adjust Filter', instruction: 'Select High Contrast, B&W Threshold, or Normal Color.' },
      { step: 4, title: 'Download PDF', instruction: 'Click "Download Scanned PDF" to compile the multi-page file.' }
    ],
    examples: [
      {
        title: 'Laboratory Notebook Scanning',
        scenario: 'A chemist needs to archive 3 handwritten balance log pages into a PDF.',
        input: '3 captured camera frames with High-Contrast filter',
        output: 'Clean, printable multi-page PDF document',
        explanation: 'Converts physical records into archived digital assets.'
      }
    ],
    bestPractices: [
      'Hold the camera parallel to the document under uniform lighting for optimal sharpness.'
    ],
    faqs: [
      {
        question: 'Are captured photos stored on any server?',
        answer: 'No. Video capture and PDF assembly occur 100% in your local browser sandbox.'
      }
    ]
  },

  'pdf-compress': {
    title: 'PDF Compression: Stream Optimization & DPI Scaling',
    badge: 'PDF Optimization & Bandwidth Reduction',
    readingTime: '5 min read',
    overview: [
      'Large PDF documents packed with high-resolution scanned graphics and redundant font tables often exceed corporate email limits and government portal thresholds.',
      'This tool recompresses raster streams with configurable quality presets while preserving typography and vector lines.'
    ],
    principles: [
      {
        heading: 'Dual-Pass Stream Optimization',
        description: 'Recompresses embedded JPEG/PNG image data through HTML5 Canvas downsampling while consolidating object streams.',
        details: [
          'Extreme: ~96 DPI, 50% quality (maximum size reduction).',
          'Recommended: ~140 DPI, 70% quality (balanced clarity and file size).',
          'High Quality: ~190 DPI, 88% quality (print-grade detail).'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload Large PDF', instruction: 'Choose the heavy PDF file you wish to shrink.' },
      { step: 2, title: 'Choose Preset', instruction: 'Select Extreme, Recommended, or High Quality.' },
      { step: 3, title: 'Compress', instruction: 'Click Compress PDF Now to process and view savings metrics.' }
    ],
    examples: [
      {
        title: 'Shrinking 28 MB Dossier for Email Attachment',
        scenario: 'An analytical submission dossier is 28 MB and rejected by email gateways.',
        input: '28 MB PDF with Recommended preset',
        output: '6.4 MB PDF (-77% reduction)',
        explanation: 'Enables smooth email delivery without noticeable loss in text readability.'
      }
    ],
    bestPractices: [
      'Use Recommended preset for standard business documents; use High Quality for documents with microscopic chart legends.'
    ],
    faqs: [
      {
        question: 'Will text become blurry?',
        answer: 'No. Vector text and fonts remain crisp; only bitmap images and scan layers are optimized.'
      }
    ]
  },

  'pdf-repair': {
    title: 'PDF Repair & Recovery: XRef Rebuilding & Stream Sanitization',
    badge: 'PDF Optimization & File Recovery',
    readingTime: '5 min read',
    overview: [
      'Network transfer interruptions, bad disk sectors, and buggy export plugins frequently produce corrupt PDFs with broken XRef offsets or missing EOF markers.',
      'This tool executes fault-tolerant binary parsing to reconstruct catalog dictionaries and recover accessible document pages.'
    ],
    principles: [
      {
        heading: 'XRef Table Reconstruction',
        description: 'Bypasses broken byte-offset tables by scanning raw binary byte markers (%PDF, obj, endobj) to synthesize a fresh valid xref directory.',
        details: [
          'Sanitizes invalid trailer dictionaries.',
          'Re-encodes page trees into ISO 32000 compliant format.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Select Damaged File', instruction: 'Upload the unreadable or corrupted PDF.' },
      { step: 2, title: 'Run Diagnostics', instruction: 'Click "Run Diagnostics & Repair" to inspect structural headers.' },
      { step: 3, title: 'Download Repaired PDF', instruction: 'Save the recovered document.' }
    ],
    examples: [
      {
        title: 'Recovering Truncated Download PDF',
        scenario: 'A download stopped at 98%, causing Adobe Reader to throw "The file is damaged and could not be repaired".',
        input: 'Truncated PDF buffer',
        output: 'Repaired PDF with reconstructed trailer markers',
        explanation: 'Allows user to view and extract intact pages.'
      }
    ],
    bestPractices: [
      'Review recovered page count against original document expectations.'
    ],
    faqs: [
      {
        question: 'Can all damaged PDFs be fixed?',
        answer: 'PDFs with broken indexes, truncated trailers, or malformed headers can be repaired. Files completely overwritten with zeros cannot be reconstructed.'
      }
    ]
  },

  'pdf-ocr': {
    title: 'OCR PDF: Optical Character Recognition & Searchable Layers',
    badge: 'PDF Optimization & Text Recognition',
    readingTime: '5 min read',
    overview: [
      'Scanned documents, paper faxes, and photocopies contain image bitmaps rather than searchable text, preventing users from copying clauses or searching keywords.',
      'This tool recognizes text characters in-browser, generates searchable text layers, and allows exporting to TXT or Searchable PDF.'
    ],
    principles: [
      {
        heading: 'In-Browser Glyph Recognition',
        description: 'Extracts spatial text coordinate streams and maps pixel contours to UTF-8 character codes client-side.',
        details: [
          '100% private: no data transmitted to third-party OCR API endpoints.',
          'Generates searchable PDF with mapped coordinate overlays.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload Scanned Document', instruction: 'Choose your scanned PDF file.' },
      { step: 2, title: 'Start OCR', instruction: 'Click "Start In-Browser OCR Recognition".' },
      { step: 3, title: 'Inspect & Search', instruction: 'Review recognized text page-by-page.' },
      { step: 4, title: 'Export', instruction: 'Copy text, download TXT, or download Searchable PDF.' }
    ],
    examples: [
      {
        title: 'Making a Scanned Certificate Searchable',
        scenario: 'A scanned ISO 17025 certificate needs to be indexed and searched by keyword.',
        input: 'Scanned image PDF',
        output: 'Searchable PDF with selectable text layer',
        explanation: 'Enables Ctrl+F searchability and text copy-pasting.'
      }
    ],
    bestPractices: [
      'For best OCR accuracy, ensure scans are at least 150-300 DPI and upright.'
    ],
    faqs: [
      {
        question: 'Is there any character limit or fee for OCR?',
        answer: 'None! Processing runs on your device CPU with zero fees or character limits.'
      }
    ]
  },

  'powerpoint-to-pdf': {
    title: 'PowerPoint to PDF: Slide Vectorization & Handouts',
    badge: 'Document Converters & Presentations',
    readingTime: '4 min read',
    overview: [
      'Converts PowerPoint presentations (.pptx) into universally viewable, crisp vector PDF slide decks without requiring Microsoft Office installation.',
      'Preserves titles, bullet hierarchies, presenter speaker notes, and widescreen 16:9 layouts.'
    ],
    principles: [
      {
        heading: 'OpenXML Slide Parsing',
        description: 'Unpacks ppt/slides/slide*.xml elements, extracts text shapes, and maps them to PDF standard typographical points.',
        details: [
          'Supports 16:9 widescreen and 4:3 projector formats.',
          'Provides Handouts mode with speaker note lines.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload PPTX', instruction: 'Select your PowerPoint presentation file.' },
      { step: 2, title: 'Customize Layout', instruction: 'Choose aspect ratio (16:9 or 4:3) and slide theme.' },
      { step: 3, title: 'Download PDF', instruction: 'Click "Convert PowerPoint to PDF" to generate the presentation.' }
    ],
    examples: [
      {
        title: 'Exporting Slide Deck for Regulatory Audits',
        scenario: 'A slide deck outlining method validation needs to be distributed as a read-only PDF.',
        input: 'Validation_Overview.pptx',
        output: 'Validation_Overview-slides.pdf',
        explanation: 'Generates standardized slides viewable on all mobile and desktop devices.'
      }
    ],
    bestPractices: [
      'Choose Widescreen 16:9 for modern laptop and monitor presentations.'
    ],
    faqs: [
      {
        question: 'Can I convert PPTX on Mac, Linux, or mobile?',
        answer: 'Yes! The converter runs entirely in any modern browser without needing Microsoft Office.'
      }
    ]
  },

  'pdf-edit': {
    title: 'PDF Editing & Annotation: Drawing, Highlights & Text Stamps',
    badge: 'PDF Editing & Document Markup',
    readingTime: '5 min read',
    overview: [
      'Annotating contract clauses, drawing revision arrows, highlighting critical pharmacopoeial requirements, or stamping text notes onto PDF documents.',
      'Burns annotations directly into the PDF coordinate system for universal compatibility across all PDF readers.'
    ],
    principles: [
      {
        heading: 'Vector Annotation Burning',
        description: 'Drawings, highlighters, and text stamps are compiled into real PDF drawing operators (/Do, /Tj) rather than temporary viewer metadata.',
        details: [
          'Ensures annotations are permanently visible when printed or opened on mobile devices.',
          'Translucent highlighters preserve readability of underlying text.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Open Document', instruction: 'Upload the PDF you wish to annotate.' },
      { step: 2, title: 'Select Tool', instruction: 'Choose Text, Freehand Pen, or Highlighter.' },
      { step: 3, title: 'Apply Edits', instruction: 'Click to place text or drag to highlight clauses.' },
      { step: 4, title: 'Save', instruction: 'Click "Save & Download Edited PDF".' }
    ],
    examples: [
      {
        title: 'Contract Clause Markup',
        scenario: 'A reviewer needs to highlight a 30-day payment term and add a comment box.',
        input: 'Draft Agreement.pdf',
        output: 'Agreement with yellow highlight and teal approval stamp',
        explanation: 'Enables clear visual feedback for counterparties.'
      }
    ],
    bestPractices: [
      'Use the Highlighter tool for existing text and the Pen tool for freehand signatures or checkmarks.'
    ],
    faqs: [
      {
        question: 'Will my annotations disappear if opened in another PDF reader?',
        answer: 'No. Annotations are permanently baked into the PDF content stream.'
      }
    ]
  },

  'pdf-forms': {
    title: 'PDF Form Filler: AcroForms & Interactive Form Flattening',
    badge: 'PDF Editing & Compliance Forms',
    readingTime: '4 min read',
    overview: [
      'Inspect, edit, and fill interactive PDF AcroForms directly in your browser. Supports text boxes, checkboxes, radio groups, and dropdown menus.',
      'Features form flattening to bake filled data permanently into print text for official submission.'
    ],
    principles: [
      {
        heading: 'AcroForm Dictionary Management',
        description: 'Interacts directly with the PDF /AcroForm catalog and /Fields array to populate appearance streams (/AP).',
        details: [
          'Form flattening removes /Widget annotations and converts entries into permanent page text.',
          'Data can be exported to standard JSON for database integration.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload Form', instruction: 'Open your interactive PDF form document.' },
      { step: 2, title: 'Fill Fields', instruction: 'Enter text, toggle checkboxes, or pick dropdown options.' },
      { step: 3, title: 'Flatten (Optional)', instruction: 'Check "Flatten Form" if you want to lock fields from further editing.' },
      { step: 4, title: 'Download', instruction: 'Save the completed PDF or export data as JSON.' }
    ],
    examples: [
      {
        title: 'Filling QA Batch Release Form',
        scenario: 'An auditor fills batch numbers and checkmarks on a standard form.',
        input: 'Release_Form.pdf with field inputs',
        output: 'Permanently flattened submission-ready PDF',
        explanation: 'Prevents tampering after formal authorization.'
      }
    ],
    bestPractices: [
      'Flatten forms before sending to external clients or regulatory bodies.'
    ],
    faqs: [
      {
        question: 'What if my PDF doesn’t have existing form fields?',
        answer: 'The tool provides a template with custom field insertion capabilities.'
      }
    ]
  },

  'pdf-sign': {
    title: 'PDF Electronic Signature: Visual Stamps & Legal Guidelines',
    badge: 'PDF Security & Document Authorization',
    readingTime: '5 min read',
    overview: [
      'Apply electronic visual signatures (e-Signatures) to contracts, approvals, and reports using smooth drawing pads, cursive typography, or image stamps.',
      'Features customizable audit certificate badges displaying signer identity, UTC timestamp, and verification statements.'
    ],
    principles: [
      {
        heading: 'Electronic vs. Cryptographic Digital Signatures',
        description: 'Crucial distinction between visual e-signatures and PKI cryptographic signatures.',
        details: [
          'Visual e-Signature: A visual signature stamp and timestamp box verifying signatory intent under ESIGN and UETA acts.',
          'Cryptographic Digital Signature: Uses X.509 certificates and cryptographic hash digests (eIDAS / AATL). For transactions requiring qualified PKI hardware, dedicated certificate signing is required.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload PDF', instruction: 'Select the document requiring signature.' },
      { step: 2, title: 'Create Signature', instruction: 'Draw on the canvas pad, type your legal name, or upload an image.' },
      { step: 3, title: 'Position Stamp', instruction: 'Select target page and adjust X/Y coordinates or scale.' },
      { step: 4, title: 'Sign & Download', instruction: 'Click "Sign & Download Document".' }
    ],
    examples: [
      {
        title: 'Signing an NDA Agreement',
        scenario: 'An executive signs an NDA on page 4 with timestamp certificate details.',
        input: 'Contract.pdf',
        output: 'Signed contract with cursive signature and timestamp audit badge',
        explanation: 'Satisfies standard commercial e-signing requirements.'
      }
    ],
    bestPractices: [
      'Include the audit timestamp badge to provide a clear record of when the signature was placed.'
    ],
    faqs: [
      {
        question: 'Is this electronic signature legally binding?',
        answer: 'Under the US ESIGN Act and European eIDAS basic provisions, electronic signatures demonstrating intent are legally recognized for most commercial agreements.'
      }
    ]
  },

  'pdf-summarizer': {
    title: 'AI PDF Summarizer: NLP Insights & Document Intelligence',
    badge: 'PDF Intelligence & Analytics',
    readingTime: '5 min read',
    overview: [
      'Extract executive briefs, key analytical findings, action items, and technical metrics from multi-page PDF documents.',
      'Includes interactive natural language Q&A allowing you to ask questions about the document and receive instant extracted answers.'
    ],
    principles: [
      {
        heading: 'Extractive NLP & Information Density',
        description: 'Analyzes document sentence centrality, frequency weights, and structural section headers client-side with zero data transmission.',
        details: [
          'Calculates reading time, word count, and words-per-page density.',
          'Answers queries using context matching across parsed sentences.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload Document', instruction: 'Choose any report, dossier, contract, or manual.' },
      { step: 2, title: 'Generate Insights', instruction: 'Select summary depth and click "Generate AI Summary".' },
      { step: 3, title: 'Query Document', instruction: 'Type specific questions into the Q&A box.' },
      { step: 4, title: 'Export', instruction: 'Copy structured Markdown summary.' }
    ],
    examples: [
      {
        title: 'Summarizing a 40-Page Clinical Trial Report',
        scenario: 'A researcher needs an immediate briefing of primary efficacy endpoints.',
        input: 'Trial_Results.pdf',
        output: '4-bullet executive brief, key findings, and action items',
        explanation: 'Extracts critical conclusions in seconds.'
      }
    ],
    bestPractices: [
      'Use the Q&A box to check specific metrics like percentage recovery or acceptance limits.'
    ],
    faqs: [
      {
        question: 'Is my confidential PDF uploaded to any third-party AI server?',
        answer: 'No! The summarization engine runs privately in your local browser memory.'
      }
    ]
  },

  'pdf-translate': {
    title: 'PDF Document Translation: Multilingual Extraction & Export',
    badge: 'PDF Intelligence & Global Languages',
    readingTime: '5 min read',
    overview: [
      'Translate PDF documents page-by-page into Spanish, French, German, Portuguese, Italian, Chinese, Japanese, Arabic, and other world languages.',
      'Features dual-pane side-by-side comparison, inline text editing, and export to translated PDF.'
    ],
    principles: [
      {
        heading: 'Preserving Document Pagination',
        description: 'Extracts text streams per page, translates structural paragraphs, and generates a corresponding translated PDF page for each original page.',
        details: [
          'Dual-column verification allows reviewing source text alongside translations.',
          'Users can manually adjust phrasing before final compilation.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Open PDF', instruction: 'Select your source PDF document.' },
      { step: 2, title: 'Choose Language', instruction: 'Select target language from the dropdown menu.' },
      { step: 3, title: 'Translate & Review', instruction: 'Inspect side-by-side translations page-by-page.' },
      { step: 4, title: 'Download', instruction: 'Save translated PDF document.' }
    ],
    examples: [
      {
        title: 'Translating SOP for Spanish Facility',
        scenario: 'A standard operating procedure in English needs to be reviewed by Spanish operators.',
        input: 'SOP_HPLC_Cleaning.pdf to Spanish (Español)',
        output: 'Spanish translated PDF report',
        explanation: 'Enables cross-border operational compliance.'
      }
    ],
    bestPractices: [
      'Review technical domain terms in the editable pane prior to saving.'
    ],
    faqs: [
      {
        question: 'Can I edit the translation before downloading?',
        answer: 'Yes! The right-hand column is completely editable.'
      }
    ]
  },

  'pdf-to-markdown': {
    title: 'PDF to Markdown: Structural Parsing & Formatting',
    badge: 'PDF Intelligence & Developer Tools',
    readingTime: '4 min read',
    overview: [
      'Convert PDF documentation, research papers, and technical guides into clean, portable GitHub-flavored Markdown (.md).',
      'Intelligently detects headings (H1, H2, H3), bullet points, numbered lists, code blocks, and data tables.'
    ],
    principles: [
      {
        heading: 'Spatial & Typographical Layout Analysis',
        description: 'Analyzes font sizes, line heights, and horizontal bounding coordinates to reconstruct true document hierarchy.',
        details: [
          'Large font titles become Markdown # headers.',
          'Multi-column tabular rows convert into GitHub Markdown tables | col | col |.',
          'Bullet markers are converted to standard hyphen lists.'
        ]
      }
    ],
    stepByStepGuide: [
      { step: 1, title: 'Upload PDF', instruction: 'Select the PDF document to convert.' },
      { step: 2, title: 'Review in Split View', instruction: 'Inspect raw Markdown alongside the rendered preview.' },
      { step: 3, title: 'Copy or Download', instruction: 'Copy to clipboard or download the .md file.' }
    ],
    examples: [
      {
        title: 'Converting Technical Whitepaper to Documentation',
        scenario: 'A developer needs to convert a PDF manual into a GitHub documentation wiki.',
        input: 'API_Guide.pdf',
        output: 'API_Guide.md with headers, tables, and code snippets',
        explanation: 'Saves hours of manual re-typing and re-formatting.'
      }
    ],
    bestPractices: [
      'Use the split-view editor to tweak any tabular cell alignment before exporting.'
    ],
    faqs: [
      {
        question: 'Does it support Markdown tables?',
        answer: 'Yes! Rows with multiple columns are automatically formatted with Markdown pipe delimiters.'
      }
    ]
  }
};
