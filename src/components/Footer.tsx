import { ModalType } from '../types';

interface FooterProps {
  onOpenModal: (type: ModalType) => void;
}

export default function Footer({ onOpenModal }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
          {/* Quick Legal & Informational Links */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2">
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
              Contact Us
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

          {/* Copyright notice */}
          <div className="text-xs text-slate-400 shrink-0">
            © {new Date().getFullYear()} ToolNest. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
