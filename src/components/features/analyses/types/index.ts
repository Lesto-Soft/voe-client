// components/features/analyses/types/index.ts
import { IUser } from "../../../../db/interfaces";

export type ViewMode = "all" | "yearly" | "monthly" | "weekly" | "custom";

export type BarChartDisplayMode = "type" | "priority";

export type TopUserStat = { user: IUser; count: number } | null;

// You can add any other types specific to the Analyses feature here as we discover them.
// For example, if the structure of data objects for charts becomes complex and reusable
// within this feature, their types could also be defined here.
