import { IAnswer, IComment } from "../../../db/interfaces";
import { useState, useEffect } from "react";
import Comment from "../Comment";
import ShowDate from "../../global/ShowDate";
import { useTranslation } from "react-i18next";
import EditButton from "../../global/EditCommentButton";
import { admin_check } from "../../../utils/rowStringCheckers";
import Creator from "../Creator";
import UserLink from "../../global/UserLink";
import ApproveBtn from "../ApproveBtn";
import AnswerHistoryModal from "../../modals/AnswerHistoryModal";
import FinanceApproveBtn from "../FinanceApproveBtn";
import CommentMobile from "./CommentMobile";

const AnswerMobile: React.FC<{
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

  useEffect(() => {
    setApproved(!!answer.approved);
    setFinancialApproved(!!answer.financial_approved);
  }, [answer]);

  const { t } = useTranslation("answer");

  return (
    <div className="flex flex-col gap-4 w-full bg-white rounded-lg shadow-md p-4 mt-5">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Creator creator={answer.creator} />
        <div className="flex flex-wrap items-center gap-4">
          <ApproveBtn
            approved={approved}
            setApproved={setApproved}
            t={t}
            answer={answer}
            me={me}
            refetch={refetch}
          />
          {answer.needs_finance && (
            <FinanceApproveBtn
              approved={financialApproved}
              setApproved={setFinancialApproved}
              t={t}
              answer={answer}
              me={me}
              refetch={refetch}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <ShowDate date={answer.date} />
          {answer.history && answer.history.length > 0 && (
            <AnswerHistoryModal history={answer.history} />
          )}
          {/* {me &&
            me.role &&
            (me._id === answer.creator._id || admin_check(me.role.name)) && (
              <EditButton />
            )} */}
        </div>
      </div>

      {/* Content Section */}
      <div
        className={`${
          approved
            ? answer.needs_finance
              ? answer.financial_approved
                ? "bg-green-50"
                : "bg-blue-50"
              : "bg-green-50"
            : "bg-gray-50"
        } rounded p-3 text-gray-900 whitespace-pre-line break-all overflow-y-auto`}
      >
        {answer.content}
      </div>

      {/* Approval Info */}
      <div className="flex flex-wrap justify-between items-center gap-2 text-gray-500 text-xs italic">
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

      {/* Comments Section */}
      {answer.comments && answer.comments.length > 0 && (
        <div className="mt-3">
          <hr className="my-2 border-gray-200" />
          <div className="flex flex-col gap-2">
            {answer.comments.map((comment: IComment) => (
              <CommentMobile
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
  );
};

export default AnswerMobile;
