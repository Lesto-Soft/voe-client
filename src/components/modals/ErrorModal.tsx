import React from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface ErrorModalProps {
  message?: string;
}

const ErrorModal = ({
  message = "An error occurred.",
}: ErrorModalProps): React.ReactElement | null => {
  // Always open, reload page on close
  return (
    <Dialog.Root open={true} onOpenChange={() => window.location.reload()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-center justify-center bg-stone-500/75" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 min-w-[300px] flex flex-col items-center">
          <div className="mb-4 flex items-center justify-center">
            <svg
              className="h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01"
              />
            </svg>
          </div>
          <p
            id="error-message"
            className="text-lg text-red-600 mb-4 text-center"
          >
            {message}
          </p>
          <Dialog.Close asChild>
            <button
              className="mt-2 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              type="button"
            >
              Close
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ErrorModal;
