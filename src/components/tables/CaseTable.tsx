import React from "react";
import {
  EllipsisHorizontalIcon,
  FlagIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router"; // Import Link
import moment from "moment";
// @ts-ignore
import "moment/dist/locale/bg";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { ICase, ICategory, IUser } from "../../db/interfaces";
import { useEffect, useState } from "react";
// Helper function to get priority styles
const getPriorityStyles = (priority: ICase["priority"]): string => {
  switch (priority) {
    case "LOW":
      return "text-green-600";
    case "HIGH":
      return "text-red-600";
    case "MEDIUM":
      return "text-yellow-600";
    default:
      return "text-gray-500";
  }
};

// Helper function to get status styles
const getStatusStyles = (
  status: ICase["status"]
): { dotBgColor: string; textColor: string } => {
  switch (status) {
    case "OPEN":
      return { dotBgColor: "bg-green-500", textColor: "text-gray-800" };
    case "CLOSED":
      return { dotBgColor: "bg-gray-400", textColor: "text-gray-500" };
    case "IN_PROGRESS":
      return { dotBgColor: "bg-blue-500", textColor: "text-gray-800" };
    default:
      return { dotBgColor: "bg-gray-400", textColor: "text-gray-500" };
  }
};

// Helper function to get type badge styles
const getTypeBadgeStyles = (type: ICase["type"]): string => {
  switch (type) {
    case "PROBLEM":
      return "bg-red-100 text-red-800 border border-red-200";
    case "SUGGESTION":
      return "bg-green-100 text-green-800 border border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

// Helper function to get initials from a name
const getInitials = (name: string): string => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .filter((initial) => initial) // Ensure we don't get undefined if there are extra spaces
    .join("")
    .toUpperCase();
};

// --- Main CaseTable Component ---
const CaseTable: React.FC<{ cases: ICase[]; t: (word: string) => string }> = ({
  cases,
  t,
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Example: log the current language and the moment locale for the first case
  if (cases.length > 0) {
    const m = moment(cases[0].date).locale("bg").format("LLL");
    console.log(m);
  }

  // State to hold the current window width (still needed for description truncation)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

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

  return (
    <div className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col shadow-md rounded-lg overflow-hidden bg-white border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Head */}
          <thead className="bg-gray-500">
            <tr>
              {/* First Header (No separator) */}
              <th
                scope="col"
                className="w-24 px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide cursor-pointer hover:bg-gray-600"
              >
                {t("case_number")}
              </th>
              {/* Subsequent Headers (Simplified structure) */}
              <th
                scope="col"
                className="w-3 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative"
              >
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                {t("priority")}
              </th>
              <th
                scope="col"
                className="w-28 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative"
              >
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                {t("type")}
              </th>
              <th
                scope="col"
                className="max-w-[150px] px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative"
              >
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                {t("creator")}
              </th>
              <th
                scope="col"
                className="max-w-[180px] px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide hidden md:table-cell relative"
              >
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pr-2 text-gray-400 hidden md:inline-block">
                  |
                </span>
                {t("categories")}
              </th>
              <th
                scope="col"
                className="max-w-[200px] sm:max-w-[250px] lg:max-w-[300px] px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative"
              >
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                {t("description")}
              </th>
              <th
                scope="col"
                className="w-32 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative"
              >
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                {t("date")}
              </th>
              <th
                scope="col"
                className="w-32 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative"
              >
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                {t("status")}
              </th>
              {/* Last Header */}
              <th scope="col" className="relative w-16 px-3 py-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pr-2 text-gray-400">
                  |
                </span>
                <span className="sr-only">{t("actions")}</span>
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {cases.map((my_case) => {
              const statusStyle = getStatusStyles(my_case.status);
              const priorityStyle = getPriorityStyles(my_case.priority);
              const typeBadgeStyle = getTypeBadgeStyles(my_case.type);
              const isClosed = my_case.status === "CLOSED";
              const creatorInitials = getInitials(my_case.creator.name);

              // Dynamic truncation based on window width
              const truncateLength = getContentTruncateLength();
              const displayContent =
                my_case.content.length > truncateLength
                  ? `${my_case.content.substring(0, truncateLength)}...`
                  : my_case.content;

              return (
                <tr
                  key={my_case._id}
                  className={`${
                    isClosed ? "bg-gray-100 text-gray-500" : "hover:bg-gray-100"
                  }`}
                >
                  {/* Case Number Cell - Now a Link */}
                  <td
                    className={`w-24 px-3 py-4 whitespace-nowrap text-sm ${
                      isClosed ? "text-gray-500" : "font-medium"
                    }`}
                  >
                    <Link
                      to={`/case/${my_case._id}`} // Use Link
                      className={`text-left w-full hover:cursor-pointer ${
                        isClosed
                          ? "text-blue-400 hover:text-blue-600 hover:underline"
                          : "text-blue-600 hover:text-blue-800 hover:underline"
                      }`}
                      title={`${t("details_for")} ${my_case.case_number}`}
                    >
                      {my_case.case_number}
                    </Link>
                  </td>
                  {/* Priority Cell - Text hidden on medium and below */}
                  <td className="w-28 px-3 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center" title={my_case.priority}>
                      <FlagIcon
                        className={`mr-1.5 h-4 w-4 flex-shrink-0 ${priorityStyle}`}
                      />
                      {/* Text is hidden on screens smaller than md */}
                      <span className="hidden md:inline">
                        {t(`${my_case.priority}`)}
                      </span>
                    </div>
                  </td>
                  {/* Type Cell */}
                  <td className="w-28 px-3 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadgeStyle}`}
                    >
                      {t(`${my_case.type}`)}
                    </span>
                  </td>
                  {/* Creator Cell - Now a Link */}
                  <td className="max-w-[150px] px-3 py-4 text-sm break-words">
                    <Link
                      to={`/user/${my_case.creator._id}`} // Use Link
                      className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium transition-colors duration-150 ease-in-out text-left hover:cursor-pointer ${
                        isClosed
                          ? "bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100"
                          : "bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200"
                      }`}
                      title={my_case.creator.name}
                    >
                      <span className="md:hidden">{creatorInitials}</span>
                      <span className="hidden md:inline">
                        {my_case.creator.name}
                      </span>
                    </Link>
                  </td>
                  {/* Category Cell - Now Links */}
                  <td className="max-w-[180px] px-3 py-4 text-sm hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {my_case.categories.map((category) => (
                        <Link
                          key={category._id} // Use category._id for key
                          to={`/category/${category._id}`} // Use Link
                          className={`px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer transition-colors duration-150 ease-in-out ${
                            isClosed
                              ? "bg-gray-200 text-gray-500 pointer-events-none" // Keep visually distinct and non-interactive if closed
                              : "bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200"
                          }`}
                        >
                          {category.name}
                        </Link>
                      ))}
                      {my_case.categories.length === 0 && (
                        <span className="text-xs text-gray-400 italic">
                          {t("no_categories")}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Description Cell */}
                  <td
                    className="max-w-[200px] sm:max-w-[250px] lg:max-w-[300px] px-3 py-4 text-sm break-words"
                    title={my_case.content}
                  >
                    {displayContent}
                  </td>
                  {/* Date Cell */}
                  <td className="w-32 px-3 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center" title={my_case.date}>
                      {`${moment(my_case.date)
                        .locale(currentLanguage)
                        .format("lll")}`}
                    </div>
                  </td>
                  {/* Status Cell - Text hidden on medium and below */}
                  <td className="w-32 px-3 py-4 whitespace-nowrap text-sm">
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
                  <td className="w-16 px-3 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      className={`p-1 rounded-md transition-colors duration-150 ease-in-out inline-flex items-center justify-center ${
                        isClosed
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                      }`}
                      disabled={isClosed}
                      title={
                        isClosed ? t("no_more_actions") : t("more_actions")
                      }
                    >
                      <EllipsisHorizontalIcon className="h-5 w-5" />
                      <span className="sr-only">
                        {t("actions")} {my_case.case_number}
                      </span>
                    </button>
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
    </div>
  );
};

export default CaseTable;
