import React from "react";
import {
  EllipsisHorizontalIcon,
  FlagIcon,
  TrashIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  PaperClipIcon,
} from "@heroicons/react/24/solid";
import moment from "moment";
// @ts-ignore
import "moment/dist/locale/bg";
import { ICase } from "../../db/interfaces";
import { useEffect, useState } from "react";
import UserLink from "../global/links/UserLink";
import CategoryLink from "../global/links/CategoryLink";
import CaseLink from "../global/links/CaseLink";
import {
  getPriorityStyle,
  getStatusStyle,
  getTypeBadgeStyle,
} from "../../utils/style-helpers";
import { getContentPreview, stripHtmlTags } from "../../utils/contentRenderer";
import { useCurrentUser } from "../../context/UserContext";
import { ROLES } from "../../utils/GLOBAL_PARAMETERS";
import {
  useDeleteCase,
  useToggleCaseReadStatus,
} from "../../graphql/hooks/case";
import ErrorModal from "../modals/ErrorModal";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";

interface ICaseTableProps {
  cases: ICase[];
  t: (word: string) => string;
  onCaseDeleted?: () => void;
}

// --- Main CaseTable Component ---
const CaseTable: React.FC<ICaseTableProps> = ({
  cases,
  t,
  onCaseDeleted: onActionComplete,
}) => {
  const currentUser = useCurrentUser();
  const { deleteCase, error: deleteError } = useDeleteCase({
    onCompleted: () => {
      if (onActionComplete) {
        onActionComplete();
      }
    },
  });

  // ADDED: Hook for the toggle functionality
  const { toggleReadStatus } = useToggleCaseReadStatus({
    onCompleted: () => {
      if (onActionComplete) {
        onActionComplete();
      }
    },
  });

  // State to hold the current window width (still needed for description truncation)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // State for dropdown menu
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // 3. Add state to hold the ID of the case to be deleted
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);

  // Effect to update window width on resize
  useEffect(() => {
    // Ensure window is defined (for SSR compatibility if needed)
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array means this effect runs only on mount and unmount

  // Function to determine the truncation length based on window width
  const getContentTruncateLength = (): number => {
    if (windowWidth < 768) {
      // Tailwind 'md' breakpoint
      return 25; // Shorter length for small screens
    } else if (windowWidth < 1280) {
      // Tailwind 'xl' breakpoint
      return 40; // Medium length for medium screens
    } else {
      return 60; // Longer length for large screens
    }
  };

  // Function to handle dropdown toggle
  const toggleDropdown = (caseId: string) => {
    setOpenDropdown((prev) => (prev === caseId ? null : caseId));
  };

  const handleConfirmDelete = () => {
    if (caseToDelete) {
      deleteCase(caseToDelete);
      setCaseToDelete(null); // Close the modal
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    // Function to close the dropdown
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    // If a dropdown is open, add a click listener to the document
    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      // Cleanup: remove the listener when the component unmounts or the dropdown closes
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [openDropdown]);

  if (deleteError) {
    return <ErrorModal message="Проблем с изтриването на сигнал." />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 lg:px-8">
      <div className="flex-1 min-h-0 overflow-y-auto shadow-md rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Head */}
          <thead className="bg-gray-500 sticky top-0 z-10">
            <tr>
              {/* First Header (No separator) */}
              <th
                scope="col"
                className="w-24 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide cursor-pointer hover:bg-gray-600"
              >
                {t("case_number")}
              </th>
              {/* Subsequent Headers (Simplified structure) */}
              <th
                scope="col"
                className="w-3 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative"
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                {t("priority")}
              </th>
              <th
                scope="col"
                className="w-28 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative"
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                {t("type")}
              </th>
              <th
                scope="col"
                className="max-w-[150px] px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative"
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                {t("creator")}
              </th>
              <th
                scope="col"
                className="max-w-[180px] px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide hidden md:table-cell relative"
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 pr-2 text-gray-400 hidden md:inline-block">
                  |
                </span>
                {t("categories")}
              </th>
              <th
                scope="col"
                className="max-w-[200px] sm:max-w-[250px] lg:max-w-[300px] px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative"
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                {t("description")}
              </th>
              <th
                scope="col"
                className="w-32 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative"
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                {t("date")}
              </th>
              <th
                scope="col"
                className="w-32 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative"
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                {t("status")}
              </th>
              {/* Last Header */}
              <th scope="col" className="relative w-16 px-3 py-4">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                <span className="sr-only">{t("actions")}</span>
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200 border-b border-gray-200">
            {cases.map((my_case, index) => {
              const isUnread = !my_case.readBy?.some(
                (entry) => entry.user._id === currentUser._id
              );
              const statusStyle = getStatusStyle(my_case.status);
              const priorityStyle = getPriorityStyle(my_case.priority);
              const typeBadgeStyle = getTypeBadgeStyle(my_case.type);
              const isClosed = my_case.status === "CLOSED";
              const truncateLength = getContentTruncateLength();
              const displayContent = getContentPreview(
                my_case.content,
                truncateLength
              );
              const hasAttachments =
                my_case.attachments && my_case.attachments.length > 0;

              const isLastRow = index >= cases.length - 1;

              return (
                <tr
                  key={my_case._id}
                  className={
                    isClosed
                      ? "bg-gray-100 text-gray-500"
                      : isUnread
                      ? "bg-blue-50 hover:bg-blue-100 font-semibold"
                      : "hover:bg-gray-50"
                  }

                  // className={`${
                  //   isClosed ? "bg-gray-100 text-gray-500" : "hover:bg-gray-100"
                  // }`}
                >
                  <td
                    className={`relative w-24 px-3 py-4 whitespace-nowrap text-sm ${
                      isClosed ? "text-gray-500" : "font-medium"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <CaseLink my_case={my_case} t={t} />
                      {hasAttachments ? (
                        <PaperClipIcon
                          className="h-4 w-4 text-gray-500 flex-shrink-0"
                          title={
                            t("case_has_attachments") || "Има прикачени файлове"
                          }
                        />
                      ) : (
                        <div
                          className="h-4 w-4 flex-shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </td>
                  {/* Priority Cell - Text hidden on medium and below */}
                  <td className="w-28 px-3 py-4 whitespace-nowrap text-xs">
                    <div className="flex items-center" title={my_case.priority}>
                      <FlagIcon
                        className={`mr-1.5 h-4 w-4 flex-shrink-0 ${priorityStyle}`}
                      />
                      {/* Text is hidden on screens smaller than md */}
                      <span className={`hidden md:inline ${priorityStyle}`}>
                        {t(`${my_case.priority}`)}
                      </span>
                    </div>
                  </td>
                  {/* Type Cell */}
                  <td className="w-28 px-3 py-4 whitespace-nowrap text-xs">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-medium ${typeBadgeStyle}`}
                    >
                      {t(`${my_case.type}`)}
                    </span>
                  </td>
                  {/* Creator Cell - Now a Link */}
                  <td className="max-w-[150px] px-3 py-4 text-sm break-words">
                    <UserLink user={my_case.creator} />
                  </td>
                  {/* Category Cell - Now Links */}
                  <td className="max-w-[180px] px-3 py-4 text-sm hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {my_case.categories.map((category) => (
                        <CategoryLink key={category._id} {...category} />
                      ))}
                      {my_case.categories.length === 0 && (
                        <span className="text-xs text-gray-400 italic">
                          {t("no_categories")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    className={
                      isUnread && !isClosed
                        ? "max-w-[200px] sm:max-w-[250px] lg:max-w-[300px] px-3 py-4 text-sm break-words"
                        : "max-w-[200px] sm:max-w-[250px] lg:max-w-[300px] px-3 py-4 text-sm break-words"
                    }
                    title={stripHtmlTags(my_case.content)} // Show plain text in tooltip
                  >
                    {displayContent}
                  </td>

                  {/* Date Cell */}
                  <td className="w-32 px-3 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center" title={my_case.date}>
                      {`${moment
                        .utc(parseInt(my_case.date, 10))
                        .local()
                        .format("lll")}`}
                    </div>
                  </td>
                  {/* Status Cell - Text hidden on medium and below */}
                  <td className="w-32 px-3 py-4 whitespace-nowrap text-xs">
                    <div className="flex items-center" title={my_case.status}>
                      <div
                        className={`mr-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${statusStyle.dotBgColor}`}
                      ></div>
                      {/* Text is hidden on screens smaller than md */}
                      <span
                        className={`hidden md:inline ${statusStyle.textColor}`}
                      >
                        {t(`${my_case.status}`)}
                      </span>
                    </div>
                  </td>
                  {/* Actions Cell */}
                  <td className="w-16 px-3 py-4 whitespace-nowrap text-center text-sm font-medium relative">
                    <div>
                      <button
                        className={`cursor-pointer p-1 rounded-md transition-colors duration-150 ease-in-out inline-flex items-center justify-center ${
                          currentUser.role._id == ROLES.LEFT
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        }`}
                        disabled={currentUser.role._id == ROLES.LEFT}
                        onClick={(e) => {
                          e.stopPropagation(); // <-- IMPORTANT: Stops the click from closing the menu immediately
                          toggleDropdown(my_case._id);
                        }}
                        title={
                          currentUser.role._id == ROLES.LEFT
                            ? t("no_more_actions")
                            : t("more_actions")
                        }
                      >
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                        <span className="sr-only">
                          {t("actions")} {my_case.case_number}
                        </span>
                      </button>

                      {/* --- DROPDOWN MENU (MODIFIED) --- */}
                      {openDropdown === my_case._id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          // --- CONDITIONAL CLASS LOGIC ---
                          className={`absolute w-53 rounded-md shadow-lg bg-white ring-2 ring-gray-100 focus:outline-none z-50 ${
                            isLastRow
                              ? "right-full -top-3 origin-right" // MODIFIED: Opens to the left
                              : "right-1 mt-2 origin-top-right" // Opens downwards (default)
                          }`}
                          role="menu"
                        >
                          <div className="py-1" role="none">
                            {/* ADDED: Toggle Read/Unread Button */}
                            <button
                              onClick={() => toggleReadStatus(my_case._id)}
                              className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-2 transition-colors duration-150"
                              role="menuitem"
                            >
                              {isUnread ? (
                                <EnvelopeOpenIcon className="h-4 w-4" />
                              ) : (
                                <EnvelopeIcon className="h-4 w-4" />
                              )}
                              {isUnread
                                ? "Направи прочетено"
                                : "Направи непрочетено"}
                            </button>

                            {/* Existing Delete Button */}
                            {currentUser.role._id === ROLES.ADMIN && (
                              <button
                                // 4. Change onClick to open the modal instead of deleting directly
                                onClick={() => setCaseToDelete(my_case._id)}
                                className="cursor-pointer w-full text-left px-4 py-2 text-sm text-btnRed hover:bg-red-50 hover:text-btnRedHover flex items-center gap-2 transition-colors duration-150"
                                role="menuitem"
                              >
                                <TrashIcon className="h-4 w-4" />
                                {t("delete_case") || "Delete Case"}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* Row to show if no cases are found */}
            {cases.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-500">
                  {t("no_cases_found")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* 5. Add the confirmation dialog component at the end of the main div */}
      <ConfirmActionDialog
        isOpen={!!caseToDelete}
        onOpenChange={() => setCaseToDelete(null)} // CHANGED: from onClose
        onConfirm={handleConfirmDelete}
        title="Потвърдете изтриването"
        description={`Сигурни ли сте, че искате да изтриете сигнал #${
          // CHANGED: from message
          cases.find((c) => c._id === caseToDelete)?.case_number
        }? Това действие не може да бъде отменено.`}
        confirmButtonText="Изтрий"
        isDestructiveAction={true} // CHANGED: from variant="danger"
      />
    </div>
  );
};

export default CaseTable;
