import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { XMarkIcon, TableCellsIcon } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { IRiskAssessment } from "../../../db/interfaces";
import UserLink from "../../global/links/UserLink";
import { getRiskStyle } from "./RiskLevelBadge";

interface RiskMatrixProps {
  assessments: IRiskAssessment[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const impactLabels: { [key: number]: string } = {
  1: "Незначително",
  2: "Ниско",
  3: "Умерено",
  4: "Значително",
  5: "Катастрофално",
};

const probabilityLabels: { [key: number]: string } = {
  1: "Малко вер.",
  2: "Рядка",
  3: "Случайна",
  4: "Вероятна",
  5: "Честа",
};

const impactAxisValues = [1, 2, 3, 4, 5];
const probabilityAxisValues = [5, 4, 3, 2, 1];

const getRiskCellColor = (impact: number, probability: number) => {
  const score = impact * probability;
  if (score <= 4) return "bg-green-200/70";
  if (score <= 9) return "bg-yellow-200/70";
  if (score <= 15) return "bg-orange-300/70";
  return "bg-red-300/70";
};

const RiskMatrix: React.FC<RiskMatrixProps> = ({
  assessments,
  isOpen,
  onOpenChange,
}) => {
  const getOverallRiskInfo = () => {
    if (assessments.length === 0) {
      return {
        text: "НЕОЦЕНЕН",
        style: "text-gray-500 bg-gray-100",
        score: 0,
      };
    }
    const maxScore = Math.max(
      ...assessments.map((a) => a.probability * a.impact)
    );
    const style = getRiskStyle(maxScore);
    return {
      text:
        maxScore <= 4
          ? "НИСЪК"
          : maxScore <= 9
          ? "СРЕДЕН"
          : maxScore <= 15
          ? "ВИСОК"
          : "КРИТИЧЕН",
      style: `${style.text} ${style.bg}`,
      score: maxScore,
    };
  };

  const overallRisk = getOverallRiskInfo();
  const maxRiskAssessment =
    assessments.find(
      (a) => a.probability * a.impact === overallRisk.score
    ) || null;

  const matrixGridItems: React.ReactNode[] = [];

  probabilityAxisValues.forEach((probability) => {
    // Row label
    matrixGridItems.push(
      <div
        key={`prob-label-${probability}`}
        className="font-semibold text-[9px] sm:text-xs text-center p-1 sm:p-2 flex items-center justify-end"
      >
        {probabilityLabels[probability]} ({probability})
      </div>
    );

    // Cells for this row
    impactAxisValues.forEach((impact) => {
      const cellAssessments = assessments.filter(
        (a) => a.probability === probability && a.impact === impact
      );

      matrixGridItems.push(
        <div
          key={`cell-${probability}-${impact}`}
          className={`relative w-full min-h-[48px] sm:min-h-[60px] sm:aspect-square rounded flex items-center justify-center ${getRiskCellColor(
            impact,
            probability
          )}`}
        >
          {cellAssessments.length > 0 && (
            <div className="absolute flex flex-col items-center justify-center gap-y-1">
              {cellAssessments.map((a) => (
                <div
                  key={a._id}
                  className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full p-0.5 pr-1.5"
                >
                  <UserLink user={a.creator} />
                  <Tooltip.Root delayDuration={100}>
                    <Tooltip.Trigger asChild>
                      <button type="button">
                        <InformationCircleIcon className="h-4 w-4 text-gray-600 hover:text-blue-600" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-800 text-white text-xs rounded-md p-2 max-w-xs shadow-lg z-[60]"
                        sideOffset={5}
                      >
                        {a.riskDescription}
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  });

  // Bottom spacer and impact labels
  matrixGridItems.push(<div key="bottom-left-spacer" />);
  impactAxisValues.forEach((impact) => {
    matrixGridItems.push(
      <div
        key={`impact-label-${impact}`}
        className="font-semibold text-[9px] sm:text-xs text-center pt-1 sm:pt-2 flex items-center justify-center"
      >
        {impactLabels[impact]} ({impact})
      </div>
    );
  });

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Tooltip.Provider>
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[98vw] max-w-3xl lg:max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <TableCellsIcon className="h-6 w-6 text-blue-500" />
                Матрица на Риска
              </Dialog.Title>

              {/* Overall Risk */}
              <div className="flex items-center gap-2 text-sm font-bold">
                <span>Максимален риск:</span>
                <span className={`px-2 py-1 rounded-full ${overallRisk.style}`}>
                  {overallRisk.score > 0
                    ? `${overallRisk.text} (${overallRisk.score})`
                    : overallRisk.text}
                </span>
                {maxRiskAssessment && (
                  <Tooltip.Root delayDuration={100}>
                    <Tooltip.Trigger asChild>
                      <button type="button">
                        <InformationCircleIcon className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-800 text-white text-xs rounded-md p-2 max-w-xs shadow-lg z-[60]"
                        sideOffset={5}
                      >
                        {maxRiskAssessment.riskDescription}
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                )}
              </div>

              <Dialog.Close asChild>
                <button
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label="Затвори"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Matrix */}
            <div className="p-4 sm:p-6 overflow-x-auto">
              <div className="flex items-stretch min-w-[400px]">
                {/* Y-axis label */}
                <div
                  className="flex items-center justify-center -rotate-180 p-2"
                  style={{ writingMode: "vertical-rl" }}
                >
                  <span className="font-bold text-sm">Вероятност</span>
                </div>

                {/* Grid */}
                <div className="flex-grow">
                  <div className="grid grid-cols-[auto_repeat(5,1fr)] grid-rows-[repeat(5,1fr)_auto] gap-x-1 gap-y-1">
                    {matrixGridItems}
                  </div>
                  {/* X-axis label */}
                  <div className="text-center mt-2 font-bold text-sm">
                    Влияние
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded bg-green-200/70" />
                  <span>Нисък (1-4)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded bg-yellow-200/70" />
                  <span>Среден (5-9)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded bg-orange-300/70" />
                  <span>Висок (10-15)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded bg-red-300/70" />
                  <span>Критичен (16-25)</span>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Tooltip.Provider>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default RiskMatrix;
