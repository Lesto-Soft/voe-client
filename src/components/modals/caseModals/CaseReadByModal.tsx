// src/components/modals/CaseReadByModal.tsx
import React, { useMemo } from "react";
import ReactDOM from "react-dom";
import { IReadBy } from "../../../db/interfaces";
import UserAvatar from "../../cards/UserAvatar";
import UserLink from "../../global/links/UserLink";
import ShowDate from "../../global/ShowDate";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { EyeIcon } from "@heroicons/react/24/solid";

interface CaseReadByModalProps {
  isOpen: boolean;
  onClose: () => void;
  readByData?: IReadBy[];
  caseNumber: number;
}

const CaseReadByModal: React.FC<CaseReadByModalProps> = ({
  isOpen,
  onClose,
  readByData = [],
}) => {
  // Sort by most recent activity (last opened, falling back to first read);
  // dateless entries are treated as oldest and pushed to the bottom
  const sortedData = useMemo(() => {
    const activityTime = (entry: IReadBy) => {
      const date = entry.lastReadAt || entry.date;
      return date ? new Date(date).getTime() : 0;
    };
    return [...readByData].sort((a, b) => activityTime(b) - activityTime(a));
  }, [readByData]);

  if (!isOpen) {
    return null;
  }

  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[99] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <EyeIcon className="h-6 w-6 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">
              Видяно от ({sortedData.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-1 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
            title="Затвори"
          >
            <XMarkIcon className="cursor-pointer h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar-xs">
          {sortedData.length > 0 ? (
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="text-xs text-gray-400">
                  <th className="text-left font-medium pb-2 pl-2">
                    Потребител
                  </th>
                  <th className="text-left font-medium pb-2 w-40">Първо</th>
                  <th className="text-left font-medium pb-2 pr-2 w-40">
                    Последно
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedData.map((entry) => (
                  <tr key={entry.user._id} className="hover:bg-gray-50">
                    <td className="py-2 pl-2 pr-3 overflow-hidden">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0">
                          <UserAvatar
                            name={entry.user.name}
                            imageUrl={
                              entry.user.avatar
                                ? `${serverBaseUrl}/static/avatars/${entry.user._id}/${entry.user.avatar}`
                                : null
                            }
                            size={40}
                            enablePreview={true}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <UserLink user={entry.user} />
                          <span className="text-xs text-gray-500">
                            {entry.user.username}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {entry.date ? (
                        <ShowDate date={entry.date} />
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap">
                      {entry.lastReadAt ? (
                        <ShowDate date={entry.lastReadAt} />
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-gray-500 italic py-8">
              Все още никой не е прочел сигнала.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CaseReadByModal;
