import React, { useState } from "react";
import { IMe, IFiveWhy, IRiskAssessment } from "../../db/interfaces";
import { FiveWhyList } from "./five-why";
import { RiskAssessmentList } from "./risk-assessment";
import {
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface AnalysisTabsSectionProps {
  taskId: string;
  fiveWhys: IFiveWhy[];
  riskAssessments: IRiskAssessment[];
  currentUser: IMe;
  refetch: () => void;
}

type TabType = "fiveWhy" | "risks";

const AnalysisTabsSection: React.FC<AnalysisTabsSectionProps> = ({
  taskId,
  fiveWhys,
  riskAssessments,
  currentUser,
  refetch,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("fiveWhy");

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    {
      id: "fiveWhy",
      label: "5 Защо",
      icon: QuestionMarkCircleIcon,
      count: fiveWhys.length,
    },
    {
      id: "risks",
      label: "Рискове",
      icon: ExclamationTriangleIcon,
      count: riskAssessments.length,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 px-4 pt-4 pb-2">
          Анализи
        </h3>
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? "border-blue-500 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {activeTab === "fiveWhy" && (
          <FiveWhyList
            taskId={taskId}
            fiveWhys={fiveWhys}
            currentUser={currentUser}
            refetch={refetch}
            compact
          />
        )}
        {activeTab === "risks" && (
          <RiskAssessmentList
            taskId={taskId}
            riskAssessments={riskAssessments}
            currentUser={currentUser}
            refetch={refetch}
            compact
          />
        )}
      </div>
    </div>
  );
};

export default AnalysisTabsSection;
