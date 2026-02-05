import React, { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { getTextLength, renderContentSafely } from "../../utils/contentRenderer";

interface TaskDescriptionCardProps {
  description?: string;
}

const COLLAPSE_THRESHOLD = 200;

const TaskDescriptionCard: React.FC<TaskDescriptionCardProps> = ({
  description,
}) => {
  // Auto-expand if description is short, collapse if long
  const textLength = description ? getTextLength(description) : 0;
  const shouldDefaultExpand = textLength > 0 && textLength < COLLAPSE_THRESHOLD;

  const [isExpanded, setIsExpanded] = useState(shouldDefaultExpand);

  useEffect(() => {
    // Update expanded state when description changes
    const newTextLength = description ? getTextLength(description) : 0;
    setIsExpanded(newTextLength > 0 && newTextLength < COLLAPSE_THRESHOLD);
  }, [description]);

  if (!description) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <DocumentTextIcon className="h-3.5 w-3.5" />
            Описание
          </h3>
        </div>
        <p className="text-gray-400 italic text-sm">Няма описание.</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-1.5 hover:opacity-70 transition-opacity cursor-pointer"
      >
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <DocumentTextIcon className="h-3.5 w-3.5" />
          Описание
        </h3>
        {isExpanded ? (
          <ChevronUpIcon className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="bg-gray-50 rounded-md p-3 text-gray-900 text-sm break-words">
          {renderContentSafely(description)}
        </div>
      )}
    </div>
  );
};

export default TaskDescriptionCard;
