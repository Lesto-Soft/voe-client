import React, { useMemo } from "react";
import { renderContentSafely } from "../../utils/contentRenderer";
import { createFileUrl } from "../../utils/fileUtils";
import ImagePreviewModal, {
  GalleryItem,
} from "../modals/imageModals/ImagePreviewModal";

interface TaskDescriptionCardProps {
  description?: string;
  attachments?: string[];
  taskId?: string;
}

const TaskDescriptionCard: React.FC<TaskDescriptionCardProps> = ({
  description,
  attachments,
  taskId,
}) => {
  const galleryItems: GalleryItem[] = useMemo(
    () =>
      (attachments || []).map((file) => ({
        url: createFileUrl("tasks", taskId || "", file),
        name: file,
      })),
    [attachments, taskId],
  );

  if (!description && (!attachments || attachments.length === 0)) {
    return (
      <div>
        <h3 className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-1.5">
          Описание:
        </h3>
        <p className="text-gray-400 italic text-sm">Няма описание.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <h3 className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-1.5 flex-shrink-0">
        Описание:
      </h3>
      <div className="overflow-y-auto custom-scrollbar-xs flex-1 min-h-0">
        <div className="bg-gray-50 rounded-md p-3 text-gray-900 text-sm break-words">
          {description && renderContentSafely(description)}
        </div>
        <div>
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map((file) => (
                <ImagePreviewModal
                  key={file}
                  galleryItems={galleryItems}
                  imageUrl={createFileUrl("tasks", taskId || "", file)}
                  fileName={file}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDescriptionCard;
