import React from "react";
import { IRatingMetric } from "../../../db/interfaces";
import {
  PencilSquareIcon,
  CheckBadgeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface RatingMetricInformationPanelProps {
  metric: IRatingMetric | undefined | null;
  isLoading?: boolean;
  onEdit: () => void;
  canEdit: boolean;
}

const RatingMetricInformationPanel: React.FC<
  RatingMetricInformationPanelProps
> = ({ metric, isLoading, onEdit, canEdit }) => {
  // Skeleton loader for when data is fetching
  if (isLoading || !metric) {
    return (
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-20 bg-gray-300 rounded w-full"></div>
          <hr className="my-4 border-gray-200" />
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </aside>
    );
  }

  // A small helper for displaying info items consistently
  const InfoItem: React.FC<{
    icon: React.ElementType;
    label: string;
    value?: string | React.ReactNode;
    valueClasses?: string;
  }> = ({ icon: Icon, label, value, valueClasses = "text-gray-700" }) => {
    return (
      <div className="flex items-center text-sm py-2">
        <Icon className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-grow">
          <span className="text-gray-500">{label}: </span>
          <span className={`font-medium ${valueClasses}`}>{value}</span>
        </div>
      </div>
    );
  };

  return (
    <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar-xs">
        <div className="relative">
          {canEdit && (
            <button
              onClick={onEdit}
              className="hover:cursor-pointer absolute top-0 right-0 p-1 text-gray-500 rounded-md hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              title="Редактирай метрика"
            >
              <PencilSquareIcon className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-800 pr-8">
            {metric.name}
          </h1>
        </div>

        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200 min-h-[6rem]">
          {metric.description || "Няма налично описание за тази метрика."}
        </p>

        <hr className="my-2 border-gray-200" />

        <div className="space-y-1">
          <InfoItem
            icon={metric.archived ? XCircleIcon : CheckBadgeIcon}
            label="Статус"
            value={metric.archived ? "Архивирана" : "Активна"}
            valueClasses={metric.archived ? "text-red-600" : "text-green-600"}
          />
        </div>
      </div>
    </aside>
  );
};

export default RatingMetricInformationPanel;
