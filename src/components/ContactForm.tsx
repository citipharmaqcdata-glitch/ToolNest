import { useState } from 'react';
import {
  Mail,
  Youtube,
  MessageCircle,
  Send,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  User,
  AtSign,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const officialEmail = 'socialeditor804@gmail.com';
  const youtubeHandle = '@trustedcareerhub';
  const youtubeUrl = 'https://www.youtube.com/@trustedcareerhub';
  const whatsappChannelUrl = 'https://whatsapp.com/channel/0029Vb7MWziGzzKLWWP2283I';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(officialEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    // Create mailto fallback link with prefilled details
    const mailtoSubject = encodeURIComponent(`[ToolNest ${category}] ${subject || 'New Contact Request'}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCategory: ${category}\n\nMessage:\n${message}\n\n---\nSent from ToolNest Contact Form`
    );
    const mailtoUrl = `mailto:${officialEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

    setIsSubmitted(true);

    // Open default mail client in background
    setTimeout(() => {
      window.open(mailtoUrl, '_blank');
    }, 600);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setCategory('General Inquiry');
    setSubject('');
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
              Contact & Official Community
            </h2>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
              We're here to help! Connect with us, join our community, or submit feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Official Community & Social Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* WhatsApp Channel */}
        <a
          href={whatsappChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                Official Channel
              </span>
            </div>
            <div>
              <div className="font-heading font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                WhatsApp Channel
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Trusted Career Hub
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-200/50 dark:border-emerald-900/40 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span>Follow Channel</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* YouTube Channel */}
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/50 hover:border-rose-400 dark:hover:border-rose-600 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
                <Youtube className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                YouTube
              </span>
            </div>
            <div>
              <div className="font-heading font-bold text-sm text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                @trustedcareerhub
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Video Guides & Tutorials
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-200/50 dark:border-rose-900/40 flex items-center justify-between text-xs font-semibold text-rose-700 dark:text-rose-400">
            <span>Subscribe & Watch</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* Official Email */}
        <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/50 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                Direct Email
              </span>
            </div>
            <div>
              <div className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                Official Inbox
              </div>
              <div className="font-mono text-[11px] text-teal-700 dark:text-teal-300 truncate mt-0.5">
                {officialEmail}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-teal-200/50 dark:border-teal-900/40 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
            <a
              href={`mailto:${officialEmail}`}
              className="text-xs text-slate-500 hover:text-teal-600 dark:text-slate-400"
            >
              Compose
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Contact Form */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 space-y-4">
        {isSubmitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Thank You! Your Message is Ready
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Your email client was opened with your message addressed to <strong>{officialEmail}</strong>. If your email app did not open automatically, you can send it directly using the button below.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <a
                href={`mailto:${officialEmail}?subject=${encodeURIComponent(`[ToolNest] Contact from ${name}`)}&body=${encodeURIComponent(message)}`}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition-colors inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                Send via Email
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Send Us a Message
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Have a suggestion for a new tool, found an issue, or want to partner? Fill in the details below.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <AtSign className="w-3.5 h-3.5 text-slate-400" />
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  Inquiry Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Suggest a Tool">Suggest a New Tool / Converter</option>
                  <option value="Bug Report">Report a Bug / Issue</option>
                  <option value="Formula Correction">Scientific / Formula Feedback</option>
                  <option value="Partnership">Collaboration & Partnership</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Request for additional HPLC column calculator"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                Your Message *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message, feedback, or tool suggestion here..."
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 resize-y"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Delivered directly to <strong>{officialEmail}</strong>.
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
