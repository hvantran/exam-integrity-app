import React from 'react';
import { X } from 'lucide-react';

export interface AppDialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  disableClose?: boolean;
  closeOnBackdrop?: boolean;
}

interface AppDialogHeaderProps {
  children: React.ReactNode;
  showClose?: boolean;
}

interface AppDialogContentProps {
  children: React.ReactNode;
}

interface AppDialogFooterProps {
  children: React.ReactNode;
}

interface AppDialogContextValue {
  onClose: () => void;
  disableClose: boolean;
}

const AppDialogContext = React.createContext<AppDialogContextValue | null>(null);

const useAppDialogContext = () => {
  const ctx = React.useContext(AppDialogContext);
  if (!ctx) {
    throw new Error('DialogHeader must be used within AppDialog');
  }
  return ctx;
};

export const DialogHeader: React.FC<AppDialogHeaderProps> = ({ children, showClose = true }) => {
  const { onClose, disableClose } = useAppDialogContext();

  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
      <h2 className="text-lg font-bold text-gray-900">{children}</h2>
      {showClose && (
        <button
          type="button"
          onClick={onClose}
          disabled={disableClose}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export const DialogContent: React.FC<AppDialogContentProps> = ({ children }) => (
  <div className="px-6 py-4">{children}</div>
);

export const DialogFooter: React.FC<AppDialogFooterProps> = ({ children }) => (
  <div className="px-6 pb-5 pt-2 flex justify-end gap-2">{children}</div>
);

const AppDialog: React.FC<AppDialogProps> = ({
  open,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  disableClose = false,
  closeOnBackdrop = true,
}) => {
  if (!open) return null;

  const handleBackdropClick = () => {
    if (disableClose || !closeOnBackdrop) return;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div
        className={`relative bg-white rounded-xl shadow-lg w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <AppDialogContext.Provider value={{ onClose, disableClose }}>
          {children}
        </AppDialogContext.Provider>
      </div>
    </div>
  );
};

export default AppDialog;
