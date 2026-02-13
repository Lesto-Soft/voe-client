// src/hooks/useAuthorization.ts
import { useMemo } from "react";
import { useCurrentUser } from "../context/UserContext";
import { IMe, ICase, IUser, ICategory, ITask } from "../db/interfaces";
import {
  canViewCase,
  canViewUserProfile,
  canViewCategory,
  canViewTask,
} from "../utils/rightUtils";

type AuthorizationInput =
  | { type: "case"; data: ICase | null | undefined }
  | { type: "user"; data: IUser | null | undefined }
  | { type: "category"; data: ICategory | null | undefined }
  | { type: "task"; data: ITask | null | undefined };

/**
 * A hook to check if the current user is authorized to view a specific piece of data.
 * @param {AuthorizationInput} props - The type of data and the data itself.
 * @returns {{ isAllowed: boolean, isLoading: boolean }} - The authorization status and loading state.
 */
export const useAuthorization = ({ type, data }: AuthorizationInput) => {
  const currentUser = useCurrentUser() as IMe;

  // The authorization check is memoized to prevent re-calculation on every render.
  const isAllowed = useMemo(() => {
    // If there's no current user or no data to check against, deny access.
    if (!currentUser || !data) {
      return false;
    }

    switch (type) {
      case "case":
        return canViewCase(currentUser, data as ICase);
      case "user":
        return canViewUserProfile(currentUser, data as IUser);
      case "category":
        return canViewCategory(currentUser, data as ICategory);
      case "task":
        return canViewTask(currentUser, data as ITask);
      default:
        return false;
    }
  }, [currentUser, data, type]);

  // The auth check is "loading" if the data for the page hasn't finished loading yet.
  const isLoading = !data;

  return { isAllowed, isLoading };
};
