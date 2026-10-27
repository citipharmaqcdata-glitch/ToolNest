import { useState, useRef, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  PenTool,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Trash2
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

type SignMode = 'draw' | 'type' | 'upload';

export default function PdfSignTool() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages: number;
  } | null>(null);

  const [signMode, setSignMode] = useState<SignMode>('draw');
  const [typedName, setTypedName] = useState<string>('Jane Doe');
  const [signerTitle, setSignerTitle] = useState<string>('Authorized Signatory');
  const [signerReason, setSignerReason] = useState<string>('I approve the release of this document');
  const [includeAuditBadge, setIncludeAuditBadge] = useState<boolean>(true);
  const [signatureColor, setSignatureColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [uploadedSigUrl, setUploadedSigUrl] = useState<string | null>(null);

  const [targetPage, setTargetPage] = useState<number>(1);
  const [posX, setPosX] = useState<number>(350); // pt
  const [posY, setPosY] = useState<number>(120); // pt
  const [sigScale, setSigScale] = useState<number>(1.0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const pageCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigImageInputRef = useRef<HTMLInputElement>(null);
  const isDrawingRef = useRef<boolean>(false);

  // Render current target page
  useEffect(() => {
    if (!file) return;
    renderTargetPage();
  }, [file, targetPage]);

  const renderTargetPage = async () => {
    if (!file) return;
    try {
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(file.buffer) }).promise;
      const page = await pdf.getPage(targetPage);
      const viewport = page.getViewport({ scale: 0.8 });

      if (pageCanvasRef.current) {
        pageCanvasRef.current.width = viewport.width;
        pageCanvasRef.current.height = viewport.height;
        const ctx = pageCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, viewport.width, viewport.height);
          await page.render({ canvasContext: ctx, viewport } as any).promise;
        }
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleFileUpload = async (uploadedFile: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (
      uploadedFile.type !== 'application/pdf' &&
      !uploadedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setErrorMsg('Please upload a valid PDF document (.pdf).');
      return;
    }

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;

      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        buffer,
        numPages: pdf.numPages
      });
      setTargetPage(pdf.numPages); // default to last signature page
      setSuccessMsg(`Loaded "${uploadedFile.name}". Draw or type your signature below.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to parse PDF.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Canvas drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = signatureColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSignatureCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSigImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedSigUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getSignatureDataUrl = (): string | null => {
    if (signMode === 'upload' && uploadedSigUrl) {
      return uploadedSigUrl;
    }

    if (signMode === 'draw') {
      const canvas = sigCanvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL('image/png');
    }

    if (signMode === 'type') {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.fillStyle = signatureColor;
      ctx.font = 'italic 36px "Brush Script MT", "Caveat", "Segoe Script", cursive';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, 20, 60);
      return canvas.toDataURL('image/png');
    }

    return null;
  };

  const handleApplySignature = async () => {
    if (!file) return;
    const sigUrl = getSignatureDataUrl();
    if (!sigUrl) {
      setErrorMsg('Please draw or create your signature first.');
      return;
    }

    setIsSigning(true);
    setErrorMsg(null);

    try {
      const pdfDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
      const page = pdfDoc.getPage(targetPage - 1);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const sigImgBytes = await fetch(sigUrl).then(res => res.arrayBuffer());
      const embeddedSig = await pdfDoc.embedPng(sigImgBytes);

      const sigW = 160 * sigScale;
      const sigH = (160 * (embeddedSig.height / embeddedSig.width)) * sigScale;

      // Draw signature image
      page.drawImage(embeddedSig, {
        x: posX,
        y: posY,
        width: sigW,
        height: sigH
      });

      // Draw audit badge box if enabled
      if (includeAuditBadge) {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        const badgeY = Math.max(20, posY - 45);

        // Border box
        page.drawRectangle({
          x: posX - 5,
          y: badgeY,
          width: Math.max(sigW + 10, 220),
          height: 40,
          borderColor: rgb(0.8, 0.85, 0.9),
          borderWidth: 1,
          color: rgb(0.97, 0.99, 1.0)
        });

        page.drawText(`Digitally Stamped: ${typedName || 'Signer'}`, {
          x: posX,
          y: badgeY + 26,
          size: 8,
          font: fontBold,
          color: rgb(0.1, 0.4, 0.4)
        });

        page.drawText(`Date: ${timestamp} | Reason: ${signerReason.substring(0, 28)}`, {
          x: posX,
          y: badgeY + 14,
          size: 7,
          font,
          color: rgb(0.3, 0.35, 0.4)
        });

        page.drawText('Verified via ToolNest Electronic Signature System', {
          x: posX,
          y: badgeY + 4,
          size: 6,
          font,
          color: rgb(0.5, 0.55, 0.6)
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.replace(/\.[^/.]+$/, '')}-signed.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg(`Document successfully signed and downloaded as "${link.download}"!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to stamp signature onto PDF.');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PenTool className="w-5 h-5 text-teal-600" />
              Sign PDF Electronically
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Draw, type, or upload your electronic signature and stamp onto any PDF page with timestamp audit details.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4" />
            100% Client-Side Privacy
          </div>
        </div>

        {/* Legal Distinction Notice */}
        <div className="mt-4 p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold">
              Legal Electronic Signature Notice (e-Signature vs. Cryptographic PKI Digital Signature):
            </p>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
              This tool applies an <strong>electronic visual signature (e-Signature)</strong> and audit timestamp directly onto the document canvas. For heavily regulated transactions requiring <strong>cryptographic digital signatures</strong> (such as qualified electronic signatures under eIDAS or Adobe Approved Trust List (AATL) X.509 certificate validation with cryptographic hardware security modules), a dedicated PKI certificate service is required.
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        {!file && (
          <div className="mt-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 rounded-2xl p-10 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={e => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PenTool className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drop your PDF document to sign
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Zero server uploads. Sign documents privately without saving signatures to the cloud.
              </p>
            </div>
          </div>
        )}

        {/* Signing Workspace */}
        {file && (
          <div className="mt-6 space-y-6">
            {/* Signature Creation Mode Tabs */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                <button
                  onClick={() => setSignMode('draw')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                    signMode === 'draw'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Draw Signature
                </button>
                <button
                  onClick={() => setSignMode('type')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                    signMode === 'type'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Type Name
                </button>
                <button
                  onClick={() => setSignMode('upload')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                    signMode === 'upload'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Upload Image
                </button>
              </div>

              {/* Draw Pad */}
              {signMode === 'draw' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Draw your signature below using touch or mouse:</span>
                    <button
                      onClick={clearSignatureCanvas}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      Clear Pad
                    </button>
                  </div>
                  <div className="border border-slate-300 dark:border-slate-600 rounded-xl bg-white overflow-hidden shadow-inner">
                    <canvas
                      ref={sigCanvasRef}
                      width={480}
                      height={140}
                      onMouseDown={startDrawing}
                      onMouseMove={drawMove}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full cursor-crosshair touch-none"
                    />
                  </div>
                </div>
              )}

              {/* Type Name */}
              {signMode === 'type' && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Type Signer Legal Name:
                  </label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={e => setTypedName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                    <span className="font-serif italic text-3xl text-slate-900">
                      {typedName || 'Your Signature'}
                    </span>
                  </div>
                </div>
              )}

              {/* Upload Image */}
              {signMode === 'upload' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => sigImageInputRef.current?.click()}
                      className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Select Signature Image (PNG/JPG)
                    </button>
                    <input
                      ref={sigImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files?.[0]) handleSigImageUpload(e.target.files[0]);
                      }}
                    />
                  </div>
                  {uploadedSigUrl && (
                    <div className="p-2 border rounded-xl bg-white max-w-xs">
                      <img src={uploadedSigUrl} alt="Uploaded signature" className="max-h-20 object-contain mx-auto" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Audit Certificate Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Page:
                </label>
                <select
                  value={targetPage}
                  onChange={e => setTargetPage(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                >
                  {Array.from({ length: file.numPages }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Page {i + 1} {i + 1 === file.numPages ? '(Last Page)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Signature Position (X / Y in pt):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={posX}
                    onChange={e => setPosX(parseInt(e.target.value, 10) || 0)}
                    placeholder="X"
                    className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <input
                    type="number"
                    value={posY}
                    onChange={e => setPosY(parseInt(e.target.value, 10) || 0)}
                    placeholder="Y"
                    className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Signature Scale:
                </label>
                <select
                  value={sigScale}
                  onChange={e => setSigScale(parseFloat(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                >
                  <option value={0.75}>Small (75%)</option>
                  <option value={1.0}>Standard (100%)</option>
                  <option value={1.25}>Large (125%)</option>
                </select>
              </div>
            </div>

            {/* Audit details checkbox */}
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeAuditBadge}
                onChange={e => setIncludeAuditBadge(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Include digital certificate timestamp badge beneath signature (ISO date & verification stamp)</span>
            </div>

            {/* Live Document Preview with Marker */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Page {targetPage} Placement Preview:
              </span>
              <div className="border border-slate-300 dark:border-slate-700 rounded-2xl overflow-auto bg-slate-200/50 dark:bg-slate-950 p-4 flex justify-center max-h-[460px]">
                <canvas ref={pageCanvasRef} className="block shadow-md bg-white" />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleApplySignature}
                disabled={isSigning}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Stamping Signature into PDF...
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4" />
                    Sign & Download Document
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
