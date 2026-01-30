// src/components/modals/imageModals/FileThumbnail.tsx

import React, { useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { getIconForFile } from "../../../utils/fileUtils";

interface FileThumbnailProps {
  item: {
    url: string;
    name: string;
  };
}

const FileThumbnail: React.FC<FileThumbnailProps> = ({ item }) => {
  const [hasError, setHasError] = useState(false);

  const ext = item.name.split(".").pop()?.toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
    ext || ""
  );

  // --- Logic ---
  // 1. If it's an image AND there's no error, try to render it.
  if (isImage && !hasError) {
    return (
      <img
        src={item.url}
        alt={item.name}
        className="w-10 h-10 object-cover rounded-md border border-gray-200"
        onError={() => setHasError(true)} // Set error state on failure
      />
    );
  }

  // 2. If it's an image AND there IS an error, render the fallback icon.
  if (isImage && hasError) {
    return (
      <div className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-md">
        <PhotoIcon className="w-7 h-7 text-gray-400" />
      </div>
    );
  }

  // 3. If it's not an image, render the specific file-type icon.
  const IconComponent = getIconForFile(item.name);
  return (
    <div className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-md">
      <IconComponent className="w-7 h-7 text-gray-500" />
    </div>
  );
};

export default FileThumbnail;
