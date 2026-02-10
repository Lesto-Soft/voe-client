// components/features/analyses/constants/index.ts

// TODO replace colors
export const PRIORITY_TRANSLATIONS: Record<string, string> = {
  LOW: "Нисък",
  MEDIUM: "Среден",
  HIGH: "Висок",
};

export const CATEGORY_COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#C9CBCF",
  "#F7A35C",
  "#8085E9",
  "#F15C80",
];

export const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#F87171", // Tailwind red-500
  MEDIUM: "#FCD34D", // Tailwind amber-400
  LOW: "#76c554", // A pleasant green
};

export const TYPE_COLORS = {
  PROBLEM: "#DE4444", // A distinct red
  SUGGESTION: "#22C55E", // Tailwind green-500
};

// Define a type for the keys of TYPE_COLORS for type safety elsewhere
export type TypeColorKey = keyof typeof TYPE_COLORS; // "PROBLEM" | "SUGGESTION"

export const MONTH_NAMES = [
  "Януари",
  "Февруари",
  "Март",
  "Април",
  "Май",
  "Юни",
  "Юли",
  "Август",
  "Септември",
  "Октомври",
  "Ноември",
  "Декември",
];

export const DAY_NAMES_FULL = [
  "Понеделник",
  "Вторник",
  "Сряда",
  "Четвъртък",
  "Петък",
  "Събота",
  "Неделя",
];

export const STATUS_COLORS: Record<string, string> = {
  TODO: "#94A3B8", // slate-400
  IN_PROGRESS: "#3B82F6", // blue-500
  DONE: "#22C55E", // green-500
};

export const STATUS_TRANSLATIONS: Record<string, string> = {
  TODO: "Незапочнати",
  IN_PROGRESS: "В процес",
  DONE: "Завършени",
};
