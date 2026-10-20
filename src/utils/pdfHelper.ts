import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker source.
// In modern environments, we point to the bundled or CDN worker
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.0'}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker initialization warning:', e);
  }
}

export { pdfjsLib };
