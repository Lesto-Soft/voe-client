import { IAnswer, ICategory, IComment, IMe } from "../../db/interfaces";
import { useState, useEffect, useRef } from "react";
import Comment from "./Comment";
import ShowDate from "../global/ShowDate";
import { useTranslation } from "react-i18next";
import Creator from "./Creator";
import UserLink from "../global/UserLink";
import ApproveBtn from "./ApproveBtn";
import AnswerHistoryModal from "../modals/AnswerHistoryModal";
import FinanceApproveBtn from "./FinanceApproveBtn";
import { createFileUrl } from "../../utils/fileUtils";
import ImagePreviewModal from "../modals/ImagePreviewModal";
import AddComment from "./AddComment";
import EditAnswerButton from "../global/EditAnswerButton";
import { useDeleteAnswer } from "../../graphql/hooks/answer";
import DeleteModal from "../modals/DeleteModal";
import { renderContentSafely } from "../../utils/contentRenderer";
import { ROLES } from "../../utils/GLOBAL_PARAMETERS";

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
}) => {
  const { t } = useTranslation("answer");
  const approved = !!answer.approved;
  const financialApproved = !!answer.financial_approved;

  const [showCommentBox, setShowCommentBox] = useState(false);
  const isCreator = me._id === answer.creator._id;
  const isAdmin = me.role?._id === ROLES.ADMIN;
  const answerRef = useRef<HTMLDivElement>(null);
  const commentRefs = useRef(new Map<string, HTMLDivElement>());

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
      const timer = setTimeout(() => {
        const commentId = childTargetId.split("-")[1];
        const childWrapperRef = commentRefs.current.get(commentId);

        if (childWrapperRef) {
          console.log(
            `ANSWER (${answer._id}): Found ref for child, now highlighting!`
          );

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

  const answerContentAndAttachments = (
    <>
      <div
        className={`text-gray-800 whitespace-pre-line break-all overflow-y-auto rounded p-3 mt-4 max-h-52 ${
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
              imageUrl={createFileUrl("answers", answer._id, file)}
              fileName={file}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-2 text-gray-500 text-xs italic mt-2">
        {answer.approved && (
          <div className="flex items-center gap-1">
            <p>{t("approvedBy")}</p>
            <UserLink user={answer.approved} />
            {answer.approved_date && <ShowDate date={answer.approved_date} />}
          </div>
        )}
        {answer.financial_approved && (
          <div className="flex items-center gap-1">
            <p>{t("financedBy")}</p>
            <UserLink user={answer.financial_approved} />
            {answer.financial_approved_date && (
              <ShowDate date={answer.financial_approved_date} />
            )}
          </div>
        )}
      </div>
    </>
  );

  const commentsSection = (
    <>
      <div className="mt-5">
        <div className="flex justify-center items-center mb-2">
          <button
            className="w-32 px-3 py-1 rounded bg-btnGreen hover:bg-btnGreenHover border border-btngreenHover text-white font-semibold transition-colors duration-200 hover:cursor-pointer"
            onClick={() => setShowCommentBox((v) => !v)}
          >
            {showCommentBox ? t("cancel") : t("addComment")}
          </button>
        </div>
        {showCommentBox && (
          <AddComment
            key={answer._id}
            t={t}
            answerId={answer._id}
            caseNumber={caseNumber}
            me={me}
            inputId={`file-upload-comment-answer-${answer._id}`}
            mentions={mentions}
          />
        )}
      </div>
      {answer.comments && answer.comments.length > 0 && (
        <div className="mt-3">
          <hr className="my-2 border-gray-200" />
          <div className="flex flex-col gap-2">
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
        </div>
      )}
    </>
  );

  return (
    <div className="my-8 min-w-full px-5 transition-all duration-500">
      <div
        className={`bg-white shadow-md rounded-lg p-4 lg:p-6 ${
          approved
            ? "border border-l-8 border-l-btnGreenHover border-gray-300"
            : ""
        }`}
      >
        {/* --- UNIFIED RESPONSIVE LAYOUT --- */}
        <div
          className="flex flex-row gap-4"
          id={`answers-${answer._id}`} // Moved ID and Ref here for consistent targeting
          ref={answerRef}
        >
          {/* Creator's avatar/info on the left */}
          <Creator creator={answer.creator} />

          {/* All content to the right of the creator */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header: Contains all action buttons and the date */}
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-2">
              {/* Approval buttons will appear on the left */}
              {(showApproveBtn || showFinanceApproveBtn) && (
                <div className="flex items-center flex-wrap gap-2">
                  {showApproveBtn && (
                    <ApproveBtn
                      approved={approved}
                      refetch={refetch} // ✅ PASS refetch instead
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
              )}

              {/* Edit/Delete/History/Date buttons. This group is pushed to the right on large screens. */}
              <div className="flex items-center gap-2 lg:ml-auto">
                {canEditOrDelete && (
                  <>
                    {answer.history && answer.history.length > 0 && (
                      <AnswerHistoryModal history={answer.history} />
                    )}
                    <EditAnswerButton
                      {...{ answer, caseNumber, me }}
                      currentAttachments={answer.attachments || []}
                      mentions={mentions}
                    />
                    <DeleteModal
                      title="deleteAnswer"
                      content="deleteAnswerInfo"
                      onDelete={() => deleteAnswer(answer._id.toString())}
                    />
                  </>
                )}
                <ShowDate date={answer.date} />
              </div>
            </div>

            {/* The main content of the answer */}
            <div>{answerContentAndAttachments}</div>
          </div>
        </div>

        {commentsSection}
      </div>
    </div>
  );
};

export default Answer;
