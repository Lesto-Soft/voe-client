// src/components/features/userAnalytics/UserActivityItemCard.tsx
import React from "react";
import { ICase, IAnswer, IComment, IUser } from "../../../db/interfaces";
import ShowDate from "../../../components/global/ShowDate";
import CaseLink from "../../../components/global/CaseLink";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  ChatBubbleBottomCenterTextIcon,
  BanknotesIcon,
  DocumentTextIcon,
  HandThumbUpIcon,
  ClockIcon,
  LinkIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { FlagIcon, StarIcon } from "@heroicons/react/24/solid";
import {
  translateStatus as translateStatusUtil,
  translateCaseType as translateCaseTypeUtil,
  translatePriority as translatePriorityUtil,
} from "../../../utils/categoryDisplayUtils";
import {
  getStatusStyle as getStatusStyleFromHelper,
  getPriorityStyle as getPriorityStyleFromHelper,
  getTypeBadgeStyle as getTypeBadgeStyleFromHelper,
  getCalculatedRatingStyle as getCalculatedRatingStyleFromHelper,
} from "../../../utils/style-helpers";
import CategoryLink from "../../global/CategoryLink";
import {
  getContentPreview,
  stripHtmlTags,
} from "../../../utils/contentRenderer";

type ActivityItem = ICase | IAnswer | IComment;

interface UserActivityItemCardProps {
  item: ActivityItem;
  activityType:
    | "case"
    | "answer"
    | "comment"
    | "base_approval"
    | "finance_approval";
  actor: IUser;
  date: string;
  view?: "full" | "compact";
}

const UserActivityItemCard: React.FC<UserActivityItemCardProps> = ({
  item,
  activityType,
  date,
  view = "full",
}) => {
  let icon: React.ReactNode;
  let titleFragments: React.ReactNode[] = [];
  let caseToLinkForDisplay: Partial<ICase> | undefined;

  const itemContent =
    (item as ICase)?.content ||
    (item as IAnswer)?.content ||
    (item as IComment)?.content ||
    "";
  const contentPreview = getContentPreview(itemContent, 150);

  if (activityType === "case" && "case_number" in item) {
    const caseItem = item as ICase;
    icon = <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
    titleFragments.push(
      <span key="action" className=" whitespace-nowrap">
        Създаде сигнал
      </span>
    );
    caseToLinkForDisplay = caseItem;
  } else if (activityType === "answer" && "case" in item) {
    const answerItem = item as IAnswer;
    icon = (
      <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-green-500" />
    );
    titleFragments.push(
      <span key="action" className=" whitespace-nowrap">
        Написа решение
      </span>
    );
    if (answerItem.case && answerItem.case.case_number) {
      caseToLinkForDisplay = answerItem.case;
      titleFragments.push(
        <span
          key="preposition"
          className="ml-1 text-gray-700 whitespace-nowrap"
        >
          по
        </span>
      );
    }
  } else if (activityType === "base_approval" && "case" in item) {
    const answerItem = item as IAnswer;
    icon = <HandThumbUpIcon className="h-5 w-5 text-sky-500" />;
    titleFragments.push(
      <span key="action" className="whitespace-nowrap">
        Одобри решение
      </span>
    );
    caseToLinkForDisplay = answerItem.case;
    titleFragments.push(
      <span key="preposition" className="text-gray-700 whitespace-nowrap">
        по
      </span>
    );
  } else if (activityType === "finance_approval" && "case" in item) {
    const answerItem = item as IAnswer;
    icon = <BanknotesIcon className="h-5 w-5 text-emerald-500" />;
    titleFragments.push(
      <span key="action" className="whitespace-nowrap">
        Финансира решение
      </span>
    );
    caseToLinkForDisplay = answerItem.case;
    titleFragments.push(
      <span key="preposition" className="text-gray-700 whitespace-nowrap">
        по
      </span>
    );
  } else if (activityType === "comment" && "content" in item) {
    const commentItem = item as IComment;
    icon = (
      <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-purple-500" />
    );
    if (
      commentItem.answer &&
      commentItem.answer.case &&
      commentItem.answer.case.case_number
    ) {
      titleFragments.push(
        <span key="action" className="text-gray-700 whitespace-nowrap">
          Написа коментар по решение
        </span>
      );
      caseToLinkForDisplay = commentItem.answer.case;
      titleFragments.push(
        <span key="preposition" className="text-gray-700 whitespace-nowrap">
          към
        </span>
      );
    } else if (commentItem.case && commentItem.case.case_number) {
      titleFragments.push(
        <span key="action" className="text-gray-700 whitespace-nowrap">
          Написа коментар
        </span>
      );
      caseToLinkForDisplay = commentItem.case;
      titleFragments.push(
        <span key="preposition" className="text-gray-700 whitespace-nowrap">
          по
        </span>
      );
    } else {
      titleFragments.push(
        <span key="action" className="text-gray-700 whitespace-nowrap">
          Написа коментар
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

  let statusStyle,
    typeBadgeClasses,
    priorityTextColorClass,
    calculatedRatingTextColorClass;
  if (activityType === "case" && "status" in item) {
    statusStyle = getStatusStyleFromHelper(item.status as string);
    typeBadgeClasses = getTypeBadgeStyleFromHelper(item.type as string);
    if ((item as ICase).priority) {
      priorityTextColorClass = getPriorityStyleFromHelper(
        (item as ICase).priority
      );
    }
    if ((item as ICase).calculatedRating != null) {
      calculatedRatingTextColorClass = getCalculatedRatingStyleFromHelper(
        (item as ICase).calculatedRating!
      );
    }
  }

  return (
    <div className="p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 group transition-colors duration-150">
      <div className="flex items-start space-x-2 sm:space-x-3">
        <div
          className={`flex-shrink-0 pt-1 ${view === "compact" ? "ml-2" : ""}`}
        >
          {icon || <LinkIcon className="h-5 w-5 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-sm">
            <div className="flex items-baseline gap-x-1.5 min-w-0 mr-2">
              {view === "full" && (
                <span className="text-gray-700 flex items-baseline gap-x-1 flex-shrink min-w-0">
                  {titleFragments.map((frag, index) => (
                    <React.Fragment key={index}>{frag}</React.Fragment>
                  ))}
                </span>
              )}
              {caseToLinkForDisplay && caseToLinkForDisplay.case_number && (
                <div className="w-[70px] flex-shrink-0">
                  <CaseLink
                    my_case={caseToLinkForDisplay as ICase}
                    t={tFunctionForCaseLinkProp}
                  />
                </div>
              )}
              {view === "compact" && contentPreview && (
                <span
                  className="mt-1 ml-1 text-sm text-sm text-gray-600 line-clamp-1"
                  title={stripHtmlTags(itemContent)}
                >
                  {contentPreview}...
                </span>
              )}
            </div>
            {date && (
              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-1 sm:mt-0 self-start sm:self-baseline">
                <ShowDate date={date} isCase={activityType === "case"} />
              </span>
            )}
          </div>
          {view === "full" && (
            <>
              {contentPreview && (
                <p
                  className="mt-1 text-sm text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-1"
                  title={stripHtmlTags(itemContent)}
                >
                  {contentPreview}
                </p>
              )}
              {activityType === "case" &&
                "status" in item &&
                statusStyle &&
                typeBadgeClasses && (
                  <div className="mt-2 text-xs">
                    <div className="flex items-center justify-around sm:justify-start sm:gap-x-3 mb-1.5">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center">
                          <span
                            className={`h-2 w-2 rounded-full mr-1.5 ${statusStyle.dotBgColor}`}
                          />
                          <span
                            className={`${statusStyle.textColor} font-medium`}
                          >
                            {translateStatusUtil(item.status as string)}
                          </span>
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${typeBadgeClasses}`}
                        >
                          {translateCaseTypeUtil(item.type as string)}
                        </span>
                      </div>
                      {priorityTextColorClass && (
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex items-center pl-2 py-0.5 rounded-full font-medium ${priorityTextColorClass}`}
                          >
                            <FlagIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                            {translatePriorityUtil(item.priority!)}
                          </span>
                        </div>
                      )}
                      {calculatedRatingTextColorClass &&
                        item.calculatedRating && (
                          <div className="flex-shrink-0">
                            <span
                              className={`inline-flex items-center px-1 py-0.5 rounded-full font-medium ${calculatedRatingTextColorClass}`}
                            >
                              <StarIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                              <span className="brightness-75">
                                {item.calculatedRating.toFixed(2)}
                              </span>
                            </span>
                          </div>
                        )}
                    </div>
                    {item.categories && item.categories.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1 items-center">
                        <span className="text-gray-500 mr-1">в:</span>
                        {item.categories?.slice(0, 3).map((cat) => (
                          <CategoryLink key={cat._id} {...cat} />
                        ))}
                        {item.categories.length > 3 && (
                          <span className="text-xs text-gray-500 ml-0.5">
                            ...
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              {activityType === "answer" &&
                item &&
                "approved" in item &&
                item.case &&
                typeof item.case.status === "string" && (
                  <div className="mt-2 text-xs">
                    {(() => {
                      const answerItem = item as IAnswer;
                      const isExpertApproved = !!answerItem.approved;
                      const caseStatus = answerItem.case.status;

                      if (
                        isExpertApproved &&
                        caseStatus === "AWAITING_FINANCE"
                      ) {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium text-blue-700 bg-blue-100 border border-blue-200">
                            <InformationCircleIcon className="h-4 w-4 mr-1" />
                            Чака финанси
                          </span>
                        );
                      } else if (isExpertApproved) {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium text-green-700 bg-green-100 border border-green-200">
                            <HandThumbUpIcon className="h-4 w-4 mr-1" />
                            Одобрено
                          </span>
                        );
                      } else if (
                        !isExpertApproved &&
                        (caseStatus === "CLOSED" ||
                          caseStatus === "AWAITING_FINANCE")
                      ) {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium text-red-700 bg-red-100 border border-red-200">
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Неодобрено
                          </span>
                        );
                      } else if (!isExpertApproved) {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium text-yellow-700 bg-yellow-100 border border-yellow-200">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Чака одобрение
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivityItemCard;
