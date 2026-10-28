// src/hooks/useMentionTiers.ts
import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_LEAN_USERS } from "../graphql/query/user";
import { buildMentionTiers, LeanMentionUser } from "../utils/mentionTiers";
import type { MentionUser } from "../components/forms/partials/TextEditor/MentionSuggestion";

interface UseMentionTiersInput {
  categoryIds: string[];
  /** the active categories, used to name the "add category instead" actions */
  categories: { _id: string; name: string }[];
  creatorId?: string | null;
  guestIds?: string[];
  /** false hides the "other" tier, e.g. while a form has no category yet */
  includeOthers?: boolean;
}

/**
 * Mention suggestions for a case or a case form, split into the users who
 * already see the case and those who would get guest access when mentioned.
 */
export const useMentionTiers = ({
  categoryIds,
  categories,
  creatorId,
  guestIds,
  includeOthers = true,
}: UseMentionTiersInput): MentionUser[] => {
  const { data } = useQuery<{ getLeanUsers: LeanMentionUser[] }>(
    GET_LEAN_USERS
  );
  const users = data?.getLeanUsers;

  return useMemo(
    () =>
      buildMentionTiers({
        users: users || [],
        categoryIds,
        categoryNames: new Map(
          categories.map((category) => [category._id, category.name])
        ),
        creatorId,
        guestIds,
        includeOthers,
      }),
    [users, categoryIds, categories, creatorId, guestIds, includeOthers]
  );
};
