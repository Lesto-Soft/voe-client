import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ClockIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  ChevronDoubleUpIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/solid";
import { IAnswer, ICase, IComment, IMe } from "../../db/interfaces";
import CaseHistoryContent from "./CaseHistoryContent";
import CaseTasksTab from "./CaseTasksTab";
import Comment from "./comment/Comment";
import Answer from "./answer/Answer";
import AddComment from "./comment/AddComment";
import AddAnswer from "./answer/AddAnswer";
import { USER_RIGHTS /*, CASE_STATUS */ } from "../../utils/GLOBAL_PARAMETERS";
import { useGetAllTasks } from "../../graphql/hooks/task";
import { useLocation } from "react-router";
import useMediaQuery from "../../hooks/useMediaQuery";
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedWarning";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";

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
  if (hash === "tasks") {
    return { view: "tasks" as const, targetId: null };
  }

  // Default state if hash is empty or unrecognized
  return { view: "answers" as const, targetId: null };
};

interface AnswerCommentState {
  content: string;
  attachments: File[];
  isVisible: boolean;
}

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

  // Fetch task count for this case
  const { count: taskCount } = useGetAllTasks({
    caseId: caseData._id,
    itemsPerPage: 1,
    currentPage: 0,
  });

  const [answerCommentsVisibility, setAnswerCommentsVisibility] = useState<
    Record<string, boolean>
  >({});

  const [answerCommentStates, setAnswerCommentStates] = useState<
    Record<string, AnswerCommentState>
  >({});

  const handleToggleAnswerComments = (answerId: string) => {
    setAnswerCommentsVisibility((prev) => ({
      ...prev,
      [answerId]: !(prev[answerId] ?? false), // Default is hidden, so toggle it off
    }));
  };

  // state for editor content AND attachments
  const [answerContent, setAnswerContent] = useState("");
  const [answerAttachments, setAnswerAttachments] = useState<File[]>([]);
  const [caseCommentContent, setCaseCommentContent] = useState("");
  const [caseCommentAttachments, setCaseCommentAttachments] = useState<File[]>(
    [],
  );

  const handleSetAnswerCommentState = useCallback(
    (answerId: string, newState: Partial<AnswerCommentState>) => {
      setAnswerCommentStates((prev) => ({
        ...prev,
        [answerId]: {
          ...(prev[answerId] || {
            content: "",
            attachments: [],
            isVisible: false,
          }),
          ...newState,
        },
      }));
    },
    [],
  );

  const handleAnswerCommentSubmitted = useCallback((answerId: string) => {
    // This function resets the state for a specific answer after submission.
    setAnswerCommentStates((prev) => ({
      ...prev,
      [answerId]: {
        content: "",
        attachments: [],
        isVisible: false,
      },
    }));
  }, []);

  const handleToggleAnswerCommentBox = useCallback((answerId: string) => {
    // This function will be called by the Answer component to open or close its comment box.
    // The Answer component itself will handle the unsaved changes warning before calling this.
    setAnswerCommentStates((prev) => {
      const currentState = prev[answerId];
      const isCurrentlyVisible = currentState?.isVisible || false;

      return {
        ...prev,
        [answerId]: {
          // If we are closing the box, reset its state. Otherwise, just open it.
          content: isCurrentlyVisible ? "" : currentState?.content || "",
          attachments: isCurrentlyVisible
            ? []
            : currentState?.attachments || [],
          isVisible: !isCurrentlyVisible,
        },
      };
    });
  }, []);

  // State to control the visibility of the AddAnswer form.
  // It defaults to 'true' (visible) if the case status is OPEN or IN_PROGRESS.
  const [isAddAnswerVisible, setIsAddAnswerVisible] = useState(() => {
    // const { status } = caseData;
    // return status === CASE_STATUS.OPEN || status === CASE_STATUS.IN_PROGRESS;

    // making it always false after the latest autoFocus changes (1 click either way to start typing)
    return false;
  });

  // State to control the visibility of the AddComment form for the case.
  const [isAddCommentVisible, setIsAddCommentVisible] =
    useState(isAddAnswerVisible);

  // NEW: Hooks for unsaved changes warnings
  const {
    isDialogOpen: isAnswerWarningOpen,
    handleConfirm: confirmCloseAnswer,
    handleCancel: cancelCloseAnswer,
    withWarning: withAnswerWarning,
    dialogContent: answerDialogContent,
  } = useUnsavedChangesWarning(
    answerContent,
    isAddAnswerVisible,
    answerAttachments.length,
  );

  const {
    isDialogOpen: isCommentWarningOpen,
    handleConfirm: confirmCloseComment,
    handleCancel: cancelCloseComment,
    withWarning: withCommentWarning,
    dialogContent: commentDialogContent,
  } = useUnsavedChangesWarning(
    caseCommentContent,
    isAddCommentVisible,
    caseCommentAttachments.length,
  );

  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const [isScrollTopButtonVisible, setIsScrollTopButtonVisible] =
    useState(false);

  // refs for the toggleable sections we want to scroll to
  const addAnswerContainerRef = useRef<HTMLDivElement>(null);
  const addCommentContainerRef = useRef<HTMLDivElement>(null);

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    const handleNavigation = async () => {
      const processUrl = () => {
        const fullHash = location.hash.substring(1);
        const isCommentLink = fullHash.includes("?comment=true");
        const hashPart = fullHash.split("?")[0];

        if (hashPart.startsWith("answers-") && isCommentLink) {
          const commentId = hashPart.split("-")[1];
          const parentAnswer = (caseData.answers || []).find((answer) =>
            answer.comments?.some((c) => c._id === commentId),
          );
          if (parentAnswer) {
            setView("answers");
            setTargetId(`answers-${parentAnswer._id}`);
            setChildTargetId(`answers-comment-${commentId}`); // Set correct child ID format
            // Programmatically open the comments for the parent answer
            setAnswerCommentsVisibility((prev) => ({
              ...prev,
              [parentAnswer._id]: true,
            }));
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
        } else if (
          hashPart === "history" ||
          hashPart === "comments" ||
          hashPart === "tasks"
        ) {
          setView(hashPart as "history" | "comments" | "tasks");
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
    // Determine the scroll target: the div on desktop, the whole window on mobile
    const scrollTarget = isDesktop ? scrollableContainerRef.current : window;
    if (!scrollTarget) return;

    const handleScroll = () => {
      const scrollTop = isDesktop
        ? (scrollTarget as HTMLElement).scrollTop // For the div
        : (scrollTarget as Window).scrollY; // For the window

      setIsScrollTopButtonVisible(scrollTop > 300);
    };

    scrollTarget.addEventListener("scroll", handleScroll);

    // Cleanup listener
    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
    };
  }, [isDesktop]); // Re-run this effect if the screen size crosses the breakpoint

  const scrollToTop = () => {
    const target = isDesktop ? scrollableContainerRef.current : window;
    target?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleToggleAddAnswer = () => {
    // Check if we are about to OPEN the accordion
    if (!isAddAnswerVisible) {
      // First, set the state to true so the component renders
      setIsAddAnswerVisible(true);

      // Use a timeout to wait for the DOM to update after the state change
      setTimeout(() => {
        const container = addAnswerContainerRef.current;
        if (container) {
          // Scroll the container into view
          container.scrollIntoView({ behavior: "smooth", block: "nearest" });

          // Find the editor element inside and focus it
          const editorElement =
            container.querySelector<HTMLElement>(".ProseMirror");
          editorElement?.focus();
        }
      }, 100);
    } else {
      // NEW: Use warning for close action
      withAnswerWarning(() => {
        setIsAddAnswerVisible(false);
        setAnswerContent("");
      });
    }
  };

  const handleToggleAddComment = () => {
    if (!isAddCommentVisible) {
      setIsAddCommentVisible(true);
      setTimeout(() => {
        const container = addCommentContainerRef.current;
        if (container) {
          container.scrollIntoView({ behavior: "smooth", block: "nearest" });
          const editorElement =
            container.querySelector<HTMLElement>(".ProseMirror");
          editorElement?.focus();
        }
      }, 100);
    } else {
      // NEW: Use warning for close action
      withCommentWarning(() => {
        setIsAddCommentVisible(false);
        setCaseCommentContent("");
      });
    }
  };

  const handleAnswerSubmitted = () => {
    setIsAddAnswerVisible(false);
    setAnswerContent(""); // Clear content
    setAnswerAttachments([]); // Add this
  };

  const handleCaseCommentSubmitted = () => {
    setIsAddCommentVisible(false); // This will close the case-level comment form
    setCaseCommentContent(""); // Clear content
    setCaseCommentAttachments([]); // Add this
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
      key: "tasks",
      label: (
        <>
          {t("tasks", "Задачи")}
          <sup>{taskCount}</sup>
        </>
      ),
      icon: <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />,
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
    // Remove history tab (index 3) for creators who have no other rights
    submenu.splice(3, 1);
  }

  const visibleAnswers = (caseData.answers || []).filter((answer) => {
    const isMentionedInAnswer =
      answer.content?.includes(`data-id="${me.username}"`) ?? false;
    const isMentionedInComment =
      answer.comments?.some((comment) =>
        comment.content?.includes(`data-id="${me.username}"`),
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
    <div className="flex flex-col lg:h-full relative custom-scrollbar-xs">
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

      {/* Scrollable Content Area - MODIFIED FOR RESPONSIVENESS */}
      {/* 1. This outer div now establishes the boundary ONLY ON DESKTOP. */}
      <div className="lg:flex-grow lg:min-h-0 lg:relative">
        {/* 2. This inner div handles scrolling ON DESKTOP and provides padding for all views. */}
        <div
          ref={scrollableContainerRef}
          className="pt-6 lg:absolute lg:inset-0 lg:overflow-y-auto"
        >
          {view === "answers" && (
            <>
              {/* This section for the "Add Answer" button remains unchanged */}
              {canAddAnswer && (
                <div
                  ref={addAnswerContainerRef}
                  className="mb-2 transition-all duration-300"
                >
                  <div className="mx-5">
                    <button
                      onClick={handleToggleAddAnswer}
                      className="cursor-pointer w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-gray-700 font-semibold ring-1 ring-gray-300 focus:outline-none active:ring-2 active:ring-indigo-400 transition-colors"
                      aria-expanded={isAddAnswerVisible}
                      aria-controls="add-answer-form"
                    >
                      <span className="flex items-center justify-center gap-2 text-sm">
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
                        content={answerContent}
                        setContent={setAnswerContent}
                        attachments={answerAttachments}
                        setAttachments={setAnswerAttachments}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Renders the list of answers if there are any */}
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
                    .map((answer: IAnswer) => {
                      //get the correct state for this specific answer
                      const commentState = answerCommentStates[answer._id] || {
                        content: "",
                        attachments: [],
                        isVisible: false,
                      };

                      return (
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
                          areCommentsVisible={
                            answerCommentsVisibility[answer._id] ?? false
                          }
                          onToggleComments={handleToggleAnswerComments}
                          // new props
                          isCommentBoxVisible={commentState.isVisible}
                          commentContent={commentState.content}
                          commentAttachments={commentState.attachments}
                          onToggleCommentBox={() =>
                            handleToggleAnswerCommentBox(answer._id)
                          }
                          onCommentSubmitted={() =>
                            handleAnswerCommentSubmitted(answer._id)
                          }
                          onSetCommentState={(newState) =>
                            handleSetAnswerCommentState(answer._id, newState)
                          }
                        />
                      );
                    })}
                </>
              ) : (
                // If there are no visible answers, show a placeholder message,
                // but only if the user is NOT currently writing a new answer.
                !isAddAnswerVisible &&
                ((caseData.answers || []).length === 0 ? (
                  <div className="text-center text-gray-500">
                    {t("no_answers")}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    {t("waiting_approval")}
                  </div>
                ))
              )}
            </>
          )}
          {view === "comments" && (
            <>
              <div
                ref={addCommentContainerRef}
                className="mb-2 transition-all duration-300"
              >
                <div className="mx-5">
                  <button
                    onClick={handleToggleAddComment}
                    className="cursor-pointer w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-gray-700 font-semibold ring-1 ring-gray-300 focus:outline-none active:ring-2 active:ring-indigo-400 transition-colors"
                    aria-expanded={isAddCommentVisible}
                    aria-controls="add-comment-form"
                  >
                    <span className="flex items-center justify-center gap-2 text-sm">
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
                      mentions={mentions}
                      onCommentSubmitted={handleCaseCommentSubmitted}
                      content={caseCommentContent}
                      setContent={setCaseCommentContent}
                      attachments={caseCommentAttachments}
                      setAttachments={setCaseCommentAttachments}
                    />
                  </div>
                )}
              </div>
              {caseData.comments && caseData.comments.length > 0 ? (
                <div className="mx-5 space-y-2">
                  {[...caseData.comments]
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
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

          {view === "tasks" && <CaseTasksTab caseData={caseData} />}

          {view === "history" &&
            (caseData.history && caseData.history.length > 0 ? (
              <div className="flex flex-col gap-4 mb-8 ml-4">
                <CaseHistoryContent history={caseData.history} />
              </div>
            ) : (
              <div className="text-center text-gray-500">{t("no_history")}</div>
            ))}
        </div>
      </div>

      {isScrollTopButtonVisible && (
        <button
          onClick={scrollToTop}
          className={`cursor-pointer z-20 p-2 bg-gray-500 text-white rounded-full shadow-lg hover:bg-gray-700 focus:outline-none active:ring-2 active:ring-offset-2 active:ring-gray-500 transition-transform hover:scale-110 ${
            isDesktop ? "absolute bottom-6 right-6" : "fixed bottom-3 right-3"
          }`}
          aria-label="Scroll to top"
          title="Върнете се най-нагоре"
        >
          <ChevronDoubleUpIcon className="h-7 w-7" />
        </button>
      )}

      {/* NEW: Modals */}
      <ConfirmActionDialog
        isOpen={isAnswerWarningOpen}
        onOpenChange={(open) => !open && cancelCloseAnswer()}
        onConfirm={confirmCloseAnswer}
        title={answerDialogContent.title}
        description={answerDialogContent.description}
        confirmButtonText={answerDialogContent.confirmText}
        isDestructiveAction={true}
      />
      <ConfirmActionDialog
        isOpen={isCommentWarningOpen}
        onOpenChange={(open) => !open && cancelCloseComment()}
        onConfirm={confirmCloseComment}
        title={commentDialogContent.title}
        description={commentDialogContent.description}
        confirmButtonText={commentDialogContent.confirmText}
        isDestructiveAction={true}
      />
    </div>
  );
};

export default Submenu;
