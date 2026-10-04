import React from 'react';
import { Modal as LibModal } from '@hvantran/ui-component-library';

export interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  titleClassName?: string;
  maxWidth?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const mapMaxWidth = (maxWidth?: string): 'sm' | 'md' | 'lg' | 'xl' => {
  if (!maxWidth) return 'lg';
  if (maxWidth.includes('sm')) return 'sm';
  if (maxWidth.includes('md')) return 'md';
  if (maxWidth.includes('xl')) return 'xl';
  return 'lg';
};

/**
 * Atom — Modal
 * Consumes published @hvantran/ui-component-library Modal primitive.
 */
const Modal: React.FC<ModalProps> = ({
  open,
  isOpen,
  onClose,
  title,
  titleClassName,
  maxWidth = 'max-w-lg',
  children,
  actions,
  footer,
  className,
}) => {
  const visible = isOpen ?? open ?? false;
  const resolvedFooter = actions ?? footer;
  const resolvedTitle =
    title && titleClassName ? <span className={titleClassName}>{title}</span> : title;

  return (
    <LibModal
      isOpen={visible}
      onClose={onClose}
      title={resolvedTitle}
      maxWidth={mapMaxWidth(maxWidth)}
      footer={resolvedFooter}
      className={className}
    >
      {children}
    </LibModal>
  );
};

export default Modal;
