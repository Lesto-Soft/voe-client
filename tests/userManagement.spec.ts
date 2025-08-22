import { test, expect, Page } from "@playwright/test";

// Base URL for the application
const BASE_URL = "http://localhost:5173";

const MOCK_ROLES = [
  {
    __typename: "Role",
    _id: "650000000000000000000001",
    name: "базов",
    description: "Базов потребител",
  },
  {
    __typename: "Role",
    _id: "650000000000000000000002",
    name: "експерт",
    description: "Потребител с експертни права",
  },
  {
    __typename: "Role",
    _id: "650000000000000000000003",
    name: "админ",
    description: "администратор",
  },
  {
    __typename: "Role",
    _id: "650000000000000000000004",
    name: "напуснал",
    description: "Потребител, който е напуснал",
  },
];

const MOCK_USERS = [
  {
    __typename: "User",
    avatar: null,
    _id: "user001",
    username: "emp_finance",
    name: "FINANCE USER",
    email: "financial@email.com",
    position: "Financial Position",
    financial_approver: true,
    role: { __typename: "Role", _id: MOCK_ROLES[1]._id, name: "експерт" },
    cases: [],
    answers: [],
    comments: [],
    expert_categories: [],
    managed_categories: [],
  },
  {
    __typename: "User",
    avatar: null,
    _id: "user002",
    username: "emp_normal",
    name: "NORMAL NAME",
    email: "normal@email.com",
    position: "NORMAL POSITION",
    financial_approver: false,
    role: { __typename: "Role", _id: MOCK_ROLES[0]._id, name: "базов" },
    cases: [],
    answers: [],
    comments: [],
    expert_categories: [],
    managed_categories: [],
  },
];

const MOCK_CATEGORIES = [{ _id: "cat1", name: "Категория 1" }];

const mockApiRequests = async (page: Page) => {
  await page.route("**/graphql", async (route) => {
    const json = route.request().postDataJSON();

    switch (json.operationName) {
      case "GetMe":
        return await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              me: {
                _id: "admin_user_id",
                username: "admin",
                name: "Admin User",
                role: MOCK_ROLES[2],
                managed_categories: [],
              },
            },
          }),
        });
      case "GetAllRoles":
        return await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { getAllLeanRoles: MOCK_ROLES } }),
        });
      case "GetActiveCategories":
        return await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: { getLeanActiveCategories: MOCK_CATEGORIES },
          }),
        });
      case "GetAllUsers":
        return await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { getAllUsers: MOCK_USERS } }),
        });
      case "CountUsers":
        return await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { countUsers: MOCK_USERS.length } }),
        });
      case "CountUsersByExactUsername":
      case "CountUsersByExactEmail":
        return await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: { countUsersByExactUsername: 0, countUsersByExactEmail: 0 },
          }),
        });
      case "CreateUser":
        return await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { createUser: { _id: "newUser123" } } }),
        });
      case "UpdateUser":
        return await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { updateUser: { _id: "user001" } } }),
        });
      case "DeleteUser":
        return await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { deleteUser: { _id: "user002" } } }),
        });
      default:
        return await route.continue();
    }
  });
};

const gotoUserManagementPage = async (page: Page) => {
  await page.goto(`${BASE_URL}/user-management`);
  await expect(
    page.getByRole("heading", { name: "Управление на акаунти" })
  ).toBeVisible();
  await expect(page.getByRole("row", { name: /NORMAL NAME/i })).toBeVisible({
    timeout: 10000,
  });
};

test.describe("User Management Page", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRequests(page);
  });

  test("1.1: Initial elements are displayed correctly", async ({ page }) => {
    await gotoUserManagementPage(page);
    await expect(page.getByText(/Общо Потребители/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Създай Потребител" })
    ).toBeVisible();
    await expect(
      page.getByRole("row", { name: /FINANCE USER/i })
    ).toBeVisible();
  });

  test('2.1: "Create User" button opens the modal', async ({ page }) => {
    await gotoUserManagementPage(page);
    await page.getByRole("button", { name: "Създай Потребител" }).click();

    const modal = page.getByRole("dialog", { name: "Създай нов потребител" });
    await expect(modal).toBeVisible();
    await expect(modal.getByLabel("Потребителско име*")).toBeEmpty();
  });

  test("2.2: Form shows validation errors", async ({ page }) => {
    await gotoUserManagementPage(page);
    await page.getByRole("button", { name: "Създай Потребител" }).click();

    const modal = page.getByRole("dialog", { name: "Създай нов потребител" });
    await expect(modal).toBeVisible();
    await modal.getByRole("button", { name: "Създай", exact: true }).click();

    await expect(
      modal.getByText("Потребителското име е задължително.")
    ).toBeVisible();
  });

  test("2.3: Successfully creates a new user", async ({ page }) => {
    await gotoUserManagementPage(page);
    await page.getByRole("button", { name: "Създай Потребител" }).click();

    const modal = page.getByRole("dialog", { name: "Създай нов потребител" });
    await expect(modal).toBeVisible();

    await modal.getByLabel("Потребителско име*").fill("new_user_test");
    await modal.getByLabel("Име и фамилия*").fill("New User Name");
    await modal.getByLabel("Роля*").selectOption({ label: "Базов" });
    await modal.getByLabel("Парола*", { exact: true }).fill("password123");
    await modal.getByLabel("Повтори парола*").fill("password123");
    await modal.getByRole("button", { name: "Създай", exact: true }).click();

    await expect(page.getByRole("heading", { name: "Успех!" })).toBeVisible();
  });

  test("3.1: Edit button opens modal with data", async ({ page }) => {
    await gotoUserManagementPage(page);
    await page
      .getByRole("row", { name: /FINANCE USER/i })
      .getByRole("button", { name: "Редактирай" })
      .click();

    const modal = page.getByRole("dialog", { name: "Редактирай потребител" });
    await expect(modal).toBeVisible();
    await expect(modal.getByLabel("Потребителско име*")).toHaveValue(
      "emp_finance"
    );
  });

  test("3.2: Successfully edits a user", async ({ page }) => {
    await gotoUserManagementPage(page);
    await page
      .getByRole("row", { name: /FINANCE USER/i })
      .getByRole("button", { name: "Редактирай" })
      .click();

    const modal = page.getByRole("dialog", { name: "Редактирай потребител" });
    await expect(modal).toBeVisible();
    await modal.getByLabel("Позиция").fill("New Position");
    await modal.getByRole("button", { name: "Запази" }).click();

    await expect(page.getByRole("heading", { name: "Успех!" })).toBeVisible();
  });

  test("4.1: Delete button opens confirmation", async ({ page }) => {
    await gotoUserManagementPage(page);
    await page
      .getByRole("row", { name: /NORMAL NAME/i })
      .getByRole("button", { name: "Изтрий" })
      .click();

    // FIX: Directly find the dialog's heading text to confirm it's visible.
    await expect(
      page.getByRole("heading", { name: "Потвърди изтриването на потребител" })
    ).toBeVisible();
    await expect(page.getByText(/Сигурни ли сте/)).toBeVisible();
  });

  test("4.2: Successfully deletes a user", async ({ page }) => {
    let currentUsers = [...MOCK_USERS];

    await page.route("**/graphql", async (route) => {
      const json = route.request().postDataJSON();
      switch (json.operationName) {
        case "GetMe":
          return await route.fulfill({
            status: 200,
            body: JSON.stringify({
              data: {
                me: {
                  _id: "admin_user_id",
                  username: "admin",
                  name: "Admin User",
                  role: MOCK_ROLES[2],
                  managed_categories: [],
                },
              },
            }),
          });
        case "GetAllRoles":
          return await route.fulfill({
            status: 200,
            body: JSON.stringify({
              data: { getAllLeanRoles: MOCK_ROLES },
            }),
          });
        case "GetAllUsers":
          return await route.fulfill({
            status: 200,
            body: JSON.stringify({ data: { getAllUsers: currentUsers } }),
          });
        case "CountUsers":
          return await route.fulfill({
            status: 200,
            body: JSON.stringify({ data: { countUsers: currentUsers.length } }),
          });
        case "DeleteUser":
          const userIdToDelete = json.variables.id;
          currentUsers = currentUsers.filter(
            (user) => user._id !== userIdToDelete
          );
          return await route.fulfill({
            status: 200,
            body: JSON.stringify({
              data: { deleteUser: { _id: userIdToDelete } },
            }),
          });
        default:
          return await route.continue();
      }
    });

    await gotoUserManagementPage(page);
    await page
      .getByRole("row", { name: /NORMAL NAME/i })
      .getByRole("button", { name: "Изтрий" })
      .click();

    // FIX: Directly find and click the confirmation button.
    await page.getByRole("button", { name: "Изтрий потребител" }).click();

    await expect(
      page.getByRole("row", { name: /NORMAL NAME/i })
    ).not.toBeVisible();
  });
});
