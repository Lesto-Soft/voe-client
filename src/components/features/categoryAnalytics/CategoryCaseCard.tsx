// src/components/features/categoryAnalytics/CategoryCaseCard.tsx
import React from "react";
import { ICase } from "../../../db/interfaces"; // Adjust path as needed
import UserAvatar from "../../../components/cards/UserAvatar"; // Adjust path as needed
import CaseLink from "../../../components/global/CaseLink"; // Adjust path as needed
import UserLink from "../../../components/global/UserLink"; // Adjust path as needed
import ShowDate from "../../../components/global/ShowDate"; // Adjust path as needed
import { FlagIcon } from "@heroicons/react/24/solid";
import { StatusStyle, tForCaseLink } from "../../../utils/categoryDisplayUtils"; // Adjust path

interface CategoryCaseCardProps {
  caseItem: ICase;
  statusStyle: StatusStyle;
  priorityStyleClass: string; // The direct Tailwind class string for priority
  translatedPriority: string;
  translatedStatus: string;
  serverBaseUrl: string;
}

const CategoryCaseCard: React.FC<CategoryCaseCardProps> = ({
  caseItem,
  statusStyle,
  priorityStyleClass,
  translatedPriority,
  translatedStatus,
  serverBaseUrl,
}) => {
  const creatorImageUrl = `${serverBaseUrl}/static/avatars/${caseItem.creator._id}/${caseItem.creator.avatar}`;

  let stripStyleClasses = "";
  if (String(caseItem.type).toUpperCase() === "PROBLEM") {
    stripStyleClasses = "border-l-8 border-l-red-400";
  } else if (String(caseItem.type).toUpperCase() === "SUGGESTION") {
    stripStyleClasses = "border-l-8 border-l-green-400";
  }

  return (
    <li
      className={`p-4 hover:bg-gray-100 rounded-l-sm transition-colors duration-150 ${stripStyleClasses}`}
    >
      <div className="flex items-start space-x-2 sm:space-x-3">
        <UserAvatar
          name={caseItem.creator.name || "Unknown User"}
          imageUrl={creatorImageUrl}
          size={40} // Corresponds to h-10 w-10
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 lg:gap-x-3 gap-y-1 text-xs text-gray-600 mb-2">
            <div className="lg:min-w-[80px] lg:flex-shrink-0">
              <CaseLink
                my_case={caseItem}
                // The tForCaseLink function is specific for "Детайли за {caseId}"
                t={(key) => tForCaseLink(key, { caseId: caseItem.case_number })}
              />
            </div>
            <span
              className={`flex items-center font-medium ${priorityStyleClass} lg:flex-shrink-0 lg:min-w-[80px]`}
            >
              <FlagIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              {translatedPriority}
            </span>
            <span
              className={`flex items-center font-medium lg:flex-shrink-0 lg:min-w-[120px]`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full mr-1.5 flex-shrink-0 ${statusStyle.dotBgColor}`}
                aria-hidden="true"
              />
              <span className={statusStyle.textColor}>{translatedStatus}</span>
            </span>
            <div
              className={`flex items-center font-medium text-gray-600 lg:flex-shrink-0 lg:min-w-[150px] sm:min-w-[120px]`} // Adjusted min-width
            >
              <span className="mr-1 whitespace-nowrap">Подател:</span>
              <UserLink user={caseItem.creator} type="table" />
            </div>
            <div className="text-xs text-gray-500 lg:whitespace-nowrap lg:flex-shrink-0 lg:min-w-[140px] sm:min-w-[110px]">
              {" "}
              {/* Adjusted min-width */}
              <ShowDate date={caseItem.date} />
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
            {caseItem.content}
          </p>
        </div>
      </div>
    </li>
  );
};

export default CategoryCaseCard;
