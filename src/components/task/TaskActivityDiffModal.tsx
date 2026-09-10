import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CodeBracketIcon, DocumentTextIcon, EyeIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ITaskActivity } from "../../db/interfaces";
import { getDifferences } from "../../utils/contentDifferences";
import { isHtmlContent, stripHtmlTags } from "../../utils/contentRenderer";
import UserLink from "../global/links/UserLink";
import ShowDate from "../global/ShowDate";

type ViewMode = "content" | "formatting";

/**
 * Shows the full before/after of an attribute-change activity (title or
 * description) — the feed entry itself only carries a truncated preview.
 * Mirrors the diff rendering used by the answer history modal.
 */
const TaskActivityDiffModal: React.FC<{
  activity: ITaskActivity;
  changeLabel: string;
}> = ({ activity, changeLabel }) => {
  const oldContent = activity.oldValue || "";
  const newContent = activity.newValue || "";

  const hasContentChange =
    stripHtmlTags(oldContent) !== stripHtmlTags(newContent);
  const hasFormattingChange =
    isHtmlContent(oldContent) || isHtmlContent(newContent);
  const isFormattingOnlyChange = !hasContentChange && hasFormattingChange;

  const [viewMode, setViewMode] = useState<ViewMode>(
    isFormattingOnlyChange ? "formatting" : "content",
  );

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/70 hover:bg-white text-xs font-medium border border-gray-300 text-gray-600 hover:text-gray-800 transition cursor-pointer flex-shrink-0"
          title="Виж пълната промяна"
        >
          <EyeIcon className="h-3.5 w-3.5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden focus:outline-none flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-bold text-gray-900">
              {changeLabel}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="cursor-pointer p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                aria-label="Затвори"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex items-center gap-6 mb-3">
            <UserLink user={activity.createdBy} />
            <ShowDate date={activity.createdAt} />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar-xs">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-md text-gray-500 font-bold underline">
                  Промяна:
                </span>
                {hasFormattingChange && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewMode("content")}
                      disabled={!hasContentChange}
                      title="Вижте промени в текста"
                      className={`flex items-center px-2 py-0.5 text-xs rounded-md border transition-colors ${
                        viewMode === "content"
                          ? "bg-gray-600 text-white border-gray-600 font-semibold"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                      }`}
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                      Текст
                    </button>
                    <button
                      onClick={() => setViewMode("formatting")}
                      title="Вижте промени във форматирането"
                      className={`flex items-center px-2 py-0.5 text-xs rounded-md border transition-colors ${
                        viewMode === "formatting"
                          ? "bg-gray-600 text-white border-gray-600 font-semibold"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:cursor-pointer"
                      }`}
                    >
                      <CodeBracketIcon className="h-4 w-4 mr-1.5" />
                      Формат
                    </button>
                  </div>
                )}
              </div>

              {getDifferences(oldContent, newContent, viewMode)}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
            <Dialog.Close asChild>
              <button
                className="hover:cursor-pointer px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                type="button"
              >
                Затвори
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TaskActivityDiffModal;
