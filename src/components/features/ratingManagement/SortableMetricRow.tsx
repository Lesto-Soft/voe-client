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
import RatingMetricLink from "../../global/RankingMetricLink";
import { TIERS } from "../../../utils/GLOBAL_PARAMETERS";

interface SortableMetricRowProps {
  metric: IRatingMetric;
  onEditMetric: (metric: IRatingMetric) => void;
  onDeleteMetric: (metric: IRatingMetric) => void;
  isAdmin: boolean;
}

export const SortableMetricRow: React.FC<SortableMetricRowProps> = ({
  metric,
  onEditMetric,
  onDeleteMetric,
  isAdmin,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: metric._id,
    disabled: !isAdmin,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative" as "relative",
  };

  // Helper function to get medal color style based on the score
  const getScoreCellStyle = (score: number | undefined | null): string => {
    if (!score || score === 0) {
      return "font-bold text-gray-500"; // Default style for no score
    }
    if (score >= TIERS.GOLD) return "font-bold text-amber-500"; // Gold
    if (score >= TIERS.SILVER) return "font-bold text-slate-500"; // Silver
    if (score >= TIERS.BRONZE) return "font-bold text-orange-700"; // Bronze
    return "font-black text-red-500"; // Below bronze
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
      <td className="w-16 px-3 py-4 text-center">
        <div
          {...(isAdmin && listeners)}
          {...attributes}
          className={`flex items-center justify-center p-2 rounded-md ${
            isAdmin
              ? "hover:bg-gray-300 cursor-grab active:cursor-grabbing"
              : ""
          } ${metric.archived ? "text-gray-400" : "text-gray-500"}`}
        >
          {isAdmin ? (
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <span>{metric.order}</span>
          )}
        </div>
      </td>
      <td
        className={`w-1/5 px-3 py-4 text-sm font-medium ${
          metric.archived ? "" : "text-gray-900"
        }`}
      >
        <RatingMetricLink metric={metric} />
      </td>

      <td
        className="w-1/3 px-3 py-4 text-sm truncate"
        title={metric.description}
      >
        {metric.description}
      </td>
      <td className="w-32 px-3 py-4 text-center">
        {metric.archived ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
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
      <td className="w-36 px-3 py-4 text-center text-sm font-medium">
        {metric.totalScores ?? 0}
      </td>
      {/* --- CELL WITH CONDITIONAL STYLING --- */}
      <td
        className={`w-36 px-3 py-4 text-center text-sm ${getScoreCellStyle(
          metric.averageScore
        )}`}
      >
        {metric.totalScores && metric.totalScores > 0 && metric.averageScore
          ? metric.averageScore.toFixed(2)
          : "-"}
      </td>

      {isAdmin && (
        <td className="w-32 px-3 py-4 text-center">
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
      )}
    </tr>
  );
};

export default SortableMetricRow;
