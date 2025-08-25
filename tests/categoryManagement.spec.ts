import { test, expect, Page } from "@playwright/test";

// Base URL for the application
const BASE_URL = "http://localhost:5173";

// --- MOCK DATA ---
const MOCK_ADMIN_ROLE = {
  __typename: "Role",
  _id: "650000000000000000000003",
  name: "админ",
};
const MOCK_EXPERT_USER = {
  __typename: "User",
  _id: "user001",
  name: "Експерт Потребител",
  username: "expert_user",
  role: { _id: "650000000000000000000002" },
};
const MOCK_MANAGER_USER = {
  __typename: "User",
  _id: "user002",
  name: "Админ Потребител",
  username: "admin_user",
  role: { _id: "650000000000000000000003" },
};

const MOCK_CATEGORIES = [
  {
    __typename: "Category",
    _id: "cat001",
    name: "Пълна Категория",
    problem: "<p>Има проблем.</p>",
    suggestion: "<p>Има предложение.</p>",
    experts: [MOCK_EXPERT_USER],
    managers: [MOCK_MANAGER_USER],
    cases: [{ __typename: "Case", _id: "case001", status: "OPEN" }],
    archived: false,
  },
  {
    __typename: "Category",
    _id: "cat002",
    name: "Празна Категория",
    problem: "<p>Няма проблем.</p>",
    suggestion: "<p>Няма предложение.</p>",
    experts: [],
    managers: [],
    cases: [],
    archived: false,
  },
];

// --- API MOCKING ---
const mockApiRequests = async (page: Page) => {
  await page.route("**/graphql", async (route) => {
    const json = route.request().postDataJSON();
    switch (json.operationName) {
      case "GetMe":
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              me: {
                _id: "admin123",
                username: "admin",
                name: "Admin User",
                role: MOCK_ADMIN_ROLE,
                managed_categories: [],
              },
            },
          }),
        });
      case "GetAllLeanCategories":
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: { getAllLeanCategories: MOCK_CATEGORIES },
          }),
        });
      case "CountCategories":
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: { countCategories: MOCK_CATEGORIES.length },
          }),
        });
      case "CountCases":
      case "CountFilteredCases":
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: { countCases: 1, countFilteredCases: 1 },
          }),
        });
      case "GetLeanUsers":
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: { getLeanUsers: [MOCK_EXPERT_USER, MOCK_MANAGER_USER] },
          }),
        });
      case "CreateCategory":
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: { createCategory: { _id: "newCat123" } },
          }),
        });
      case "UpdateCategory":
        return route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { updateCategory: { _id: "cat001" } } }),
        });
      case "DeleteCategory":
        return route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { deleteCategory: { _id: "cat002" } } }),
        });
      default:
        return route.continue();
    }
  });
};

const gotoCategoryManagementPage = async (page: Page) => {
  await page.goto(`${BASE_URL}/category-management`);
  await expect(
    page.getByRole("heading", { name: "Управление на категории" })
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Празна Категория", exact: true })
  ).toBeVisible({ timeout: 10000 });
};

// --- TESTS ---
test.describe("Category Management Page", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRequests(page);
  });

  test("1.1: Initial elements are displayed correctly", async ({ page }) => {
    await gotoCategoryManagementPage(page);
    await expect(page.getByText(/Общо Сигнали/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Създай Категория" })
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Пълна Категория", exact: true })
    ).toBeVisible();
  });

  test('2.1: "Create Category" button opens the modal', async ({ page }) => {
    await gotoCategoryManagementPage(page);
    await page.getByRole("button", { name: "Създай Категория" }).click();

    const modal = page.getByRole("dialog", { name: "Създай нова категория" });
    await expect(modal).toBeVisible();
    await expect(modal.getByLabel("Име на категория*")).toBeEmpty();
  });

  test("2.2: Form shows validation errors", async ({ page }) => {
    await gotoCategoryManagementPage(page);
    await page.getByRole("button", { name: "Създай Категория" }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await modal.getByRole("button", { name: "Създай категория" }).click();

    await expect(
      modal.getByText("Името на категорията е задължително.")
    ).toBeVisible();
  });

  test("2.3: Successfully creates a new category", async ({ page }) => {
    await gotoCategoryManagementPage(page);
    await page.getByRole("button", { name: "Създай Категория" }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    await modal.getByLabel("Име на категория*").fill("Нова Тестова Категория");
    await modal.locator(".ProseMirror").first().fill("Описание на проблем");
    await modal.locator(".ProseMirror").last().fill("Описание на предложение");
    await modal.getByRole("button", { name: "Създай категория" }).click();

    await expect(page.getByRole("heading", { name: "Успех!" })).toBeVisible();
  });

  test("3.1: Edit button opens modal with data", async ({ page }) => {
    await gotoCategoryManagementPage(page);
    await page
      .getByRole("row", { name: /Пълна Категория/i })
      .getByRole("button", { name: "Редактирай" })
      .click();

    const modal = page.getByRole("dialog", { name: "Редактирай категория" });
    await expect(modal).toBeVisible();
    await expect(modal.getByLabel("Име на категория*")).toHaveValue(
      "Пълна Категория"
    );
  });

  test("3.2: Successfully edits a category", async ({ page }) => {
    await gotoCategoryManagementPage(page);
    await page
      .getByRole("row", { name: /Пълна Категория/i })
      .getByRole("button", { name: "Редактирай" })
      .click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await modal.getByLabel("Име на категория*").fill("Редактирана Категория");
    await modal.getByRole("button", { name: "Запази промените" }).click();

    await expect(page.getByRole("heading", { name: "Успех!" })).toBeVisible();
  });

  test("4.1: Delete button is absent for categories with associations", async ({
    page,
  }) => {
    await gotoCategoryManagementPage(page);
    const fullCategoryRow = page.getByRole("row", { name: /Пълна Категория/i });
    await expect(
      fullCategoryRow.getByRole("button", { name: "Изтрий" })
    ).toHaveCount(0);
  });

  test("4.2: Delete button opens confirmation for empty category", async ({
    page,
  }) => {
    await gotoCategoryManagementPage(page);
    await page
      .getByRole("row", { name: /Празна Категория/i })
      .getByRole("button", { name: "Изтрий" })
      .click();

    await expect(
      page.getByRole("heading", { name: "Потвърди изтриването" })
    ).toBeVisible();
    await expect(page.getByText(/Сигурни ли сте/)).toBeVisible();
  });

  test("4.3: Successfully deletes a category", async ({ page }) => {
    let currentCategories = [...MOCK_CATEGORIES];

    await page.route("**/graphql", async (route) => {
      const json = route.request().postDataJSON();
      switch (json.operationName) {
        case "GetMe":
          return route.fulfill({
            status: 200,
            body: JSON.stringify({
              data: {
                me: {
                  _id: "admin123",
                  username: "admin",
                  name: "Admin User",
                  role: MOCK_ADMIN_ROLE,
                  managed_categories: [],
                },
              },
            }),
          });
        case "GetAllLeanCategories":
          return route.fulfill({
            status: 200,
            body: JSON.stringify({
              data: { getAllLeanCategories: currentCategories },
            }),
          });
        case "CountCategories":
          return route.fulfill({
            status: 200,
            body: JSON.stringify({
              data: { countCategories: currentCategories.length },
            }),
          });
        case "DeleteCategory":
          const catIdToDelete = json.variables.id;
          currentCategories = currentCategories.filter(
            (cat) => cat._id !== catIdToDelete
          );
          return route.fulfill({
            status: 200,
            body: JSON.stringify({
              data: { deleteCategory: { _id: catIdToDelete } },
            }),
          });
        case "CountCases":
        case "CountFilteredCases":
          return route.fulfill({
            status: 200,
            body: JSON.stringify({
              data: { countCases: 1, countFilteredCases: 1 },
            }),
          });
        default:
          return route.continue();
      }
    });

    await gotoCategoryManagementPage(page);
    await page
      .getByRole("row", { name: /Празна Категория/i })
      .getByRole("button", { name: "Изтрий" })
      .click();

    await expect(
      page.getByRole("heading", { name: "Потвърди изтриването" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Изтрий" }).click();

    await expect(page.getByRole("heading", { name: "Успех!" })).toBeVisible();
    await expect(
      page.getByText("Категорията е изтрита успешно!")
    ).toBeVisible();

    // FIX: Changed getByCell to the correct getByRole('cell', ...)
    await expect(
      page.getByRole("cell", { name: "Празна Категория", exact: true })
    ).not.toBeVisible();
  });
});
