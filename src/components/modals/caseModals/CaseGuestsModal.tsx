// src/components/modals/caseModals/CaseGuestsModal.tsx
import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { ICaseHistory, IUser } from "../../../db/interfaces";
import UserAvatar from "../../cards/UserAvatar";
import UserLink from "../../global/links/UserLink";
import ShowDate from "../../global/ShowDate";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { UserGroupIcon } from "@heroicons/react/24/solid";

interface CaseGuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: IUser[];
  history?: ICaseHistory[];
  canManage: boolean;
  onRemove: (guest: IUser) => Promise<void>;
  isRemoving: boolean;
}

const CaseGuestsModal: React.FC<CaseGuestsModalProps> = ({
  isOpen,
  onClose,
  guests,
  history = [],
  canManage,
  onRemove,
  isRemoving,
}) => {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // the latest history entry that added each guest: who granted it and when
  const grants = useMemo(() => {
    const byGuest = new Map<string, ICaseHistory>();
    const newestFirst = [...history].sort(
      (a, b) =>
        new Date(b.date_change).getTime() - new Date(a.date_change).getTime()
    );
    for (const entry of newestFirst) {
      for (const guest of entry.added_guests || []) {
        if (!byGuest.has(guest._id)) byGuest.set(guest._id, entry);
      }
    }
    return byGuest;
  }, [history]);

  if (!isOpen) {
    return null;
  }

  const serverBaseUrl = import.meta.env.VITE_API_URL || "";
  const close = () => {
    setConfirmingId(null);
    onClose();
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[99] p-4"
      onClick={close}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Достъпен и за"
      >
        {/* Header */}
        <div className="flex justify-between items-start p-4 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <UserGroupIcon className="h-6 w-6 text-amber-500 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Достъпен и за ({guests.length})
              </h2>
              <p className="text-xs text-gray-500">
                Потребители, получили достъп, защото са споменати в сигнала, без
                да са експерти или мениджъри на категориите му.
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="cursor-pointer p-1 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
            title="Затвори"
          >
            <XMarkIcon className="cursor-pointer h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar-xs">
          {guests.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {guests.map((guest) => {
                const grant = grants.get(guest._id);
                const isConfirming = confirmingId === guest._id;
                return (
                  <li
                    key={guest._id}
                    className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0">
                      <UserAvatar
                        name={guest.name}
                        imageUrl={
                          guest.avatar
                            ? `${serverBaseUrl}/static/avatars/${guest._id}/${guest.avatar}`
                            : null
                        }
                        size={40}
                        enablePreview={true}
                      />
                    </div>
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <UserLink user={guest} />
                      {guest.position && (
                        <span className="text-xs text-gray-500 truncate">
                          {guest.position}
                        </span>
                      )}
                    </div>
                    {grant && (
                      <div className="hidden sm:flex flex-col items-end text-xs text-gray-500 flex-shrink-0">
                        <span className="flex items-center gap-1">
                          добавен от <UserLink user={grant.user} />
                        </span>
                        <ShowDate date={grant.date_change} />
                      </div>
                    )}
                    {canManage && (
                      <div className="flex-shrink-0 flex items-center gap-1 pl-2">
                        {isConfirming ? (
                          <>
                            <span className="text-xs text-gray-600 mr-1">
                              Премахване на достъпа?
                            </span>
                            <button
                              type="button"
                              disabled={isRemoving}
                              onClick={async () => {
                                await onRemove(guest);
                                setConfirmingId(null);
                              }}
                              className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer disabled:opacity-50"
                            >
                              Премахни
                            </button>
                            <button
                              type="button"
                              disabled={isRemoving}
                              onClick={() => setConfirmingId(null)}
                              className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
                            >
                              Отказ
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmingId(guest._id)}
                            title="Премахни достъпа"
                            className="rounded-md p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 cursor-pointer"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center text-gray-500 italic py-8">
              Няма потребители с допълнителен достъп.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CaseGuestsModal;
