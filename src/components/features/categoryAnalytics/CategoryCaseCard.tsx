// src/components/features/categoryAnalytics/CategoryCaseCard.tsx
import React from "react";
import { ICase } from "../../../db/interfaces"; // Adjust path as needed
import UserAvatar from "../../../components/cards/UserAvatar"; // Adjust path as needed
import CaseLink from "../../../components/global/CaseLink"; // Adjust path as needed
import UserLink from "../../../components/global/UserLink"; // Adjust path as needed
import ShowDate from "../../../components/global/ShowDate"; // Adjust path as needed
import { FlagIcon as SolidFlagIcon } from "@heroicons/react/24/solid"; // Use solid as per CaseInfo

// Import style helpers from your file
import {
  getStatusStyle as getStatusStyleFromHelper,
  getPriorityStyle as getPriorityStyleFromHelper,
  getTypeBadgeStyle as getTypeBadgeStyleFromHelper,
} from "../../../utils/style-helpers"; // Adjust path to your style-helpers.ts

// Import translation helpers and tForCaseLink from categoryDisplayUtils
import {
  translateStatus,
  translatePriority,
  translateCaseType,
  tForCaseLink, // For CaseLink's title
} from "../../../utils/categoryDisplayUtils"; // Adjust path
import { getContentPreview } from "../../../utils/contentRenderer";

interface CategoryCaseCardProps {
  caseItem: ICase;
  serverBaseUrl: string;
  // Props like statusStyle, priorityStyleClass, translatedPriority, translatedStatus are no longer needed
}

const CategoryCaseCard: React.FC<CategoryCaseCardProps> = ({
  caseItem,
  serverBaseUrl,
}) => {
  const creatorImageUrl = `${serverBaseUrl}/static/avatars/${caseItem.creator._id}/${caseItem.creator.avatar}`;

  let stripStyleClasses = "";
  if (String(caseItem.type).toUpperCase() === "PROBLEM") {
    stripStyleClasses = "border-l-8 border-l-red-400";
  } else if (String(caseItem.type).toUpperCase() === "SUGGESTION") {
    stripStyleClasses = "border-l-8 border-l-green-400";
  }

  // Prepare styles and translated text internally
  const statusStyle = getStatusStyleFromHelper(caseItem.status as string);
  const translatedStatusText = translateStatus(caseItem.status as string);

  const typeBadgeClasses = getTypeBadgeStyleFromHelper(caseItem.type as string);
  const translatedTypeText = translateCaseType(caseItem.type as string);

  const priorityStyleClass = getPriorityStyleFromHelper(
    caseItem.priority as string
  );
  const translatedPriorityText = translatePriority(caseItem.priority as string);

  // This t function is for the CaseLink title, as per previous discussions
  const tFunctionForCaseLinkTitle = (key: string): string => {
    if (key === "details_for") {
      return "Детайли за"; // CaseLink will append the case number
    }
    return key;
  };

  return (
    <li
      className={`p-4 hover:bg-gray-100 rounded-l-sm transition-colors duration-150 ${stripStyleClasses}`}
    >
      <div className="flex items-start space-x-2 sm:space-x-3">
        <UserAvatar
          name={caseItem.creator.name || "Unknown User"}
          imageUrl={creatorImageUrl}
          size={40}
          enablePreview={true}
        />
        <div className="flex-1 min-w-0">
          {/* Main info line: CaseLink, Status, Type, Priority, Creator, Date */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-600 mb-2">
            {/* Changed to items-center */}
            {/* Case Link (no change to this specific element's structure) */}
            <div className="flex-shrink-0">
              <CaseLink
                my_case={caseItem} // Or caseToLinkForDisplay if in UserActivityItemCard
                t={tFunctionForCaseLinkTitle} // Or tFunctionForCaseLinkProp
              />
            </div>
            {/* Status Display (now styled more like a badge) */}
            <span
              className={`inline-flex items-center py-0.5 rounded-full font-medium ${statusStyle.textColor} `}
            >
              <span
                className={`h-2 w-2 rounded-full mr-1.5 ${statusStyle.dotBgColor}`}
                aria-hidden="true"
              />
              <span>{translatedStatusText}</span>
            </span>
            {/* Type Badge (already styled as a badge, ensure consistent py-0.5) */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium text-xs ${typeBadgeClasses} flex-shrink-0`}
            >
              {translatedTypeText}
            </span>
            {/* Priority Display (already styled as a badge, ensure consistent py-0.5) */}
            {caseItem.priority &&
              priorityStyleClass && ( // Ensure priorityStyleClass is also checked if it's prepared conditionally
                <span
                  className={`inline-flex items-center py-0.5 rounded-full font-medium ${priorityStyleClass}`}
                >
                  <SolidFlagIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  {translatedPriorityText}
                </span>
              )}
            {/* Creator (no change to this specific element's structure) */}
            <div className="flex items-center text-gray-600 flex-shrink-0">
              <span className="mr-1 text-gray-500">от:</span>
              <UserLink user={caseItem.creator} />
            </div>
            {/* Date (no change to this specific element's structure) */}
            <div className="text-gray-500 whitespace-nowrap flex-shrink-0">
              <ShowDate date={parseInt(caseItem.date)} />
            </div>
          </div>

          {/* Content Preview */}
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 sm:line-clamp-4">
            {getContentPreview(caseItem.content, 150)}
          </p>
        </div>
      </div>
    </li>
  );
};

export default CategoryCaseCard;
