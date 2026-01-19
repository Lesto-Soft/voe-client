// src/components/forms/partials/TextEditor/TextEditorWithAttachments/AttachmentZone.tsx
import React, { useEffect, useState } from "react";
import ImagePreviewWithThumbnail, {
  ThumbnailGalleryItem,
} from "../../../../modals/imageModals/ImagePreviewWithThumbnail";

const apiUrl = import.meta.env.VITE_API_URL;

interface AttachmentZoneProps {
  newAttachments: File[];
  existingAttachments?: string[];
  onRemoveNew: (index: number) => void;
  onRemoveExisting?: (url: string) => void;
  caseId?: string;
}

const AttachmentZone: React.FC<AttachmentZoneProps> = ({
  newAttachments,
  existingAttachments,
  onRemoveNew,
  onRemoveExisting,
  caseId,
}) => {
  const [galleryItems, setGalleryItems] = useState<ThumbnailGalleryItem[]>([]);

  useEffect(() => {
    // Generate URLs for new files and track them for cleanup
    const objectUrls: string[] = [];

    const items: ThumbnailGalleryItem[] = [
      ...(existingAttachments || []).map((url) => ({
        url: `${apiUrl}/static/cases/${caseId}/${url}`,
        name: url.split("/").pop() || "attachment",
        type: "existing" as const,
        identifier: url,
      })),
      ...newAttachments.map((file, index) => {
        const url = URL.createObjectURL(file);
        objectUrls.push(url);
        return {
          url,
          name: file.name,
          size: file.size,
          type: "new" as const,
          identifier: index,
        };
      }),
    ];

    setGalleryItems(items);

    // CLEANUP: Revoke all created URLs when attachments change or component unmounts
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newAttachments, existingAttachments, caseId]);

  if (galleryItems.length === 0) return null;

  return (
    <div className="px-3 pb-3 pt-2  border-gray-200 bg-gray-50/50">
      <div className="flex flex-wrap gap-2">
        <ImagePreviewWithThumbnail
          galleryItems={galleryItems}
          onRemove={(type, id) => {
            if (type === "new") onRemoveNew(id as number);
            else if (onRemoveExisting) onRemoveExisting(id as string);
          }}
        />
      </div>
    </div>
  );
};

export default AttachmentZone;
