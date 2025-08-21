import { test, expect, Page } from "@playwright/test";

// Base URL for the application
const BASE_URL = "http://localhost:5173"; // Assuming default Vite port
const endpoint = "http://localhost:3001"; // Define the backend API endpoint

/**
 * Helper function to navigate to the home page and wait for it to be ready.
 * @param page - The Playwright Page object.
 */
const gotoHomePage = async (page: Page) => {
  await page.goto(BASE_URL);
  // Wait for a key static element (the main image) to be visible.
  await expect(page.getByAltText("VOE Image")).toBeVisible({ timeout: 10000 });
};

/**
 * Helper function to switch from the default case submission view to the login view.
 * @param page - The Playwright Page object.
 */
const switchToLoginView = async (page: Page) => {
  // Corrected selector based on screenshot text
  await page.getByRole("button", { name: /Влез в профила си/i }).click();
  // Wait for the login form to be visible to ensure the view has changed
  await expect(page.getByPlaceholder(/Потребител/i)).toBeVisible();
};

test.describe("Home Page: Default View (Case Submission)", () => {
  test("1.1: Initial elements are displayed correctly", async ({ page }) => {
    await gotoHomePage(page);

    // Check for the main title and subtitle
    await expect(
      page.getByRole("heading", { name: /ГЛАСЪТ НА СЛУЖИТЕЛИТЕ/i })
    ).toBeVisible();
    await expect(page.getByText(/Подай сигнал/i)).toBeVisible();

    // Corrected selectors for action buttons
    await expect(
      page.getByRole("button", { name: /^ПРОБЛЕМ$/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /ПОДОБРЕНИЕ/i })
    ).toBeVisible();

    // Corrected selector for the link to switch to the login form
    await expect(
      page.getByRole("button", { name: /Влез в профила си/i })
    ).toBeVisible();

    // Check that the main illustration is visible
    await expect(page.getByAltText("VOE Image")).toBeVisible();
  });

  test('1.2: "Problem" button navigates correctly', async ({ page }) => {
    await gotoHomePage(page);

    // Corrected selector to look for a link with the specific text
    await page.getByRole("link", { name: /ПРОБЛЕМ/i }).click();

    // Verify the URL has changed as expected
    await expect(page).toHaveURL(`${BASE_URL}/submit-case?type=problem`);
  });

  test('1.3: "Improvement" button navigates correctly', async ({ page }) => {
    await gotoHomePage(page);

    // Corrected selector to look for a link with the specific text
    await page.getByRole("link", { name: /ПОДОБРЕНИЕ/i }).click();

    // Verify the URL has changed as expected
    await expect(page).toHaveURL(`${BASE_URL}/submit-case?type=suggestion`);
  });

  test("1.4: Successfully switches to the Login View", async ({ page }) => {
    await gotoHomePage(page);
    await switchToLoginView(page);

    // Verify case submission buttons are gone
    await expect(
      page.getByRole("button", { name: /^ПРОБЛЕМ$/i })
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: /ПОДОБРЕНИЕ/i })
    ).not.toBeVisible();

    // Verify login form elements are now visible
    await expect(page.getByPlaceholder(/Потребител/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Парола/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "ВЛЕЗ" })).toBeVisible();

    // Verify the subtitle has updated
    await expect(page.getByText("Влез в профила си")).toBeVisible();
  });
});

test.describe("Home Page: Login View", () => {
  test("2.1: Login form elements are displayed correctly", async ({ page }) => {
    await gotoHomePage(page);
    await switchToLoginView(page);

    // Check for input fields
    await expect(page.getByPlaceholder(/Потребител/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Парола/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Потребител/i)).toBeEmpty();
    await expect(page.getByPlaceholder(/Парола/i)).toBeEmpty();

    // Check for login button
    await expect(page.getByRole("button", { name: "ВЛЕЗ" })).toBeEnabled();

    // Corrected selector for the link to switch back
    await expect(
      page.getByRole("button", { name: /Подай сигнал/i })
    ).toBeVisible();
  });

  test("2.2: Login with valid credentials redirects to dashboard", async ({
    page,
  }) => {
    await page.route(`${endpoint}/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Login successful" }),
      });
    });

    await gotoHomePage(page);
    await switchToLoginView(page);

    await page.getByPlaceholder(/Потребител/i).fill("testuser");
    await page.getByPlaceholder(/Парола/i).fill("password123");
    await page.getByRole("button", { name: "ВЛЕЗ" }).click();

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  test("2.3: Login with invalid credentials shows an error message", async ({
    page,
  }) => {
    await page.route(`${endpoint}/login`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid credentials" }),
      });
    });

    await gotoHomePage(page);
    await switchToLoginView(page);

    await page.getByPlaceholder(/Потребител/i).fill("wronguser");
    await page.getByPlaceholder(/Парола/i).fill("wrongpassword");
    await page.getByRole("button", { name: "ВЛЕЗ" }).click();

    await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
    await expect(page).toHaveURL(BASE_URL + "/");
    await expect(page.getByRole("button", { name: "ВЛЕЗ" })).toBeEnabled();
  });

  test("2.5: Successfully switches back to the Case Submission View", async ({
    page,
  }) => {
    await gotoHomePage(page);
    await switchToLoginView(page);

    // Corrected selector for the link to go back
    await page.getByRole("button", { name: /Подай сигнал/i }).click();

    // Verify login form is gone
    await expect(page.getByPlaceholder(/Потребител/i)).not.toBeVisible();
    await expect(page.getByPlaceholder(/Парола/i)).not.toBeVisible();

    // Verify case submission buttons are back
    await expect(
      page.getByRole("button", { name: /^ПРОБЛЕМ$/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /ПОДОБРЕНИЕ/i })
    ).toBeVisible();

    // Verify the subtitle has reverted
    await expect(page.getByText(/Подай сигнал/i).first()).toBeVisible();
  });
});
