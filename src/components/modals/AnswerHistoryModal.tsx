import React from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { getDifferences } from "../../utils/contentDifferences";

const AnswerHistoryModal: React.FC<{
  history?: any[];
}> = ({ history }) => {
  const { t } = useTranslation("modals");
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="hover:cursor-pointer flex items-center px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs font-medium border border-gray-300 transition ml-2"
          type="button"
          title="История"
        >
          <ClockIcon className="h-4 w-4" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-lg focus:outline-none">
          <Dialog.Title className="text-lg font-bold mb-4">
            {t("history")}
          </Dialog.Title>
          <ul className="space-y-2 text-sm max-h-96 overflow-y-auto">
            {history && history.length > 0 ? (
              history.map((h: any) => (
                <li key={h._id} className="text-gray-700 border-b pb-2">
                  <div>
                    <span className="font-semibold">
                      {moment(h.date_change).format("LLL")}
                    </span>
                    {" – "}
                    <span className="font-medium">{h.user?.name}</span>
                  </div>
                  <div className="ml-2">
                    {h.old_content !== h.new_content &&
                      h.old_content &&
                      h.new_content && (
                        <div>
                          {getDifferences(h.old_content, h.new_content)}
                        </div>
                      )}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic">{t("noHistory")}</li>
            )}
          </ul>
          <div className="flex justify-end">
            <Dialog.Close asChild>
              <button
                className="hover:cursor-pointer mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition "
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
export default AnswerHistoryModal;
