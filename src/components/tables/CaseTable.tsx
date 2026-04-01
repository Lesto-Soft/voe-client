import React, { useState, useEffect } from "react";
import {
  EllipsisHorizontalIcon,
  FlagIcon,
  TrashIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  PaperClipIcon,
} from "@heroicons/react/24/solid";
import { ICase } from "../../db/interfaces";
import UserLink from "../global/links/UserLink";
import CategoryLink from "../global/links/CategoryLink";
import CaseLink from "../global/links/CaseLink";
import {
  getPriorityStyle,
  getStatusStyle,
  getTypeBadgeStyle,
} from "../../utils/style-helpers";
import { getContentPreview, stripHtmlTags } from "../../utils/contentRenderer";
import ShowDate from "../global/ShowDate";
import { useCurrentUser } from "../../context/UserContext";
import { ROLES } from "../../utils/GLOBAL_PARAMETERS";
import {
  useDeleteCase,
  useToggleCaseReadStatus,
} from "../../graphql/hooks/case";
import ErrorModal from "../modals/ErrorModal";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";
import DataTable, { DataTableColumn } from "./DataTable";

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
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);

  // Effect to update window width on resize
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to determine the truncation length based on window width
  const getContentTruncateLength = (): number => {
    if (windowWidth < 768) {
      return 25;
    } else if (windowWidth < 1280) {
      return 40;
    } else {
      return 60;
    }
  };

  // Function to handle dropdown toggle
  const toggleDropdown = (caseId: string) => {
    setOpenDropdown((prev) => (prev === caseId ? null : caseId));
  };

  const handleConfirmDelete = () => {
    if (caseToDelete) {
      deleteCase(caseToDelete);
      setCaseToDelete(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [openDropdown]);

  if (deleteError) {
    return <ErrorModal message="Проблем с изтриването на сигнал." />;
  }

  const columns: DataTableColumn<ICase>[] = [
    {
      key: "case_number",
      header: t("case_number"),
      width: "w-24",
      cellClassName: (my_case) => {
        const isClosed = my_case.status === "CLOSED";
        return `whitespace-nowrap text-sm ${isClosed ? "text-gray-500" : "font-medium"}`;
      },
      render: (my_case) => {
        const hasAttachments =
          my_case.attachments && my_case.attachments.length > 0;
        return (
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
        );
      },
    },
    {
      key: "priority",
      header: t("priority"),
      width: "w-28",
      cellClassName: "whitespace-nowrap text-xs",
      render: (my_case) => {
        const priorityStyle = getPriorityStyle(my_case.priority);
        return (
          <div className="flex items-center">
            <FlagIcon
              className={`mr-1.5 h-4 w-4 flex-shrink-0 ${priorityStyle}`}
            />
            <span className={`hidden md:inline ${priorityStyle}`}>
              {t(`${my_case.priority}`)}
            </span>
          </div>
        );
      },
    },
    {
      key: "type",
      header: t("type"),
      width: "w-28",
      cellClassName: "whitespace-nowrap text-xs",
      render: (my_case) => {
        const typeBadgeStyle = getTypeBadgeStyle(my_case.type);
        return (
          <span
            className={`px-2.5 py-0.5 rounded-full font-medium ${typeBadgeStyle}`}
          >
            {t(`${my_case.type}`)}
          </span>
        );
      },
    },
    {
      key: "creator",
      header: t("creator"),
      width: "max-w-[150px]",
      cellClassName: "text-sm break-words",
      render: (my_case) => <UserLink user={my_case.creator} />,
    },
    {
      key: "categories",
      header: t("categories"),
      width: "max-w-[180px]",
      headerClassName: "hidden md:table-cell",
      cellClassName: "text-sm hidden md:table-cell",
      render: (my_case) => (
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
      ),
    },
    {
      key: "description",
      header: t("description"),
      width: "max-w-[200px] sm:max-w-[250px] lg:max-w-[300px]",
      cellClassName: "text-sm break-words",
      render: (my_case) => (
        <span title={stripHtmlTags(my_case.content)}>
          {getContentPreview(my_case.content, getContentTruncateLength())}
        </span>
      ),
    },
    {
      key: "date",
      header: t("date"),
      width: "w-52",
      cellClassName: "text-sm overflow-hidden max-w-0",
      render: (my_case) => (
        <ShowDate date={my_case.date} isCase truncate defaultFull />
      ),
    },
    {
      key: "status",
      header: t("status"),
      width: "w-32",
      cellClassName: "whitespace-nowrap text-xs",
      render: (my_case) => {
        const statusStyle = getStatusStyle(my_case.status);
        return (
          <div className="flex items-center">
            <div
              className={`mr-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${statusStyle.dotBgColor}`}
            ></div>
            <span
              className={`hidden md:inline ${statusStyle.textColor}`}
            >
              {t(`${my_case.status}`)}
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: t("actions"),
      width: "w-16",
      cellClassName: "whitespace-nowrap text-center text-sm font-medium relative",
      render: (my_case, index) => {
        const isUnread = !my_case.readBy?.some(
          (entry) => entry.user._id === currentUser._id
        );
        const isLastRow = index >= cases.length - 1;

        return (
          <div>
            <button
              className={`cursor-pointer p-1 rounded-md transition-colors duration-150 ease-in-out inline-flex items-center justify-center ${
                currentUser.role._id == ROLES.LEFT
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
              disabled={currentUser.role._id == ROLES.LEFT}
              onClick={(e) => {
                e.stopPropagation();
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

            {/* --- DROPDOWN MENU --- */}
            {openDropdown === my_case._id && (
              <div
                onClick={(e) => e.stopPropagation()}
                className={`absolute w-53 rounded-md shadow-lg bg-white ring-2 ring-gray-100 focus:outline-none z-50 ${
                  isLastRow
                    ? "right-full -top-3 origin-right"
                    : "right-1 mt-2 origin-top-right"
                }`}
                role="menu"
              >
                <div className="py-1" role="none">
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

                  {currentUser.role._id === ROLES.ADMIN && (
                    <button
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
        );
      },
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <DataTable
        columns={columns}
        data={cases}
        rowKey={(my_case) => my_case._id}
        rowClassName={(my_case) => {
          const isClosed = my_case.status === "CLOSED";
          const isUnread = !my_case.readBy?.some(
            (entry) => entry.user._id === currentUser._id
          );
          if (isClosed) return "bg-gray-100 text-gray-500";
          if (isUnread) return "bg-blue-50 hover:bg-blue-100 font-semibold";
          return "hover:bg-gray-50";
        }}
        tableFixed={false}
        emptyMessage={t("no_cases_found")}
      />
      <ConfirmActionDialog
        isOpen={!!caseToDelete}
        onOpenChange={() => setCaseToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Потвърдете изтриването"
        description={`Сигурни ли сте, че искате да изтриете сигнал #${
          cases.find((c) => c._id === caseToDelete)?.case_number
        }? Това действие не може да бъде отменено.`}
        confirmButtonText="Изтрий"
        isDestructiveAction={true}
      />
    </div>
  );
};

export default CaseTable;
