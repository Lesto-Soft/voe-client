import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

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
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity bg-gray-500/50 duration-300 ease-in-out"
      onClick={handleOverlayClick} // Close on overlay click
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Content Container */}
      <div className="bg-white rounded-lg shadow-xl m-4 max-w-lg w-full flex flex-col transform transition-all duration-300 ease-in-out scale-100 opacity-100">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
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
            className="p-1 cursor-pointer rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="px-6 py-5 overflow-y-auto"
          style={{ maxHeight: "70vh" }}
        >
          <div className="text-gray-700">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
