// src/components/features/ratingManagement/RatingMetricTable.tsx
import React from "react";
import { IRatingMetric } from "../../../db/interfaces";
import RatingMetricTableSkeleton from "../../skeletons/RatingMetricTableSkeleton";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableMetricRow } from "./SortableMetricRow";

interface RatingMetricTableProps {
  metrics: IRatingMetric[];
  isLoading: boolean;
  onEditMetric: (metric: IRatingMetric) => void;
  onDeleteMetric: (metric: IRatingMetric) => void;
  setMetrics: (metrics: IRatingMetric[]) => void; // For optimistic UI update
  onReorderSave: (orderedIds: string[]) => void; // To trigger mutation
}

const RatingMetricTable: React.FC<RatingMetricTableProps> = ({
  metrics,
  isLoading,
  onEditMetric,
  onDeleteMetric,
  setMetrics,
  onReorderSave,
}) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const metricIds = React.useMemo(() => metrics.map((m) => m._id), [metrics]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = metricIds.indexOf(active.id as string);
      const newIndex = metricIds.indexOf(over.id as string);
      const newOrderMetrics = arrayMove(metrics, oldIndex, newIndex);

      // Optimistically update the UI
      setMetrics(newOrderMetrics);

      // Trigger the save action
      const newOrderIds = newOrderMetrics.map((m) => m._id);
      onReorderSave(newOrderIds);
    }
  };

  if (isLoading) {
    return <RatingMetricTableSkeleton rows={10} />;
  }

  // Table headers are now defined inside the return statement
  const renderTableHeader = () => (
    <thead className="bg-gray-500 sticky top-0 z-10">
      <tr>
        <th
          scope="col"
          className="w-16 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider"
        >
          Ред
        </th>
        <th
          scope="col"
          className="w-1/5 px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider"
        >
          Име
        </th>
        <th
          scope="col"
          className="w-1/3 px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider"
        >
          Описание
        </th>
        <th
          scope="col"
          className="w-32 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider"
        >
          Статус
        </th>
        <th
          scope="col"
          className="w-36 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider"
        >
          ОБЩО ОЦЕНКИ
        </th>
        <th
          scope="col"
          className="w-36 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider"
        >
          СРЕДНА ОЦЕНКА
        </th>
        <th
          scope="col"
          className="w-32 px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider"
        >
          Действия
        </th>
      </tr>
    </thead>
  );

  return (
    <section className="flex flex-col shadow-md rounded-lg overflow-hidden bg-white border border-gray-200">
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            {renderTableHeader()}
            <SortableContext
              items={metricIds}
              strategy={verticalListSortingStrategy}
            >
              <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
                {metrics.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Няма намерени метрики, съответстващи на филтрите.
                    </td>
                  </tr>
                ) : (
                  metrics.map((metric) => (
                    <SortableMetricRow
                      key={metric._id}
                      metric={metric}
                      onEditMetric={onEditMetric}
                      onDeleteMetric={onDeleteMetric}
                    />
                  ))
                )}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>
    </section>
  );
};

export default RatingMetricTable;
