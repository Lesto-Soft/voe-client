import React from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import UserLink from "../global/UserLink";
import { getDifferences } from "../../utils/contentDifferences";
import ShowDate from "../global/ShowDate";

const AnswerHistoryModal: React.FC<{
  history?: any[];
}> = ({ history }) => {
  const { t } = useTranslation("modals");
  console.log(history);

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
          <Dialog.Title className="text-lg font-bold mb-4 text-gray-900">
            {t("answerHistory", "История на отговора")}
          </Dialog.Title>

          <div className="max-h-96 overflow-y-auto pr-2">
            {history && history.length > 0 ? (
              <ul className="space-y-4">
                {history.map((h: any) => (
                  <li
                    key={h._id}
                    className="border-b border-gray-100 pb-4 last:border-b-0"
                  >
                    <div className="flex items-center gap-6 mb-3">
                      <ShowDate date={h.date_change} />
                      <UserLink user={h.user} />
                    </div>

                    {h.old_content !== h.new_content &&
                      h.old_content &&
                      h.new_content && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          {getDifferences(h.old_content, h.new_content)}
                        </div>
                      )}
                  </li>
                ))}
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

          <div className="flex justify-end pt-4 border-t mt-4">
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
