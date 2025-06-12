import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface ImagePreviewProps {
  imageUrl: string;
  fileName?: string; // Made optional for avatar usage
  displayName?: string; // For avatar: user's name
  isAvatar?: boolean; // Flag to distinguish avatar vs file preview
  triggerElement?: React.ReactNode; // Custom trigger element (for avatar)
  children?: React.ReactNode; // Alternative way to pass trigger content
}

const ImagePreviewModal: React.FC<ImagePreviewProps> = ({
  imageUrl,
  fileName,
  displayName,
  isAvatar = false,
  triggerElement,
  children,
}) => {
  // Function to handle direct download
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = fileName || displayName || "image";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine what to show as the title
  const modalTitle = isAvatar ? displayName || "User Avatar" : "Preview Image";
  const displayTitle = isAvatar ? displayName : fileName;

  // Default trigger for file attachments (backward compatibility)
  const defaultTrigger =
    !isAvatar && fileName ? (
      <button
        className="hover:cursor-pointer flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        type="button"
        title="Preview Image"
      >
        <span
          className="truncate max-w-32 overflow-hidden whitespace-nowrap"
          title={fileName}
        >
          {fileName}
        </span>
      </button>
    ) : null;

  // Use custom trigger, children, or default trigger
  const trigger = triggerElement || children || defaultTrigger;

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9999]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 p-4 bg-white rounded-lg shadow-lg z-[10000]">
          <div className="flex justify-between items-center">
            <ArrowDownTrayIcon
              className="h-6 w-6 text-gray-500 hover:text-gray-700 hover:cursor-pointer"
              onClick={handleDownload}
              title="Download Image"
            />
            <Dialog.Title className="text-center text-lg font-medium text-gray-900">
              <span
                className="truncate max-w-60 overflow-hidden whitespace-nowrap inline-block align-bottom"
                title={displayTitle}
              >
                {displayTitle}
              </span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="top-2 right-2 text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>
          <img
            src={imageUrl}
            alt={isAvatar ? `${displayName}'s avatar` : "Preview"}
            className="w-full h-auto rounded-md mt-3"
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ImagePreviewModal;
