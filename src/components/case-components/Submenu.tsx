import React, { use, useLayoutEffect } from "react";
import {
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import { IAnswer, ICase, ICategory, IComment } from "../../db/interfaces";
import AnswerMobile from "./mobile/AnswerMobile";
import CaseHistoryContent from "./CaseHistoryContent";
import Comment from "./Comment";
import Answer from "./Answer";
import CommentMobile from "./mobile/CommentMobile";
import AddComment from "./AddComment";
import AddAnswer from "./AddAnswer";
import { checkNormal } from "../../utils/rightUtils";
import { USER_RIGHTS } from "../../utils/GLOBAL_PARAMETERS";

const LOCAL_STORAGE_KEY = "case-submenu-view";

interface SubmenuProps {
  caseData: ICase;
  t: (key: string, options?: Record<string, any>) => string;
  me: any;
  refetch: () => void;
  userRights: string[];
}
const Submenu: React.FC<SubmenuProps> = ({
  caseData,
  t,
  me,
  refetch,
  userRights,
}) => {
  const [view, setView] = useState<"answers" | "comments" | "history">(() => {
    // Try to get the last selected view from sessionStorage
    const stored = sessionStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored === "answers" || stored === "comments" || stored === "history") {
      return stored;
    }
    return "answers";
  });

  const expertCategoryIds = (me.expert_categories || []).map(
    (cat: { _id: string }) => cat._id
  );
  const caseCategoryIdsInThisCase = (caseData.categories || []).map(
    (cat: ICategory) => cat._id
  );

  const isExpertForCase = expertCategoryIds.some((expertId: string) =>
    caseCategoryIdsInThisCase.includes(expertId)
  );

  useLayoutEffect(() => {
    sessionStorage.setItem(LOCAL_STORAGE_KEY, view);
  }, [view]);

  const isCreatorAndNothingElse =
    userRights.length === 1 && userRights.includes("creator");

  const submenu = [
    {
      key: "answers",
      label: (
        <>
          {t("answers")}
          <sup>{caseData && caseData.answers && caseData.answers.length}</sup>
        </>
      ),
      icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />,
    },
    {
      key: "comments",
      label: (
        <>
          {t("comments")}
          <sup>{caseData && caseData.comments && caseData.comments.length}</sup>
        </>
      ),
      icon: <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-2" />,
    },
    {
      key: "history",
      label: (
        <>
          {t("history")}
          <sup>{caseData && caseData.history && caseData.history.length}</sup>
        </>
      ),
      icon: <ClockIcon className="h-5 w-5 mr-2" />,
    },
  ];
  if (isCreatorAndNothingElse) {
    submenu.splice(2, 2);
  }

  return (
    <>
      <div className="flex justify-center gap-2 mb-6 mt-5 lg:mt-0">
        {submenu.map((item) => (
          <button
            key={item.key}
            className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 border
        ${
          view === item.key
            ? "border-btnRedHover text-btnRedHover shadow"
            : "border-gray-300 shadow-sm bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-btnRedHover hover:cursor-pointer"
        }`}
            type="button"
            onClick={() =>
              setView(item.key as "answers" | "comments" | "history")
            }
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Comments/answers and other scrollable content will go here */}
      {/* Section content */}
      <div>
        {view === "answers" && (
          <>
            {userRights.includes(USER_RIGHTS.EXPERT) ||
            userRights.includes(USER_RIGHTS.MANAGER) ||
            userRights.includes(USER_RIGHTS.ADMIN) ? (
              <AddAnswer
                caseNumber={caseData.case_number}
                caseId={caseData._id}
                t={t}
                me={me}
              />
            ) : null}
            {caseData.answers && caseData.answers.length > 0 ? (
              <>
                {[...caseData.answers] // Create a shallow copy of the array
                  .sort((a, b) => {
                    // Approved answers first
                    if (a.approved && !b.approved) return -1;
                    if (!a.approved && b.approved) return 1;
                    // If both are approved or both are not approved, sort by date (newest first)
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    return dateB - dateA;
                  })
                  .map((answer: IAnswer) => {
                    const showThisAnswer =
                      answer.approved ||
                      userRights.includes(USER_RIGHTS.EXPERT) ||
                      userRights.includes(USER_RIGHTS.MANAGER) ||
                      userRights.includes(USER_RIGHTS.ADMIN);
                    return showThisAnswer ? (
                      <div key={answer._id}>
                        <div className="flex lg:hidden flex-col gap-4 mb-8">
                          <AnswerMobile
                            answer={answer}
                            me={me}
                            refetch={refetch}
                            caseNumber={caseData.case_number}
                            status={caseData.status}
                          />
                        </div>
                        <div className="hidden lg:flex flex-col gap-4 mb-8">
                          <Answer
                            answer={answer}
                            me={me}
                            refetch={refetch}
                            caseNumber={caseData.case_number}
                            status={caseData.status}
                            caseCategories={caseData.categories}
                          />
                        </div>
                      </div>
                    ) : null; // React handles null by rendering nothing, which is what we want.
                  })}
              </>
            ) : (
              <div className="text-center text-gray-500">{t("no_answers")}</div>
            )}
          </>
        )}

        {view === "comments" && (
          <>
            <AddComment
              caseId={caseData._id}
              t={t}
              me={me}
              caseNumber={caseData.case_number}
            />
            {caseData.comments && caseData.comments.length > 0 ? (
              <>
                {[...caseData.comments]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((comment: IComment) => (
                    <div className=" gap-4 mb-8" key={comment._id}>
                      <div className="hidden lg:block ">
                        <Comment
                          comment={comment}
                          me={me}
                          caseNumber={caseData.case_number}
                        />
                      </div>
                      <div className="lg:hidden flex">
                        <CommentMobile
                          comment={comment}
                          me={me}
                          caseNumber={caseData.case_number}
                        />
                      </div>
                    </div>
                  ))}
              </>
            ) : (
              <div className="text-center text-gray-500">
                {t("no_comments")}
              </div>
            )}
          </>
        )}

        {view === "history" &&
          (caseData.history && caseData.history.length > 0 ? (
            <div className="flex flex-col gap-4 mb-8">
              <CaseHistoryContent history={caseData.history} />
            </div>
          ) : (
            <div className="text-center text-gray-500">{t("no_history")}</div>
          ))}
      </div>
    </>
  );
};

export default Submenu;
