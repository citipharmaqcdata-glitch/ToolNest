import { ModalType } from '../types';
import { ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenModal: (type: ModalType) => void;
}

export default function Footer({ onOpenModal }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-slate-900 dark:text-white text-lg">
                ToolNest
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">Every tool. One place.</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              A high-speed, mobile-friendly online suite of scientific, laboratory, everyday math, developer, and media utilities. Built for zero-cost deployment and 100% local client-side data privacy.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>100% In-Browser Processing · No Server File Storage</span>
            </div>
          </div>

          {/* Quick Legal & Informational Links */}
          <div className="md:col-span-7 flex flex-wrap gap-x-8 gap-y-3 text-xs font-medium text-slate-600 dark:text-slate-300 md:justify-end items-center">
            <button
              onClick={() => onOpenModal('about')}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              About ToolNest
            </button>
            <button
              onClick={() => onOpenModal('contact')}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Contact
            </button>
            <button
              onClick={() => onOpenModal('privacy')}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenModal('terms')}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Terms of Use
            </button>
            <button
              onClick={() => onOpenModal('disclaimer')}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Scientific & Lab Disclaimer
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div>
            © {new Date().getFullYear()} ToolNest. Free and open for everyone.
          </div>
          <div>
            Designed for mobile and desktop web browsers.
          </div>
        </div>
      </div>
    </footer>
  );
}
