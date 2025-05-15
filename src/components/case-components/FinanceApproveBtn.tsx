import React, { useState } from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/solid";
import * as Dialog from "@radix-ui/react-dialog";
import {
  useApproveFinanceAnswer,
  useUnapproveFinanceAnswer,
} from "../../graphql/hooks/answer";
import LoadingModal from "../modals/LoadingModal";
import ErrorModal from "../modals/ErrorModal";
import { IAnswer } from "../../db/interfaces";
import Answer from "./Answer";

const FinanceApproveBtn: React.FC<{
  approved: boolean;
  setApproved: React.Dispatch<React.SetStateAction<boolean>>;
  t: (word: string) => string;
  answer: IAnswer;
  me: any;
}> = ({ approved, setApproved, t, answer, me }) => {
  const [open, setOpen] = useState(false);
  const { approveFinanceAnswer, loading, error } = useApproveFinanceAnswer();
  const {
    unapproveFinanceAnswer,
    loading: unapproveLoading,
    error: unapproveError,
  } = useUnapproveFinanceAnswer();

  const handleApprove = async () => {
    try {
      if (approved) {
        await unapproveFinanceAnswer(answer._id); // Replace with actual answer ID
      } else {
        await approveFinanceAnswer(answer._id, me._id); // Replace with actual answer ID and user ID
      }
      setApproved((prev) => !prev);
    } catch (error) {
      console.error("Error approving finance:", error);
    } finally {
      window.location.reload();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className={`w-32 flex items-center px-2 py-1 rounded text-md text-center font-medium border transition hover:cursor-pointer ${
            !approved
              ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
              : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
          }`}
          type="button"
          title={approved ? t("unapproveFinance") : t("finance")}
        >
          <CurrencyDollarIcon
            className={`h-5 w-5 m-auto ${
              approved ? "text-btnRedHover" : "text-blue-500"
            }`}
          />
          <span className="text-gray-500 text-sm whitespace-nowrap m-auto">
            {approved ? t("unapprove") : t("finance")}
          </span>
        </button>
      </Dialog.Trigger>
      {loading || unapproveLoading ? <LoadingModal /> : null}
      {error || unapproveError ? (
        <ErrorModal message="Възникна грешка!" />
      ) : null}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-sm focus:outline-none">
          <Dialog.Title className="text-lg font-bold mb-4">
            {approved ? t("unapproveFinance") : t("finance")}
          </Dialog.Title>
          <div className="mb-4">
            {approved
              ? t("areYouSureUnapproveFinance") ||
                "Сигурни ли сте, че искате да отмените финансовото одобрение?"
              : t("areYouSureApproveFinance") ||
                "Сигурни ли сте, че искате да финансирате този отговор?"}
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              onClick={() => setOpen(false)}
              type="button"
            >
              {t("cancel") || "Отказ"}
            </button>
            <button
              className={`px-3 py-1 rounded ${
                approved
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              onClick={() => {
                setApproved((v) => !v);
                setOpen(false);
                handleApprove();
              }}
              type="button"
            >
              {approved ? t("unapprove") : t("finance")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FinanceApproveBtn;
