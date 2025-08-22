import { test, expect, Page } from "@playwright/test";

// Base URL for the application
const BASE_URL = "http://localhost:5173";

/**
 * Mocks the necessary GraphQL queries for the Case Submission page.
 * Mocks getActiveCategories to provide categories for the dropdown.
 * Mocks getLeanUserByUsername for username validation and autofill.
 * @param page The Playwright Page object.
 */
const mockApiRequests = async (page: Page) => {
  await page.route("**/graphql", async (route) => {
    const request = route.request();
    const json = request.postDataJSON();

    // Mock for fetching categories
    if (json.operationName === "GetActiveCategories") {
      return await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            getLeanActiveCategories: [
              { _id: "cat1", name: "БЕЗОПАСНОСТ" },
              { _id: "cat2", name: "ДОКУМЕНТИ" },
              { _id: "cat3", name: "ДОСТАВКИ" },
            ],
          },
        }),
      });
    }

    // Mock for searching user by username
    if (json.operationName === "GetUserByUsername") {
      if (json.variables.username === "testuser") {
        return await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              getLeanUserByUsername: {
                _id: "user123",
                name: "Тест Потребител",
              },
            },
          }),
        });
      }
      // Simulate user not found
      return await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { getLeanUserByUsername: null } }),
      });
    }

    // Mock for the final case creation
    if (json.operationName === "CreateCase") {
      return await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            createCase: { _id: "case456", case_number: 101 },
          },
        }),
      });
    }

    // Continue with the actual request for any other GraphQL operation
    return await route.continue();
  });
};

/**
 * Helper function to navigate to the Problem submission page.
 * @param page The Playwright Page object.
 */
const gotoProblemPage = async (page: Page) => {
  await page.goto(`${BASE_URL}/submit-case?type=problem`);
  await expect(
    page.getByRole("heading", { name: /Подаване на проблем/i })
  ).toBeVisible();
};

/**
 * Helper function to navigate to the Suggestion submission page.
 * @param page The Playwright Page object.
 */
const gotoSuggestionPage = async (page: Page) => {
  await page.goto(`${BASE_URL}/submit-case?type=suggestion`);
  await expect(
    page.getByRole("heading", { name: /Подаване на предложение/i })
  ).toBeVisible();
};

test.describe("Case Submission Page", () => {
  test.beforeEach(async ({ page }) => {
    // Mock APIs before each test
    await mockApiRequests(page);
  });

  test('1.1: Displays correct elements for a "Problem"', async ({ page }) => {
    await gotoProblemPage(page);

    await expect(
      page.getByText("Моля, попълнете формуляра по-долу")
    ).toBeVisible();

    // Check for form labels using regular expressions to account for asterisks
    await expect(page.getByLabel(/Потребителско име/)).toBeVisible();
    await expect(page.getByLabel(/Име и фамилия/)).toBeVisible();
    await expect(page.getByText(/Описание/)).toBeVisible();
    await expect(page.getByText(/Прикачени файлове/)).toBeVisible();
    await expect(page.getByText(/Приоритет/)).toBeVisible();
    await expect(page.getByText(/Категории/)).toBeVisible();

    // Check for buttons
    await expect(page.getByRole("button", { name: "Изпрати" })).toBeVisible();
    await expect(page.getByRole("button", { name: "← Назад" })).toBeVisible();
    await expect(page.getByRole("button", { name: "❓ Помощ" })).toBeVisible();

    // Check that the "Low" priority radio is checked by default
    await expect(
      page.locator('input[type="radio"][value="LOW"]')
    ).toBeChecked();
  });

  test('1.2: Displays correct elements for a "Suggestion"', async ({
    page,
  }) => {
    await gotoSuggestionPage(page);
    await expect(
      page.getByText("Моля, попълнете формуляра по-долу")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Изпрати" })).toBeVisible();
  });

  test('1.3: "Back" button navigates to the home page', async ({ page }) => {
    await gotoProblemPage(page);
    await page.getByRole("button", { name: "← Назад" }).click();
    await expect(page).toHaveURL(BASE_URL + "/");
  });

  test("2.1: Shows validation errors for required fields", async ({ page }) => {
    await gotoProblemPage(page);

    await page.getByRole("button", { name: "Изпрати" }).click();

    // Based on the screenshot, the username error appears first in a toast.
    await expect(
      page.getByText("Моля, въведете валидно потребителско име.")
    ).toBeVisible();
  });

  test("2.2: User search autofills full name and handles not found users", async ({
    page,
  }) => {
    await gotoProblemPage(page);

    // Test valid user
    await page.getByLabel(/Потребителско име/).fill("testuser");
    await expect(page.getByLabel(/Име и фамилия/)).toHaveValue(
      "Тест Потребител",
      { timeout: 5000 }
    );

    // Test invalid user
    await page.getByLabel(/Потребителско име/).fill("invaliduser");
    await page.waitForTimeout(1000); // Wait for debounce
    await expect(
      page.getByText('Потребител "invaliduser" не е намерен.')
    ).toBeVisible();
  });

  test("2.3: Successful submission shows success modal and redirects", async ({
    page,
  }) => {
    await gotoProblemPage(page);

    // Fill the form
    await page.getByLabel(/Потребителско име/).fill("testuser");
    await expect(page.getByLabel(/Име и фамилия/)).toHaveValue(
      "Тест Потребител"
    );

    // Fill description in TextEditor
    await page
      .locator(".ProseMirror")
      .fill("Това е описание на проблема от теста.");

    // Click the category button directly by its name provided in the mock
    await page.getByRole("button", { name: "БЕЗОПАСНОСТ" }).click();

    // Click submit
    await page.getByRole("button", { name: "Изпрати" }).click();

    // FIX: Wait for the custom success modal to appear and check its content
    await expect(
      page.getByRole("heading", { name: "Изпратено Успешно!" })
    ).toBeVisible();
    await expect(page.getByText("Сигналът е изпратен успешно!")).toBeVisible();

    // Verify the redirect after the modal automatically closes
    await expect(page).toHaveURL(BASE_URL + "/", { timeout: 10000 }); // Increased timeout for modal
  });
});
