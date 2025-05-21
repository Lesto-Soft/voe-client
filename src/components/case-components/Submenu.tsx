import React from "react";
import {
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import { IAnswer, ICase, IComment } from "../../db/interfaces";
import AnswerMobile from "./mobile/AnswerMobile";
import CaseHistoryContent from "./CaseHistoryContent";
import Comment from "./Comment";
import Answer from "./Answer";
import CommentMobile from "./mobile/CommentMobile";
import AddComment from "./AddComment";

interface SubmenuProps {
  caseData: ICase;
  t: (key: string, options?: Record<string, any>) => string; // Updated type for t
  me: any;
  refetch: () => void;
}

const Submenu: React.FC<SubmenuProps> = ({ caseData, t, me, refetch }) => {
  const [view, setView] = useState<"answers" | "comments" | "history">(
    "answers"
  );

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
        {view === "answers" &&
          (caseData.answers && caseData.answers.length > 0 ? (
            <>
              {[...caseData.answers] // Create a shallow copy of the array
                .sort((a, b) => (b.approved ? 1 : 0) - (a.approved ? 1 : 0)) // Sort approved answers to the top
                .map((answer: IAnswer) => (
                  <div key={answer._id}>
                    <div className="flex lg:hidden flex-col gap-4 mb-8">
                      <AnswerMobile answer={answer} me={me} refetch={refetch} />
                    </div>
                    <div className="hidden lg:flex flex-col gap-4 mb-8">
                      <Answer answer={answer} me={me} refetch={refetch} />
                    </div>
                  </div>
                ))}
            </>
          ) : (
            <div className="text-center text-gray-500">{t("no_answers")}</div>
          ))}

        {view === "comments" &&
          (caseData.comments && caseData.comments.length > 0 ? (
            <div>
              <AddComment
                caseId={caseData._id}
                refetch={refetch}
                t={t}
                me={me}
              />

              {[...caseData.comments]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((comment: IComment) => (
                  <div className=" gap-4 mb-8" key={comment._id}>
                    <div className="hidden lg:block ">
                      <Comment comment={comment} me={me} />
                    </div>
                    <div className="lg:hidden flex">
                      <CommentMobile comment={comment} me={me} />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">{t("no_comments")}</div>
          ))}

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
