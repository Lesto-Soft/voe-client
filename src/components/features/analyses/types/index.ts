// components/features/analyses/types/index.ts
import { IUser } from "../../../../db/interfaces";

export type ViewMode = "all" | "yearly" | "monthly" | "weekly" | "custom";

export type BarChartDisplayMode = "type" | "priority";

/**
 * Defines the types of leaderboards we can request from the server.
 * This must match the enum on the GraphQL server.
 */
export enum RankingType {
  CREATORS = "CREATORS",
  SOLVERS = "SOLVERS",
  APPROVERS = "APPROVERS",
  RATERS = "RATERS",
}

/**
 * Represents a user in a ranked list, as returned by the getRankedUsers query.
 * This replaces the old TopUserStat.
 */
export interface RankedUser {
  user: IUser;
  count: number;
}
