import React, { useState, useCallback } from "react";
import ImagePreviewModal, { GalleryItem } from "./ImagePreviewModal";

interface ImagePreviewWithThumbnailProps {
  galleryItems: GalleryItem[];
  initialIndex?: number;
  fileName?: string;
  displayName?: string;
  triggerElement?: React.ReactNode;
  isAvatar?: boolean;
}

const ImagePreviewWithThumbnail: React.FC<ImagePreviewWithThumbnailProps> = ({
  galleryItems,
  initialIndex = 0,
  fileName,
  displayName,
  triggerElement,
  isAvatar = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <ImagePreviewModal
        galleryItems={galleryItems}
        imageUrl={galleryItems[currentIndex].url}
        fileName={fileName || galleryItems[currentIndex].name}
        displayName={displayName}
        isAvatar={isAvatar}
        triggerElement={triggerElement}
      />

      <div className="flex gap-2 overflow-x-auto w-full justify-center px-2 py-2">
        {galleryItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
              index === currentIndex
                ? "border-blue-500 scale-105"
                : "border-transparent hover:border-gray-300"
            }`}
          >
            <img
              src={item.url}
              alt={item.name}
              className="object-cover w-full h-full"
              onError={(e) =>
                ((e.target as HTMLImageElement).src = "/placeholder.png")
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImagePreviewWithThumbnail;
