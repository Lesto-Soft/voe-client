import React, { useState } from "react";
import { CodeBracketIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
import { ClockIcon } from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import UserLink from "../global/UserLink";
import { getDifferences } from "../../utils/contentDifferences";
import ShowDate from "../global/ShowDate";
import { IAnswerHistory } from "../../db/interfaces";
import { isHtmlContent, stripHtmlTags } from "../../utils/contentRenderer";

type ViewMode = "content" | "formatting";

const AnswerHistoryModal: React.FC<{
  history?: IAnswerHistory[];
}> = ({ history }) => {
  const { t } = useTranslation("modals");
  const [viewModes, setViewModes] = useState<{ [key: string]: ViewMode }>({});

  const handleToggle = (historyId: string, mode: ViewMode) => {
    setViewModes((prev) => ({ ...prev, [historyId]: mode }));
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="hover:cursor-pointer flex items-center px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs font-medium border border-gray-300 transition ml-2"
          type="button"
          title="История на промените"
        >
          <ClockIcon className="h-4 w-4" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden focus:outline-none">
          <Dialog.Title className="text-lg font-bold mb-4 text-gray-900 shadow-xs">
            {t("answerHistory", "История на решението")}
          </Dialog.Title>

          <div className="max-h-96 overflow-y-auto pr-2">
            {history && history.length > 0 ? (
              <ul className="space-y-4">
                {history.map((h: IAnswerHistory) => {
                  const oldContent = h.old_content || "";
                  const newContent = h.new_content || "";
                  const hasContentChange =
                    stripHtmlTags(oldContent) !== stripHtmlTags(newContent);
                  const hasFormattingChange =
                    isHtmlContent(oldContent) || isHtmlContent(newContent);

                  const isFormattingOnlyChange =
                    !hasContentChange && hasFormattingChange;
                  const defaultView = isFormattingOnlyChange
                    ? "formatting"
                    : "content";
                  const currentView = viewModes[h._id] || defaultView;

                  return (
                    <li
                      key={h._id}
                      className="border-b border-gray-200 pb-4 last:border-b-0"
                    >
                      <div className="flex items-center gap-6 mb-3">
                        <UserLink user={h.user} />
                        <ShowDate date={h.date_change} />
                      </div>

                      {h.old_content !== h.new_content && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-md text-gray-500 font-bold underline">
                              Съдържание:
                            </span>
                            {hasFormattingChange && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleToggle(h._id, "content")}
                                  disabled={!hasContentChange}
                                  title="Вижте промени в текста"
                                  className={`flex items-center px-2 py-0.5 text-xs rounded-md border transition-colors ${
                                    currentView === "content"
                                      ? "bg-gray-600 text-white border-gray-600 font-semibold"
                                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                  }`}
                                >
                                  <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                                  Текст
                                </button>
                                <button
                                  onClick={() =>
                                    handleToggle(h._id, "formatting")
                                  }
                                  disabled={!hasFormattingChange}
                                  title="Вижте промени във форматирането"
                                  className={`flex items-center px-2 py-0.5 text-xs rounded-md border transition-colors ${
                                    currentView === "formatting"
                                      ? "bg-gray-600 text-white border-gray-600 font-semibold"
                                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                  }`}
                                >
                                  <CodeBracketIcon className="h-4 w-4 mr-1.5" />
                                  Формат
                                </button>
                              </div>
                            )}
                          </div>

                          {getDifferences(
                            h.old_content,
                            h.new_content,
                            currentView
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8">
                <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 italic">
                  {t("noHistory", "Няма история на промени")}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
            <Dialog.Close asChild>
              <button
                className="hover:cursor-pointer px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                type="button"
              >
                {t("close", "Затвори")}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AnswerHistoryModal;
