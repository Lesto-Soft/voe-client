import { IAnswer, IComment } from "../../db/interfaces";
import { useState, useEffect } from "react";
import Comment from "./Comment";
import ShowDate from "../global/ShowDate";
import { useTranslation } from "react-i18next";
import EditButton from "../global/EditCommentButton";
import { admin_check } from "../../utils/rowStringCheckers";
import Creator from "./Creator";
import UserLink from "../global/UserLink";
import ApproveBtn from "./ApproveBtn";
import AnswerHistoryModal from "../modals/AnswerHistoryModal";
import FinanceApproveBtn from "./FinanceApproveBtn";
import { createFileUrl } from "../../utils/fileUtils";
import ImagePreviewModal from "../modals/ImagePreviewModal";
import AddComment from "./AddComment";
import EditAnswerBtn from "../global/EditAnswerButton";

const Answer: React.FC<{
  answer: IAnswer;
  me?: any;
  refetch: () => void;
  caseNumber: number;
  status?: string;
}> = ({ answer, me, refetch, caseNumber, status }) => {
  const [approved, setApproved] = useState(!!answer.approved);
  const [financialApproved, setFinancialApproved] = useState(
    !!answer.financial_approved
  );
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Synchronize state with the updated answer prop
  useEffect(() => {
    setApproved(!!answer.approved);
    setFinancialApproved(!!answer.financial_approved);
  }, [answer]);

  const { t } = useTranslation("answer");

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
                {/* Approve/Unapprove Button */}

                {approved ? (
                  <div className="flex items-center  flex-col xs:flex-row sm:flex-row md:flex-row lg:flex-row xl:flex-row 2xl:flex-row md:flex-nowrap md:gap-2 xs:gap-2 gap-2">
                    <div className="flex items-center gap-2">
                      <ApproveBtn
                        approved={approved}
                        setApproved={setApproved}
                        t={t}
                        answer={answer}
                        me={me}
                        refetch={refetch}
                      />
                    </div>
                    {answer.needs_finance && (
                      <div className="flex items-center gap-2">
                        {/* Divider for md+ screens only */}
                        <hr className="h-8 border-l border-gray-300 mx-2 hidden md:block" />
                        <FinanceApproveBtn
                          approved={financialApproved}
                          setApproved={setFinancialApproved}
                          t={t}
                          answer={answer}
                          me={me}
                          refetch={refetch}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  status !== "CLOSED" &&
                  status !== "AWAITING_FINANCE" && (
                    <ApproveBtn
                      approved={approved}
                      setApproved={setApproved}
                      t={t}
                      answer={answer}
                      me={me}
                      refetch={refetch}
                    />
                  )
                )}
              </div>

              <div className="flex items-center gap-2">
                <ShowDate date={answer.date} />
                {answer.history && answer.history.length > 0 && (
                  <AnswerHistoryModal history={answer.history} />
                )}
                {/* {me &&
                  me.role &&
                  (me._id === answer.creator._id ||
                    admin_check(me.role.name)) && <EditButton 
                      currentAttachments={answer.attachments || []}
                      caseNumber={answer.case_number}
                      comment={answer}
                    />} */}
                {me &&
                  me.role &&
                  (me._id === answer.creator._id ||
                    admin_check(me.role.name)) && (
                    <EditAnswerBtn
                      answer={answer}
                      caseNumber={caseNumber}
                      me={me}
                      currentAttachments={answer.attachments || []}
                    />
                  )}
              </div>
            </div>
            <div className="mt-1 flex-1 flex">
              <div className="bg-gray-50 rounded p-3  text-gray-900 whitespace-pre-line w-full flex overflow-y-auto break-all">
                {answer.content}
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
                    <UserLink user={answer.approved} type="case" />
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
                    <UserLink user={answer.financial_approved} type="case" />
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
