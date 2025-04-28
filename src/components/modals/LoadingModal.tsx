import React from "react";

// Define an interface for the component's props
interface LoadingModalProps {
  message?: string; // Optional string prop (denoted by '?')
}

// Use the props interface to type the component's props
// Provide a default value for the optional 'message' prop
const LoadingModal = ({
  message = "Loading...",
}: LoadingModalProps): React.ReactElement | null => {
  // Return type is React.ReactElement when rendering the modal
  return (
    // Modal Overlay: Fixed position, covers the entire screen, centers content, semi-transparent background, high z-index
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-500/75"
      aria-modal="true" // Indicates it's a modal
      role="dialog" // Role for accessibility
      aria-labelledby="loading-message" // Points to the message for screen readers
    >
      {/* Modal Content Box: White background, padding, rounded corners, shadow, centers content internally */}
      <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-xl">
        {/* Spinner: Size, border, top border transparent for spinner effect, rounded, spinning animation */}
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-7 border-gray-500 border-t-transparent"></div>
        {/* Loading Message: Text styling */}
        <p id="loading-message" className="text-lg text-gray-700">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingModal;
