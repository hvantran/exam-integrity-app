import React from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Tailwind text colour class e.g. "text-primary" (default) or "text-error-600" */
  titleClassName?: string;
  /** Tailwind max-width class, e.g. "max-w-lg" (default) or "max-w-sm" */
  maxWidth?: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  titleClassName,
  maxWidth = 'max-w-lg',
  children,
  actions,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90vh]`}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <h2 className={`text-lg font-bold ${titleClassName ?? 'text-primary'}`}>{title}</h2>
          {React.createElement(
            'button',
            {
              onClick: onClose,
              className: 'text-gray-400 hover:text-gray-600 transition rounded-full p-1',
              'aria-label': 'Close',
              type: 'button',
            },
            <X size={20} />,
          )}
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
        <div className="px-6 pb-5 pt-3 flex justify-end gap-2 border-t border-gray-100">
          {actions}
        </div>
      </div>
    </div>
  );
};

export default Modal;
