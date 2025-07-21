// src/utils/dashboardFilterUtils.ts

// Define a reusable type for the translation function
type TFunction = (key: string) => string;

// Define a reusable type for the dropdown options
type Option = { value: string; label: string };

export const getPriorityOptions = (t: TFunction): Option[] => [
  { value: "", label: t("all") },
  { value: "LOW", label: t("LOW") },
  { value: "MEDIUM", label: t("MEDIUM") },
  { value: "HIGH", label: t("HIGH") },
];

export const getTypeOptions = (t: TFunction): Option[] => [
  { value: "", label: t("all") },
  { value: "PROBLEM", label: t("PROBLEM") },
  { value: "SUGGESTION", label: t("SUGGESTION") },
];

export const getStatusOptions = (t: TFunction): Option[] => [
  { value: "", label: t("all") },
  { value: "OPEN", label: t("OPEN") },
  { value: "IN_PROGRESS", label: t("IN_PROGRESS") },
  { value: "AWAITING_FINANCE", label: t("AWAITING_FINANCE") },
  { value: "CLOSED", label: t("CLOSED") },
];

export const getReadStatusOptions = (t: TFunction): Option[] => [
  { value: "ALL", label: t("all") },
  { value: "READ", label: "ПРОЧЕТЕНИ" }, // You can move these to your translation file too if you want
  { value: "UNREAD", label: "НЕПРОЧЕТЕНИ" },
];
