import React, { useMemo, useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { DocumentIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(false);

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

  const isPdfFile = useMemo(() => {
    if (fileName) {
      const extension = fileName.split(".").pop()?.toLowerCase();
      return extension === "pdf";
    }
    return false;
  }, [fileName]);

  // Reset the error state when the image URL changes
  useEffect(() => {
    setImageError(false);
    setPdfError(false);
    setPageNumber(1);
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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setPdfError(true);
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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[10000] overflow-hidden flex flex-col w-[95%] max-w-4xl h-[90vh]">
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

          <div className="flex justify-center items-center flex-1 p-4 overflow-auto">
            {isImageFile ? (
              imageError ? (
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
                  className="max-w-full max-h-full object-contain rounded-md"
                  onError={() => setImageError(true)}
                />
              )
            ) : isPdfFile ? (
              pdfError ? (
                <div className="text-center text-gray-500 flex flex-col items-center gap-3">
                  <DocumentIcon className="h-12 w-12 text-gray-300" />
                  <div>
                    <p className="font-semibold text-gray-600">
                      Грешка при зареждане на PDF
                    </p>
                    <p className="text-sm mt-1">
                      PDF файлът не може да бъде показан.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full h-full">
                  <div className="flex-1 flex items-center justify-center">
                    <Document
                      file={imageUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex items-center justify-center h-32">
                          <div className="text-gray-500">
                            Зареждане на PDF...
                          </div>
                        </div>
                      }
                    >
                      <Page
                        pageNumber={pageNumber}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="max-w-full max-h-full"
                        scale={1.0}
                        width={Math.min(window.innerWidth * 0.8, 800)}
                      />
                    </Document>
                  </div>
                  {numPages && numPages > 1 && (
                    <div className="flex items-center gap-4 mb-8 text-sm text-gray-600 flex-shrink-0">
                      <button
                        onClick={() =>
                          setPageNumber((prev) => Math.max(1, prev - 1))
                        }
                        disabled={pageNumber <= 1}
                        className="cursor-pointer px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Предишна
                      </button>
                      <span>
                        Страница {pageNumber} от {numPages}
                      </span>
                      <button
                        onClick={() =>
                          setPageNumber((prev) => Math.min(numPages, prev + 1))
                        }
                        disabled={pageNumber >= numPages}
                        className="cursor-pointer px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Следваща
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
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
