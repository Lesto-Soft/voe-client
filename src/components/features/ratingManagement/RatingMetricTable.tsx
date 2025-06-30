// src/components/features/ratingManagement/RatingMetricTable.tsx
import React from "react";
import { IRatingMetric } from "../../../db/interfaces";
import RatingMetricTableSkeleton from "../../skeletons/RatingMetricTableSkeleton";
import {
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";

interface RatingMetricTableProps {
  metrics: IRatingMetric[];
  isLoading: boolean;
  onEditMetric: (metric: IRatingMetric) => void;
  onDeleteMetric: (metric: IRatingMetric) => void;
}

const RatingMetricTable: React.FC<RatingMetricTableProps> = ({
  metrics,
  isLoading,
  onEditMetric,
  onDeleteMetric,
}) => {
  // --- UPDATED COLUMN WIDTHS ---
  const columnWidths = {
    order: "w-16", // 4rem
    name: "w-1/5", // 20%
    description: "w-1/3", // ~33.3%
    archived: "w-32", // 8rem
    totalScores: "w-36", // 9rem
    avgScore: "w-36", // 9rem
    actions: "w-32", // 8rem
  };

  if (isLoading) {
    return <RatingMetricTableSkeleton rows={10} />;
  }

  return (
    <section className="flex flex-col shadow-md rounded-lg overflow-hidden bg-white border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-500 sticky top-0 z-10">
            <tr>
              <th
                scope="col"
                className={`${columnWidths.order} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider`}
              >
                Ред
              </th>
              <th
                scope="col"
                className={`${columnWidths.name} px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider`}
              >
                Име
              </th>
              <th
                scope="col"
                className={`${columnWidths.description} px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider`}
              >
                Описание
              </th>
              <th
                scope="col"
                className={`${columnWidths.archived} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider`}
              >
                Статус
              </th>
              {/* --- UPDATED HEADER TEXT --- */}
              <th
                scope="col"
                className={`${columnWidths.totalScores} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider`}
              >
                ОБЩО ОЦЕНКИ
              </th>
              <th
                scope="col"
                className={`${columnWidths.avgScore} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider`}
              >
                СРЕДНА ОЦЕНКА
              </th>
              <th
                scope="col"
                className={`${columnWidths.actions} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider`}
              >
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
            {metrics.length === 0 ? (
              <tr>
                <td
                  colSpan={Object.keys(columnWidths).length}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Няма намерени метрики, съответстващи на филтрите.
                </td>
              </tr>
            ) : (
              metrics.map((metric) => (
                <tr
                  key={metric._id}
                  className={`transition-colors duration-150 ${
                    metric.archived
                      ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <td className={`${columnWidths.order} px-3 py-4 text-center`}>
                    <div
                      className={`flex items-center justify-center ${
                        metric.archived ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <Bars3Icon
                        className="h-5 w-5 mr-2 cursor-grab"
                        aria-hidden="true"
                      />
                      <span>{metric.order}</span>
                    </div>
                  </td>
                  <td
                    className={`${
                      columnWidths.name
                    } px-3 py-4 text-sm font-medium ${
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
                  <td
                    className={`${columnWidths.archived} px-3 py-4 text-center`}
                  >
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
                  <td
                    className={`${columnWidths.avgScore} px-3 py-4 text-center text-sm`}
                  >
                    N/A
                  </td>
                  <td
                    className={`${columnWidths.actions} px-3 py-4 text-center`}
                  >
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RatingMetricTable;
