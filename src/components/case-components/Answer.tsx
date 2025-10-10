import { IAnswer, ICategory, IComment, IMe } from "../../db/interfaces";
import { useState, useEffect, useRef, useMemo } from "react";
import Comment from "./Comment";
import ShowDate from "../global/ShowDate";
import { useTranslation } from "react-i18next";
import UserLink from "../global/links/UserLink";
// import Creator from "./Creator";
import ApproveBtn from "./ApproveBtn";
import AnswerHistoryModal from "../modals/AnswerHistoryModal";
import FinanceApproveBtn from "./FinanceApproveBtn";
import { createFileUrl } from "../../utils/fileUtils";
import ImagePreviewModal, { GalleryItem } from "../modals/ImagePreviewModal";
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedWarning";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";
import AddComment from "./AddComment";
import EditAnswerButton from "../global/EditAnswerButton";
import { useDeleteAnswer } from "../../graphql/hooks/answer";
import DeleteModal from "../modals/DeleteModal";
import { renderContentSafely } from "../../utils/contentRenderer";
import { ROLES } from "../../utils/GLOBAL_PARAMETERS";
import UserAvatar from "../cards/UserAvatar";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/solid";
import ActionMenu from "../global/ActionMenu";

const Answer: React.FC<{
  answer: IAnswer;
  me: IMe;
  refetch: () => void;
  caseNumber: number;
  status?: string;
  caseCategories: ICategory[];
  mentions: { name: string; username: string; _id: string }[];
  targetId?: string | null;
  childTargetId?: string | null;
  areCommentsVisible: boolean;
  onToggleComments: (answerId: string) => void;
}> = ({
  answer,
  me,
  refetch,
  caseNumber,
  status,
  caseCategories,
  mentions,
  targetId,
  childTargetId = null,
  areCommentsVisible,
  onToggleComments,
}) => {
  const { t } = useTranslation("answer");
  const approved = !!answer.approved;
  const financialApproved = !!answer.financial_approved;

  const [commentContent, setCommentContent] = useState("");
  const [commentAttachments, setCommentAttachments] = useState<File[]>([]); // ADD THIS
  const [showCommentBox, setShowCommentBox] = useState(false);
  const isCreator = me._id === answer.creator._id;
  const isAdmin = me.role?._id === ROLES.ADMIN;
  const answerRef = useRef<HTMLDivElement>(null);
  const commentRefs = useRef(new Map<string, HTMLDivElement>());

  const {
    isDialogOpen: isCommentWarningOpen,
    handleConfirm: confirmCloseComment,
    handleCancel: cancelCloseComment,
    withWarning: withCommentWarning,
    dialogContent: commentDialogContent,
  } = useUnsavedChangesWarning(
    commentContent,
    showCommentBox,
    commentAttachments.length
  );

  const [isCommentScrolled, setIsCommentScrolled] = useState(false);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = commentsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Set state to true if the container is scrolled down at all
      setIsCommentScrolled(container.scrollTop > 0);
    };

    container.addEventListener("scroll", handleScroll);

    // Also run it once on mount in case the list is already scrolled
    handleScroll();

    // Cleanup the listener when the component unmounts or hides
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [areCommentsVisible]); // Re-run this effect when the comment list is shown/hidden

  const managedCategoryIds = me?.managed_categories.map(
    (cat: ICategory) => cat._id
  );
  const caseCategoryIdsForThisCase = caseCategories.map((cat) => cat._id);
  const isCategoryManagerForCase = managedCategoryIds.some(
    (managedId: string) => caseCategoryIdsForThisCase.includes(managedId)
  );
  const canInteractWithGeneralApproval = isCategoryManagerForCase || isAdmin;
  const { deleteAnswer } = useDeleteAnswer(caseNumber);

  const canEditOrDelete =
    (isCreator || isAdmin) &&
    (status === "OPEN" ||
      status === "IN_PROGRESS" ||
      isAdmin ||
      isCategoryManagerForCase);

  const canApproveNow =
    !approved && status !== "CLOSED" && status !== "AWAITING_FINANCE";
  const canUnapproveNow = approved;
  const showApproveBtn =
    canInteractWithGeneralApproval && (canApproveNow || canUnapproveNow);
  const showFinanceApproveBtn =
    me?.financial_approver === true &&
    answer.needs_finance === true &&
    approved === true;

  useEffect(() => {
    const selfId = `answers-${answer._id}`;
    // This component is not involved at all, so do nothing.
    if (targetId !== selfId) {
      return;
    }

    // Action 1: Scroll this parent Answer into view.
    if (answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // Action 2: Check if there is a child comment to highlight.
    if (childTargetId) {
      if (!areCommentsVisible) {
        onToggleComments(answer._id);
      }
      const timer = setTimeout(() => {
        const commentId = childTargetId.split("-")[1];
        const childWrapperRef = commentRefs.current.get(commentId);

        if (childWrapperRef) {
          // SCROLL TO THE CHILD'S WRAPPER
          childWrapperRef.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // HIGHLIGHT THE CHILD'S WRAPPER
          childWrapperRef.classList.add("highlight");
          setTimeout(() => {
            childWrapperRef.classList.remove("highlight");
          }, 5000);
        } else {
          console.error(
            `ANSWER (${answer._id}): FAILED to find ref for child with ID:`,
            commentId
          );
        }
      }, 100); // 100ms delay for React to render the comment.

      return () => clearTimeout(timer);
    } else {
      // NO. The target is me.
      // Highlight myself.
      if (answerRef.current) {
        answerRef.current.classList.add("highlight");
        setTimeout(() => {
          answerRef.current?.classList.remove("highlight");
        }, 5000);
      }
    }
  }, [targetId, childTargetId, answer._id]);

  // A reusable function to handle the scroll action
  const focusOnAnswer = () => {
    // Delay to allow the DOM to update (e.g., the comment box to render) before scrolling
    setTimeout(() => {
      answerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const handleCommentSubmitted = () => {
    setShowCommentBox(false);
    setCommentContent("");
    setCommentAttachments([]); // Add this
  };

  const handleToggleCommentBox = () => {
    if (!showCommentBox) {
      setShowCommentBox(true);
      focusOnAnswer();
    } else {
      withCommentWarning(() => {
        setShowCommentBox(false);
        setCommentContent("");
        setCommentAttachments([]); // Add this
      });
    }
  };

  const galleryItems: GalleryItem[] = useMemo(() => {
    return (answer.attachments || []).map((file) => ({
      url: createFileUrl("answers", answer._id, file),
      name: file,
    }));
  }, [answer.attachments, answer._id]);

  const answerContentAndAttachments = (
    <>
      <div
        className={`text-gray-800 whitespace-pre-line break-words overflow-y-auto rounded p-3 mt-4 max-h-52 ${
          approved
            ? answer.needs_finance
              ? answer.financial_approved
                ? "bg-green-50"
                : "bg-blue-50"
              : "bg-green-50"
            : "bg-gray-50"
        }`}
      >
        {renderContentSafely(answer.content as string | "")}
      </div>

      {answer.attachments && answer.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {answer.attachments.map((file) => (
            <ImagePreviewModal
              key={file}
              galleryItems={galleryItems}
              imageUrl={createFileUrl("answers", answer._id, file)}
              fileName={file}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-2 text-gray-500 text-xs italic mt-2">
        {answer.approved && (
          <div className="flex items-center gap-1 mb-2">
            <p>{t("approvedBy")}</p>
            <UserLink user={answer.approved} />
            {answer.approved_date && (
              <ShowDate collapsible={true} date={answer.approved_date} />
            )}
          </div>
        )}
        {answer.financial_approved && (
          <div className="flex items-center gap-1 mb-2">
            <p>{t("financedBy")}</p>
            <UserLink user={answer.financial_approved} />
            {answer.financial_approved_date && (
              <ShowDate
                collapsible={true}
                date={answer.financial_approved_date}
              />
            )}
          </div>
        )}
      </div>
    </>
  );

  const commentsSection = (
    <div className="mt-2 pt-2 border-t border-gray-100">
      {/* --- NEW: Combined Controls Row using Absolute Positioning --- */}
      <div
        className={`relative flex items-center h-10 bg-white rounded-md z-10 transition-shadow duration-200 ${
          isCommentScrolled && areCommentsVisible && !showCommentBox
            ? "shadow-[0_5px_10px_-5px_rgba(0,0,0,0.1)] [clip-path:inset(0_0_-10px_0)]"
            : ""
        }`}
      >
        {/* Left Side: Add Comment Button */}
        <button
          className="cursor-pointer text-gray-800 bg-gray-100 hover:bg-gray-200 absolute left-2 top-1/2 -translate-y-1/2 w-42 px-2 py-1 rounded text-sm font-semibold transition-colors duration-200"
          onClick={handleToggleCommentBox}
        >
          <div className="flex w-full items-center gap-2">
            <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 flex-shrink-0 text-gray-500" />
            <div className="flex-1 text-center">
              {showCommentBox ? t("cancelWriting") : t("addComment")}
            </div>
          </div>
        </button>

        {/* Center: Toggle Comments List */}
        {answer.comments && answer.comments.length > 0 && (
          <button
            onClick={() => {
              onToggleComments(answer._id);
              focusOnAnswer();
            }}
            className="absolute top-1/2 -translate-y-1/2 right-2 md:right-auto md:left-1/2 md:-translate-x-1/2 flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-50 focus:outline-none transition-colors"
            aria-expanded={areCommentsVisible}
          >
            {areCommentsVisible ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}

            <span>
              {/* "Покажи" or "Скрий" - always visible */}
              {`${areCommentsVisible ? "Скрий" : "Покажи"}`}

              {/* "коментар/и" - hidden on mobile (xs), visible from sm upwards */}
              <span className="hidden sm:inline">
                {` ${answer.comments.length === 1 ? "коментар" : "коментари"}`}
              </span>

              {/* "към решението" - hidden below md, visible from md upwards */}
              <span className="hidden md:inline"> към решението</span>

              {/* The count - always visible if > 1 */}
              {` ${
                answer.comments.length > 1 ? `(${answer.comments.length})` : ""
              }`}
            </span>
          </button>
        )}
      </div>

      {/* Add Comment Form (conditionally rendered) */}
      {showCommentBox && (
        <div className="mt-1">
          <AddComment
            key={answer._id}
            t={t}
            answerId={answer._id}
            caseNumber={caseNumber}
            me={me}
            inputId={`file-upload-comment-answer-${answer._id}`}
            mentions={mentions}
            onCommentSubmitted={handleCommentSubmitted}
            content={commentContent}
            setContent={setCommentContent}
            attachments={commentAttachments}
            setAttachments={setCommentAttachments}
          />
        </div>
      )}

      {/* Comments List (conditionally rendered) */}
      {answer.comments && answer.comments.length > 0 && areCommentsVisible && (
        // 1. Add a new parent div with `relative` positioning.
        <div className="relative">
          <div
            ref={commentsContainerRef}
            className="pl-4 max-h-96 overflow-y-auto custom-scrollbar-xs space-y-2"
          >
            {answer.comments.map((comment: IComment) => (
              <div
                key={comment._id}
                ref={(node) => {
                  if (node) {
                    commentRefs.current.set(comment._id, node);
                  } else {
                    commentRefs.current.delete(comment._id);
                  }
                }}
                className="ml-1 mt-1 mr-2"
              >
                <Comment
                  key={comment._id}
                  comment={comment}
                  me={me}
                  caseNumber={caseNumber}
                  mentions={mentions}
                  parentType="answer"
                  targetId={childTargetId}
                />
              </div>
            ))}
          </div>

          <div
            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-gray-200 to-transparent pointer-events-none transition-opacity duration-300 ${
              isCommentScrolled && areCommentsVisible && showCommentBox
                ? "opacity-100"
                : "opacity-0"
            }`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-3 mb-3 min-w-full px-5 transition-all duration-500 relative">
      <div
        className={`bg-white shadow-md rounded-lg p-4 transition-colors ${
          approved
            ? "border-l-4 border-l-btnGreenHover"
            : "border-l-4 border-transparent"
        }`}
        id={`answers-${answer._id}`}
        ref={answerRef}
      >
        {/* --- NEW UNIFIED HEADER --- */}
        <div className="flex justify-between items-start gap-4 mb-3">
          {/* Left side: Avatar, Creator Info, and potentially Buttons */}
          <div className="flex min-w-0 flex-grow items-center gap-3">
            <UserAvatar
              name={answer.creator.name}
              imageUrl={
                answer.creator.avatar
                  ? `${import.meta.env.VITE_API_URL}/static/avatars/${
                      answer.creator._id
                    }/${answer.creator.avatar}`
                  : null
              }
              size={56}
              enablePreview={true}
            />

            {showApproveBtn || showFinanceApproveBtn ? (
              // Layout WITH Buttons: Vertical stack for info, buttons next to it
              <>
                <div className="flex flex-col items-center flex-shrink-0">
                  <UserLink user={answer.creator} />
                  <p
                    className="w-28 sm:w-32 md:w-40 truncate text-center text-xs text-gray-400"
                    title={answer.creator.position}
                  >
                    {answer.creator.position}
                  </p>
                </div>
                <div className="flex items-center justify-center flex-wrap gap-2">
                  {showApproveBtn && (
                    <ApproveBtn
                      approved={approved}
                      refetch={refetch}
                      t={t}
                      answer={answer}
                      me={me}
                      caseNumber={caseNumber}
                    />
                  )}
                  {showFinanceApproveBtn && (
                    <FinanceApproveBtn
                      approved={financialApproved}
                      {...{ t, answer, me, caseNumber }}
                    />
                  )}
                </div>
              </>
            ) : (
              // Layout WITHOUT Buttons: Horizontal, flexible, and truncating
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex-shrink-0">
                  <UserLink user={answer.creator} />
                </div>
                <p
                  className="min-w-0 truncate text-xs text-gray-400"
                  title={answer.creator.position}
                >
                  {answer.creator.position}
                </p>
              </div>
            )}
          </div>

          {/* Right side: Actions (Edit/Delete/History) */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {answer.history && answer.history.length > 0 && (
              <AnswerHistoryModal history={answer.history} />
            )}
            <ShowDate collapsible={true} date={answer.date} />

            {canEditOrDelete && !answer.approved && (
              <ActionMenu>
                <EditAnswerButton
                  {...{ answer, caseNumber, me }}
                  currentAttachments={answer.attachments || []}
                  mentions={mentions}
                  showText={true}
                />
                <DeleteModal
                  title="deleteAnswer"
                  content="deleteAnswerInfo"
                  onDelete={() => deleteAnswer(answer._id.toString())}
                  showText={true}
                />
              </ActionMenu>
            )}
          </div>
        </div>

        {/* --- MAIN CONTENT & APPROVALS --- */}
        <div className="pl-2">
          {/* The main content of the answer */}
          {answerContentAndAttachments}
        </div>

        {/* --- COMMENTS SECTION --- */}
        {commentsSection}
      </div>
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

export default Answer;
