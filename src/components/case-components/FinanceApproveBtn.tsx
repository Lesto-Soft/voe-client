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

const FinanceApproveBtn: React.FC<{
  approved: boolean;
  t: (word: string) => string;
  answer: IAnswer;
  me: any;
  caseNumber: number;
}> = ({ approved, t, answer, me, caseNumber }) => {
  const [open, setOpen] = useState(false);
  const { approveFinanceAnswer, loading, error } = useApproveFinanceAnswer();
  const {
    unapproveFinanceAnswer,
    loading: unapproveLoading,
    error: unapproveError,
  } = useUnapproveFinanceAnswer();

  const handleConfirmAction = async () => {
    setOpen(false); // Close the dialog
    try {
      if (approved) {
        await unapproveFinanceAnswer(answer._id, caseNumber);
      } else {
        await approveFinanceAnswer(answer._id, me._id, caseNumber);
      }
    } catch (err) {
      console.error("Failed to update finance approval status:", err);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className={`w-32 hover:cursor-pointer flex items-center justify-center gap-2 px-2 py-1 rounded-lg text-xs font-medium shadow-md transition-all duration-200 ${
            !approved
              ? "bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
              : "bg-btnRed text-white hover:bg-btnRedHover focus:ring-2 focus:ring-red-300"
          }`}
          type="button"
          title={approved ? t("unapproveFinance") : t("finance")}
        >
          <CurrencyDollarIcon
            className={`h-5 w-5 ${approved ? "text-white" : "text-white"}`}
          />
          <span>{approved ? t("unapprove") : t("finance")}</span>
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
                "Сигурни ли сте, че искате да финансирате това решение?"}
          </div>
          <hr className="my-4 border-gray-200" />

          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 hover:cursor-pointer"
              onClick={() => setOpen(false)}
              type="button"
            >
              {t("cancel") || "Отказ"}
            </button>
            <button
              className={`px-3 py-1 rounded ${
                approved
                  ? "bg-btnRed hover:bg-btnRedHover text-white hover:cursor-pointer"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:cursor-pointer"
              }`}
              onClick={handleConfirmAction}
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
