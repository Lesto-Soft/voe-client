// src/components/global/SubmissionTypeIcon.tsx
import React from "react";
import {
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
} from "@heroicons/react/24/solid";

export type SubmissionType = "suggestion" | "problem" | "task";

// Same icons and colours as the NavBar's submit buttons, so the dialogs those
// buttons open are recognisably the same thing
const STYLES: Record<
  SubmissionType,
  { Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; tile: string }
> = {
  suggestion: { Icon: LightBulbIcon, tile: "bg-green-600" },
  problem: { Icon: ExclamationTriangleIcon, tile: "bg-red-600" },
  task: { Icon: ClipboardDocumentCheckIcon, tile: "bg-blue-600" },
};

const SubmissionTypeIcon: React.FC<{
  type: SubmissionType;
  className?: string;
}> = ({ type, className = "" }) => {
  const { Icon, tile } = STYLES[type];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-md p-2 text-white shadow-md ${tile} ${className}`}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
};

export default SubmissionTypeIcon;
