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

  const parsed: UrlParamsInput = { page, perPage };
  if (name) parsed.name = name;
  if (username) parsed.username = username;
  if (position) parsed.position = position;
  if (email) parsed.email = email;
  if (roleIds) parsed.roleIds = roleIds;

  return parsed;
}

/**
 * Sets URL parameters based on the provided state.
 * @param params URLSearchParams object to modify.
 * @param state An object containing currentPage, itemsPerPage, and filter values.
 */
export function setUrlParams(
  params: URLSearchParams,
  state: StateForUrl
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
}
