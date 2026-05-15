import React, { useState, useEffect, useMemo } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { ITaskActivity } from "../../db/interfaces";
import { useUpdateTaskActivity } from "../../graphql/hooks/task";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";
import UnifiedEditor from "../forms/partials/UnifiedRichTextEditor";
import { getTextLength } from "../../utils/contentRenderer";

interface EditTaskActivityModalProps {
  activity: ITaskActivity;
  taskId: string;
  mentions?: { name: string; username: string; _id: string }[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const EditTaskActivityModal: React.FC<EditTaskActivityModalProps> = ({
  activity,
  taskId,
  mentions = [],
  isOpen,
  onOpenChange,
  onSaved,
}) => {
  const [content, setContent] = useState("");
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [initialContent, setInitialContent] = useState("");
  const [initialExistingAttachments, setInitialExistingAttachments] = useState<
    string[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { updateTaskActivity, loading } = useUpdateTaskActivity(taskId);

  useEffect(() => {
    if (isOpen && activity) {
      const initContent = activity.content || "";
      const initFiles = activity.attachments || [];

      setContent(initContent);
      setInitialContent(initContent);
      setExistingAttachments(initFiles);
      setInitialExistingAttachments(initFiles);
      setNewAttachments([]);
      setError(null);
    }
  }, [isOpen, activity]);

  const hasChanges = useMemo(() => {
    if (loading) return false;
    if (content !== initialContent) return true;
    if (newAttachments.length > 0) return true;
    if (initialExistingAttachments.length !== existingAttachments.length)
      return true;
    return (
      [...initialExistingAttachments].sort().join(",") !==
      [...existingAttachments].sort().join(",")
    );
  }, [
    content,
    newAttachments,
    existingAttachments,
    initialContent,
    initialExistingAttachments,
    loading,
  ]);

  const handleCloseRequest = (open: boolean) => {
    if (!open && hasChanges) {
      setIsConfirmOpen(true);
    } else {
      onOpenChange(open);
    }
  };

  const handleSave = async () => {
    setError(null);

    const deletedAttachments = initialExistingAttachments.filter(
      (url) => !existingAttachments.includes(url),
    );

    try {
      await updateTaskActivity(activity._id, {
        content,
        attachments: newAttachments.length > 0 ? newAttachments : undefined,
        deletedAttachments:
          deletedAttachments.length > 0 ? deletedAttachments : undefined,
      });
      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      setError(err.message || "Грешка при запис на записа.");
    }
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleCloseRequest}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content
            onPointerDownOutside={(e) => {
              if ((e.target as Element)?.closest("[data-tippy-root]")) {
                e.preventDefault();
              }
            }}
            className="fixed top-1/2 left-1/2 w-[90%] max-w-6xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 flex flex-col overflow-hidden max-h-[85vh]"
          >
            <div data-mention-container="true" className="relative z-[1001]" />
            <div className="p-6 pb-2 flex-shrink-0">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-2">
                Редактирай запис
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500">
                Редактирайте съдържанието на записа.
              </Dialog.Description>
            </div>

            <div className="flex-grow overflow-hidden flex flex-col px-6 min-h-0">
              <UnifiedEditor
                content={content}
                onContentChange={setContent}
                attachments={newAttachments}
                setAttachments={setNewAttachments}
                existingAttachments={existingAttachments}
                setExistingAttachments={setExistingAttachments}
                mentions={mentions}
                placeholder="Редактирайте съдържанието..."
                editorClassName="min-h-0"
                minLength={0}
                maxLength={1500}
                hideSideButtons={true}
                onProcessingChange={setIsProcessing}
                caseId={activity._id}
                type="taskActivity"
                attachmentFolder="taskActivities"
                enableFullscreen
              />
            </div>

            {error && (
              <div className="mx-6 my-2 flex items-start p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800 font-bold">{error}</p>
              </div>
            )}

            <div className="p-6 pt-2 border-t border-gray-100 flex justify-end gap-2 flex-shrink-0">
              <Dialog.Close asChild>
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                  type="button"
                  disabled={loading || isProcessing}
                >
                  Отказ
                </button>
              </Dialog.Close>
              <button
                onClick={handleSave}
                disabled={
                  loading ||
                  isProcessing ||
                  !hasChanges ||
                  getTextLength(content) > 1500
                }
                className="px-6 py-2 text-sm font-medium text-white rounded transition-all shadow-md bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed"
                type="button"
              >
                {loading ? "Запазване..." : "Запази"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmActionDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={() => {
          setIsConfirmOpen(false);
          onOpenChange(false);
        }}
        title="Незапазени промени"
        description="Имате незапазен текст или прикачени файлове, които ще бъдат изгубени. Сигурни ли сте, че искате да затворите?"
        confirmButtonText="Затвори"
        isDestructiveAction={true}
      />
    </>
  );
};

export default EditTaskActivityModal;
