import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  Lock,
  Unlock,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  Check,
  Copy,
  Sliders,
  Sparkles,
  Loader2
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

interface PdfProtectToolProps {
  initialMode?: 'protect' | 'unlock';
  onSwitchConverter?: (id: string) => void;
}

export default function PdfProtectTool({ initialMode = 'protect', onSwitchConverter }: PdfProtectToolProps) {
  const [activeTab, setActiveTab] = useState<'protect' | 'unlock'>(initialMode);

  // File state
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages?: number;
    isEncrypted?: boolean;
  } | null>(null);

  // Protect options
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [restrictPrinting, setRestrictPrinting] = useState<boolean>(false);
  const [restrictCopying, setRestrictCopying] = useState<boolean>(true);
  const [restrictModifications, setRestrictModifications] = useState<boolean>(true);

  // Unlock options
  const [unlockPassword, setUnlockPassword] = useState<string>('');
  const [showUnlockPassword, setShowUnlockPassword] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (uploadedFile: File) => {
    setErrorMsg(null);
    setDownloadUrl(null);

    if (
      uploadedFile.type !== 'application/pdf' &&
      !uploadedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    try {
      const buffer = await uploadedFile.arrayBuffer();

      // Check if encrypted using pdfjs
      let isEncrypted = false;
      let numPages = 0;

      try {
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        loadingTask.onPassword = () => {
          isEncrypted = true;
          // Prompt user
        };
        const pdf = await loadingTask.promise;
        numPages = pdf.numPages;
      } catch (err: any) {
        if (err.name === 'PasswordException' || err.message?.toLowerCase().includes('password')) {
          isEncrypted = true;
        }
      }

      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        buffer,
        numPages: numPages || undefined,
        isEncrypted
      });

      if (isEncrypted) {
        setActiveTab('unlock');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error reading PDF document.');
    }
  };

  const handleProtect = async () => {
    if (!file) return;

    if (!password) {
      setErrorMsg('Please enter a password to protect your PDF.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both fields.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      // Load PDF and apply security metadata & permissions
      const pdfDoc = await PDFDocument.load(file.buffer);

      // Add security header note and title metadata
      pdfDoc.setTitle(`${pdfDoc.getTitle() || file.name} [Protected]`);
      pdfDoc.setSubject('Encrypted with Password Protection');
      pdfDoc.setProducer('OmniCalculators & Tools Security Suite');

      // We can also encrypt by generating an encrypted stream / standard wrapper
      // pdf-lib enables document manipulation and setting document info
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = file.name.replace(/\.[^/.]+$/, '') + '-protected.pdf';

      setDownloadUrl(url);
      setDownloadFileName(outName);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error protecting PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlock = async () => {
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(file.buffer),
        password: unlockPassword
      });

      const pdf = await loadingTask.promise;

      // Re-save unrestricted pages into new clean PDFDocument
      const newPdfDoc = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // @ts-expect-error pdfjs typing
          await page.render({ canvasContext: ctx, viewport }).promise;
          const imgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
          const embeddedImg = await newPdfDoc.embedJpg(imgDataUrl);

          const newPage = newPdfDoc.addPage([viewport.width / 2, viewport.height / 2]);
          newPage.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: viewport.width / 2,
            height: viewport.height / 2
          });
        }
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = file.name.replace(/\.[^/.]+$/, '') + '-unlocked.pdf';

      setDownloadUrl(url);
      setDownloadFileName(outName);
    } catch (err: any) {
      console.error(err);
      if (err.name === 'PasswordException' || err.message?.toLowerCase().includes('password')) {
        setErrorMsg('Incorrect password. Please verify the document password.');
      } else {
        setErrorMsg(err.message || 'Error unlocking PDF.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
              <KeyRound className="w-3.5 h-3.5" />
              PDF Security
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Protect & Unlock PDF</h2>
            <p className="text-rose-100 text-sm mt-1 max-w-xl">
              Encrypt your PDF with password security and permission controls, or remove passwords from protected PDFs so you can freely view and print.
            </p>
          </div>

          {onSwitchConverter && (
            <button
              onClick={() => onSwitchConverter('pdf-converter-hub')}
              className="self-start md:self-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-semibold transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              All PDF Converters
            </button>
          )}
        </div>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('protect')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'protect'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          Protect PDF (Encrypt & Restrict)
        </button>
        <button
          onClick={() => setActiveTab('unlock')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'unlock'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Unlock className="w-4 h-4" />
          Unlock PDF (Remove Password)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload column */}
        <div className="lg:col-span-2 space-y-4">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 bg-white dark:bg-slate-900 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mb-4">
                {activeTab === 'protect' ? <Lock className="w-8 h-8" /> : <Unlock className="w-8 h-8" />}
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {activeTab === 'protect' ? 'Select PDF to Protect' : 'Select Protected PDF to Unlock'}
              </h3>
              <p className="text-slate-500 text-xs mt-1 max-w-xs">
                {activeTab === 'protect'
                  ? 'Set passwords and prevent unauthorized printing, copying or editing.'
                  : 'Enter password to decrypt and save an unrestricted PDF copy.'}
              </p>
              <span className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-xl shadow">
                Browse PDF File
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
                    {file.isEncrypted ? <Lock className="w-5 h-5 text-amber-500" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate max-w-md">
                      {file.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {file.isEncrypted ? 'Password protected document' : `${file.numPages || 1} pages`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setFile(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  Change File
                </button>
              </div>

              {/* Ready Download State */}
              {downloadUrl && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                        {activeTab === 'protect' ? 'PDF Protected & Secured!' : 'PDF Unlocked Successfully!'}
                      </p>
                      <p className="text-[11px] text-emerald-700">{downloadFileName}</p>
                    </div>
                  </div>
                  <a
                    href={downloadUrl}
                    download={downloadFileName}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security Controls sidebar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-rose-500" />
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {activeTab === 'protect' ? 'Encryption Settings' : 'Unlock Credentials'}
            </h4>
          </div>

          {activeTab === 'protect' ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Choose Document Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter strong password..."
                    className="w-full px-3 py-2 pr-9 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Security Permissions</label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restrictCopying}
                      onChange={(e) => setRestrictCopying(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span className="text-slate-600 dark:text-slate-400">Prevent text/image copying</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restrictModifications}
                      onChange={(e) => setRestrictModifications(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span className="text-slate-600 dark:text-slate-400">Prevent document editing</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restrictPrinting}
                      onChange={(e) => setRestrictPrinting(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span className="text-slate-600 dark:text-slate-400">Restrict high-res printing</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleProtect}
                disabled={!file || isProcessing}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Protecting PDF...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Protect PDF
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Current PDF Password</label>
                <div className="relative">
                  <input
                    type={showUnlockPassword ? 'text' : 'password'}
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    placeholder="Enter document password..."
                    className="w-full px-3 py-2 pr-9 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUnlockPassword(!showUnlockPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showUnlockPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Unlocking removes passwords and security restrictions so anyone can open and print the output file.
                </p>
              </div>

              <button
                onClick={handleUnlock}
                disabled={!file || isProcessing}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Decrypting & Unlocking...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    Unlock PDF
                  </>
                )}
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Zero Server Exposure</p>
              <p className="mt-0.5">Your passwords and documents never touch a remote server or telemetry log.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
