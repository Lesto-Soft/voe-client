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
  folder?: string;
}

const AttachmentZone: React.FC<AttachmentZoneProps> = ({
  newAttachments,
  existingAttachments,
  onRemoveNew,
  onRemoveExisting,
  caseId,
  folder = "cases",
}) => {
  const [galleryItems, setGalleryItems] = useState<ThumbnailGalleryItem[]>([]);

  const [fileUrls, setFileUrls] = useState<Map<File, string>>(new Map());

  useEffect(() => {
    setFileUrls((prevMap) => {
      const newMap = new Map(prevMap);
      let hasChanged = false;

      for (const [file, url] of prevMap.entries()) {
        if (!newAttachments.includes(file)) {
          URL.revokeObjectURL(url);
          newMap.delete(file);
          hasChanged = true;
        }
      }

      newAttachments.forEach((file) => {
        if (!newMap.has(file)) {
          newMap.set(file, URL.createObjectURL(file));
          hasChanged = true;
        }
      });

      return hasChanged ? newMap : prevMap;
    });
  }, [newAttachments]);

  useEffect(() => {
    const items: ThumbnailGalleryItem[] = [
      ...(existingAttachments || []).map((url) => ({
        url: `${apiUrl}/static/${folder}/${caseId}/${url}`,
        name: url.split("/").pop() || "attachment",
        type: "existing" as const,
        identifier: url,
      })),
      ...newAttachments
        .map((file, index) => ({
          url: fileUrls.get(file) || "",
          name: file.name,
          size: file.size,
          type: "new" as const,
          identifier: index,
        }))
        .filter((item) => item.url !== ""),
    ];

    setGalleryItems(items);
  }, [newAttachments, existingAttachments, fileUrls, caseId]);

  useEffect(() => {
    return () => {
      fileUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  if (galleryItems.length === 0) return null;

  return (
    <div className="px-3 pb-3 pt-2">
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
