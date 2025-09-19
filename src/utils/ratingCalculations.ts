// import { IRating, IMetricScore } from "../db/interfaces";

// export const calculateUserRating = (scores: IMetricScore[]): number => {
//   if (!scores || scores.length === 0) return 0;

//   const validScores = scores.filter((s) => s.score > 0);
//   if (validScores.length === 0) return 0;

//   const sum = validScores.reduce((acc, s) => acc + s.score, 0);
//   return sum / validScores.length;
// };

// export const calculateCaseRating = (ratings: IRating[]): number => {
//   if (!ratings || ratings.length === 0) return 0;

//   const userRatings = ratings.map((r) => calculateUserRating(r.scores));
//   const validRatings = userRatings.filter((rating) => rating > 0);

//   if (validRatings.length === 0) return 0;

//   const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
//   return sum / validRatings.length;
// };

import { TIERS } from "./GLOBAL_PARAMETERS";

export type RatingTierLabel =
  | "Отлични"
  | "Добри"
  | "Средни"
  | "Проблемни"
  | "all";

export const getTierForScore = (score: number): RatingTierLabel => {
  if (score >= TIERS.GOLD) return "Отлични";
  if (score >= TIERS.SILVER) return "Добри";
  if (score >= TIERS.BRONZE) return "Средни";
  return "Проблемни";
};
