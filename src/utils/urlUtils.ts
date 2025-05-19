// src/utils/urlUtils.ts
import { UrlParamsInput, StateForUrl } from "../types/userManagementTypes"; // Adjust path if needed

/**
 * Parses URLSearchParams to extract filter values, page, and perPage.
 * @param params URLSearchParams object.
 * @returns An object containing parsed filter values, page, and perPage.
 */
export function getUrlParams(params: URLSearchParams): UrlParamsInput {
  const page = Number(params.get("page")) || 1;
  const perPageParam = Number(params.get("perPage"));
  const perPage = [10, 25, 50].includes(perPageParam) ? perPageParam : 10;

  const name = params.get("name") || undefined;
  const username = params.get("username") || undefined;
  const position = params.get("position") || undefined;
  const email = params.get("email") || undefined;
  const roleIdsParam = params.get("roleIds");
  const roleIds = roleIdsParam
    ? roleIdsParam.split(",").filter(Boolean)
    : undefined;

  // --- ADDED: Parse financial_approver from URL ---
  const financialApproverParam = params.get("financial_approver"); // Read the 'financial_approver' URL param
  const financial = financialApproverParam === "true"; // Convert to boolean for React state

  const parsed: UrlParamsInput = { page, perPage };
  if (name) parsed.name = name;
  if (username) parsed.username = username;
  if (position) parsed.position = position;
  if (email) parsed.email = email;
  if (roleIds) parsed.roleIds = roleIds;
  // --- ADDED: Assign parsed financial boolean ---
  // The UrlParamsInput type expects a 'financial' key (from UserFiltersState)
  parsed.financial = financial;

  return parsed;
}

/**
 * Sets URL parameters based on the provided state.
 * @param params URLSearchParams object to modify.
 * @param state An object containing currentPage, itemsPerPage, and filter values (StateForUrl type).
 */
export function setUrlParams(
  params: URLSearchParams,
  state: StateForUrl // StateForUrl now has financial_approver?: string
): void {
  params.set("page", String(state.currentPage));
  params.set("perPage", String(state.itemsPerPage));

  state.filterName
    ? params.set("name", state.filterName)
    : params.delete("name");
  state.filterUsername
    ? params.set("username", state.filterUsername)
    : params.delete("username");
  state.filterPosition
    ? params.set("position", state.filterPosition)
    : params.delete("position");
  state.filterEmail
    ? params.set("email", state.filterEmail)
    : params.delete("email");

  if (state.filterRoleIds && state.filterRoleIds.length > 0) {
    params.set("roleIds", state.filterRoleIds.join(","));
  } else {
    params.delete("roleIds");
  }

  // --- ADDED: Set financial_approver URL parameter ---
  // 'state.financial_approver' comes from 'createStateForUrl' and is 'true' or undefined
  if (state.financial_approver === "true") {
    params.set("financial_approver", "true");
  } else {
    params.delete("financial_approver"); // Remove param if not 'true' (i.e., if it's undefined)
  }
}
