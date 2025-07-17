import React, { useMemo, useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { DocumentIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { Document, Page, pdfjs } from "react-pdf";

// Setting up the PDF worker
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
  // State for file loading and errors
  const [imageError, setImageError] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(false);

  // State for zoom and pan functionality
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs for the image and its container to calculate panning boundaries
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // --- Adjustable setting for mouse wheel zoom sensitivity ---
  const mouseWheelZoomStrength = 0.2; // Increase for faster zoom, decrease for slower

  // Determine file type based on extension
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

  const isPreviewable = isImageFile || isPdfFile;

  // Reset state when the modal is opened with a new file
  useEffect(() => {
    setImageError(false);
    setPdfError(false);
    setPageNumber(1);
    // Reset zoom and pan state for the new image
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, [imageUrl]);

  // Handlers for file download
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = fileName || displayName || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handlers for PDF loading
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setPdfError(true);
  };

  // Handlers for image zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 5)); // Cap zoom at 500%
  };

  const handleZoomOut = () => {
    const newZoomLevel = Math.max(1, zoomLevel - 0.2);
    if (newZoomLevel <= 1) {
      setPanPosition({ x: 0, y: 0 });
    }
    setZoomLevel(newZoomLevel);
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Handler for mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isAvatar) return;
    e.preventDefault();

    const direction = e.deltaY < 0 ? 1 : -1;
    const oldZoomLevel = zoomLevel;
    const newZoomLevel = Math.max(
      1,
      Math.min(oldZoomLevel + direction * mouseWheelZoomStrength, 5)
    );

    if (newZoomLevel === oldZoomLevel) return;

    if (!imageContainerRef.current || !imageRef.current) return;

    const container = imageContainerRef.current;
    const image = imageRef.current;
    const containerRect = container.getBoundingClientRect();

    // Mouse position relative to container center
    const mouseX = e.clientX - containerRect.left - containerRect.width / 2;
    const mouseY = e.clientY - containerRect.top - containerRect.height / 2;

    // The point on the content (image) that is under the mouse, relative to content center
    const contentX = (mouseX - panPosition.x) / oldZoomLevel;
    const contentY = (mouseY - panPosition.y) / oldZoomLevel;

    // The new pan should be `mouse_pos - content_pos * new_zoom`
    const newPanX = mouseX - contentX * newZoomLevel;
    const newPanY = mouseY - contentY * newZoomLevel;

    // Get image's rendered dimensions to calculate clamping bounds
    const { naturalWidth, naturalHeight } = image;
    const imageAspectRatio = naturalWidth / naturalHeight;
    const containerAspectRatio = containerRect.width / containerRect.height;
    let renderedWidth, renderedHeight;
    if (imageAspectRatio > containerAspectRatio) {
      renderedWidth = containerRect.width;
      renderedHeight = renderedWidth / imageAspectRatio;
    } else {
      renderedHeight = containerRect.height;
      renderedWidth = renderedHeight * imageAspectRatio;
    }

    // Clamp the new pan position
    const overflowX = Math.max(
      0,
      renderedWidth * newZoomLevel - containerRect.width
    );
    const overflowY = Math.max(
      0,
      renderedHeight * newZoomLevel - containerRect.height
    );
    const maxPanX = overflowX / (2 * newZoomLevel);
    const maxPanY = overflowY / (2 * newZoomLevel);

    const clampedX = Math.max(-maxPanX, Math.min(newPanX, maxPanX));
    const clampedY = Math.max(-maxPanY, Math.min(newPanY, maxPanY));

    setZoomLevel(newZoomLevel);
    if (newZoomLevel <= 1) {
      setPanPosition({ x: 0, y: 0 });
    } else {
      setPanPosition({ x: clampedX, y: clampedY });
    }
  };

  // Handlers for mouse events to pan the image
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1) return; // Panning is only enabled when zoomed
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      !isDragging ||
      zoomLevel <= 1 ||
      !imageContainerRef.current ||
      !imageRef.current
    )
      return;
    e.preventDefault();

    const container = imageContainerRef.current;
    const image = imageRef.current;

    const containerRect = container.getBoundingClientRect();
    const { naturalWidth, naturalHeight } = image;
    const imageAspectRatio = naturalWidth / naturalHeight;
    const containerAspectRatio = containerRect.width / containerRect.height;

    let renderedWidth, renderedHeight;
    if (imageAspectRatio > containerAspectRatio) {
      renderedWidth = containerRect.width;
      renderedHeight = renderedWidth / imageAspectRatio;
    } else {
      renderedHeight = containerRect.height;
      renderedWidth = renderedHeight * imageAspectRatio;
    }

    const overflowX = Math.max(
      0,
      renderedWidth * zoomLevel - containerRect.width
    );
    const overflowY = Math.max(
      0,
      renderedHeight * zoomLevel - containerRect.height
    );

    const maxPanX = overflowX / (2 * zoomLevel);
    const maxPanY = overflowY / (2 * zoomLevel);

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const clampedX = Math.max(-maxPanX, Math.min(newX, maxPanX));
    const clampedY = Math.max(-maxPanY, Math.min(newY, maxPanY));

    setPanPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const displayTitle = isAvatar ? displayName : fileName;

  // Default trigger button for non-avatar files
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
        <Dialog.Content
          className={`
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            bg-white rounded-lg shadow-xl z-[10000] overflow-hidden 
            flex flex-col focus:outline-none
            ${
              isAvatar
                ? "w-auto h-auto max-w-[90vw] max-h-[90vh]"
                : isPreviewable
                ? "w-[95%] max-w-4xl h-[90vh]"
                : "w-auto max-w-lg"
            }
          `}
        >
          <header className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0 ">
            <ArrowDownTrayIcon
              className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={handleDownload}
              title="Свали файла"
            />
            <Dialog.Title className="text-lg font-medium text-gray-900 w-full text-center truncate px-4">
              <span
                className="w-[90%] truncate inline-block align-bottom"
                title={displayTitle}
              >
                {displayTitle}
              </span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                aria-label="Затвори"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </header>

          <div className="flex justify-center items-center flex-1 p-4 overflow-auto bg-gray-50">
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
                <div
                  ref={imageContainerRef}
                  className="relative w-full h-full flex items-center justify-center overflow-hidden"
                  onMouseDown={!isAvatar ? handleMouseDown : undefined}
                  onMouseMove={!isAvatar ? handleMouseMove : undefined}
                  onMouseUp={!isAvatar ? handleMouseUp : undefined}
                  onMouseLeave={!isAvatar ? handleMouseLeave : undefined}
                  onWheel={!isAvatar ? handleWheel : undefined}
                >
                  {/* Container for panning and zooming */}
                  <div
                    className={`
                      w-full h-full flex items-center justify-center
                      ${
                        !isAvatar && zoomLevel > 1
                          ? isDragging
                            ? "cursor-grabbing"
                            : "cursor-grab"
                          : ""
                      }
                    `}
                  >
                    <img
                      ref={imageRef}
                      src={imageUrl}
                      alt={isAvatar ? `${displayName}'s avatar` : "Preview"}
                      className={`
                        object-contain rounded-md transition-transform duration-100 ease-out
                        ${isAvatar ? "w-80 h-80" : "max-w-full max-h-full"}
                      `}
                      style={
                        !isAvatar
                          ? {
                              transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                              transformOrigin: "center center",
                              willChange: "transform",
                            }
                          : {}
                      }
                      onError={() => setImageError(true)}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </div>

                  {/* Zoom Controls - only shown for non-avatar images */}
                  {!isAvatar && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm p-1.5 rounded-lg flex items-center gap-2 shadow-lg">
                      <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 1}
                        className="p-1 text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 rounded-md transition-all"
                        title="Намали"
                      >
                        <MagnifyingGlassMinusIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={handleZoomReset}
                        disabled={zoomLevel === 1}
                        className="p-1 text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 rounded-md transition-all"
                        title="Нулиране"
                      >
                        <ArrowPathIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 5}
                        className="p-1 text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 rounded-md transition-all"
                        title="Увеличи"
                      >
                        <MagnifyingGlassPlusIcon className="h-6 w-6" />
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : isPdfFile ? (
              // PDF Viewer Logic - Corrected for proper scrolling
              <div className="flex flex-col items-center w-full h-full">
                <div className="flex-1 w-full overflow-y-auto flex justify-center pt-4">
                  <Document
                    file={imageUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex items-center justify-center h-32 text-gray-500">
                        Зареждане на PDF...
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="max-w-full" // Removed max-h-full to allow scrolling
                      scale={1.5}
                    />
                  </Document>
                </div>
                {numPages && numPages > 1 && (
                  <div className="flex items-center gap-4 py-4 text-sm text-gray-600 flex-shrink-0">
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
            ) : (
              // Fallback for non-previewable files
              <div className="text-center text-gray-600 flex flex-col items-center justify-center gap-6 p-8 sm:p-12">
                <DocumentIcon className="h-24 w-24 text-gray-300" />
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-lg text-gray-700">
                    Визуализацията не е налична
                  </p>
                  <p className="text-sm">
                    Може да свалите файла, за да го видите.
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="cursor-pointer flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Сваляне на файл
                </button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ImagePreviewModal;
