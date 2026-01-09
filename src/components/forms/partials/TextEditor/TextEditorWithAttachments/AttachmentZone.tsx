// src/components/forms/partials/TextEditor/TextEditorWithAttachments/AttachmentZone.tsx

import React from "react";
import ImagePreviewWithThumbnail, {
  ThumbnailGalleryItem,
} from "../../../../modals/imageModals/ImagePreviewWithThumbnail";

const apiUrl = import.meta.env.VITE_API_URL;

interface AttachmentZoneProps {
  newAttachments: File[];
  existingAttachments: string[];
  onRemoveNew: (index: number) => void;
  onRemoveExisting: (url: string) => void;
  caseId?: string;
}

const AttachmentZone: React.FC<AttachmentZoneProps> = ({
  newAttachments,
  existingAttachments,
  onRemoveNew,
  onRemoveExisting,
  caseId,
}) => {
  if (newAttachments.length === 0 && existingAttachments.length === 0)
    return null;

  // This galleryItems array now correctly includes ALL files.
  const galleryItems: ThumbnailGalleryItem[] = [
    // All existing attachments
    ...existingAttachments.map((url) => ({
      url: `${apiUrl}/static/cases/${caseId}/${url}`,
      name: url.split("/").pop() || "attachment",
      type: "existing" as const,
      identifier: url,
    })),
    // All new attachments
    ...newAttachments.map((file, index) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: "new" as const,
      identifier: index,
    })),
  ];

  const handleRemoveImage = (
    type: "new" | "existing",
    identifier: number | string
  ) => {
    if (type === "new") {
      onRemoveNew(identifier as number);
    } else {
      onRemoveExisting(identifier as string);
    }
  };

  return (
    <div className="px-3 pb-3 pt-2 border-t border-gray-200 bg-gray-50/50">
      <div className="flex flex-wrap gap-2">
        {galleryItems.length > 0 && (
          <ImagePreviewWithThumbnail
            galleryItems={galleryItems}
            onRemove={handleRemoveImage}
          />
        )}
      </div>
    </div>
  );
};

export default AttachmentZone;
