import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/uis';

const Modal = ({ isOpen, onClose, children, title }) => {
  const handleEscape = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-auto bg-white rounded-lg shadow-lg transition-all duration-300 transform scale-100 hover:scale-[1.02]">
        <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close Modal"
          >
            <X size={24} />
          </Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;