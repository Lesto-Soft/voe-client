import React, { useMemo, useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { DocumentIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface ImagePreviewProps {
  imageUrl: string;
  fileName?: string;
  displayName?: string;
  isAvatar?: boolean;
  triggerElement?: React.ReactNode;
  children?: React.ReactNode;
}

const ImagePreviewModal: React.FC<ImagePreviewProps> = ({
  imageUrl,
  fileName,
  displayName,
  isAvatar = false,
  triggerElement,
  children,
}) => {
  // State to track if the image has failed to load
  const [imageError, setImageError] = useState(false);

  const isImageFile = useMemo(() => {
    if (isAvatar) return true;
    if (fileName) {
      const extension = fileName.split(".").pop()?.toLowerCase();
      if (extension) {
        const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
        return imageExtensions.includes(extension);
      }
    }
    return false;
  }, [fileName, isAvatar]);

  // Reset the error state when the image URL changes
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = fileName || displayName || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayTitle = isAvatar ? displayName : fileName;

  const defaultTrigger =
    !isAvatar && fileName ? (
      <button
        className="hover:cursor-pointer flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        type="button"
        title={fileName}
      >
        <span className="truncate max-w-32 overflow-hidden whitespace-nowrap">
          {fileName}
        </span>
      </button>
    ) : null;

  const trigger = triggerElement || children || defaultTrigger;

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9999]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[10000] overflow-hidden flex flex-col">
          <header className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
            <ArrowDownTrayIcon
              className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={handleDownload}
              title="Download File"
            />
            <Dialog.Title className="text-lg font-medium text-gray-900 truncate px-4">
              <span
                className="max-w-60 overflow-hidden whitespace-nowrap inline-block align-bottom"
                title={displayTitle}
              >
                {displayTitle}
              </span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </header>

          <div className="p-6 flex justify-center items-center min-h-[250px]">
            {isImageFile ? (
              imageError ? (
                // 1. New placeholder for broken images
                <div className="text-center text-gray-500 flex flex-col items-center gap-3">
                  <PhotoIcon className="h-12 w-12 text-gray-300" />
                  <div>
                    <p className="font-semibold text-gray-600">
                      Грешка при зареждане
                    </p>
                    <p className="text-sm mt-1">
                      Изображението не може да бъде показано.
                    </p>
                  </div>
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt={isAvatar ? `${displayName}'s avatar` : "Preview"}
                  className="w-full h-auto rounded-md max-h-[70vh]"
                  onError={() => setImageError(true)}
                />
              )
            ) : (
              // 2. Translated placeholder for non-image files
              <div className="text-center text-gray-500 flex flex-col items-center gap-3">
                <DocumentIcon className="h-12 w-12 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-600">
                    Визуализацията не е налична
                  </p>
                  <p className="text-sm mt-1">
                    Може да свалите файла, за да го видите.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ImagePreviewModal;
