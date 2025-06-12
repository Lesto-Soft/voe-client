import React from "react";
import { EllipsisHorizontalIcon, FlagIcon } from "@heroicons/react/24/solid";
import moment from "moment";
// @ts-ignore
import "moment/dist/locale/bg";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { ICase } from "../../db/interfaces";
import { useEffect, useState } from "react";
import UserLink from "../global/UserLink";
import CategoryLink from "../global/CategoryLink";
import CaseLink from "../global/CaseLink";
import {
  getPriorityStyle,
  getStatusStyle,
  getTypeBadgeStyle,
} from "../../utils/style-helpers";
import { getContentPreview, stripHtmlTags } from "../../utils/contentRenderer";

// --- Main CaseTable Component ---
const CaseTable: React.FC<{ cases: ICase[]; t: (word: string) => string }> = ({
  cases,
  t,
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

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
              const statusStyle = getStatusStyle(my_case.status);
              const priorityStyle = getPriorityStyle(my_case.priority);
              const typeBadgeStyle = getTypeBadgeStyle(my_case.type);
              const isClosed = my_case.status === "CLOSED";

              // Dynamic truncation based on window width
              const truncateLength = getContentTruncateLength();

              const displayContent = getContentPreview(
                my_case.content,
                truncateLength
              );

              return (
                <tr
                  key={my_case._id}
                  className={`${
                    isClosed ? "bg-gray-100 text-gray-500" : "hover:bg-gray-100"
                  }`}
                >
                  {/* Case Number Cell - Now a Button-like Link */}
                  <td
                    className={`w-24 px-3 py-4 whitespace-nowrap text-sm ${
                      isClosed ? "text-gray-500" : "font-medium"
                    }`}
                  >
                    <CaseLink my_case={my_case} t={t} />
                  </td>
                  {/* Priority Cell - Text hidden on medium and below */}
                  <td className="w-28 px-3 py-4 whitespace-nowrap text-sm">
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
                  <td className="w-28 px-3 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadgeStyle}`}
                    >
                      {t(`${my_case.type}`)}
                    </span>
                  </td>
                  {/* Creator Cell - Now a Link */}
                  <td className="max-w-[150px] px-3 py-4 text-sm break-words">
                    <UserLink user={my_case.creator} type="table" />
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
                    className="max-w-[200px] sm:max-w-[250px] lg:max-w-[300px] px-3 py-4 text-sm break-words"
                    title={stripHtmlTags(my_case.content)} // Show plain text in tooltip
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
