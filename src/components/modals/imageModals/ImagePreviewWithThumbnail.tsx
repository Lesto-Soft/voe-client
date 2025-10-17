import React, { useState } from "react";
import { XCircleIcon } from "@heroicons/react/24/solid";
import ImagePreviewModal, { GalleryItem } from "./ImagePreviewModal";
import { getIconForFile } from "../../../utils/fileUtils";

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

  const renderFilePreview = (item: GalleryItem) => {
    const ext = item.name.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || ""))
      return (
        <img
          src={item.url}
          alt={item.name}
          className="w-10 h-10 object-cover rounded-md border border-gray-200"
          onError={(e) =>
            ((e.target as HTMLImageElement).src = "/placeholder.png")
          }
        />
      );
    const IconComponent = getIconForFile(item.name);
    return (
      <div className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-md">
        <IconComponent className="w-7 h-7 text-gray-500" />
      </div>
    );
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
                {renderFilePreview(item)}
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
                    <XCircleIcon className="w-5 h-5" />
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
