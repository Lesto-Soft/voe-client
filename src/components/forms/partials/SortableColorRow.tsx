// src/components/forms/partials/SortableColorRow.tsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IPaletteColor } from "../../../db/interfaces";
import { Bars3Icon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface SortableColorRowProps {
  color: IPaletteColor;
  usedBy?: string; // Category name
  onEdit: (color: IPaletteColor) => void;
  onDelete: (color: IPaletteColor) => void;
}

export const SortableColorRow: React.FC<SortableColorRowProps> = ({
  color,
  usedBy,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: color._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative" as "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-md bg-gray-50 p-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab p-1 text-gray-500 hover:bg-gray-200 active:cursor-grabbing rounded-md"
        title="Премести"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>
      <div
        className="h-6 w-6 flex-shrink-0 rounded-md border border-gray-400"
        style={{ backgroundColor: color.hexCode }}
      ></div>
      <span className="font-mono text-sm text-gray-700">{color.hexCode}</span>
      <span className="flex-grow text-sm text-gray-600 truncate">
        {color.label}
        {usedBy && (
          <span className="ml-2 text-xs text-gray-400 truncate" title={usedBy}>
            (Използван от: {usedBy})
          </span>
        )}
      </span>
      <button
        onClick={() => onEdit(color)}
        className="cursor-pointer p-1 text-gray-500 hover:text-blue-600"
        title="Редактирай"
      >
        <PencilIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(color)}
        className="cursor-pointer p-1 text-gray-500 hover:text-red-600"
        title="Изтрий"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
