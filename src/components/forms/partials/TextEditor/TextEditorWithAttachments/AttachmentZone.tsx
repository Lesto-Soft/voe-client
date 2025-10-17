// src/components/forms/partials/TextEditorWithAttachments/AttachmentZone.tsx

import React, { useState, useEffect, useRef } from "react";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { getIconForFile } from "../../../../../utils/fileUtils";
import { formatFileSize } from "../../../../../utils/formatters";

const apiUrl = import.meta.env.VITE_API_URL;
// Thumbnail for existing attachments (with error handling)
const ExistingAttachmentThumbnail: React.FC<{
  url: string;
  onImageClick: () => void;
  caseId?: string;
}> = ({ url, onImageClick, caseId }) => {
  const [hasError, setHasError] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const isLikelyImage = /\.(jpe?g|png|gif|webp|svg)$/i.test(url);

  if (!isLikelyImage || hasError) {
    const IconComponent = getIconForFile(url);
    return <IconComponent className="w-8 h-8 text-gray-500" />;
  }
  const fullUrl = `${apiUrl}/static/cases/${caseId}/${url}`;
  console.log("Rendering existing attachment:", fullUrl);
  return (
    <button type="button" onClick={onImageClick} className="block">
      <img
        src={fullUrl}
        alt={url}
        className="w-8 h-8 rounded object-cover"
        onError={() => {
          if (isMounted.current) {
            setHasError(true);
          }
        }}
      />
    </button>
  );
};

interface AttachmentZoneProps {
  newAttachments: File[];
  existingAttachments: string[];
  onRemoveNew: (index: number) => void;
  onRemoveExisting: (url: string) => void;
  onImageClick: (url: string) => void;
  caseId?: string;
}

const AttachmentZone: React.FC<AttachmentZoneProps> = ({
  newAttachments,
  existingAttachments,
  onRemoveNew,
  onRemoveExisting,
  onImageClick,
  caseId,
}) => {
  if (newAttachments.length === 0 && existingAttachments.length === 0) {
    return null;
  }

  const renderFilePreview = (file: File) => {
    console.log("Rendering file:", file.name, file.type);
    if (file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      return (
        <button type="button" onClick={() => onImageClick(objectUrl)}>
          <img
            src={objectUrl}
            alt={file.name}
            className="w-8 h-8 rounded object-cover"
          />
        </button>
      );
    }
    const IconComponent = getIconForFile(file.name);
    return <IconComponent className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="px-3 pb-3 pt-2 border-t border-gray-200 bg-gray-50/50">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {existingAttachments.map((url) => {
          const fileName = url.split("/").pop()?.split("?")[0] || "attachment";
          return (
            <div
              key={url}
              className="flex items-center bg-white p-2 border border-gray-200 rounded-md text-xs text-gray-700"
            >
              <ExistingAttachmentThumbnail
                url={url}
                onImageClick={() => onImageClick(url)}
                caseId={caseId}
              />
              <span className="ml-2 truncate flex-1" title={fileName}>
                {fileName}
              </span>
              <button
                type="button"
                onClick={() => onRemoveExisting(url)}
                className="ml-2 text-gray-400 hover:text-red-500"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          );
        })}
        {newAttachments.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center bg-white p-2 border border-gray-200 rounded-md text-xs text-gray-700"
          >
            {renderFilePreview(file)}
            <div className="ml-2 truncate flex-1">
              <p className="truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => onRemoveNew(index)}
              className="ml-2 text-gray-400 hover:text-red-500"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentZone;
