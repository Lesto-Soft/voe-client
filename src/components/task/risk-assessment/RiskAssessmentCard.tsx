import React from "react";
import { IRiskAssessment } from "../../../db/interfaces";
import UserLink from "../../global/links/UserLink";
import RiskLevelBadge, { getRiskStyle } from "./RiskLevelBadge";

interface RiskAssessmentCardProps {
  assessment: IRiskAssessment;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({
  assessment,
  onEdit,
  onDelete,
  canEdit = false,
}) => {
  const score = assessment.probability * assessment.impact;
  const style = getRiskStyle(score);

  return (
    <div className={`p-3 rounded-md border-l-4 ${style.bg} ${style.border}`}>
      <div className="flex justify-between items-start mb-2">
        <UserLink user={assessment.creator} />
        <RiskLevelBadge
          probability={assessment.probability}
          impact={assessment.impact}
        />
      </div>

      <p className="text-sm text-gray-700 mb-2">{assessment.riskDescription}</p>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 flex gap-4">
          <span>
            Вероятност: <strong>{assessment.probability}</strong>/5
          </span>
          <span>
            Влияние: <strong>{assessment.impact}</strong>/5
          </span>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                Редактирай
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                Изтрий
              </button>
            )}
          </div>
        )}
      </div>

      {assessment.plan && (
        <div className="mt-2 pt-2 border-t border-gray-200/50">
          <p className="text-xs text-gray-600">
            <span className="font-medium">План за действие:</span>{" "}
            {assessment.plan}
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskAssessmentCard;
