import React, { useState } from "react";
import { XCircleIcon } from "@heroicons/react/24/solid";
import ImagePreviewModal, { GalleryItem } from "./ImagePreviewModal";
import { getIconForFile } from "../../../utils/fileUtils";
import FileThumbnail from "./FileThumbnail";

export interface ThumbnailGalleryItem extends GalleryItem {
  type: "new" | "existing";
  identifier: number | string;
  size?: number;
}

interface ImagePreviewWithThumbnailProps {
  galleryItems: ThumbnailGalleryItem[];
  onRemove?: (type: "new" | "existing", identifier: number | string) => void;
}

const ImagePreviewWithThumbnail: React.FC<ImagePreviewWithThumbnailProps> = ({
  galleryItems,
  onRemove,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const formatFileSize = (size: number) => {
    if (!size) return "";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {galleryItems.map((item, index) => (
        <ImagePreviewModal
          key={`${item.identifier}-${item.name}`}
          galleryItems={galleryItems}
          imageUrl={item.url}
          fileName={item.name}
          triggerElement={
            <div
              onClick={() => setCurrentIndex(index)}
              className={`flex items-center bg-white p-2 border border-gray-200 rounded-md text-xs text-gray-700 w-[11.5rem] cursor-pointer transition-all hover:shadow-sm hover:border-blue-300 ${
                index === currentIndex ? "ring-1 ring-blue-400" : ""
              }`}
              title={item.name}
            >
              <div className="flex items-center flex-1 truncate">
                <FileThumbnail item={item} />
                <div className="ml-2 truncate flex-1">
                  <p className="truncate font-medium" title={item.name}>
                    {item.name}
                  </p>
                  {item.size !== undefined && (
                    <p className="text-gray-500">
                      {formatFileSize(item.size as number)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center ml-2 flex-shrink-0">
                {onRemove && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.type, item.identifier);
                    }}
                    className="text-gray-400 hover:text-red-500 relative cursor-pointer"
                  >
                    <XCircleIcon className="w-8 h-8" />
                  </button>
                )}
              </div>
            </div>
          }
        />
      ))}
    </div>
  );
};

export default ImagePreviewWithThumbnail;
