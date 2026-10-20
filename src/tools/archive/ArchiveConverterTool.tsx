import { useState, useRef } from 'react';
import {
  Archive,
  Upload,
  Download,
  FileText,
  FolderArchive,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Image as ImageIcon,
  File as FileIcon,
  Eye,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
  Lock,
  Layers,
  ArrowRight,
  HardDrive,
  Copy,
  Check,
  X
} from 'lucide-react';
import {
  ArchiveEntry,
  ArchiveInspection,
  inspectAndExtractArchive,
  buildZip,
  buildTar,
  compressGzip,
  formatBytes
} from '../../utils/archiveEngine';

export interface ArchiveToolConfig {
  id: string;
  name: string;
  shortDescription: string;
  primaryExtension: string;
  supportedExtensions: string[];
  category: 'archive';
  mode: 'converter' | 'extractor' | 'stream';
  defaultTargetFormat: 'zip' | 'tar' | 'uncompressed' | 'tar.gz';
  availableTargets: Array<'zip' | 'tar' | 'tar.gz' | 'uncompressed'>;
  technicalDetails: {
    formatSpecs: string;
    compressionMethod: string;
    typicalUseCases: string[];
    magicBytes: string;
  };
}

interface ArchiveConverterToolProps {
  config: ArchiveToolConfig;
}

export default function ArchiveConverterTool({ config }: ArchiveConverterToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inspection, setInspection] = useState<ArchiveInspection | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<'zip' | 'tar' | 'tar.gz' | 'uncompressed'>(config.defaultTargetFormat);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState<string | null>(null);

  // File Preview Modal State
  const [previewEntry, setPreviewEntry] = useState<{ name: string; content: string; isImage?: boolean; url?: string } | null>(null);

  // Creator / Pack Mode State
  const [activeTab, setActiveTab] = useState<'convert' | 'pack'>('convert');
  const [packFiles, setPackFiles] = useState<File[]>([]);
  const [isPacking, setIsPacking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const packInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    await processFile(selected);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    await processFile(dropped);
  };

  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    setErrorMessage(null);
    setInspection(null);
    setConversionSuccess(null);

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      const result = await inspectAndExtractArchive(config.id, uint8, uploadedFile.name);
      setInspection(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse archive format.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert and trigger instant download
  const handleConvertAndDownload = async (targetFormat: 'zip' | 'tar' | 'tar.gz' | 'uncompressed') => {
    if (!inspection || inspection.entries.length === 0) return;
    setIsConverting(true);
    setConversionSuccess(null);

    try {
      const baseName = (file?.name || 'archive').replace(/\.[^/.]+$/, '').replace(/\.tar$/, '');
      let blob: Blob;
      let outputFileName = `${baseName}.${targetFormat}`;

      if (targetFormat === 'uncompressed') {
        const primary = inspection.entries[0];
        if (primary && primary.data) {
          blob = new Blob([primary.data.buffer as ArrayBuffer], { type: 'application/octet-stream' });
          outputFileName = primary.name || `${baseName}.dat`;
        } else {
          throw new Error('No uncompressed payload stream found.');
        }
      } else if (targetFormat === 'zip') {
        const zipBytes = await buildZip(
          inspection.entries.map(e => ({
            name: e.name,
            data: e.data || new Uint8Array(0),
            isDirectory: e.isDirectory
          }))
        );
        blob = new Blob([zipBytes.buffer as ArrayBuffer], { type: 'application/zip' });
        outputFileName = `${baseName}.zip`;
      } else if (targetFormat === 'tar') {
        const tarBytes = buildTar(
          inspection.entries.map(e => ({
            name: e.name,
            data: e.data || new Uint8Array(0),
            isDirectory: e.isDirectory
          }))
        );
        blob = new Blob([tarBytes.buffer as ArrayBuffer], { type: 'application/x-tar' });
        outputFileName = `${baseName}.tar`;
      } else if (targetFormat === 'tar.gz') {
        const tarBytes = buildTar(
          inspection.entries.map(e => ({
            name: e.name,
            data: e.data || new Uint8Array(0),
            isDirectory: e.isDirectory
          }))
        );
        const gzBytes = compressGzip(tarBytes);
        blob = new Blob([gzBytes.buffer as ArrayBuffer], { type: 'application/gzip' });
        outputFileName = `${baseName}.tar.gz`;
      } else {
        throw new Error('Unsupported conversion target.');
      }

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setConversionSuccess(`Successfully converted to ${outputFileName} (${formatBytes(blob.size)})`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Conversion failed.');
    } finally {
      setIsConverting(false);
    }
  };

  // Download individual file entry
  const handleDownloadEntry = (entry: ArchiveEntry) => {
    if (!entry.data) return;
    const blob = new Blob([entry.data.buffer as ArrayBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = entry.name.split('/').pop() || entry.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Preview file content
  const handlePreviewEntry = (entry: ArchiveEntry) => {
    if (!entry.data || entry.data.length === 0) return;

    const ext = entry.name.split('.').pop()?.toLowerCase() || '';
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'];

    if (imageExtensions.includes(ext)) {
      const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
      const blob = new Blob([entry.data.buffer as ArrayBuffer], { type: mime });
      const url = URL.createObjectURL(blob);
      setPreviewEntry({
        name: entry.name,
        content: '',
        isImage: true,
        url
      });
      return;
    }

    // Text / Code preview
    try {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(entry.data.subarray(0, 50000));
      setPreviewEntry({
        name: entry.name,
        content: text,
        isImage: false
      });
    } catch {
      setPreviewEntry({
        name: entry.name,
        content: 'Binary file preview not available. Please click Download to inspect this file.',
        isImage: false
      });
    }
  };

  // Create demo archive for immediate testing
  const handleLoadDemoArchive = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const sampleFiles = [
        { name: 'document.txt', data: new TextEncoder().encode('ToolNest Archive Converter Engine.\nProcessed 100% locally in-browser with zero server uploads.') },
        { name: 'config.json', data: new TextEncoder().encode(JSON.stringify({ tool: config.name, version: '1.0', secure: true, localOnly: true }, null, 2)) },
        { name: 'notes.md', data: new TextEncoder().encode('# ToolNest Guide\n\nHigh speed client-side archive processing for Netlify.') }
      ];

      let demoBytes: Uint8Array;
      let demoName = `demo_sample.${config.primaryExtension.replace(/^\./, '')}`;

      if (config.id.includes('tar')) {
        demoBytes = buildTar(sampleFiles);
        if (config.id.includes('gz')) {
          demoBytes = compressGzip(demoBytes);
        }
      } else if (config.id === 'gzip-converter' || config.id === 'bzip2-converter' || config.id === 'zstandard-converter') {
        const raw = new TextEncoder().encode('Single stream compressed payload sample for ' + config.name);
        demoBytes = compressGzip(raw);
      } else {
        demoBytes = await buildZip(sampleFiles);
      }

      const sampleBlob = new Blob([demoBytes.buffer as ArrayBuffer]);
      const demoFile = new File([sampleBlob], demoName, { type: 'application/octet-stream' });
      await processFile(demoFile);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Demo generation failed');
      setIsProcessing(false);
    }
  };

  // Pack user files into archive
  const handlePackFiles = async () => {
    if (packFiles.length === 0) return;
    setIsPacking(true);
    setErrorMessage(null);

    try {
      const entries = await Promise.all(
        packFiles.map(async f => ({
          name: f.name,
          data: new Uint8Array(await f.arrayBuffer())
        }))
      );

      let outputBytes: Uint8Array;
      let ext = 'zip';

      if (config.primaryExtension.includes('tar.gz') || config.id.includes('tar-gz')) {
        const tar = buildTar(entries);
        outputBytes = compressGzip(tar);
        ext = 'tar.gz';
      } else if (config.primaryExtension.includes('tar') || config.id.includes('tar')) {
        outputBytes = buildTar(entries);
        ext = 'tar';
      } else if (config.id === 'gzip-converter' && entries.length === 1) {
        outputBytes = compressGzip(entries[0].data);
        ext = 'gz';
      } else {
        outputBytes = await buildZip(entries);
        ext = 'zip';
      }

      const blob = new Blob([outputBytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toolnest_archive_${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setConversionSuccess(`Archive generated successfully! (${formatBytes(blob.size)})`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create archive.');
    } finally {
      setIsPacking(false);
    }
  };

  // Filter entries
  const filteredEntries = inspection?.entries.filter(e =>
    e.name.toLowerCase().includes(filterQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Tool Header & Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {config.primaryExtension}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Supports {config.supportedExtensions.join(', ')}
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
              {config.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              {config.shortDescription}
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setActiveTab('convert')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'convert'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Extract & Convert
            </button>
            <button
              onClick={() => setActiveTab('pack')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'pack'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Compress & Pack
            </button>
          </div>
        </div>

        {/* TAB 1: EXTRACT & CONVERT */}
        {activeTab === 'convert' && (
          <div className="space-y-6">
            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={config.supportedExtensions.join(',')}
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderArchive className="w-8 h-8" />
              </div>

              <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                {file ? file.name : `Select or drop your ${config.primaryExtension} archive here`}
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Drag and drop your file here, or tap to browse from your device. 100% private in-browser extraction.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  Browse File
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadDemoArchive();
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Load Sample Archive
                </button>
              </div>
            </div>

            {/* Loading Indicator */}
            {isProcessing && (
              <div className="p-6 bg-teal-50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800/60 flex items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5 text-teal-600 animate-spin" />
                <span className="text-xs sm:text-sm font-medium text-teal-900 dark:text-teal-200">
                  Reading archive headers, verifying checksums, and parsing structure...
                </span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-800 dark:text-rose-300">
                  <div className="font-bold">Extraction Warning / Error:</div>
                  <div>{errorMessage}</div>
                  <div className="mt-1 text-[11px] opacity-80">
                    Make sure the file is a valid {config.primaryExtension} archive. You can also test with the "Load Sample Archive" button above.
                  </div>
                </div>
              </div>
            )}

            {/* Conversion Success Alert */}
            {conversionSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  {conversionSuccess}
                </span>
              </div>
            )}

            {/* Archive Dashboard */}
            {inspection && (
              <div className="space-y-6 pt-2">
                {/* Meta Statistics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Archive Format</span>
                    <div className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-0.5 truncate">
                      {inspection.formatName}
                    </div>
                    <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Header Verified
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Entries</span>
                    <div className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-0.5">
                      {inspection.fileCount} {inspection.fileCount === 1 ? 'file' : 'files'}
                      {inspection.folderCount > 0 ? ` (${inspection.folderCount} dirs)` : ''}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Unpacked structure
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Uncompressed Size</span>
                    <div className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-0.5">
                      {formatBytes(inspection.totalUncompressedSize)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Extracted footprint
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Archive Footprint</span>
                    <div className="font-heading font-bold text-sm sm:text-base text-teal-600 dark:text-teal-400 mt-0.5">
                      {formatBytes(inspection.totalCompressedSize)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Packed file size
                    </div>
                  </div>
                </div>

                {/* Conversion & Action Controls */}
                <div className="p-5 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 dark:from-teal-950/40 dark:via-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        Convert & Export Archive
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Choose your target archive format and convert in one click.
                      </p>
                    </div>

                    {/* Target Format Radio / Button Group */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {config.availableTargets.map((target) => (
                        <button
                          key={target}
                          onClick={() => setSelectedTarget(target)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                            selectedTarget === target
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-400'
                          }`}
                        >
                          {target === 'uncompressed' ? 'Raw Extract' : `To .${target}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleConvertAndDownload(selectedTarget)}
                      disabled={isConverting}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isConverting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download as {selectedTarget === 'uncompressed' ? 'Extracted File' : `.${selectedTarget.toUpperCase()}`}
                        </>
                      )}
                    </button>

                    {/* Quick Download All as ZIP if not already selected */}
                    {selectedTarget !== 'zip' && (
                      <button
                        onClick={() => handleConvertAndDownload('zip')}
                        disabled={isConverting}
                        className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <FolderArchive className="w-4 h-4" />
                        Download All as .ZIP
                      </button>
                    )}
                  </div>
                </div>

                {/* Archive File Browser / Explorer */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-teal-600" />
                      Archive Contents ({filteredEntries.length} items)
                    </h4>

                    {/* Search inside archive */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search file in archive..."
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredEntries.map((entry, idx) => {
                        const isDir = entry.isDirectory;
                        const ext = entry.name.split('.').pop()?.toLowerCase();
                        const isImg = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(ext || '');
                        const isText = ['txt', 'md', 'json', 'js', 'ts', 'html', 'css', 'py', 'xml', 'csv', 'yaml', 'yml'].includes(ext || '');

                        return (
                          <div
                            key={idx}
                            className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                                {isDir ? (
                                  <FolderArchive className="w-4 h-4 text-amber-500" />
                                ) : isImg ? (
                                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                                ) : isText ? (
                                  <FileCode className="w-4 h-4 text-teal-500" />
                                ) : (
                                  <FileIcon className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-mono text-slate-900 dark:text-slate-100 truncate font-medium">
                                  {entry.name}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {isDir ? 'Directory' : formatBytes(entry.size)}
                                </div>
                              </div>
                            </div>

                            {/* Actions per item */}
                            {!isDir && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                {(isText || isImg) && (
                                  <button
                                    onClick={() => handlePreviewEntry(entry)}
                                    title="Quick Preview"
                                    className="p-1.5 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDownloadEntry(entry)}
                                  title="Download File"
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-semibold rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Save</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PACK / COMPRESS MULTIPLE FILES */}
        {activeTab === 'pack' && (
          <div className="space-y-6">
            <div
              onClick={() => packInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/50"
            >
              <input
                ref={packInputRef}
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setPackFiles(Array.from(e.target.files));
                  }
                }}
                className="hidden"
              />

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Upload className="w-8 h-8" />
              </div>

              <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Select Files to Compress into {config.name}
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Pick multiple files, documents, or photos from your phone or computer to package and compress locally.
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  packInputRef.current?.click();
                }}
                className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                Select Multiple Files
              </button>
            </div>

            {/* Selected files list */}
            {packFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">
                    {packFiles.length} files selected ({formatBytes(packFiles.reduce((acc, f) => acc + f.size, 0))})
                  </span>
                  <button
                    onClick={() => setPackFiles([])}
                    className="text-rose-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 p-2 text-xs">
                  {packFiles.map((f, i) => (
                    <div key={i} className="py-1.5 px-2 flex items-center justify-between">
                      <span className="truncate max-w-[200px] sm:max-w-xs">{f.name}</span>
                      <span className="text-slate-400">{formatBytes(f.size)}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handlePackFiles}
                  disabled={isPacking}
                  className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPacking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Compressing Files...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Create & Download {config.primaryExtension.toUpperCase()} Archive
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Technical Specifications & Privacy Guarantee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Specs Box */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-600" />
            Technical Architecture & Format Specs
          </h4>
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-400">Primary Extension:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">{config.primaryExtension}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-400">Magic Number / Signature:</span>
              <span className="font-mono text-teal-600 dark:text-teal-400">{config.technicalDetails.magicBytes}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-400">Compression Algorithm:</span>
              <span className="font-medium text-slate-900 dark:text-white">{config.technicalDetails.compressionMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Standard Specification:</span>
              <span className="text-right text-slate-700 dark:text-slate-300">{config.technicalDetails.formatSpecs}</span>
            </div>
          </div>
        </div>

        {/* In-Browser Privacy Box */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" />
            Zero-Server Client-Side Guarantee
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            All decompression, decompression streams, checksum calculations, and archive repacking occur completely within your browser using WebAssembly and pure JavaScript.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>No files or passwords ever uploaded to an external server.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Fast local speeds unaffected by internet upload bandwidth.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Safe for sensitive business, confidential, and proprietary archives.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick In-App File Preview Modal */}
      {previewEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white truncate max-w-md">
                {previewEntry.name}
              </div>
              <button
                onClick={() => setPreviewEntry(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 my-2 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200">
              {previewEntry.isImage && previewEntry.url ? (
                <div className="flex items-center justify-center">
                  <img src={previewEntry.url} alt={previewEntry.name} className="max-h-96 object-contain rounded-lg" />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap">{previewEntry.content}</pre>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPreviewEntry(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
