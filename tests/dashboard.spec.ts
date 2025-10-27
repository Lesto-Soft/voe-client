// tests/dashboard.spec.ts
import { test, expect, Page } from "@playwright/test";
import { ROLES } from "../src/utils/GLOBAL_PARAMETERS"; // Import roles

// Base URL for the application
const BASE_URL = "http://localhost:5173";

// --- MOCK DATA ---

// Mock user data for GetMe query
const MOCK_ADMIN_USER = {
  me: {
    __typename: "User",
    _id: "admin123",
    username: "admin",
    name: "Admin User",
    role: { __typename: "Role", _id: ROLES.ADMIN, name: "админ" },
    managed_categories: [{ _id: "mcat1", __typename: "Category" }],
    expert_categories: [{ _id: "ecat1", __typename: "Category" }],
    answers: [],
    comments: [],
  },
};

const MOCK_NORMAL_USER = {
  me: {
    __typename: "User",
    _id: "normal456",
    username: "normal",
    name: "Normal User",
    role: { __typename: "Role", _id: ROLES.NORMAL, name: "базов" },
    managed_categories: [],
    expert_categories: [],
    answers: [],
    comments: [],
  },
};

// Mock case data. We'll use a "stateful" DB for testing CUD operations.
let mockCasesDb: any[] = [];

const MOCK_CASE_1_UNREAD = {
  __typename: "Case",
  _id: "case001",
  case_number: 350,
  content: "This is test case 1. It is unread.",
  date: "1700000000000", // A valid timestamp string
  type: "PROBLEM",
  priority: "LOW",
  status: "OPEN",
  creator: {
    __typename: "User",
    _id: "userCreator1",
    name: "Creator One",
    username: "creator1",
  },
  categories: [{ __typename: "Category", _id: "cat1", name: "БЕЗОПАСНОСТ" }],
  readBy: [], // Empty, so it's unread for admin123
  answers: [],
};

const MOCK_CASE_2_READ_HIGH = {
  __typename: "Case",
  _id: "case002",
  case_number: 351,
  content: "This is test case 2. It is read and high priority.",
  date: "1700000100000",
  type: "SUGGESTION",
  priority: "HIGH",
  status: "IN_PROGRESS",
  creator: {
    __typename: "User",
    _id: "userCreator2",
    name: "Creator Two",
    username: "creator2",
  },
  categories: [{ __typename: "Category", _id: "cat2", name: "ДОКУМЕНТИ" }],
  readBy: [
    {
      __typename: "ReadBy",
      user: { __typename: "User", _id: "admin123" }, // Read by admin
    },
    {
      // Add the normal user to readBy for case 2 initially for simpler testing
      __typename: "ReadBy",
      user: { __typename: "User", _id: "normal456" },
    },
  ],
  answers: [],
};

// Mocks for filter dropdowns
const MOCK_CREATOR_FILTER = {
  __typename: "User",
  _id: "userCreator1",
  name: "Creator One",
  username: "creator1",
};
const MOCK_CATEGORY_FILTER = {
  __typename: "Category",
  _id: "cat1",
  name: "БЕЗОПАСНОСТ",
};

/**
 * Mocks all necessary API requests for the Dashboard.
 * This is stateful to test create/update/delete actions.
 */
const mockApiRequests = async (
  page: Page,
  userType: "admin" | "normal" = "admin"
) => {
  await page.route("**/graphql", async (route) => {
    const json = route.request().postDataJSON();
    const userMe = userType === "admin" ? MOCK_ADMIN_USER : MOCK_NORMAL_USER;

    switch (json.operationName) {
      case "GetMe":
        return route.fulfill({
          status: 200,
          body: JSON.stringify({ data: userMe }),
        });

      // This handles 'All' for Admin
      case "GET_CASES": {
        let cases = [...mockCasesDb];
        const input = json.variables.input || {};

        if (input.priority) {
          cases = cases.filter((c) => c.priority === input.priority);
        }
        if (input.creatorId) {
          cases = cases.filter((c) => c.creator._id === input.creatorId);
        }
        // Add more filter logic here as needed...

        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              getAllCases: {
                // The resolver name is still getAllCases
                __typename: "CaseQueryResult",
                cases: cases,
                count: cases.length,
              },
            },
          }),
        });
      }

      // This handles 'All' for non-Admin
      case "GET_RELEVANT_CASES": {
        let cases = [...mockCasesDb]; // Simple mock, just return all
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              getRelevantCases: {
                // The resolver name is still getRelevantCases
                __typename: "CaseQueryResult",
                cases: cases,
                count: cases.length,
              },
            },
          }),
        });
      }

      // This handles 'Mine' tab
      case "GET_USER_CASES": {
        const cases = mockCasesDb.filter(
          (c) => c.creator._id === userMe.me._id
        );
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              getUserCases: {
                __typename: "CaseQueryResult",
                cases: cases,
                count: cases.length,
              },
            },
          }),
        });
      }

      // Mocks for filter dropdowns
      case "GetLeanUsers":
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: { getLeanUsers: [MOCK_CREATOR_FILTER] },
          }),
        });

      case "GetAllActiveCategories":
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: { getLeanActiveCategories: [MOCK_CATEGORY_FILTER] },
          }),
        });

      // Mock for Table Actions
      case "ToggleCaseReadStatus": {
        const caseId = json.variables.caseId;
        mockCasesDb = mockCasesDb.map((c) => {
          if (c._id === caseId) {
            const currentUserId = userMe.me._id; // Get current user's ID
            const isRead = c.readBy.some(
              (rb: any) => rb.user._id === currentUserId
            );
            // console.log(`Toggling read status for case ${caseId} by user ${currentUserId}. Was read: ${isRead}`);
            return {
              ...c,
              // Toggle logic for the specific user
              readBy: isRead
                ? c.readBy.filter((rb: any) => rb.user._id !== currentUserId) // Remove the user
                : [
                    // Add the user
                    ...c.readBy,
                    {
                      __typename: "ReadBy",
                      user: { __typename: "User", _id: currentUserId },
                    },
                  ],
            };
          }
          return c;
        });
        // console.log(`Updated mockCasesDb after toggle for ${caseId}:`, JSON.stringify(mockCasesDb.find(c => c._id === caseId)?.readBy));
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: { toggleCaseReadStatus: { _id: caseId } }, // Return a success indicator
          }),
        });
      }

      case "DeleteCase": {
        const id = json.variables.id;
        const deletedCase = mockCasesDb.find((c) => c._id === id);
        mockCasesDb = mockCasesDb.filter((c) => c._id !== id);
        return route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { deleteCase: deletedCase } }),
        });
      }

      // ADDED: Handlers for other tabs to prevent "unhandled" warnings
      case "GET_CASES_BY_USER_CATEGORIES":
      case "GET_CASES_BY_USER_MANAGED_CATEGORIES":
      case "GET_USER_ANSWERED_CASES":
      case "GET_USER_COMMENTED_CASES":
        // Determine the correct resolver name field based on the operation name
        const resolverFieldName =
          json.operationName.charAt(0).toLowerCase() +
          json.operationName.slice(1);
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              [resolverFieldName]: {
                __typename: "CaseQueryResult",
                cases: [],
                count: 0,
              },
            },
          }),
        });

      default:
        // Let other requests pass through or fail
        // console.warn(`Unhandled GraphQL operation: ${json.operationName}`);
        return route.continue();
    }
  });
};

/** Helper to navigate to the dashboard and wait for it to load */
const gotoDashboard = async (page: Page) => {
  await page.goto(`${BASE_URL}/dashboard`);
  // Wait for the "All" tab to be visible and stable
  await expect(page.locator("button", { hasText: /^Всички$/ })).toBeVisible();
  // Wait for the table body to be present, indicating skeleton is gone
  await expect(page.locator("tbody")).toBeVisible({ timeout: 10000 });
};

// --- TEST SUITES ---

test.describe("Dashboard Page (Admin)", () => {
  // Reset mock DB and set up admin user before each test
  test.beforeEach(async ({ page }) => {
    // Reset DB state for each test
    mockCasesDb = [
      JSON.parse(JSON.stringify(MOCK_CASE_1_UNREAD)), // Deep copy to avoid test interference
      JSON.parse(JSON.stringify(MOCK_CASE_2_READ_HIGH)),
    ];
    await mockApiRequests(page, "admin");
    await gotoDashboard(page);
  });

  test("1.1: Initial load shows all tabs and cases", async ({ page }) => {
    // Check for Admin tabs
    await expect(page.locator("button", { hasText: /^Всички$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Мои" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Управлявани" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Експертни" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Решени" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Коментирани" })
    ).toBeVisible();

    // Check for filter button (based on DashboardContent.tsx)
    await expect(page.getByRole("button", { name: "Филтри" })).toBeVisible();

    // Check for table headers
    await expect(
      page.getByRole("columnheader", { name: "Номер" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Приоритет" })
    ).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Тип" })).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Подател" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Описание" })
    ).toBeVisible();

    // Check for mock case data in the table
    await expect(
      page.getByRole("link", {
        name: MOCK_CASE_1_UNREAD.case_number.toString(),
      })
    ).toBeVisible();
    await expect(page.getByText(/This is test case 1/i)).toBeVisible();
    await expect(page.getByText(/This is test case 2/i)).toBeVisible();

    // Check pagination
    await expect(page.getByText(/от 2 резултата/i)).toBeVisible();
  });

  test("1.2: Unread case has correct styling", async ({ page }) => {
    const unreadRow = page.getByRole("row", {
      name: /This is test case 1/i,
    });
    // Check for classes from CaseLink.tsx and CaseTable.tsx
    await expect(unreadRow).toHaveClass(/bg-blue-50/);
    await expect(unreadRow).toHaveClass(/font-semibold/);

    // The read case row should not
    const readRow = page.getByRole("row", {
      name: /This is test case 2/i,
    });
    await expect(readRow).not.toHaveClass(/bg-blue-50/);
    await expect(readRow).not.toHaveClass(/font-semibold/);
  });

  test("2.1: Filtering by Priority works", async ({ page }) => {
    // Both cases are visible initially
    await expect(page.getByText(/This is test case 1/i)).toBeVisible();
    await expect(page.getByText(/This is test case 2/i)).toBeVisible();

    // Find the 'Приоритет' dropdown (CustomDropdown)
    await page.getByText("Приоритет", { exact: true }).click();

    // Click the 'HIGH' option (text from bg/dashboard.json)
    await page.getByRole("option", { name: "ВИСОК" }).click();

    // Wait for the table to update (refetch)
    // The 'HIGH' case should still be visible
    await expect(page.getByText(/This is test case 2/i)).toBeVisible();
    // The 'LOW' case should be gone
    await expect(page.getByText(/This is test case 1/i)).not.toBeVisible();

    // Check pagination text update
    await expect(page.getByText(/от 1 резултата/i)).toBeVisible();
  });

  test("2.2: Hiding and Showing filters works", async ({ page }) => {
    const filterButton = page.getByRole("button", { name: "Филтри" });
    const searchBarInput = page.locator("#caseNumber");

    // Find the animated container that wraps the CaseSearchBar
    const searchBarContainer = searchBarInput.locator(
      'xpath=./ancestor::div[contains(@class, "transition-all")]'
    );

    // 1. Filters are visible by default
    await expect(searchBarInput).toBeVisible();
    await expect(filterButton).toHaveAttribute("title", "Скрий филтри");
    await expect(searchBarContainer).toHaveClass(/max-h-screen/);

    // 2. Hide filters
    await filterButton.click();

    // Assert on the container's class change. This waits for the animation.
    await expect(searchBarContainer).toHaveClass(/max-h-0/);
    await expect(searchBarContainer).toHaveClass(/opacity-0/);
    await expect(filterButton).toHaveAttribute("title", "Покажи филтри");

    // 3. Show filters again
    await filterButton.click();
    await expect(searchBarContainer).toHaveClass(/max-h-screen/);
    await expect(searchBarInput).toBeVisible();
    await expect(filterButton).toHaveAttribute("title", "Скрий филтри");
  });

  test("3.1: Mark as Read action works", async ({ page }) => {
    const unreadRow = page.getByRole("row", {
      name: /This is test case 1/i,
    });
    const markReadText = "Направи прочетено";
    const markUnreadText = "Направи непрочетено";

    // 1. Assert it's unread
    await expect(unreadRow).toHaveClass(/bg-blue-50/);

    // 2. Find action menu and click "Mark as Read"
    await unreadRow.getByTitle("Още действия").click();
    const markReadButton = page.getByRole("menuitem", { name: markReadText });
    await expect(markReadButton).toBeVisible();
    await markReadButton.click(); // Menu stays open after this

    // 3. Wait for UI to update (refetch) and assert row is now read (style removed)
    await expect(unreadRow).not.toHaveClass(/bg-blue-50/, { timeout: 10000 }); // Increased timeout

    // 4. Test marking it back as unread - menu is STILL OPEN
    // FIX: Do NOT re-open the menu. Wait directly for the text change within the open menu.
    await expect(
      page.getByRole("menuitem", { name: markReadText })
    ).not.toBeVisible({ timeout: 10000 }); // Wait for "Mark Read" to disappear
    const markUnreadButton = page.getByRole("menuitem", {
      name: markUnreadText,
    });
    await expect(markUnreadButton).toBeVisible({ timeout: 10000 }); // Wait for "Mark Unread" to appear
    await markUnreadButton.click(); // Click "Mark Unread", menu should close or stay open

    // 5. Wait and assert it's unread again (style reapplied)
    // Add a small wait in case the menu closing takes a moment before checking style
    await page.waitForTimeout(500);
    await expect(unreadRow).toHaveClass(/bg-blue-50/, { timeout: 10000 }); // Increased timeout
  });

  test("3.2: Delete Case action works", async ({ page }) => {
    const caseRow = page.getByRole("row", {
      name: /This is test case 1/i,
    });

    // 1. Assert case is visible
    await expect(caseRow).toBeVisible();

    // 2. Click delete action
    await caseRow.getByTitle("Още действия").click();
    await page.getByRole("menuitem", { name: "Изтрий сигнал" }).click();

    // 3. Confirm deletion in the dialog (ConfirmActionDialog)
    await expect(
      page.getByRole("heading", { name: "Потвърдете изтриването" })
    ).toBeVisible();
    await expect(
      page.getByText(/Сигурни ли сте, че искате да изтриете/)
    ).toBeVisible();
    await page.getByRole("button", { name: "Изтрий" }).click();

    // 4. Assert the case is removed from the table
    await expect(caseRow).not.toBeVisible();
    await expect(page.getByText(/This is test case 2/i)).toBeVisible(); // The other case remains
  });
});

test.describe("Dashboard Page (Normal User)", () => {
  // Reset mock DB and set up normal user before each test
  test.beforeEach(async ({ page }) => {
    // Reset DB state for each test
    mockCasesDb = [
      JSON.parse(JSON.stringify(MOCK_CASE_1_UNREAD)), // Deep copy
      JSON.parse(JSON.stringify(MOCK_CASE_2_READ_HIGH)),
    ];
    await mockApiRequests(page, "normal");
    await gotoDashboard(page);
  });

  test("1.1: Initial load shows limited tabs and correct case data", async ({
    page,
  }) => {
    // Check for 'All' tab (this is already done by gotoDashboard)
    await expect(page.locator("button", { hasText: /^Всички$/ })).toBeVisible();

    // Assert Admin/Expert tabs are NOT visible (based on DashboardContent.tsx logic)
    await expect(page.getByRole("button", { name: "Мои" })).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Управлявани" })
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Експертни" })
    ).not.toBeVisible();

    // Check that cases are loaded (from GetRelevantCases mock)
    // FIX: Target the specific span containing the case number to avoid strict mode violation
    const row1 = page.getByRole("row", { name: /This is test case 1/i });
    await expect(
      row1.locator("span.font-bold", {
        hasText: MOCK_CASE_1_UNREAD.case_number.toString(),
      })
    ).toBeVisible();

    await expect(page.getByText(/This is test case 1/i)).toBeVisible();
    await expect(page.getByText(/This is test case 2/i)).toBeVisible();
  });
});
