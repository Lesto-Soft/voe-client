import { IAnswer, IComment } from "../../db/interfaces";
import moment from "moment";
import {
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import Comment from "./Comment";
import UserLink from "../global/UserLink";
import ShowDate from "../global/ShowDate";
import { useTranslation } from "react-i18next";
import EditButton from "../global/EditButton";
import { admin_check } from "../../utils/rowStringCheckers";

// Dummy AnswerHistoryModal for now (replace with your real modal if needed)
const AnswerHistoryModal: React.FC<{
  history?: any[];
}> = ({ history }) => {
  const { t } = useTranslation("history");
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="flex items-center px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs font-medium border border-gray-300 transition ml-2"
          type="button"
          title="История"
        >
          <ClockIcon className="h-4 w-4" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-lg focus:outline-none">
          <Dialog.Title className="text-lg font-bold mb-4">
            История
          </Dialog.Title>
          <ul className="space-y-2 text-sm max-h-96 overflow-y-auto">
            {history && history.length > 0 ? (
              history.map((h: any) => (
                <li key={h._id} className="text-gray-700 border-b pb-2">
                  <div>
                    <span className="font-semibold">
                      {moment(h.date_change).format("LLL")}
                    </span>
                    {" – "}
                    <span className="font-medium">{h.user?.name}</span>
                  </div>
                  <div className="ml-2">
                    {h.old_content !== h.new_content && (
                      <div>
                        <div>
                          <span className="text-gray-500">
                            {t("old_content")}:{" "}
                          </span>
                          <span className="line-through text-btnRedHover font-bold">
                            {h.old_content}
                          </span>
                        </div>
                        <div>
                          {" "}
                          <span className="text-gray-500 ">
                            {t("new_content")}:{" "}
                          </span>
                          <span className="text-btnGreenHover font-bold">
                            {h.new_content}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic">Няма история</li>
            )}
          </ul>
          <Dialog.Close asChild>
            <button
              className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              type="button"
            >
              Затвори
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const Answer: React.FC<{ answer: IAnswer; me?: any }> = ({ answer, me }) => {
  const [approved, setApproved] = useState(!!answer.approved);
  const { t } = useTranslation("answer");
  return (
    <div className="mb-6 mt-5 bg-white px-6 py-4 shadow rounded-lg flex flex-col gap-4">
      <div className="flex flex-row gap-6">
        {/* Creator at left */}
        <div className="flex flex-col items-center min-w-[100px]">
          {answer.creator.avatar ? (
            <img
              src={answer.creator.avatar}
              alt={answer.creator.name}
              className="h-14 w-14 rounded-full object-cover border-2 border-gray-300 mb-2"
            />
          ) : (
            <UserCircleIcon className="h-14 w-14 text-purple-400 mb-2" />
          )}
          <UserLink {...answer.creator} />
          <span className="text-xs text-gray-400 italic mb-1">
            {answer.creator.position}
          </span>
        </div>
        {/* Content and actions at right */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex items-center mb-2 justify-between">
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 mr-2">
                {t("answer")}
              </span>
              {/* Approve/Unapprove Button */}
              <button
                className={`w-26 ml-2 flex items-center px-2 py-1 rounded text-xs font-medium border transition hover:cursor-pointer ${
                  approved
                    ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                    : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                }`}
                onClick={() => setApproved((v) => !v)}
                type="button"
                title={approved ? "Отмени одобрението" : "Одобри"}
              >
                {approved ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    {t("approved")}
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {t("unapproved")}
                  </>
                )}
              </button>
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
                approved ? "bg-green-50" : "bg-gray-50"
              } rounded p-3 text-gray-900 whitespace-pre-line w-full flex max-h-48 overflow-y-auto`}
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
  );
};

export default Answer;
