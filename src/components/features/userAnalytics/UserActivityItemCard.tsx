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
import {
  getStatusStyle as getStatusStyleUtil,
  translateStatus as translateStatusUtil,
  translateCaseType as translateCaseTypeUtil,
  // tForCaseLink is NOT directly used here for CaseLink's t-prop anymore
  // because CaseLink expects a simpler t function.
} from "../../../utils/categoryDisplayUtils"; // Adjust path
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
    >
      {actor.name}
    </span>
  ); // Added truncate

  if (activityType === "case" && "case_number" in item) {
    const caseItem = item as ICase;
    icon = <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
    titleFragments.push(
      <span key="action" className="ml-1">
        създаде сигнал
      </span>
    );
    caseToLinkForDisplay = caseItem;
  } else if (activityType === "answer" && "case" in item) {
    const answerItem = item as IAnswer;
    icon = <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500" />;
    titleFragments.push(
      <span key="action" className="ml-1">
        написа отговор
      </span>
    );
    if (answerItem.case && answerItem.case.case_number) {
      caseToLinkForDisplay = answerItem.case;
      titleFragments.push(
        <span key="preposition" className="ml-1 text-gray-500">
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
        <span key="action" className="ml-1 text-gray-700">
          написа коментар по отговор
        </span>
      ); // Ensure consistent coloring
      caseToLinkForDisplay = commentItem.answer.case;
      titleFragments.push(
        <span key="preposition" className="ml-1 text-gray-500">
          към
        </span>
      );
    } else if (commentItem.case && commentItem.case.case_number) {
      titleFragments.push(
        <span key="action" className="ml-1 text-gray-700">
          написа коментар
        </span>
      );
      caseToLinkForDisplay = commentItem.case;
      titleFragments.push(
        <span key="preposition" className="ml-1 text-gray-500">
          по
        </span>
      );
    } else {
      titleFragments.push(
        <span key="action" className="ml-1 text-gray-700">
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

  return (
    <div className="p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 group transition-colors duration-150">
      <div className="flex items-start space-x-2 sm:space-x-3">
        <div className="flex-shrink-0 pt-1">
          {icon || <LinkIcon className="h-5 w-5 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          {" "}
          {/* Added min-w-0 here to help with truncation inside */}
          {/* Top line: Action Title, CaseLink, and Date */}
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-sm mb-1">
            {/* Left part: Title fragments and CaseLink */}
            <div className="flex items-baseline gap-x-1.5 min-w-0 mr-2">
              {" "}
              {/* min-w-0 allows inner truncation */}
              <span className="text-gray-700 flex items-baseline gap-x-1 flex-shrink min-w-0">
                {" "}
                {/* Allow this to shrink and truncate */}
                {/* Actor name and action - wrap for potential truncation if too long */}
                {titleFragments.map((frag, index) => (
                  <React.Fragment key={index}>{frag}</React.Fragment>
                ))}
              </span>
              {caseToLinkForDisplay && caseToLinkForDisplay.case_number && (
                <div className="w-[70px] flex-shrink-0">
                  {" "}
                  {/* Fixed width for CaseLink wrapper. Adjust w-[70px] as needed */}
                  <CaseLink
                    my_case={caseToLinkForDisplay as ICase}
                    t={tFunctionForCaseLinkProp} // Assuming this is defined as in previous fix
                  />
                </div>
              )}
            </div>

            {/* Right part: Date */}
            {date && (
              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-1 sm:mt-0 self-start sm:self-baseline">
                <ShowDate date={date} />
              </span>
            )}
          </div>
          {/* Content Preview */}
          {contentPreview && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
              {contentPreview}
            </p>
          )}
          {/* Case-specific details */}
          {activityType === "case" && "status" in item && (
            // ... (this part remains the same) ...
            <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs items-center">
              <span
                className={`px-1.5 py-0.5 rounded-full font-medium ${
                  getStatusStyleUtil(item.status as string).textColor
                } ${getStatusStyleUtil(
                  item.status as string
                ).dotBgColor.replace("bg-", "bg-opacity-20 bg-")}`}
              >
                {translateStatusUtil(item.status as string)}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-full font-medium text-gray-600 bg-gray-100 border`}
              >
                {translateCaseTypeUtil(item.type)}
              </span>
              {(item as ICase).categories &&
                (item as ICase).categories!.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-gray-400">в:</span>
                    {(item as ICase).categories?.slice(0, 2).map((cat) => (
                      <CategoryLink key={cat._id} category={cat} />
                    ))}
                    {(item as ICase).categories!.length > 2 && (
                      <span className="text-xs text-gray-500 ml-1">...</span>
                    )}
                  </div>
                )}
            </div>
          )}
          {/* Answer-specific details */}
          {activityType === "answer" && "approved" in item && (
            // ... (this part remains the same) ...
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
  // Ensure tFunctionForCaseLinkProp is defined if you haven't moved it outside
  // or ensure it's correctly passed if it's a prop.
  // For this example, assuming it's defined in this component's scope as before:
  function tFunctionForCaseLinkProp(key: string): string {
    if (key === "details_for") {
      return "Детайли за";
    }
    return key;
  }
};

export default UserActivityItemCard;
