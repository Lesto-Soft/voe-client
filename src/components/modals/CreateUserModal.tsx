import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline"; // Or solid if preferred

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const CreateUserModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-500/75"
      onClick={onClose} // Close modal on backdrop click
    >
      {/* Modal Content */}
      <div
        className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          aria-label="Close modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Modal Header */}
        <h2 className="mb-6 text-center text-xl font-semibold text-gray-800">
          {title}
        </h2>

        {/* Modal Body */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default CreateUserModal;
