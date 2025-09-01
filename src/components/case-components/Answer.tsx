import { IAnswer, ICategory, IComment, IMe } from "../../db/interfaces";
import { useState, useEffect } from "react";
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
}> = ({
  answer,
  me,
  refetch,
  caseNumber,
  status,
  caseCategories,
  mentions,
}) => {
  const { t } = useTranslation("answer");
  const [approved, setApproved] = useState(!!answer.approved);
  const [financialApproved, setFinancialApproved] = useState(
    !!answer.financial_approved
  );
  const [showCommentBox, setShowCommentBox] = useState(false);
  const isCreator = me._id === answer.creator._id;
  const isAdmin = me.role?._id === ROLES.ADMIN;

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
    setApproved(!!answer.approved);
    setFinancialApproved(!!answer.financial_approved);
  }, [answer]);

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
          />
        )}
      </div>
      {answer.comments && answer.comments.length > 0 && (
        <div className="mt-3">
          <hr className="my-2 border-gray-200" />
          <div className="flex flex-col gap-2">
            {answer.comments.map((comment: IComment) => (
              <Comment
                key={comment._id}
                comment={comment}
                me={me}
                caseNumber={caseNumber}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="my-8 min-w-full px-5">
      <div
        className={`bg-white shadow-md rounded-lg p-4 lg:p-6 ${
          approved
            ? "border border-l-8 border-l-btnGreenHover border-gray-300"
            : ""
        }`}
      >
        {/* --- MOBILE VIEW (GRID) --- */}
        <div className="lg:hidden">
          <div className="grid grid-cols-[1fr_auto] gap-x-4">
            <div className="col-start-1">
              <Creator creator={answer.creator} />
            </div>
            <div className="col-start-2 flex flex-col items-end gap-y-2">
              {(showApproveBtn || showFinanceApproveBtn) && (
                <div className="flex items-center flex-wrap gap-2 justify-end">
                  {showApproveBtn && (
                    <ApproveBtn
                      {...{ approved, setApproved, t, answer, me, refetch }}
                    />
                  )}
                  {showFinanceApproveBtn && (
                    <FinanceApproveBtn
                      approved={financialApproved}
                      setApproved={setFinancialApproved}
                      {...{ t, answer, me, refetch }}
                    />
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                {canEditOrDelete && (
                  <>
                    {answer.history && answer.history.length > 0 && (
                      <AnswerHistoryModal history={answer.history} />
                    )}
                    <>
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
                  </>
                )}
              </div>
              <ShowDate date={answer.date} centered={true} />
            </div>
            <div className="col-span-2">{answerContentAndAttachments}</div>
          </div>
        </div>

        {/* --- DESKTOP VIEW (FLEX) --- */}
        <div className="hidden lg:block">
          <div className="flex flex-row gap-2">
            <Creator creator={answer.creator} />
            <div className="flex-1 flex flex-col">
              <div className="flex flex-wrap gap-y-2 justify-between items-center mb-2">
                {showApproveBtn || showFinanceApproveBtn ? (
                  <div className="flex items-center flex-wrap gap-2 justify-end">
                    {showApproveBtn && (
                      <ApproveBtn
                        {...{ approved, setApproved, t, answer, me, refetch }}
                      />
                    )}
                    {showFinanceApproveBtn && (
                      <FinanceApproveBtn
                        approved={financialApproved}
                        setApproved={setFinancialApproved}
                        {...{ t, answer, me, refetch }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="h-10" /> // This empty div acts as a placeholder to maintain spacing
                )}
                <div className="flex items-center gap-2 ml-4">
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
              <div>{answerContentAndAttachments}</div>
            </div>
          </div>
        </div>
        {commentsSection}
      </div>
    </div>
  );
};

export default Answer;
