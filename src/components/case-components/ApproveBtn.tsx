import React, { useState } from "react";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";
import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";
import {
  useApproveAnswer,
  useUnapproveAnswer,
} from "../../graphql/hooks/answer";
import { IAnswer } from "../../db/interfaces";
import LoadingModal from "../modals/LoadingModal";
import ErrorModal from "../modals/ErrorModal";
const ApproveBtn: React.FC<{
  approved: boolean;
  t: (word: string) => string;
  answer: IAnswer;
  me: any;
  refetch: () => void;
  caseNumber: number;
}> = ({ approved, t, answer, me, caseNumber }) => {
  const [open, setOpen] = useState(false);
  const [needsFinance, setNeedsFinance] = useState(!!answer.needs_finance);

  const { approveAnswer, loading, error } = useApproveAnswer();
  const {
    unapproveAnswer,
    loading: unapproveLoading,
    error: unapproveError,
  } = useUnapproveAnswer();
  const handleConfirmAction = async () => {
    setOpen(false);
    try {
      if (approved) {
        await unapproveAnswer(answer._id, caseNumber);
      } else {
        await approveAnswer(answer._id, me._id, needsFinance, caseNumber);
      }
    } catch (err) {
      console.error("Failed to update approval status:", err);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className={`hover:cursor-pointer flex items-center justify-center gap-2 px-2 py-1 rounded-lg text-xs font-medium shadow-md transition-all duration-200 w-10 sm:w-32 ${
            // Responsive width
            !approved
              ? "bg-btnGreen text-white hover:bg-btnGreenHover focus:ring-2 focus:ring-green-300"
              : "bg-btnRed text-white hover:bg-btnRedHover focus:ring-2 focus:ring-red-300"
          }`}
          type="button"
          title={approved ? t("unapprove") : t("approve")}
        >
          {!approved ? (
            <HandThumbUpIcon className="h-5 w-5 text-white" />
          ) : (
            <HandThumbDownIcon className="h-5 w-5 text-white" />
          )}
          <span className="hidden sm:inline">
            {approved ? t("unapprove") : t("approve")}
          </span>
        </button>
      </Dialog.Trigger>
      {loading || unapproveLoading ? <LoadingModal /> : null}
      {error || unapproveError ? (
        <ErrorModal message="Възникна грешка! Моля отпитайте отново!" />
      ) : null}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-sm focus:outline-none">
          <Dialog.Title className="text-lg font-bold mb-4">
            {approved ? t("unapprove") : t("approve")}
          </Dialog.Title>
          <div className="mb-4">
            {approved
              ? t("areYouSureUnapprove") ||
                "Сигурни ли сте, че искате да отмените одобрението?"
              : t("areYouSureApprove") ||
                "Сигурни ли сте, че искате да одобрите това решение?"}
          </div>
          {/* NeedsFinance Toggle with Radix Switch */}
          {!approved && (
            <div className="mb-4 flex items-center gap-3">
              <span className="font-medium text-gray-700">
                {t("isFinanceNeeded")}
              </span>
              <Switch.Root
                checked={needsFinance}
                onCheckedChange={setNeedsFinance}
                className={`${
                  needsFinance ? "bg-btnGreen" : "bg-gray-300"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none cursor-pointer`}
                id="needs-finance-switch"
              >
                <Switch.Thumb
                  className={`${
                    needsFinance ? "translate-x-6" : "translate-x-1"
                  } block h-4 w-4 rounded-full bg-white transition-transform`}
                />
              </Switch.Root>
              <span className="ml-2 text-xs text-gray-500">
                {needsFinance ? t("yes") : t("no")}
              </span>
            </div>
          )}
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
                  : "bg-btnGreen hover:bg-btnGreenHover text-white hover:cursor-pointer"
              }`}
              onClick={handleConfirmAction}
              type="button"
            >
              {approved ? t("unapprove") : t("approve")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ApproveBtn;
