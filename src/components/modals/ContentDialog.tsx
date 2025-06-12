import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import { renderContentSafely } from "../../utils/contentRenderer";

interface FullScreenContentDialogProps {
  content: string;
}

const FullScreenContentDialog: React.FC<FullScreenContentDialogProps> = ({
  content,
}) => {
  const { t } = useTranslation("modals");

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
          type="button"
          aria-label={t("showFullScreen") || "Show full screen"}
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ outline: "none" }}
        >
          <Dialog.Title className="sr-only" />
          <div className="bg-white rounded shadow-lg max-w-2xl w-full max-h-[90vh] p-0 overflow-y-auto relative flex flex-col">
            {/* Reserved top bar for X */}
            <div className="flex items-center justify-end h-12 px-4 border-b border-gray-100">
              <Dialog.Close asChild>
                <button
                  className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  aria-label="Close"
                  type="button"
                >
                  <XMarkIcon className="h-6 w-6 hover:cursor-pointer" />
                </button>
              </Dialog.Close>
            </div>
            <div className="prose prose-lg max-w-none p-6 bg-white rounded-lg shadow-xl max-h-[80vh] overflow-y-auto">
              {renderContentSafely(content)}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FullScreenContentDialog;
