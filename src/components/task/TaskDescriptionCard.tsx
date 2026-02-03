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
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <DocumentTextIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Описание</span>
        </div>
        <p className="text-gray-400 italic text-sm mt-2">Няма описание.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 text-gray-700">
          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-semibold">Описание</span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="text-gray-700 pt-3">
            {renderContentSafely(description)}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDescriptionCard;
