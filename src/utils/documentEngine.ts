import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

export interface DocumentInspection {
  formatName: string;
  detectedType: string;
  metadata: {
    title?: string;
    author?: string;
    date?: string;
    subject?: string;
    pageCount?: number;
    wordCount?: number;
    sheetCount?: number;
  };
  textContent: string;
  htmlContent?: string;
  tableData?: any[][];
  warnings: string[];
}

export interface ConvertTarget {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  description: string;
}

// -------------------------------------------------------------
// TEXT TO PDF RENDERER (Using pdf-lib)
// -------------------------------------------------------------
export async function renderTextToPdf(
  title: string,
  text: string,
  meta?: { author?: string; subject?: string }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  if (meta?.author) pdfDoc.setAuthor(meta.author);
  if (meta?.subject) pdfDoc.setSubject(meta.subject);
  pdfDoc.setTitle(title);

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 10;
  const lineHeight = 14;
  const margin = 50;
  const pageWidth = 595.28; // A4
  const pageHeight = 841.89; // A4
  const maxLineWidth = pageWidth - margin * 2;

  // Split text into paragraphs and wrap lines
  const rawLines = text.split('\n');
  const wrappedLines: { text: string; isHeader: boolean }[] = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      wrappedLines.push({ text: '', isHeader: false });
      continue;
    }

    const isHeader = trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.toUpperCase() === trimmed && trimmed.length < 50;
    const cleanLine = trimmed.replace(/^#+\s*/, '');
    const words = cleanLine.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = (isHeader ? helveticaBold : helvetica).widthOfTextAtSize(testLine, isHeader ? 13 : fontSize);
      if (width > maxLineWidth) {
        if (currentLine) wrappedLines.push({ text: currentLine, isHeader });
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      wrappedLines.push({ text: currentLine, isHeader });
    }
  }

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Header Title
  page.drawText(title, {
    x: margin,
    y: y,
    size: 16,
    font: helveticaBold,
    color: rgb(0.06, 0.58, 0.53) // Teal
  });
  y -= 25;

  // Divider line
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: pageWidth - margin, y: y },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.91)
  });
  y -= 20;

  for (const line of wrappedLines) {
    if (y < margin + 40) {
      // New Page
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    if (!line.text) {
      y -= 8;
      continue;
    }

    const currentFont = line.isHeader ? helveticaBold : helvetica;
    const currentSize = line.isHeader ? 12 : fontSize;
    const fontColor = line.isHeader ? rgb(0.09, 0.12, 0.17) : rgb(0.2, 0.25, 0.33);

    page.drawText(line.text, {
      x: margin,
      y: y,
      size: currentSize,
      font: currentFont,
      color: fontColor
    });

    y -= line.isHeader ? 18 : lineHeight;
  }

  return await pdfDoc.save();
}

// -------------------------------------------------------------
// SPREADSHEET TO PDF RENDERER (SheetJS -> pdf-lib Table)
// -------------------------------------------------------------
export async function renderSpreadsheetToPdf(
  title: string,
  rows: any[][]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(title);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 841.89; // Landscape A4
  const pageHeight = 595.28;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Title
  page.drawText(title, {
    x: margin,
    y: y,
    size: 15,
    font: fontBold,
    color: rgb(0.06, 0.58, 0.53)
  });
  y -= 25;

  if (rows.length === 0) {
    page.drawText('(Empty Spreadsheet)', { x: margin, y, size: 10, font, color: rgb(0.5, 0.5, 0.5) });
    return await pdfDoc.save();
  }

  // Calculate Column Widths
  const colCount = Math.min(10, Math.max(...rows.map(r => r.length)));
  const colWidth = contentWidth / colCount;
  const rowHeight = 18;

  for (let r = 0; r < rows.length; r++) {
    if (y < margin + 30) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    const row = rows[r];
    const isHeader = r === 0;

    // Row Background (Zebra Striping)
    if (isHeader) {
      page.drawRectangle({
        x: margin,
        y: y - 4,
        width: contentWidth,
        height: rowHeight,
        color: rgb(0.92, 0.95, 0.96)
      });
    } else if (r % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: y - 4,
        width: contentWidth,
        height: rowHeight,
        color: rgb(0.98, 0.99, 1.0)
      });
    }

    for (let c = 0; c < colCount; c++) {
      const cellVal = String(row[c] !== undefined && row[c] !== null ? row[c] : '').substring(0, 30);
      page.drawText(cellVal, {
        x: margin + c * colWidth + 4,
        y: y,
        size: isHeader ? 8.5 : 8,
        font: isHeader ? fontBold : font,
        color: isHeader ? rgb(0.1, 0.2, 0.25) : rgb(0.25, 0.3, 0.35)
      });
    }

    y -= rowHeight;
  }

  return await pdfDoc.save();
}

// -------------------------------------------------------------
// HTML TO MARKDOWN CONVERTER
// -------------------------------------------------------------
export function convertHtmlToMarkdown(html: string): string {
  let md = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
    .replace(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

  return md.trim();
}

// -------------------------------------------------------------
// RTF (Rich Text Format) TO HTML/TEXT PARSER
// -------------------------------------------------------------
export function parseRtf(rtf: string): { text: string; html: string } {
  // Extract text and basic bold/italic tags
  let text = rtf
    .replace(/\\par[d]?\s*/gi, '\n')
    .replace(/\\tab\s*/gi, '\t')
    .replace(/\\line\s*/gi, '\n')
    .replace(/\\b0\s*/gi, '</b>')
    .replace(/\\b\s*/gi, '<b>')
    .replace(/\\i0\s*/gi, '</i>')
    .replace(/\\i\s*/gi, '<i>')
    .replace(/\{\\*?\\[^{}]*\}/g, '') // remove grouped control blocks
    .replace(/\\[a-z0-9-]+\s?/gi, '') // remove inline control words
    .replace(/[{}]/g, '')
    .trim();

  const html = `<div style="font-family: sans-serif; line-height: 1.6;">${text.replace(/\n/g, '<br/>')}</div>`;
  const plainText = text.replace(/<[^>]+>/g, '');
  return { text: plainText, html };
}

// -------------------------------------------------------------
// DOCX / DOCM / DOTX (OpenXML) PARSER
// -------------------------------------------------------------
export async function parseDocx(buffer: Uint8Array): Promise<{ text: string; html: string }> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(buffer);
  const docXmlFile = loaded.file('word/document.xml');

  if (!docXmlFile) {
    throw new Error('Invalid OpenXML document: word/document.xml not found.');
  }

  const xmlText = await docXmlFile.async('text');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  const paragraphs = xmlDoc.getElementsByTagName('w:p');
  const textLines: string[] = [];
  const htmlParts: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const textNodes = p.getElementsByTagName('w:t');
    let line = '';
    for (let j = 0; j < textNodes.length; j++) {
      line += textNodes[j].textContent || '';
    }

    if (line.trim()) {
      textLines.push(line);
      htmlParts.push(`<p>${line}</p>`);
    }
  }

  return {
    text: textLines.join('\n\n'),
    html: htmlParts.join('\n')
  };
}

// -------------------------------------------------------------
// ODT / SXW (OpenDocument Text) PARSER
// -------------------------------------------------------------
export async function parseOdt(buffer: Uint8Array): Promise<{ text: string; html: string }> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(buffer);
  const contentFile = loaded.file('content.xml');

  if (!contentFile) {
    throw new Error('Invalid OpenDocument: content.xml not found.');
  }

  const xmlText = await contentFile.async('text');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  const pNodes = xmlDoc.getElementsByTagName('text:p');
  const lines: string[] = [];

  for (let i = 0; i < pNodes.length; i++) {
    const content = pNodes[i].textContent || '';
    if (content.trim()) {
      lines.push(content);
    }
  }

  return {
    text: lines.join('\n\n'),
    html: lines.map(l => `<p>${l}</p>`).join('\n')
  };
}

// -------------------------------------------------------------
// EPUB EBOOK PARSER
// -------------------------------------------------------------
export async function parseEpub(buffer: Uint8Array): Promise<{ text: string; html: string; title?: string }> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(buffer);

  let fullHtml = '';
  let fullText = '';
  let bookTitle = 'eBook';

  // Find all xhtml/html content files
  for (const [path, file] of Object.entries(loaded.files)) {
    if ((path.endsWith('.xhtml') || path.endsWith('.html')) && !file.dir) {
      const content = await file.async('text');
      fullHtml += `<div class="chapter">${content}</div>\n`;
      fullText += convertHtmlToMarkdown(content) + '\n\n';
    }
  }

  return {
    text: fullText.trim() || 'No text extracted from EPUB.',
    html: fullHtml || '<div>No content</div>',
    title: bookTitle
  };
}

// -------------------------------------------------------------
// EML (RFC 822/2822) EMAIL PARSER
// -------------------------------------------------------------
export function parseEml(emlContent: string): {
  subject: string;
  from: string;
  to: string;
  date: string;
  textBody: string;
  htmlBody: string;
} {
  const headerSplit = emlContent.indexOf('\r\n\r\n') !== -1 ? emlContent.indexOf('\r\n\r\n') : emlContent.indexOf('\n\n');
  const headerBlock = headerSplit !== -1 ? emlContent.substring(0, headerSplit) : '';
  const bodyBlock = headerSplit !== -1 ? emlContent.substring(headerSplit) : emlContent;

  const getHeader = (name: string): string => {
    const match = headerBlock.match(new RegExp(`^${name}:\\s*(.*)$`, 'im'));
    return match ? match[1].trim() : '';
  };

  const subject = getHeader('Subject') || 'No Subject';
  const from = getHeader('From') || 'Unknown Sender';
  const to = getHeader('To') || 'Unknown Recipient';
  const date = getHeader('Date') || new Date().toUTCString();

  return {
    subject,
    from,
    to,
    date,
    textBody: bodyBlock.trim(),
    htmlBody: `<div style="font-family: sans-serif;">
      <div style="border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="margin: 0; color: #0f172a;">${subject}</h2>
        <div style="font-size: 12px; color: #64748b; margin-top: 6px;">
          <div><strong>From:</strong> ${from}</div>
          <div><strong>To:</strong> ${to}</div>
          <div><strong>Date:</strong> ${date}</div>
        </div>
      </div>
      <div>${bodyBlock.replace(/\n/g, '<br/>')}</div>
    </div>`
  };
}

// -------------------------------------------------------------
// MASTER DOCUMENT INSPECTION AND CONVERSION ENGINE
// -------------------------------------------------------------
export async function inspectDocumentFile(
  toolId: string,
  buffer: Uint8Array,
  fileName: string
): Promise<DocumentInspection> {
  const decoder = new TextDecoder('utf-8');
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  let formatName = toolId.toUpperCase();
  let detectedType = 'Document';
  let textContent = '';
  let htmlContent = '';
  let tableData: any[][] | undefined = undefined;
  const warnings: string[] = [];
  const metadata: DocumentInspection['metadata'] = {};

  // 1. Spreadsheet Formats
  if (['xlsx', 'xls', 'xlsb', 'xlt', 'csv', 'ods'].includes(ext) || toolId.includes('xls') || toolId === 'csv-converter' || toolId === 'ods-converter') {
    formatName = `${ext.toUpperCase()} Spreadsheet`;
    detectedType = 'Spreadsheet / Tabular Data';

    try {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      if (firstSheet) {
        const worksheet = workbook.Sheets[firstSheet];
        tableData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        metadata.sheetCount = workbook.SheetNames.length;
        textContent = tableData.map(row => row.join('\t')).join('\n');
        htmlContent = XLSX.utils.sheet_to_html(worksheet);
      }
    } catch (e: any) {
      warnings.push(`SheetJS parsing notice: ${e.message}`);
      textContent = decoder.decode(buffer.subarray(0, 50000));
    }
  }

  // 2. OpenXML Word Formats
  else if (['docx', 'docm', 'dotx', 'dotm'].includes(ext) || toolId.includes('doc') || toolId.includes('dot')) {
    formatName = `Microsoft Word (${ext.toUpperCase()})`;
    detectedType = 'Word Processing Document';

    try {
      const parsed = await parseDocx(buffer);
      textContent = parsed.text;
      htmlContent = parsed.html;
    } catch {
      // Fallback text extraction
      const raw = decoder.decode(buffer);
      textContent = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      warnings.push('Extracted via stream text scanner.');
    }
  }

  // 3. OpenDocument Text & StarOffice
  else if (['odt', 'sxw'].includes(ext) || toolId === 'odt-converter' || toolId === 'sxw-converter') {
    formatName = 'OpenDocument Text (ODT/SXW)';
    detectedType = 'OpenDocument Standard';
    try {
      const parsed = await parseOdt(buffer);
      textContent = parsed.text;
      htmlContent = parsed.html;
    } catch {
      textContent = decoder.decode(buffer);
    }
  }

  // 4. RTF (Rich Text Format)
  else if (ext === 'rtf' || toolId === 'rtf-converter') {
    formatName = 'Rich Text Format (RTF)';
    detectedType = 'Formatted Document';
    const parsed = parseRtf(decoder.decode(buffer));
    textContent = parsed.text;
    htmlContent = parsed.html;
  }

  // 5. eBooks (EPUB, MOBI, FB2, LIT, PDB)
  else if (['epub', 'mobi', 'fb2', 'lit', 'pdb'].includes(ext) || toolId === 'epub-converter') {
    formatName = `eBook (${ext.toUpperCase()})`;
    detectedType = 'Digital eBook';
    if (ext === 'epub') {
      try {
        const parsed = await parseEpub(buffer);
        textContent = parsed.text;
        htmlContent = parsed.html;
      } catch {
        textContent = decoder.decode(buffer.subarray(0, 50000));
      }
    } else {
      textContent = decoder.decode(buffer.subarray(0, 50000));
      htmlContent = `<pre>${textContent}</pre>`;
    }
  }

  // 6. Emails (EML, MSG)
  else if (['eml', 'msg'].includes(ext) || toolId === 'eml-converter' || toolId === 'msg-converter') {
    formatName = `Email Message (${ext.toUpperCase()})`;
    detectedType = 'Electronic Mail';
    const parsed = parseEml(decoder.decode(buffer));
    metadata.title = parsed.subject;
    metadata.author = parsed.from;
    metadata.date = parsed.date;
    textContent = `Subject: ${parsed.subject}\nFrom: ${parsed.from}\nTo: ${parsed.to}\nDate: ${parsed.date}\n\n${parsed.textBody}`;
    htmlContent = parsed.htmlBody;
  }

  // 7. Web & Markup (HTML, HTM, XHTML, MHTML, XML, MD, LOG, TXT)
  else {
    formatName = `${ext.toUpperCase()} Document`;
    detectedType = 'Text / Web Document';
    const raw = decoder.decode(buffer);
    textContent = raw;
    if (ext === 'md' || toolId === 'markdown-converter') {
      htmlContent = `<pre>${raw}</pre>`;
    } else if (['html', 'htm', 'xhtml', 'mhtml'].includes(ext)) {
      htmlContent = raw;
      textContent = convertHtmlToMarkdown(raw);
    } else {
      htmlContent = `<pre>${raw}</pre>`;
    }
  }

  metadata.wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;

  return {
    formatName,
    detectedType,
    metadata,
    textContent,
    htmlContent,
    tableData,
    warnings
  };
}

// -------------------------------------------------------------
// EXECUTE DOCUMENT CONVERSION TO TARGET FORMAT
// -------------------------------------------------------------
export async function convertDocument(
  inspection: DocumentInspection,
  targetFormat: string,
  baseFileName: string
): Promise<{ blob: Blob; fileName: string }> {
  const cleanBase = baseFileName.replace(/\.[^/.]+$/, '');

  switch (targetFormat) {
    case 'pdf': {
      let pdfBytes: Uint8Array;
      if (inspection.tableData && inspection.tableData.length > 0) {
        pdfBytes = await renderSpreadsheetToPdf(cleanBase, inspection.tableData);
      } else {
        pdfBytes = await renderTextToPdf(cleanBase, inspection.textContent, {
          author: inspection.metadata.author,
          subject: inspection.metadata.subject
        });
      }
      return {
        blob: new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
        fileName: `${cleanBase}.pdf`
      };
    }

    case 'xlsx': {
      const workbook = XLSX.utils.book_new();
      const wsData = inspection.tableData || inspection.textContent.split('\n').map(l => l.split('\t'));
      const worksheet = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      return {
        blob: new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        fileName: `${cleanBase}.xlsx`
      };
    }

    case 'csv': {
      let csvContent = '';
      if (inspection.tableData) {
        csvContent = inspection.tableData.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      } else {
        csvContent = inspection.textContent;
      }
      return {
        blob: new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
        fileName: `${cleanBase}.csv`
      };
    }

    case 'json': {
      let jsonStr = '';
      if (inspection.tableData && inspection.tableData.length > 1) {
        const headers = inspection.tableData[0];
        const dataRows = inspection.tableData.slice(1).map(row => {
          const obj: Record<string, any> = {};
          headers.forEach((h: string, idx: number) => {
            obj[String(h) || `col_${idx}`] = row[idx];
          });
          return obj;
        });
        jsonStr = JSON.stringify(dataRows, null, 2);
      } else {
        jsonStr = JSON.stringify({ documentTitle: cleanBase, content: inspection.textContent }, null, 2);
      }
      return {
        blob: new Blob([jsonStr], { type: 'application/json' }),
        fileName: `${cleanBase}.json`
      };
    }

    case 'html': {
      const htmlBody = inspection.htmlContent || `<div style="white-space: pre-wrap; font-family: sans-serif;">${inspection.textContent}</div>`;
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${cleanBase}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; max-width: 800px; margin: auto; line-height: 1.6; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
  </style>
</head>
<body>
  <h1>${cleanBase}</h1>
  ${htmlBody}
</body>
</html>`;
      return {
        blob: new Blob([fullHtml], { type: 'text/html;charset=utf-8;' }),
        fileName: `${cleanBase}.html`
      };
    }

    case 'md': {
      const mdContent = convertHtmlToMarkdown(inspection.htmlContent || inspection.textContent);
      return {
        blob: new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' }),
        fileName: `${cleanBase}.md`
      };
    }

    case 'txt':
    default: {
      return {
        blob: new Blob([inspection.textContent], { type: 'text/plain;charset=utf-8;' }),
        fileName: `${cleanBase}.txt`
      };
    }
  }
}
