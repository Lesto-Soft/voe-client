// src/components/features/userAnalytics/UserActivityItemCard.tsx
import React from "react";
import { ICase, IAnswer, IComment, IUser } from "../../../db/interfaces"; // Adjust path
import ShowDate from "../../../components/global/ShowDate"; // Adjust path
import CaseLink from "../../../components/global/CaseLink"; // Adjust path
import {
  ChatBubbleLeftEllipsisIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  ClockIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { FlagIcon } from "@heroicons/react/24/solid"; // Use solid FlagIcon as in CaseInfo
import {
  // Utilities from categoryDisplayUtils for translations
  translateStatus as translateStatusUtil,
  translateCaseType as translateCaseTypeUtil,
  translatePriority as translatePriorityUtil,
} from "../../../utils/categoryDisplayUtils"; // Adjust path

// Import new style helpers
import {
  getStatusStyle as getStatusStyleFromHelper,
  getPriorityStyle as getPriorityStyleFromHelper,
  getTypeBadgeStyle as getTypeBadgeStyleFromHelper,
} from "../../../utils/style-helpers"; // Adjust path to your style-helpers.ts

import CategoryLink from "../../global/CategoryLink";

type ActivityItem = ICase | IAnswer | IComment;

interface UserActivityItemCardProps {
  item: ActivityItem;
  activityType: "case" | "answer" | "comment";
  actor: IUser;
}

const UserActivityItemCard: React.FC<UserActivityItemCardProps> = ({
  item,
  activityType,
  actor,
}) => {
  let icon: React.ReactNode;
  let titleFragments: React.ReactNode[] = [];
  let contentPreview = "";
  let caseToLinkForDisplay: Partial<ICase> | undefined;

  const date = item.date;
  const itemContent =
    (item as ICase)?.content ||
    (item as IAnswer)?.content ||
    (item as IComment)?.content ||
    "";
  contentPreview =
    itemContent.substring(0, 150) + (itemContent.length > 150 ? "..." : "");

  titleFragments.push(
    <span
      key="actor"
      className="font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors"
      title={actor.name}
    >
      {actor.name}
    </span>
  );

  if (activityType === "case" && "case_number" in item) {
    const caseItem = item as ICase;
    icon = <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
    titleFragments.push(
      <span key="action" className="ml-1 whitespace-nowrap">
        създаде сигнал
      </span>
    );
    caseToLinkForDisplay = caseItem;
  } else if (activityType === "answer" && "case" in item) {
    const answerItem = item as IAnswer;
    icon = <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500" />;
    titleFragments.push(
      <span key="action" className="ml-1 whitespace-nowrap">
        написа отговор
      </span>
    );
    if (answerItem.case && answerItem.case.case_number) {
      caseToLinkForDisplay = answerItem.case;
      titleFragments.push(
        <span
          key="preposition"
          className="ml-1 text-gray-500 whitespace-nowrap"
        >
          по
        </span>
      );
    }
  } else if (activityType === "comment" && "content" in item) {
    const commentItem = item as IComment;
    icon = <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-purple-500" />;
    if (
      commentItem.answer &&
      commentItem.answer.case &&
      commentItem.answer.case.case_number
    ) {
      titleFragments.push(
        <span key="action" className="ml-1 text-gray-700 whitespace-nowrap">
          написа коментар по отговор
        </span>
      );
      caseToLinkForDisplay = commentItem.answer.case;
      titleFragments.push(
        <span
          key="preposition"
          className="ml-1 text-gray-500 whitespace-nowrap"
        >
          към
        </span>
      );
    } else if (commentItem.case && commentItem.case.case_number) {
      titleFragments.push(
        <span key="action" className="ml-1 text-gray-700 whitespace-nowrap">
          написа коментар
        </span>
      );
      caseToLinkForDisplay = commentItem.case;
      titleFragments.push(
        <span
          key="preposition"
          className="ml-1 text-gray-500 whitespace-nowrap"
        >
          по
        </span>
      );
    } else {
      titleFragments.push(
        <span key="action" className="ml-1 text-gray-700 whitespace-nowrap">
          написа коментар
        </span>
      );
    }
  } else {
    return (
      <div className="p-4 border-b border-gray-200 text-sm">
        Неизвестен тип активност или непълни данни.
      </div>
    );
  }

  function tFunctionForCaseLinkProp(key: string): string {
    if (key === "details_for") {
      return "Детайли за";
    }
    return key;
  }

  // Prepare styles for case-specific details if activityType is "case"
  let statusStyleFromHelper,
    typeBadgeClassesFromHelper,
    priorityTextColorClassFromHelper;
  if (activityType === "case" && "status" in item) {
    statusStyleFromHelper = getStatusStyleFromHelper(item.status as string);
    typeBadgeClassesFromHelper = getTypeBadgeStyleFromHelper(
      item.type as string
    );
    if ((item as ICase).priority) {
      priorityTextColorClassFromHelper = getPriorityStyleFromHelper(
        (item as ICase).priority
      );
    }
  }

  return (
    <div className="p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 group transition-colors duration-150">
      <div className="flex items-start space-x-2 sm:space-x-3">
        <div className="flex-shrink-0 pt-1">
          {icon || <LinkIcon className="h-5 w-5 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          {/* ... (Top line with title, CaseLink, and Date remains the same) ... */}
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-sm mb-1">
            <div className="flex items-baseline gap-x-1.5 min-w-0 mr-2">
              <span className="text-gray-700 flex items-baseline gap-x-1 flex-shrink min-w-0">
                {titleFragments.map((frag, index) => (
                  <React.Fragment key={index}>{frag}</React.Fragment>
                ))}
              </span>
              {caseToLinkForDisplay && caseToLinkForDisplay.case_number && (
                <div className="w-[70px] flex-shrink-0">
                  <CaseLink
                    my_case={caseToLinkForDisplay as ICase}
                    t={tFunctionForCaseLinkProp}
                  />
                </div>
              )}
            </div>
            {date && (
              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-1 sm:mt-0 self-start sm:self-baseline">
                <ShowDate date={date} />
              </span>
            )}
          </div>

          {contentPreview && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
              {contentPreview}
            </p>
          )}

          {/* === MODIFIED Case-specific details section starts here === */}
          {activityType === "case" &&
            "status" in item &&
            "type" in item &&
            statusStyleFromHelper &&
            typeBadgeClassesFromHelper && (
              <div className="mt-2 text-xs">
                {/* Main container for both lines */}
                {/* Line 1: Status, Type, Priority - Evenly Spaced */}
                <div className="flex items-center justify-around sm:justify-start sm:gap-x-3 mb-1.5">
                  {/* justify-around for small, gap for larger */}
                  {/* Status Display */}
                  <div className="flex-shrink-0">
                    {/* Wrapper to help with spacing if needed */}
                    <span className="inline-flex items-center">
                      <span
                        className={`h-2 w-2 rounded-full mr-1.5 ${statusStyleFromHelper.dotBgColor}`}
                      />
                      <span
                        className={`${statusStyleFromHelper.textColor} font-medium`}
                      >
                        {translateStatusUtil(item.status as string)}
                      </span>
                    </span>
                  </div>
                  {/* Type Badge */}
                  <div className="flex-shrink-0">
                    {/* Wrapper to help with spacing */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${typeBadgeClassesFromHelper}`}
                    >
                      {translateCaseTypeUtil(item.type as string)}
                    </span>
                  </div>
                  {/* Priority Badge/Text */}
                  {"priority" in item &&
                    item.priority &&
                    priorityTextColorClassFromHelper && (
                      <div className="flex-shrink-0">
                        {/* Wrapper to help with spacing */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${priorityTextColorClassFromHelper}`}
                        >
                          <FlagIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          {translatePriorityUtil(item.priority)}
                        </span>
                      </div>
                    )}
                </div>
                {/* Line 2: Categories */}
                {"categories" in item &&
                  item.categories &&
                  item.categories.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1 items-center">
                      {/* Added mt-1 for slight space from line above */}
                      <span className="text-gray-500 mr-1">в:</span>
                      {/* Added margin to "в:" */}
                      {item.categories?.slice(0, 3).map(
                        (
                          cat // Show up to 3 categories
                        ) => (
                          <CategoryLink key={cat._id} {...cat} />
                        )
                      )}
                      {item.categories.length > 3 && (
                        <span className="text-xs text-gray-500 ml-0.5">
                          ...
                        </span>
                      )}
                    </div>
                  )}
              </div>
            )}
          {/* === MODIFIED Case-specific details section ends here === */}

          {/* Answer-specific details (remains the same) */}
          {activityType === "answer" && "approved" in item && (
            <div className="mt-2 text-xs">
              {(item as IAnswer).approved ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium text-green-700 bg-green-100 border border-green-200">
                  <CheckBadgeIcon className="h-4 w-4 mr-1" /> Одобрен
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium text-yellow-700 bg-yellow-100 border border-yellow-200">
                  <ClockIcon className="h-4 w-4 mr-1" /> Чака одобрение
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivityItemCard;
