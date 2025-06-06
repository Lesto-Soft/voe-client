export const checkCaseEditPermission = (
  caseCreatorId: string,
  userId: string,
  caseCategories: string[],
  userManagedCategories: string[] | undefined
): boolean => {
  // Check if the user is the creator of the case
  if (caseCreatorId === userId) {
    return true;
  }

  // If the user is not the creator, check if they manage any of the case's categories
  if (userManagedCategories && caseCategories.length > 0) {
    return caseCategories.some((category) =>
      userManagedCategories.includes(category)
    );
  }

  // If neither condition is met, the user cannot edit the case
  return false;
};

export const checkNormal = (userRoleId: string): boolean => {
  if (!userRoleId) return false;
  return userRoleId === "650000000000000000000001";
};
