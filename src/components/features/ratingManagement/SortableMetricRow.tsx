// src/components/features/ratingManagement/SortableMetricRow.tsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IRatingMetric } from "../../../db/interfaces";
import {
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";

interface SortableMetricRowProps {
  metric: IRatingMetric;
  onEditMetric: (metric: IRatingMetric) => void;
  onDeleteMetric: (metric: IRatingMetric) => void;
}

// Re-defining column widths here to be self-contained
const columnWidths = {
  order: "w-16",
  name: "w-1/5",
  description: "w-1/3",
  archived: "w-32",
  totalScores: "w-36",
  avgScore: "w-36",
  actions: "w-32",
};

export const SortableMetricRow: React.FC<SortableMetricRowProps> = ({
  metric,
  onEditMetric,
  onDeleteMetric,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: metric._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative" as "relative",
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`transition-colors duration-150 ${
        metric.archived
          ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      <td className={`${columnWidths.order} px-3 py-4 text-center`}>
        <div
          {...attributes}
          {...listeners}
          className={`flex items-center justify-center p-2 rounded-md hover:bg-gray-300 ${
            metric.archived ? "text-gray-400" : "text-gray-500"
          } cursor-grab active:cursor-grabbing`}
        >
          <Bars3Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </td>
      <td
        className={`${columnWidths.name} px-3 py-4 text-sm font-medium ${
          metric.archived ? "" : "text-gray-900"
        }`}
      >
        {metric.name}
      </td>
      <td
        className={`${columnWidths.description} px-3 py-4 text-sm truncate`}
        title={metric.description}
      >
        {metric.description}
      </td>
      <td className={`${columnWidths.archived} px-3 py-4 text-center`}>
        {metric.archived ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <ArchiveBoxIcon className="h-4 w-4 mr-1.5" />
            Архивирана
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4 mr-1.5" />
            Активна
          </span>
        )}
      </td>
      <td
        className={`${columnWidths.totalScores} px-3 py-4 text-center text-sm`}
      >
        N/A
      </td>
      <td className={`${columnWidths.avgScore} px-3 py-4 text-center text-sm`}>
        N/A
      </td>
      <td className={`${columnWidths.actions} px-3 py-4 text-center`}>
        <div className="inline-flex items-center space-x-2">
          <button
            onClick={() => onEditMetric(metric)}
            className="inline-flex justify-center items-center rounded bg-sky-100 p-1.5 text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-sky-200 active:bg-sky-300"
            title={`Редактирай ${metric.name}`}
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDeleteMetric(metric)}
            className="inline-flex justify-center items-center rounded bg-red-100 p-1.5 text-red-700 border border-red-200 hover:border-red-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-red-200 active:bg-red-300"
            title={`Изтрий ${metric.name}`}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
