import React, { useEffect, useState, useRef } from "react";
import {
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ClockIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  ArrowUpCircleIcon,
} from "@heroicons/react/24/solid";
import { IAnswer, ICase, IComment, IMe } from "../../db/interfaces";
import CaseHistoryContent from "./CaseHistoryContent";
import Comment from "./Comment";
import Answer from "./Answer";
import AddComment from "./AddComment";
import AddAnswer from "./AddAnswer";
import { USER_RIGHTS, CASE_STATUS } from "../../utils/GLOBAL_PARAMETERS";
import { useLocation } from "react-router";

interface SubmenuProps {
  caseData: ICase;
  t: (key: string, options?: Record<string, any>) => string;
  me: IMe;
  refetch: () => void;
  userRights: string[];
  mentions?: { name: string; username: string; _id: string }[];
}

const getStateFromHash = () => {
  const hash = window.location.hash.substring(1);

  if (hash.startsWith("comments-")) {
    return { view: "comments" as const, targetId: hash };
  }
  if (hash.startsWith("answers-")) {
    return { view: "answers" as const, targetId: hash };
  }
  if (hash === "comments") {
    return { view: "comments" as const, targetId: null };
  }
  if (hash === "answers") {
    return { view: "answers" as const, targetId: null };
  }
  if (hash === "history") {
    return { view: "history" as const, targetId: null };
  }

  // Default state if hash is empty or unrecognized
  return { view: "answers" as const, targetId: null };
};

const Submenu: React.FC<SubmenuProps> = ({
  caseData,
  t,
  me,
  refetch,
  userRights,
  mentions = [],
}) => {
  const [view, setView] = useState(() => getStateFromHash().view);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [childTargetId, setChildTargetId] = useState<string | null>(null);
  const location = useLocation();

  // State to control the visibility of the AddAnswer form.
  // It defaults to 'true' (visible) if the case status is OPEN or IN_PROGRESS.
  const [isAddAnswerVisible, setIsAddAnswerVisible] = useState(() => {
    const { status } = caseData;
    return status === CASE_STATUS.OPEN || status === CASE_STATUS.IN_PROGRESS;
  });

  // State to control the visibility of the AddComment form for the case.
  const [isAddCommentVisible, setIsAddCommentVisible] =
    useState(isAddAnswerVisible);

  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const [isScrollTopButtonVisible, setIsScrollTopButtonVisible] =
    useState(false);

  useEffect(() => {
    const handleNavigation = async () => {
      const processUrl = () => {
        const fullHash = location.hash.substring(1);
        const isCommentLink = fullHash.includes("?comment=true");
        const hashPart = fullHash.split("?")[0];

        if (hashPart.startsWith("answers-") && isCommentLink) {
          const commentId = hashPart.split("-")[1];
          const parentAnswer = (caseData.answers || []).find((answer) =>
            answer.comments?.some((c) => c._id === commentId)
          );
          if (parentAnswer) {
            setView("answers");
            setTargetId(`answers-${parentAnswer._id}`);
            setChildTargetId(`comments-${commentId}`);
          }
          return;
        }

        setChildTargetId(null);
        if (hashPart.startsWith("comments-")) {
          setView("comments");
          setTargetId(hashPart);
        } else if (hashPart.startsWith("answers-")) {
          setView("answers");
          setTargetId(hashPart);
        } else if (hashPart === "history" || hashPart === "comments") {
          setView(hashPart as "history" | "comments");
          setTargetId(null);
        } else {
          setView("answers");
          setTargetId(null);
        }
      };

      const isTargetingSpecificItem = location.hash.includes("-");

      if (isTargetingSpecificItem) {
        await refetch();
      }

      processUrl();
    };

    handleNavigation();
  }, [caseData.answers, location.hash, refetch]);

  // useEfect for scroll to top listener
  useEffect(() => {
    const container = scrollableContainerRef.current;

    const handleScroll = () => {
      if (container) {
        // Show button if scrolled down more than 300px
        setIsScrollTopButtonVisible(container.scrollTop > 300);
      }
    };

    container?.addEventListener("scroll", handleScroll);

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  const scrollToTop = () => {
    scrollableContainerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleAnswerSubmitted = () => {
    setIsAddAnswerVisible(false);
  };

  const handleCaseCommentSubmitted = () => {
    setIsAddCommentVisible(false); // This will close the case-level comment form
  };

  const isCreatorAndNothingElse =
    userRights.length === 1 && userRights.includes("creator");

  const canAddAnswer =
    userRights.includes(USER_RIGHTS.EXPERT) ||
    userRights.includes(USER_RIGHTS.MANAGER) ||
    userRights.includes(USER_RIGHTS.ADMIN);

  const submenu = [
    {
      key: "answers",
      label: (
        <>
          {t("answers")}
          <sup>{caseData?.answers?.length || 0}</sup>
        </>
      ),
      icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5 mr-2" />,
    },
    {
      key: "comments",
      label: (
        <>
          {t("comments")}
          <sup>{caseData?.comments?.length || 0}</sup>
        </>
      ),
      icon: <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 mr-2" />,
    },
    {
      key: "history",
      label: (
        <>
          {t("history")}
          <sup>{caseData?.history?.length || 0}</sup>
        </>
      ),
      icon: <ClockIcon className="h-5 w-5 mr-2" />,
    },
  ];

  if (isCreatorAndNothingElse) {
    submenu.splice(2, 2);
  }

  const visibleAnswers = (caseData.answers || []).filter((answer) => {
    const isMentionedInAnswer =
      answer.content?.includes(`data-id="${me.username}"`) ?? false;
    const isMentionedInComment =
      answer.comments?.some((comment) =>
        comment.content?.includes(`data-id="${me.username}"`)
      ) ?? false;

    return (
      answer.approved ||
      userRights.includes(USER_RIGHTS.EXPERT) ||
      userRights.includes(USER_RIGHTS.MANAGER) ||
      userRights.includes(USER_RIGHTS.ADMIN) ||
      isMentionedInAnswer ||
      isMentionedInComment
    );
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 sticky top-0 z-1 bg-white border-b border-gray-200">
        <div className="flex justify-center gap-2 py-4">
          {submenu.map((item) => (
            <button
              key={item.key}
              className={`flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-150 border
              ${
                view === item.key
                  ? "border-btnRedHover text-btnRedHover shadow"
                  : "border-gray-300 shadow-sm bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-btnRedHover hover:cursor-pointer"
              }`}
              type="button"
              onClick={() => (window.location.hash = item.key)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div
        ref={scrollableContainerRef}
        className="flex-grow overflow-y-auto pt-6"
      >
        {view === "answers" && (
          <>
            {canAddAnswer ? (
              <div className="mb-2 transition-all duration-300">
                <div className="mx-5">
                  <button
                    onClick={() => setIsAddAnswerVisible((prev) => !prev)}
                    className="cursor-pointer w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-gray-700 font-semibold ring-1 ring-gray-300 focus:outline-none active:ring-2 active:ring-indigo-400 transition-colors"
                    aria-expanded={isAddAnswerVisible}
                    aria-controls="add-answer-form"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-gray-500" />
                      {isAddAnswerVisible
                        ? "Скрий писане на решение"
                        : "Напиши решение"}
                    </span>
                    {isAddAnswerVisible ? (
                      <MinusCircleIcon className="h-6 w-6 text-gray-500" />
                    ) : (
                      <PlusCircleIcon className="h-6 w-6 text-gray-500" />
                    )}
                  </button>
                </div>
                {isAddAnswerVisible && (
                  <div id="add-answer-form" className="mt-4">
                    <AddAnswer
                      caseNumber={caseData.case_number}
                      caseId={caseData._id}
                      t={t}
                      me={me}
                      mentions={mentions}
                      onAnswerSubmitted={handleAnswerSubmitted}
                    />
                  </div>
                )}
              </div>
            ) : // Existing placeholder messages for non-privileged users
            visibleAnswers.length === 0 &&
              (caseData.answers || []).length === 0 ? (
              <div className="text-center text-gray-500">{t("no_answers")}</div>
            ) : visibleAnswers.length === 0 ? (
              <div className="text-center text-gray-500">
                {t("waiting_approval")}
              </div>
            ) : null}

            {/* Block for the list of answers */}
            {/* **MODIFIED**: We map over the pre-filtered visibleAnswers array */}
            {visibleAnswers.length > 0 ? (
              <>
                {visibleAnswers
                  .sort((a, b) => {
                    if (a.approved && !b.approved) return -1;
                    if (!a.approved && b.approved) return 1;
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    return dateB - dateA;
                  })
                  .map((answer: IAnswer) => (
                    <Answer
                      key={answer._id}
                      answer={answer}
                      me={me}
                      refetch={refetch}
                      caseNumber={caseData.case_number}
                      status={caseData.status}
                      caseCategories={caseData.categories}
                      mentions={mentions}
                      targetId={targetId}
                      childTargetId={childTargetId}
                    />
                  ))}
              </>
            ) : null}
          </>
        )}
        {view === "comments" && (
          <>
            <div className="mb-2 transition-all duration-300">
              <div className="mx-5">
                <button
                  onClick={() => setIsAddCommentVisible((prev) => !prev)}
                  className="cursor-pointer w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-gray-700 font-semibold ring-1 ring-gray-300 focus:outline-none active:ring-2 active:ring-indigo-400 transition-colors"
                  aria-expanded={isAddCommentVisible}
                  aria-controls="add-comment-form"
                >
                  <span className="flex items-center justify-center gap-2">
                    <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 text-gray-500" />
                    {isAddCommentVisible
                      ? "Скрий писане на коментар"
                      : "Напиши коментар"}
                  </span>
                  {isAddCommentVisible ? (
                    <MinusCircleIcon className="h-6 w-6 text-gray-500" />
                  ) : (
                    <PlusCircleIcon className="h-6 w-6 text-gray-500" />
                  )}
                </button>
              </div>
              {isAddCommentVisible && (
                <div id="add-comment-form" className="mt-4">
                  <AddComment
                    key="main-case-comment-box"
                    caseId={caseData._id}
                    t={t}
                    me={me}
                    caseNumber={caseData.case_number}
                    inputId={`file-upload-comment-case-${caseData._id}`}
                    mentions={mentions}
                    onCommentSubmitted={handleCaseCommentSubmitted}
                  />
                </div>
              )}
            </div>
            {caseData.comments && caseData.comments.length > 0 ? (
              <div className="mx-5 space-y-2">
                {[...caseData.comments]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((comment: IComment) => (
                    <Comment
                      key={comment._id}
                      comment={comment}
                      me={me}
                      caseNumber={caseData.case_number}
                      mentions={mentions}
                      targetId={targetId}
                    />
                  ))}
              </div>
            ) : (
              // Hide "no comments" message if the user is about to write one
              !isAddCommentVisible && (
                <div className="text-center text-gray-500">
                  {t("no_comments")}
                </div>
              )
            )}
          </>
        )}

        {view === "history" &&
          (caseData.history && caseData.history.length > 0 ? (
            <div className="flex flex-col gap-4 mb-8 ml-4">
              <CaseHistoryContent history={caseData.history} />
            </div>
          ) : (
            <div className="text-center text-gray-500">{t("no_history")}</div>
          ))}
      </div>

      {isScrollTopButtonVisible && (
        <button
          onClick={scrollToTop}
          className="cursor-pointer absolute bottom-6 right-6 z-20 p-2 bg-gray-500 text-white rounded-full shadow-lg hover:bg-gray-700 focus:outline-none active:ring-2 active:ring-offset-2 active:ring-gray-500 transition-transform hover:scale-110"
          aria-label="Scroll to top"
          title="Върнете се най-нагоре"
        >
          <ArrowUpCircleIcon className="h-7 w-7" />
        </button>
      )}
    </div>
  );
};

export default Submenu;
