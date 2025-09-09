// src/components/forms/partials/ColorManagementDialog.tsx
import React, { useState, useEffect, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  XMarkIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ICategory, IPaletteColor } from "../../../db/interfaces";
import {
  useAddPaletteColor,
  useUpdatePaletteColor,
  useRemovePaletteColor,
  useReorderPaletteColors,
} from "../../../graphql/hooks/colorPalette";
import ConfirmActionDialog from "../../modals/ConfirmActionDialog";
import { SortableColorRow } from "./SortableColorRow";

interface ColorManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paletteColors: IPaletteColor[];
  setPaletteColors: (colors: IPaletteColor[]) => void; // For optimistic updates
  allCategories: ICategory[];
  isLoading: boolean;
}

const ColorManagementDialog: React.FC<ColorManagementDialogProps> = ({
  isOpen,
  onClose,
  paletteColors,
  setPaletteColors,
  allCategories,
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
  const { reorderColors } = useReorderPaletteColors();

  const isMutating = addLoading || updateLoading || removeLoading;
  const sensors = useSensors(useSensor(PointerSensor));

  const colorUsageMap = useMemo(() => {
    const map = new Map<string, string>();
    allCategories.forEach((cat) => {
      if (cat.color) {
        map.set(cat.color.toUpperCase(), cat.name);
      }
    });
    return map;
  }, [allCategories]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = paletteColors.findIndex((c) => c._id === active.id);
      const newIndex = paletteColors.findIndex((c) => c._id === over.id);
      const newOrder = arrayMove(paletteColors, oldIndex, newIndex);
      setPaletteColors(newOrder); // Optimistic update
      reorderColors(newOrder.map((c) => c._id));
    }
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
              Добавяйте, редактирайте или пренареждайте цветове от палитрата.
            </Dialog.Description>

            {error && (
              <div className="my-3 flex items-start gap-x-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mb-4 flex items-center gap-2"
            >
              <input
                type="color"
                value={hexCode.length === 7 ? hexCode : "#FFFFFF"}
                onChange={(e) => setHexCode(e.target.value.toUpperCase())}
                className="h-10 w-12 flex-shrink-0 cursor-pointer rounded-xs border border-gray-300 bg-white p-0"
                title="Избери цвят"
              />
              <input
                type="text"
                value={hexCode}
                onChange={(e) => setHexCode(e.target.value.toUpperCase())}
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
              <div className="flex-shrink-0 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isMutating}
                  className="cursor-pointer flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 px-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {editingColor ? "Запази" : <PlusIcon className="h-5 w-5" />}
                </button>
                {editingColor && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-md bg-gray-200 px-3 text-gray-700 hover:bg-gray-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>

            <div className="custom-scrollbar-xs -mr-3 max-h-[40vh] space-y-2 overflow-y-auto pr-3">
              {isLoading ? (
                <p>Зареждане...</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                  <SortableContext
                    items={paletteColors.map((c) => c._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {paletteColors.map((color) => (
                      <SortableColorRow
                        key={color._id}
                        color={color}
                        usedBy={colorUsageMap.get(color.hexCode.toUpperCase())}
                        onEdit={setEditingColor}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>

            <Dialog.Close asChild>
              <button
                className="cursor-pointer absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
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
