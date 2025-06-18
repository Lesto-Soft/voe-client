import { ICase, IMe, IUser, ICategory } from "../db/interfaces";
import { ROLES, CASE_STATUS } from "./GLOBAL_PARAMETERS";

export const checkNormal = (userRoleId: string): boolean => {
  if (!userRoleId) return false;
  return userRoleId === "650000000000000000000001";
};

export const determineUserRightsForCase = (
  currentUser: IMe,
  caseData: ICase
) => {
  const rights = [];

  // --- Rule 1: Check if the user is the creator of the case ---
  if (currentUser._id === caseData.creator._id) {
    rights.push("creator");
  }

  // --- Rule 2: Check if the user is a manager for any of the case's categories ---
  // Create a Set of managed category IDs for efficient lookup
  const managedCategoryIds = new Set(
    (currentUser.managed_categories || []).map((cat) => cat._id)
  );

  // Check if any case category ID exists in the user's managed set
  const isManager = (caseData.categories || []).some((caseCat) =>
    managedCategoryIds.has(caseCat._id)
  );

  if (isManager) {
    rights.push("manager");
  }

  // --- Rule 3: Check if the user is an expert in any of the case's categories ---
  // Create a Set of expert category IDs for efficient lookup
  const expertCategoryIds = new Set(
    (currentUser.expert_categories || []).map((cat) => cat._id)
  );

  // Check if any case category ID exists in the user's expert set
  const isExpert = (caseData.categories || []).some((caseCat) =>
    expertCategoryIds.has(caseCat._id)
  );

  if (isExpert) {
    rights.push("expert");
  }

  const isAdmin = currentUser.role?._id === ROLES.ADMIN;

  if (isAdmin) {
    rights.push("admin");
  }

  // Check if the user is a financial approver and (if the case is awaiting finance or if it has had a answer that needed finance)
  const hasFinancialAnswer = caseData.answers?.some(
    (answer) => answer.needs_finance === true
  );

  const isFinancial =
    currentUser.financial_approver &&
    (caseData.status === CASE_STATUS.AWAITING_FINANCE || hasFinancialAnswer);

  if (isFinancial) {
    rights.push("financial");
  }

  return rights;
};

// --- NEW: Function to check view rights for a User Profile ---
export const canViewUserProfile = (
  currentUser: IMe,
  targetUser: IUser
): boolean => {
  if (!currentUser || !targetUser) return false;

  // Rule 1: Admins can see any profile.
  if (currentUser.role?._id === ROLES.ADMIN) {
    return true;
  }

  // Rule 2: Users can see their own profile.
  if (currentUser._id === targetUser._id) {
    return true;
  }

  // Rule 3: Managers can see experts/managers profiles of users with whom they share an expert/manager category
  console.log("UR Current User: ", currentUser);
  console.log("UR TARGET USER: ", targetUser);
  if (
    (currentUser.role?._id === ROLES.EXPERT ||
      currentUser.role?._id === ROLES.ADMIN) &&
    currentUser.managed_categories?.length > 0
  ) {
    const isManager = (currentUser.managed_categories || []).some(
      (managed_category) => {
        // Check if targetUser's expert categories contain any matches
        const hasExpertMatch = (targetUser.expert_categories || []).some(
          (expert_cat) => expert_cat._id === managed_category._id
        );

        // Check if targetUser's managed categories contain any matches
        const hasManagedMatch = (targetUser.managed_categories || []).some(
          (managed_cat) => managed_cat._id === managed_category._id
        );

        return hasExpertMatch || hasManagedMatch;
      }
    );

    if (isManager) return true;
  }

  // Add other rules here if needed, e.g., managers viewing their team.
  // For now, we'll assume other users cannot view profiles.
  // To allow all logged-in users to view any profile, simply return true here.
  return false;
};

// --- NEW: Function to check view rights for a Category Page ---
export const canViewCategory = (
  currentUser: IMe,
  category: ICategory
): boolean => {
  if (!currentUser || !category) return false;

  // Rule 1: Admins can see any category.
  if (currentUser.role?._id === ROLES.ADMIN) {
    return true;
  }

  // Rule 2: Experts and Managers of that specific category can view it.
  const isExpert = (category.experts || []).some(
    (expert) => expert._id === currentUser._id
  );
  const isManager = (category.managers || []).some(
    (manager) => manager._id === currentUser._id
  );

  if (isExpert || isManager) {
    return true;
  }

  return false;
};

// --- NEW: Function to check view rights for a Case Page ---
export const canViewCase = (currentUser: IMe, caseData: ICase): boolean => {
  if (!currentUser || !caseData) return false;

  // Use the existing rights determination function. If the user has *any* right, they can view.
  const rights = determineUserRightsForCase(currentUser, caseData);
  return rights.length > 0;
};
