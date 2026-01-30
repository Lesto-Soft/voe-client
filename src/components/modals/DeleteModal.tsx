import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

type DeleteModalProps = {
  title: string;
  content: string;
  onDelete: () => void;
  showText?: boolean;
};

const DeleteModal: React.FC<DeleteModalProps> = ({
  title,
  content,
  onDelete,
  showText = false,
}) => {
  const { t } = useTranslation("modals");
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className={`cursor-pointer
            ${
              showText
                ? "flex items-center gap-2 w-full p-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
                : "p-1.5 rounded-md text-red-700 hover:bg-red-100 transition-colors"
            }`}
          title={t(title, "Изтриване")}
        >
          <TrashIcon className="h-4 w-4" />
          {showText && <span>Изтрий</span>}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[1000]" />
        <Dialog.Content className="bg-white rounded-lg p-6 min-w-[320px] max-w-[400px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] shadow-xl">
          <Dialog.Title className="font-semibold text-lg mb-3">
            {t(title, "Изтриване")}
          </Dialog.Title>
          <Dialog.Description className="mb-6">
            {t(content, "Сигурни ли сте, че искате да изтриете решението?")}
          </Dialog.Description>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="hover:cursor-pointer px-4 py-2 rounded bg-gray-200 text-gray-900 hover:bg-gray-300 transition">
                {t("cancel")}
              </button>
            </Dialog.Close>
            <button
              className="hover:cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded bg-btnRed text-white hover:bg-btnRedHover transition"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
            >
              <TrashIcon width={18} height={18} className="mr-1" />
              {t("delete")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DeleteModal;
