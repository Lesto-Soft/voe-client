import React from "react";
import {
  ViewColumnsIcon,
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";

export type PanelLayout =
  | "all"
  | "info-activity"
  | "activity-stats"
  | "activity-only";

export const layoutOptions: {
  key: PanelLayout;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "all", label: "Всички панели", icon: ViewColumnsIcon },
  { key: "info-activity", label: "Без статистика", icon: ArrowRightCircleIcon },
  { key: "activity-stats", label: "Без информация", icon: ArrowLeftCircleIcon },
  { key: "activity-only", label: "Само активност", icon: ArrowsRightLeftIcon },
];
