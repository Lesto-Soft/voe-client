import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { DocumentIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { Document, Page, pdfjs } from "react-pdf";
import { getIconForFile } from "../../../utils/fileUtils";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export interface GalleryItem {
  url: string;
  name: string;
}

interface ImagePreviewProps {
  galleryItems?: GalleryItem[];
  imageUrl: string;
  fileName?: string;
  displayName?: string;
  isAvatar?: boolean;
  triggerElement?: React.ReactNode;
  children?: React.ReactNode;
}

const ImagePreviewModal: React.FC<ImagePreviewProps> = ({
  galleryItems = [],
  imageUrl,
  fileName,
  displayName,
  isAvatar = false,
  triggerElement,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const mouseWheelZoomStrength = 0.2;

  const effectiveGallery = useMemo(() => {
    if (galleryItems && galleryItems.length > 0) return galleryItems;
    return [{ url: imageUrl, name: fileName || "" }];
  }, [galleryItems, imageUrl, fileName]);

  const currentItem = effectiveGallery[currentIndex] || {
    url: imageUrl,
    name: fileName || "",
  };

  useEffect(() => {
    if (isOpen) {
      const startIndex = effectiveGallery.findIndex(
        (item) => item.url === imageUrl
      );
      setCurrentIndex(startIndex >= 0 ? startIndex : 0);
    }
  }, [isOpen, imageUrl, effectiveGallery]);

  useEffect(() => {
    setImageError(false);
    setIsImageLoading(true); // Start loading when the item changes
    setPageNumber(1);
    setNumPages(null);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, [currentItem.url]);

  const goToNext = useCallback(() => {
    if (effectiveGallery.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % effectiveGallery.length);
  }, [effectiveGallery.length]);

  const goToPrevious = useCallback(() => {
    if (effectiveGallery.length <= 1) return;
    setCurrentIndex(
      (prev) => (prev - 1 + effectiveGallery.length) % effectiveGallery.length
    );
  }, [effectiveGallery.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goToNext();
      else if (event.key === "ArrowLeft") goToPrevious();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToNext, goToPrevious]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentItem.url;
    link.download = currentItem.name || displayName || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) =>
    setNumPages(numPages);
  const onDocumentLoadError = (error: Error) =>
    console.error("Error loading PDF:", error);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 5));
  const handleZoomReset = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };
  const handleZoomOut = () => {
    const newZoom = Math.max(1, zoomLevel - 0.2);
    if (newZoom <= 1) setPanPosition({ x: 0, y: 0 });
    setZoomLevel(newZoom);
  };

  // Legend for short constant names used in calculations:
  /*
   * cRect: container Rectangle - The dimensions and position of the image's container.
   * iAR:   image Aspect Ratio - The width-to-height ratio of the original image file.
   * cAR:   container Aspect Ratio - The width-to-height ratio of the visible container.
   * rW/rH: rendered Width/Height - The actual size of the image as it's displayed (respecting 'object-contain').
   *
   * --- Mouse Position & Pan Logic ---
   * mX/mY: mouse X/Y - The mouse cursor's position relative to the container's center.
   * cX/cY: (in handleWheel) content X/Y - The specific coordinate on the *un-zoomed* image that is directly under the mouse cursor.
   * nPx/nPy: new Pan X/Y - The calculated pan position required to keep the content point (cX/cY) under the mouse after zooming.
   * nX/nY: (in handleMouseMove) new X/Y - The calculated raw new pan position based on how far the mouse has been dragged.
   *
   * --- Clamping Logic (to prevent panning outside image bounds) ---
   * oX/oY: overflow X/Y - How many pixels the zoomed image extends beyond the container's edges.
   * mPx/mPy: max Pan X/Y - The maximum distance (positive or negative) the image can be panned from the center.
   * cX_/cY_ or cX/cY (at the end): clamped X/Y - The final, bounded pan position that ensures the image edges don't come into view.
   */

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isAvatar) return;
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const oldZoom = zoomLevel;
    const newZoom = Math.max(
      1,
      Math.min(oldZoom + direction * mouseWheelZoomStrength, 5)
    );
    if (newZoom === oldZoom || !imageContainerRef.current || !imageRef.current)
      return;
    const container = imageContainerRef.current;
    const image = imageRef.current;
    const cRect = container.getBoundingClientRect();
    const mX = e.clientX - cRect.left - cRect.width / 2;
    const mY = e.clientY - cRect.top - cRect.height / 2;
    const cX = (mX - panPosition.x) / oldZoom;
    const cY = (mY - panPosition.y) / oldZoom;
    const nPx = mX - cX * newZoom;
    const nPy = mY - cY * newZoom;
    const { naturalWidth, naturalHeight } = image;
    const iAR = naturalWidth / naturalHeight;
    const cAR = cRect.width / cRect.height;
    let rW, rH;
    if (iAR > cAR) {
      rW = cRect.width;
      rH = rW / iAR;
    } else {
      rH = cRect.height;
      rW = rH * iAR;
    }
    const oX = Math.max(0, rW * newZoom - cRect.width);
    const oY = Math.max(0, rH * newZoom - cRect.height);
    const mPx = oX / (2 * newZoom);
    const mPy = oY / (2 * newZoom);
    const cX_ = Math.max(-mPx, Math.min(nPx, mPx));
    const cY_ = Math.max(-mPy, Math.min(nPy, mPy));
    setZoomLevel(newZoom);
    if (newZoom <= 1) setPanPosition({ x: 0, y: 0 });
    else setPanPosition({ x: cX_, y: cY_ });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1) return;
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
    const cRect = container.getBoundingClientRect();
    const { naturalWidth, naturalHeight } = image;
    const iAR = naturalWidth / naturalHeight;
    const cAR = cRect.width / cRect.height;
    let rW, rH;
    if (iAR > cAR) {
      rW = cRect.width;
      rH = rW / iAR;
    } else {
      rH = cRect.height;
      rW = rH * iAR;
    }
    const oX = Math.max(0, rW * zoomLevel - cRect.width);
    const oY = Math.max(0, rH * zoomLevel - cRect.height);
    const mPx = oX / (2 * zoomLevel);
    const mPy = oY / (2 * zoomLevel);
    const nX = e.clientX - dragStart.x;
    const nY = e.clientY - dragStart.y;
    const cX = Math.max(-mPx, Math.min(nX, mPx));
    const cY = Math.max(-mPy, Math.min(nY, mPy));
    setPanPosition({ x: cX, y: cY });
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const isImageFile = useMemo(() => {
    if (isAvatar) return true;
    const name = currentItem.name || "";
    const ext = name.split(".").pop()?.toLowerCase();
    return ext
      ? ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)
      : false;
  }, [currentItem.name, isAvatar]);

  const isPdfFile = useMemo(() => {
    const name = currentItem.name || "";
    return name.split(".").pop()?.toLowerCase() === "pdf";
  }, [currentItem.name]);

  const TriggerIconComponent = getIconForFile(fileName || "");
  const CurrentItemIconComponent = getIconForFile(currentItem.name || "");
  const displayTitle = isAvatar ? displayName : currentItem.name;

  const defaultTrigger =
    !isAvatar && fileName ? (
      <button
        className="w-38 hover:cursor-pointer flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        type="button"
        title={fileName}
      >
        <TriggerIconComponent className="h-4 w-4 text-gray-600 flex-shrink-0" />
        <span className="truncate overflow-hidden whitespace-nowrap">
          {fileName}
        </span>
      </button>
    ) : null;

  const trigger = triggerElement || children || defaultTrigger;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9999]" />
        <Dialog.Content
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[10000] overflow-hidden flex flex-col focus:outline-none ${
            isAvatar
              ? "w-auto h-auto max-w-[90vw] max-h-[90vh]"
              : "w-[95%] max-w-5xl h-[90vh]"
          }`}
        >
          <header className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
            <ArrowDownTrayIcon
              className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={handleDownload}
              title="Свали файла"
            />
            <Dialog.Title className="flex items-center gap-2 text-lg font-medium text-gray-900 w-full justify-center truncate px-4">
              <CurrentItemIconComponent className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <span className="truncate" title={displayTitle}>
                {displayTitle}
              </span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none"
                aria-label="Затвори"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </header>
          <div
            className="relative flex justify-center items-center flex-1 p-4 overflow-hidden bg-gray-50"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
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
                  onWheel={!isAvatar ? handleWheel : undefined}
                >
                  {/* The image itself, hidden while loading */}
                  <img
                    ref={imageRef}
                    src={currentItem.url}
                    alt={isAvatar ? `${displayName}'s avatar` : "Preview"}
                    className={`object-contain rounded-md transition-opacity duration-150 ease-out ${
                      isAvatar ? "w-80 h-80" : "max-w-full max-h-full"
                    } ${isImageLoading ? "opacity-0" : "opacity-100"}`}
                    style={
                      !isAvatar
                        ? {
                            transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                            transformOrigin: "center center",
                            willChange: "transform",
                          }
                        : {}
                    }
                    onLoad={() => setIsImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setIsImageLoading(false); // Make sure to hide the loader on error
                    }}
                    onDragStart={(e) => e.preventDefault()}
                  />

                  {/* Adapted Loading Indicator from your LoadingModal */}
                  {isImageLoading && (
                    <div
                      className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/75 backdrop-blur-sm"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-[7px] border-gray-400 border-t-transparent"></div>
                        <p className="mt-4 text-lg font-medium text-gray-700">
                          Зареждане...
                        </p>
                      </div>
                    </div>
                  )}

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
              <div className="flex flex-col items-center w-full h-full">
                <div className="flex-1 w-full overflow-y-auto flex justify-center pt-4">
                  <Document
                    file={currentItem.url}
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
                      className="max-w-full"
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
            {effectiveGallery.length > 1 && !isAvatar && (
              <>
                <button
                  onClick={goToPrevious}
                  className="z-20 cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 focus:outline-none transition-opacity"
                  title="Предишен"
                >
                  <ChevronLeftIcon className="h-7 w-7" />
                </button>
                <button
                  onClick={goToNext}
                  className="z-20 cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 focus:outline-none transition-opacity"
                  title="Следващ"
                >
                  <ChevronRightIcon className="h-7 w-7" />
                </button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ImagePreviewModal;
