/** @jsxRuntime classic */
import * as React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'success' | 'error';
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, type, children }: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  const titleColor = type === 'success' ? 'text-green-400' : 'text-red-500';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-brand-secondary p-8 rounded-lg border border-brand-border max-w-sm w-full text-center shadow-2xl relative"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 className={`text-2xl font-bold ${titleColor} mb-4`}>{title}</h2>
        <p className="text-brand-tertiary mb-6">
          {children}
        </p>
        <button
          onClick={onClose}
          className="px-8 py-2 bg-brand-accent hover:bg-blue-500 rounded-md text-white font-bold transition-colors"
          aria-label="Cerrar"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default Modal;