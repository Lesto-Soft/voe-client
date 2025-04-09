import React from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string; // Optional title
}

const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  if (!isOpen) {
    return null;
  }

  // Handle clicks outside the modal content to close it
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Overlay backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-300/50 transition-opacity duration-300 ease-in-out"
      onClick={handleOverlayClick} // Close on overlay click
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Content Container */}
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-lg w-full transform transition-all duration-300 ease-in-out scale-100 opacity-100">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          {title && (
            <h2
              id="modal-title"
              className="text-xl font-semibold text-gray-800"
            >
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close modal"
          >
            &times; {/* Nice 'X' character */}
          </button>
        </div>

        {/* Modal Body */}
        <div className="text-gray-700">{children}</div>
      </div>
    </div>
  );
};

export default HelpModal;
