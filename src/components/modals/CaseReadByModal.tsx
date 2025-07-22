// src/components/modals/CaseReadByModal.tsx
import React, { useMemo } from "react";
import ReactDOM from "react-dom";
import { IReadBy } from "../../db/interfaces";
import UserAvatar from "../cards/UserAvatar";
import UserLink from "../global/UserLink";
import ShowDate from "../global/ShowDate";
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
  caseNumber,
}) => {
  // Sort the data by most recent date first
  const sortedData = useMemo(() => {
    return [...readByData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [readByData]);

  if (!isOpen) {
    return null;
  }

  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[99] p-4" //backdrop-blur-sm
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
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
        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
          {sortedData.length > 0 ? (
            <ul className="space-y-3">
              {sortedData.map((entry) => (
                <li
                  key={entry.user._id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
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
                    <div className="flex flex-col">
                      <UserLink user={entry.user} />
                      <span className="text-xs text-gray-500">
                        {entry.user.username}
                      </span>
                    </div>
                  </div>
                  <div className="pr-5">
                    <ShowDate date={entry.date} />
                  </div>
                </li>
              ))}
            </ul>
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
