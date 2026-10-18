import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode as QrIcon, Wifi, Link2, FileText, Mail, UserCheck } from 'lucide-react';
import { copyToClipboard } from '../../utils/formatters';

type QrMode = 'url' | 'text' | 'wifi' | 'email' | 'contact';
type ErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export default function QrCodeGenerator() {
  const [mode, setMode] = useState<QrMode>('url');
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrection>('M');
  const [darkColor, setDarkColor] = useState<string>('#0f172a');
  const [lightColor, setLightColor] = useState<string>('#ffffff');

  // Input states
  const [urlInput, setUrlInput] = useState<string>('https://');
  const [textInput, setTextInput] = useState<string>('Hello from ToolNest!');

  // WiFi states
  const [wifiSsid, setWifiSsid] = useState<string>('MyHomeWiFi');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);

  // Email states
  const [emailTo, setEmailTo] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');

  // Contact / vCard states
  const [contactName, setContactName] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactOrg, setContactOrg] = useState<string>('');

  // Output
  const [svgString, setSvgString] = useState<string>('');
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Build payload
  const getPayload = (): string => {
    switch (mode) {
      case 'url':
        return urlInput.trim() || 'https://';
      case 'text':
        return textInput || ' ';
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'contact':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${contactPhone}\nEMAIL:${contactEmail}\nORG:${contactOrg}\nEND:VCARD`;
      default:
        return 'ToolNest';
    }
  };

  useEffect(() => {
    const payload = getPayload();
    if (!payload.trim()) return;

    // Generate SVG
    QRCode.toString(payload, {
      type: 'svg',
      errorCorrectionLevel: errorCorrection,
      color: {
        dark: darkColor,
        light: lightColor
      },
      margin: 2
    })
      .then((svg) => setSvgString(svg))
      .catch((err) => console.error(err));

    // Generate PNG Data URL
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: errorCorrection,
      width: 400,
      margin: 2,
      color: {
        dark: darkColor,
        light: lightColor
      }
    })
      .then((dataUrl) => setPngDataUrl(dataUrl))
      .catch((err) => console.error(err));
  }, [
    mode,
    urlInput,
    textInput,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    emailTo,
    emailSubject,
    emailBody,
    contactName,
    contactPhone,
    contactEmail,
    contactOrg,
    errorCorrection,
    darkColor,
    lightColor
  ]);

  const handleDownloadPng = () => {
    if (!pngDataUrl) return;
    const a = document.createElement('a');
    a.href = pngDataUrl;
    a.download = `toolnest-qr-${mode}.png`;
    a.click();
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolnest-qr-${mode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySvg = async () => {
    if (!svgString) return;
    const ok = await copyToClipboard(svgString);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Type Selection Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMode('url')}
            className={`flex items-center gap-2 py-2 px-3.5 text-xs font-semibold rounded-xl transition-all ${
              mode === 'url'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Website URL
          </button>

          <button
            onClick={() => setMode('text')}
            className={`flex items-center gap-2 py-2 px-3.5 text-xs font-semibold rounded-xl transition-all ${
              mode === 'text'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Plain Text
          </button>

          <button
            onClick={() => setMode('wifi')}
            className={`flex items-center gap-2 py-2 px-3.5 text-xs font-semibold rounded-xl transition-all ${
              mode === 'wifi'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            Wi-Fi Network
          </button>

          <button
            onClick={() => setMode('email')}
            className={`flex items-center gap-2 py-2 px-3.5 text-xs font-semibold rounded-xl transition-all ${
              mode === 'email'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </button>

          <button
            onClick={() => setMode('contact')}
            className={`flex items-center gap-2 py-2 px-3.5 text-xs font-semibold rounded-xl transition-all ${
              mode === 'contact'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            vCard Contact
          </button>
        </div>
      </div>

      {/* Main Dual Grid: Content Inputs & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Settings (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            {mode === 'url' && 'Website Link Payload'}
            {mode === 'text' && 'Text Payload'}
            {mode === 'wifi' && 'Wi-Fi Network Credentials'}
            {mode === 'email' && 'Email Dispatch Payload'}
            {mode === 'contact' && 'Contact Card Details (vCard)'}
          </h3>

          {/* Mode inputs */}
          {mode === 'url' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Destination URL
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          )}

          {mode === 'text' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Plain Text Message
              </label>
              <textarea
                rows={4}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text, notes or codes..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          )}

          {mode === 'wifi' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Network SSID (Name)
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="MyHomeWiFi"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Wi-Fi Password
                </label>
                <input
                  type="text"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="Network password"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Security Type
                  </label>
                  <select
                    value={wifiEncryption}
                    onChange={(e) => setWifiEncryption(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open Network)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600"
                    />
                    Hidden SSID
                  </label>
                </div>
              </div>
            </div>
          )}

          {mode === 'email' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject line"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pre-filled Body
                </label>
                <textarea
                  rows={2}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Email message..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {mode === 'contact' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Dr. Alex Rivera"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Organization / Company
                </label>
                <input
                  type="text"
                  value={contactOrg}
                  onChange={(e) => setContactOrg(e.target.value)}
                  placeholder="Quality Labs Inc."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* Color & Error Correction Customizations */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Error Correction
              </label>
              <select
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value as ErrorCorrection)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              >
                <option value="L">L - Low (7% recovery)</option>
                <option value="M">M - Medium (15% recovery)</option>
                <option value="Q">Q - Quartile (25% recovery)</option>
                <option value="H">H - High (30% recovery)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Foreground Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live QR Code Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-between space-y-5">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Live Vector QR Preview
            </span>
            <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400">
              100% Client-Side
            </span>
          </div>

          {/* Rendered SVG Preview Box */}
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center max-w-[260px] aspect-square">
            {svgString ? (
              <div
                dangerouslySetInnerHTML={{ __html: svgString }}
                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
              />
            ) : (
              <div className="text-xs text-slate-400">Generating QR...</div>
            )}
          </div>

          {/* Action Download Buttons */}
          <div className="w-full space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadPng}
                disabled={!pngDataUrl}
                className="py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </button>
              <button
                onClick={handleDownloadSvg}
                disabled={!svgString}
                className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download SVG
              </button>
            </div>

            <button
              onClick={handleCopySvg}
              disabled={!svgString}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'SVG Code Copied' : 'Copy Raw SVG Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
