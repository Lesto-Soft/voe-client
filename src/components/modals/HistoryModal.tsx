import * as Dialog from "@radix-ui/react-dialog";
import { ICaseHistory } from "../../db/interfaces";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { ClockIcon } from "@heroicons/react/24/outline";
import { getDifferences } from "../../utils/contentDifferences";

// Priority color helper
const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "HIGH":
      return "text-red-600 font-bold";
    case "MEDIUM":
      return "text-yellow-600 font-bold";
    case "LOW":
      return "text-green-600 font-bold";
    default:
      return "text-gray-500";
  }
};

const CaseHistoryModal: React.FC<{ history: ICaseHistory[] }> = ({
  history,
}) => {
  const { t } = useTranslation("history");
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="hover: cursor-pointer flex items-center px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium border border-gray-300 transition"
          type="button"
        >
          <ClockIcon className="h-4 w-4" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-1/3 focus:outline-none">
          <Dialog.Title className="text-lg font-bold mb-4">
            {t("history")}
          </Dialog.Title>
          <ul className="space-y-2 text-sm max-h-96 overflow-y-auto">
            {history.map((h) => (
              <li key={h._id} className="text-gray-700 border-b pb-2">
                <div>
                  <span className="font-semibold">
                    {moment(h.date_change).format("LLL")}
                  </span>
                  {" – "}
                  <span className="font-medium">{h.user?.name}</span>
                </div>
                {/* Show changed fields if present */}
                <div className="ml-2">
                  {h.old_content !== h.new_content &&
                    h.old_content &&
                    h.new_content && (
                      <div>{getDifferences(h.old_content, h.new_content)}</div>
                    )}
                  {h.old_priority !== h.new_priority && (
                    <div>
                      <span className="text-gray-500">{t("priority")}: </span>
                      <span
                        className={`line-through ${getPriorityColor(
                          h.old_priority
                        )}`}
                      >
                        {t(`${h.old_priority}`)}
                      </span>
                      <span
                        className={`ml-2 ${getPriorityColor(h.new_priority)}`}
                      >
                        {t(`${h.new_priority}`)}
                      </span>
                    </div>
                  )}
                  {h.old_type !== h.new_type && (
                    <div>
                      <span className="text-gray-500">{t("type")}: </span>
                      <span className="line-through">{t(`${h.old_type}`)}</span>
                      <span className="ml-2">{t(`${h.new_type}`)}</span>
                    </div>
                  )}
                  {/* Categories diff */}
                  {(h.old_categories?.length > 0 ||
                    h.new_categories?.length > 0) && (
                    <div>
                      <span className="text-gray-500">{t("categories")}: </span>
                      <span className="line-through">
                        {h.old_categories?.map((cat) => cat.name).join(", ")}
                      </span>
                      <span className="ml-2">
                        {h.new_categories?.map((cat) => cat.name).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Dialog.Close asChild>
            <button
              className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition hover:cursor-pointer"
              type="button"
            >
              {t("close")}
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CaseHistoryModal;
