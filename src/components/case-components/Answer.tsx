import { IAnswer, ICategory, IComment, IMe } from "../../db/interfaces";
import { useState, useEffect } from "react";
import Comment from "./Comment";
import ShowDate from "../global/ShowDate";
import { useTranslation } from "react-i18next";
import { admin_check } from "../../utils/rowStringCheckers";
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

const Answer: React.FC<{
  answer: IAnswer;
  me: IMe;
  refetch: () => void;
  caseNumber: number;
  status?: string;
  caseCategories: ICategory[];
}> = ({ answer, me, refetch, caseNumber, status, caseCategories }) => {
  const { t } = useTranslation("answer");
  const [approved, setApproved] = useState(!!answer.approved);
  const [financialApproved, setFinancialApproved] = useState(
    !!answer.financial_approved
  );
  const [showCommentBox, setShowCommentBox] = useState(false);
  const isCreator = me._id === answer.creator._id;

  // 1. Determine if the current user is a manager for any of the case's categories
  const managedCategoryIds = me?.managed_categories.map(
    (cat: ICategory) => cat._id
  );
  const caseCategoryIdsForThisCase = caseCategories.map((cat) => cat._id);
  const isCategoryManagerForCase = managedCategoryIds.some(
    (managedId: string) => caseCategoryIdsForThisCase.includes(managedId)
  );
  // 2. Updated condition for being able to interact with general approval
  const canInteractWithGeneralApproval = !isCreator && isCategoryManagerForCase;
  const { deleteAnswer, error, loading } = useDeleteAnswer(caseNumber);

  // 3. Conditions for when approval/unapproval actions are contextually allowed
  const canApproveNow =
    !approved && status !== "CLOSED" && status !== "AWAITING_FINANCE";
  const canUnapproveNow = approved; // If it's approved, the button allows unapproving

  // 4. Final visibility for the general ApproveBtn
  const showApproveBtn =
    canInteractWithGeneralApproval && (canApproveNow || canUnapproveNow);

  // 5. FinanceApproveBtn visibility logic (remains unchanged by this new requirement)
  const showFinanceApproveBtn =
    me?.financial_approver === true && // User has the specific financial approver permission
    answer.needs_finance === true && // Answer is flagged as needing finance
    approved === true;

  // Synchronize state with the updated answer prop
  useEffect(() => {
    setApproved(!!answer.approved);
    setFinancialApproved(!!answer.financial_approved);
  }, [answer]);

  return (
    <div className="my-8 px-4 min-w-full">
      <div
        className={`bg-white shadow rounded-lg p-6 ${
          approved
            ? "border border-l-8 border-l-btnGreenHover border-gray-300"
            : ""
        }`}
      >
        {/* Content + Creator Row */}
        <div className="flex flex-col sm:flex-row gap-6 mb-3">
          {/* Creator at left */}
          <Creator creator={answer.creator} />
          {/* Content and actions at right */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex items-center mb-2 justify-between">
              <div className="flex items-center">
                {" "}
                {/* Main container for this section */}
                {/* Only render the button group if at least one button is supposed to be visible */}
                {(showApproveBtn || showFinanceApproveBtn) && (
                  <div className="flex items-center flex-col xs:flex-row sm:flex-row md:flex-row lg:flex-row xl:flex-row 2xl:flex-row md:flex-nowrap md:gap-2 xs:gap-2 gap-2">
                    {/* General Approve/Unapprove Button */}
                    {showApproveBtn && (
                      <div className="flex items-center gap-2">
                        <ApproveBtn
                          approved={approved} // Current general approval status of the answer
                          setApproved={setApproved} // Function to toggle general approval
                          t={t}
                          answer={answer}
                          me={me}
                          refetch={refetch}
                        />
                      </div>
                    )}

                    {/* Divider: Show only if both ApproveBtn and FinanceApproveBtn are visible */}
                    {showApproveBtn && showFinanceApproveBtn && (
                      <hr className="h-8 border-l border-gray-300 mx-2 hidden md:block" />
                    )}

                    {/* Finance Approve/Unapprove Button */}
                    {showFinanceApproveBtn && (
                      <div className="flex items-center gap-2">
                        <FinanceApproveBtn
                          approved={financialApproved} // Current financial approval status of the answer
                          setApproved={setFinancialApproved} // Function to toggle financial approval
                          t={t}
                          answer={answer}
                          me={me}
                          refetch={refetch}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {answer.history && answer.history.length > 0 && (
                  <AnswerHistoryModal history={answer.history} />
                )}
                {me &&
                  me.role &&
                  (me._id === answer.creator._id ||
                    admin_check(me.role.name)) && (
                    <>
                      <EditAnswerButton
                        answer={answer}
                        caseNumber={caseNumber}
                        me={me}
                        currentAttachments={answer.attachments || []}
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
            <div className="mt-1 flex-1 flex">
              <div className="text-gray-700 mb-3">
                {renderContentSafely(answer.content)}
              </div>
            </div>
            {answer.attachments && answer.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {answer.attachments.map((file) => (
                  <ImagePreviewModal
                    key={file}
                    imageUrl={createFileUrl("answers", answer._id, file)}
                    fileName={file}
                  />
                ))}
              </div>
            )}
            <div className="flex justify-between items-center gap-2 borderpx-2 py-0.5 italic text-gray-500 text-xs mt-1">
              <div className="flex items-center gap-1">
                {answer.approved && (
                  <>
                    <p className="whitespace-nowrap"> {t("approvedBy")} </p>
                    <UserLink user={answer.approved} />
                    {/* <ShowDate date={answer.approved_date} /> */}
                  </>
                )}

                {/* <p className="whitespace-nowrap">{answer.approved?.name}</p> */}
                {answer.approved_date && (
                  <ShowDate date={answer.approved_date} />
                )}
              </div>
              <div className="flex items-center gap-1">
                {answer.financial_approved && (
                  <>
                    <p className="whitespace-nowrap">{t("financedBy")}</p>
                    <UserLink user={answer.financial_approved} />
                    {answer.financial_approved_date && (
                      <ShowDate date={answer.financial_approved_date} />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Comment Button & Section */}
        <div className=" mt-5">
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
              t={t}
              answerId={answer._id}
              caseNumber={caseNumber}
              me={me}
            />
          )}
        </div>
        {/* Comments under the answer */}
        {answer.comments && answer.comments.length > 0 && (
          <div>
            <hr className=" border-gray-200" />
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
      </div>
    </div>
  );
};

export default Answer;
