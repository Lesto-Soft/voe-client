// src/components/global/FilterTag.tsx
import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

const FilterTag: React.FC<FilterTagProps> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="cursor-pointer group relative h-3.5 w-3.5 rounded-full hover:bg-indigo-600/20"
      aria-label={`Remove ${label} filter`}
    >
      <span className="sr-only">Remove</span>
      <XMarkIcon className="h-3.5 w-3.5 text-indigo-600/75 stroke-2 group-hover:text-indigo-600" />
    </button>
  </span>
);

export default FilterTag;
