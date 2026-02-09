import React from "react";
import { renderContentSafely } from "../../utils/contentRenderer";

interface TaskDescriptionCardProps {
  description?: string;
}

const TaskDescriptionCard: React.FC<TaskDescriptionCardProps> = ({
  description,
}) => {
  if (!description) {
    return (
      <div>
        <h3 className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-1.5">
          Описание:
        </h3>
        <p className="text-gray-400 italic text-sm">Няма описание.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <h3 className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-1.5 flex-shrink-0">
        Описание:
      </h3>
      <div className="bg-gray-50 rounded-md p-3 text-gray-900 text-sm break-words overflow-y-auto custom-scrollbar-xs flex-1 min-h-0">
        {renderContentSafely(description)}
      </div>
    </div>
  );
};

export default TaskDescriptionCard;
