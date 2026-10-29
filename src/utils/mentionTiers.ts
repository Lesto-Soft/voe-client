// src/utils/mentionTiers.ts
import { ROLES } from "./GLOBAL_PARAMETERS";
import type { MentionUser } from "../components/forms/partials/TextEditor/MentionSuggestion";

export interface LeanMentionUser {
  _id: string;
  name: string;
  username: string;
  position?: string | null;
  role?: { _id: string } | null;
  expert_categories?: { _id: string }[];
  managed_categories?: { _id: string }[];
}

interface BuildMentionTiersInput {
  users: LeanMentionUser[];
  /** categories currently on the case (or selected in the form) */
  categoryIds: string[];
  /** id → name of the categories that may be added (the active ones) */
  categoryNames: Map<string, string>;
  creatorId?: string | null;
  guestIds?: string[];
}

/**
 * Splits the users into the two mention tiers: those who already see the
 * case (creator, guests, admins, experts/managers of its categories) and
 * everyone else, who receives guest access when mentioned. Mirrors
 * determineUserRightsForCase without the finance and linked-task edge cases,
 * which the server re-checks anyway before creating a guest.
 */
export const buildMentionTiers = ({
  users,
  categoryIds,
  categoryNames,
  creatorId,
  guestIds = [],
}: BuildMentionTiersInput): MentionUser[] => {
  const caseCategories = new Set(categoryIds);
  const guests = new Set(guestIds);

  return users
    .filter((user) => user.role?._id !== ROLES.LEFT)
    .map((user): MentionUser => {
      const userCategories = [
        ...(user.expert_categories || []),
        ...(user.managed_categories || []),
      ].map((category) => category._id);
      const hasAccess =
        user.role?._id === ROLES.ADMIN ||
        user._id === creatorId ||
        guests.has(user._id) ||
        userCategories.some((id) => caseCategories.has(id));
      const base = {
        _id: user._id,
        name: user.name,
        username: user.username,
        position: user.position || undefined,
      };
      if (hasAccess) return { ...base, tier: "case" };

      const fixCategories = [...new Set(userCategories)]
        .filter((id) => !caseCategories.has(id) && categoryNames.has(id))
        .map((id) => ({ _id: id, name: categoryNames.get(id) as string }));
      return { ...base, tier: "other", fixCategories };
    });
};
