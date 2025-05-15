import { IAnswer, IComment } from "../../db/interfaces";
import moment from "moment";
import { useState } from "react";
import Comment from "./Comment";
import ShowDate from "../global/ShowDate";
import { useTranslation } from "react-i18next";
import EditButton from "../global/EditButton";
import { admin_check } from "../../utils/rowStringCheckers";
import Creator from "./Creator";
import UserLink from "../global/UserLink";
import ApproveBtn from "./ApproveBtn";
import AnswerHistoryModal from "../modals/AnswerHistoryModal";
import FinanceApproveBtn from "./FinanceApproveBtn";

const Answer: React.FC<{ answer: IAnswer; me?: any }> = ({ answer, me }) => {
  const [approved, setApproved] = useState(!!answer.approved);
  const [financialApproved, setFinancialApproved] = useState(
    !!answer.financial_approved
  );

  const { t } = useTranslation("answer");
  return (
    <div className="mx-auto my-8 px-4">
      <div className="bg-white shadow rounded-lg p-6">
        {/* Content + Creator Row */}
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
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
                      />
                      <div className="flex items-center gap-2  border border-gray-200 rounded px-2 py-0.5">
                        <p className="whitespace-nowrap"> {t("approvedBy")} </p>
                        {answer.approved ? (
                          <UserLink user={answer.approved} type="case" />
                        ) : (
                          ""
                        )}
                        <p className="text-gray-500 text-xs ml-1 whitespace-nowrap text-center">
                          {<ShowDate date={answer.approved_date} />}
                        </p>
                      </div>
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
                        />
                        {answer.financial_approved && (
                          <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-0.5">
                            <p className="whitespace-nowrap">
                              {t("financedBy")}
                            </p>
                            <UserLink
                              user={answer.financial_approved}
                              type="case"
                            />
                            <p className="text-gray-500 text-xs ml-1 whitespace-nowrap text-center">
                              {answer.financial_approved_date && (
                                <ShowDate
                                  date={answer.financial_approved_date}
                                />
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <ApproveBtn
                    approved={approved}
                    setApproved={setApproved}
                    t={t}
                    answer={answer}
                    me={me}
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <ShowDate date={answer.date} />
                {answer.history && answer.history.length > 0 && (
                  <AnswerHistoryModal history={answer.history} />
                )}
                {me &&
                  (me._id === answer.creator._id ||
                    admin_check(me.role.name)) && <EditButton />}
              </div>
            </div>
            <div className="mt-1 flex-1 flex">
              <div
                className={`${
                  approved
                    ? answer.needs_finance
                      ? answer.financial_approved
                        ? "bg-green-50"
                        : "bg-blue-50"
                      : "bg-green-50"
                    : "bg-gray-50"
                } rounded p-3  text-gray-900 whitespace-pre-line w-full flex overflow-y-auto break-all`}
              >
                {answer.content}
              </div>
            </div>
          </div>
        </div>
        {/* Comments under the answer */}
        {answer.comments && answer.comments.length > 0 && (
          <div className="mt-3">
            <hr className="my-2 border-gray-200" />
            <div className="flex flex-col gap-2">
              {answer.comments.map((comment: IComment) => (
                <Comment key={comment._id} comment={comment} me={me} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Answer;
