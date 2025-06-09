// components/features/analyses/types/index.ts
import { IUser } from "../../../../db/interfaces";

export type ViewMode = "all" | "yearly" | "monthly" | "weekly" | "custom";

export type BarChartDisplayMode = "type" | "priority";

export type TopUserStat = { user: IUser; count: number } | null;

// NEW: Add the formal type for a ranked user entry.
export type RankedUser = { user: IUser; count: number };
