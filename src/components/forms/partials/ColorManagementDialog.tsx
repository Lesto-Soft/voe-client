// src/components/forms/partials/ColorManagementDialog.tsx
import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { IPaletteColor } from "../../../db/interfaces";
import {
  useAddPaletteColor,
  useUpdatePaletteColor,
  useRemovePaletteColor,
} from "../../../graphql/hooks/colorPalette";
import ConfirmActionDialog from "../../modals/ConfirmActionDialog";

interface ColorManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paletteColors: IPaletteColor[];
  isLoading: boolean;
}

const ColorManagementDialog: React.FC<ColorManagementDialogProps> = ({
  isOpen,
  onClose,
  paletteColors,
  isLoading,
}) => {
  const [hexCode, setHexCode] = useState("#");
  const [label, setLabel] = useState("");
  const [editingColor, setEditingColor] = useState<IPaletteColor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [colorToDelete, setColorToDelete] = useState<IPaletteColor | null>(
    null
  );

  const { addColor, loading: addLoading } = useAddPaletteColor();
  const { updateColor, loading: updateLoading } = useUpdatePaletteColor();
  const { removeColor, loading: removeLoading } = useRemovePaletteColor();

  const isMutating = addLoading || updateLoading || removeLoading;

  useEffect(() => {
    if (editingColor) {
      setHexCode(editingColor.hexCode);
      setLabel(editingColor.label || "");
    } else {
      resetForm();
    }
  }, [editingColor]);

  const resetForm = () => {
    setEditingColor(null);
    setHexCode("#");
    setLabel("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalHex = hexCode.toUpperCase();
    if (!/^#([0-9A-F]{6})$/i.test(finalHex)) {
      setError("Моля въведете валиден 6-цифрен HEX код (напр. #1A2B3C).");
      return;
    }

    try {
      if (editingColor) {
        await updateColor(editingColor._id, finalHex, label);
      } else {
        await addColor(finalHex, label);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || "Възникна грешка.");
    }
  };

  const handleDeleteClick = (color: IPaletteColor) => {
    setColorToDelete(color);
  };

  const confirmDelete = async () => {
    if (!colorToDelete) return;
    setError(null);
    try {
      await removeColor(colorToDelete._id);
      setColorToDelete(null);
    } catch (err: any) {
      setError(err.message || "Възникна грешка при изтриване.");
      setColorToDelete(null);
    }
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith("#")) {
      value = `#${value}`;
    }
    setHexCode(value.toUpperCase());
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 data-[state=open]:animate-overlayShow" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg data-[state=open]:animate-contentShow focus:outline-none">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              Управление на цветове
            </Dialog.Title>
            <Dialog.Description className="mt-1 mb-4 text-sm text-gray-600">
              Добавяйте, редактирайте или премахвайте цветове от глобалната
              палитра.
            </Dialog.Description>

            {error && (
              <div className="my-3 flex items-start gap-x-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
              <input
                type="color"
                value={hexCode.length === 7 ? hexCode : "#FFFFFF"}
                onChange={handleHexChange}
                className="h-10 w-12 flex-shrink-0 cursor-pointer rounded-md border border-gray-300 bg-white p-0"
                title="Избери цвят"
              />
              <input
                type="text"
                value={hexCode}
                onChange={handleHexChange}
                placeholder="#RRGGBB"
                maxLength={7}
                className="h-10 w-28 rounded-md border border-gray-300 p-2 font-mono text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Етикет (напр. 'Светло синьо')"
                className="h-10 flex-grow rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isMutating}
                className="flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {editingColor ? "Запази" : <PlusIcon className="h-5 w-5" />}
              </button>
              {editingColor && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex h-10 items-center justify-center rounded-md bg-gray-200 px-3 text-gray-700 hover:bg-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </form>

            <div className="custom-scrollbar-xs -mr-3 max-h-[40vh] space-y-2 overflow-y-auto pr-3">
              {isLoading && <p>Зареждане...</p>}
              {paletteColors.map((color) => (
                <div
                  key={color._id}
                  className="flex items-center gap-3 rounded-md bg-gray-50 p-2"
                >
                  <div
                    className="h-6 w-6 flex-shrink-0 rounded-md border border-gray-400"
                    style={{ backgroundColor: color.hexCode }}
                  ></div>
                  <span className="font-mono text-sm text-gray-700">
                    {color.hexCode}
                  </span>
                  <span className="flex-grow text-sm text-gray-600">
                    {color.label}
                  </span>
                  <button
                    onClick={() => setEditingColor(color)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                    title="Редактирай"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(color)}
                    className="p-1 text-gray-500 hover:text-red-600"
                    title="Изтрий"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <Dialog.Close asChild>
              <button
                className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmActionDialog
        isOpen={!!colorToDelete}
        onOpenChange={(open) => !open && setColorToDelete(null)}
        onConfirm={confirmDelete}
        title="Изтриване на цвят"
        description={`Сигурни ли сте, че искате да изтриете ${
          colorToDelete?.label || colorToDelete?.hexCode
        }? Тази операция е необратима.`}
        confirmButtonText="Изтрий"
        isDestructiveAction={true}
      />
    </>
  );
};

export default ColorManagementDialog;
