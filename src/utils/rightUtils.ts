import { ICase, IMe, IUser } from "../db/interfaces";
import { ROLES } from "./GLOBAL_PARAMETERS";
import { CASE_STATUS } from "./GLOBAL_PARAMETERS";

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
