export const ANSWER_CONTENT = { MIN: 5, MAX: 1250 };
export const CASE_CONTENT = {
  MIN: 10,
  MAX: 1500,
};
export const COMMENT_CONTENT = { MIN: 5, MAX: 750 };
export const CATEGORY_HELPERS = { MIN: 10, MAX: 500 };
export const CATEGORY_NAME = { MIN: 3, MAX: 25 };
export const ROLE_NAME = { MIN: 3, MAX: 25 };
export const ROLE_DESCRIPTION = { MIN: 10, MAX: 500 };
export const ROLES = {
  ADMIN: "650000000000000000000003",
  NORMAL: "650000000000000000000001",
  LEFT: "650000000000000000000004",
  EXPERT: "650000000000000000000002",
};
// Define thresholds for each tier
export const TIERS = {
  GOLD: 4.25,
  SILVER: 3.5,
  BRONZE: 2.5,
};

export const CASE_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  AWAITING_FINANCE: "AWAITING_FINANCE",
  CLOSED: "CLOSED",
};
export const CASE_TYPE = {
  PROBLEM: "PROBLEM",
  SUGGESTION: "SUGGESTION",
};
export const CASE_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
};

export const USER_RIGHTS = {
  CREATOR: "creator",
  MANAGER: "manager",
  EXPERT: "expert",
  ADMIN: "admin",
};

export const UPLOAD_MAX_SIZE_MB = 1;
export const UPLOAD_MAX_SIZE_BYTES = UPLOAD_MAX_SIZE_MB * 1024 * 1024;
