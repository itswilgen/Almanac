import { test, expect, type Page } from "@playwright/test";
import { addDays, todayIn } from "../src/lib/dates";
const password = "a private synthetic journal";
async function screenshot(page: Page, name: string, width: number) {
  await page.setViewportSize({ width, height: 1000 });
  await page.screenshot({
    path: `test-results/screenshots/${name}-${width}.png`,
    fullPage: !(await page.getByRole("dialog").isVisible()),
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    `${name} fits ${width}px`,
  ).toBe(true);
}
test("complete private journal journey, responsive pages, and recoverable errors", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  const email = `journey-${Date.now()}@example.test`,
    today = todayIn("Asia/Manila");
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Get to know/ }),
  ).toBeVisible();
  for (const w of [375, 768, 1440]) await screenshot(page, "landing", w);
  await page.getByRole("link", { name: "Start your private journal" }).click();
  await page.getByLabel("Your name").fill("Jamie");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create my journal" }).click();
  await expect(
    page.getByRole("heading", { name: "A journal that fits you." }),
  ).toBeVisible();
  await page.getByLabel("Timezone").selectOption("Asia/Manila");
  await page.getByRole("radio", { name: /Understand my period/ }).check();
  await page.getByRole("checkbox", { name: /A daily moment/ }).check();
  await page.getByRole("button", { name: "Open my journal" }).click();
  await expect(
    page.getByRole("heading", { name: "A moment for you, Jamie." }),
  ).toBeVisible();
  await expect(page.getByText("Getting to know your cycle")).toBeVisible();
  await screenshot(page, "empty-journal", 375);
  for (const days of [99, 70, 41, 12]) {
    await page.getByRole("button", { name: "Log period", exact: true }).click();
    await page.getByLabel("Start date").fill(addDays(today, -days));
    await page.getByLabel("My period is still ongoing").uncheck();
    await page
      .getByLabel("End date", { exact: true })
      .fill(addDays(today, -days + 4));
    await page.getByRole("button", { name: "Save entry" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByText("Your entry has been saved.")).toBeVisible();
  }
  await expect(page.locator(".estimate-label")).toBeVisible();
  for (const w of [375, 768, 1440]) await screenshot(page, "journal", w);
  const selectedDay = page.locator(`[data-date="${today}"]`);
  await selectedDay.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.locator(`[data-date="${addDays(today, 1)}"]`),
  ).toBeFocused();
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await page.getByRole("button", { name: "Add check-in", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Bleeding", exact: true })
    .selectOption("light");
  await page
    .getByRole("combobox", { name: "Cramps", exact: true })
    .selectOption("mild");
  await page
    .getByRole("combobox", { name: "Mood", exact: true })
    .selectOption("calm");
  await page
    .getByLabel("A note to yourself")
    .fill("A synthetic note for testing.");
  for (const w of [375, 768, 1440]) await screenshot(page, "entry-form", w);
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() =>
        Boolean(document.activeElement?.closest("dialog")),
      ),
    ).toBe(true);
  }
  await page.route("**/api/symptoms", (route) => route.abort("failed"));
  await page.getByRole("button", { name: "Save entry" }).click();
  await expect(page.getByRole("alert")).toContainText("Unable to connect");
  await expect(page.getByLabel("A note to yourself")).toHaveValue(
    "A synthetic note for testing.",
  );
  await page.unroute("**/api/symptoms");
  await page.getByRole("button", { name: "Save entry" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.reload();
  await expect(page.getByText("A synthetic note for testing.")).toBeVisible();
  await page.getByRole("link", { name: "Cycle history", exact: true }).click();
  for (const w of [375, 768, 1440]) await screenshot(page, "history", w);
  await expect(
    page.getByRole("cell", { name: "29 days", exact: true }),
  ).toHaveCount(3);
  await page
    .getByRole("button", {
      name: `Edit period starting ${addDays(today, -12)}`,
    })
    .click();
  await page.getByLabel("End date", { exact: true }).fill(addDays(today, -7));
  await page.getByRole("button", { name: "Save entry" }).click();
  await expect(
    page.getByRole("cell", { name: "6 days", exact: true }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export records" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("almanac-records.csv");
  await page
    .getByRole("button", {
      name: `Edit period starting ${addDays(today, -99)}`,
    })
    .click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Delete entry", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("link", { name: "My journal" }).click();
  await expect(page.getByText("Log at least four period starts")).toBeVisible();
  await page
    .getByRole("link", { name: "A little knowledge", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "A little knowledge." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Family planning", exact: true })
    .click();
  await expect(page.locator(".article-card")).toHaveCount(2);
  await page.getByRole("link", { name: /Awareness begins/ }).click();
  await expect(
    page.getByRole("heading", { name: "Awareness begins with understanding" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  for (const w of [375, 768, 1440]) await screenshot(page, "settings", w);
  await page.getByLabel("Your name").fill("Jamie Test");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(
    page.getByText("Your preferences have been saved."),
  ).toBeVisible();
  await page.getByRole("button", { name: /Sign out/ }).click();
  await expect(
    page.getByRole("heading", { name: "Good to have you here." }),
  ).toBeVisible();
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("wrong password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("incorrect");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A moment for you, Jamie." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete account", exact: true })
    .click();
  await page.getByLabel("Confirm your password").fill(password);
  await page.getByRole("button", { name: "Permanently delete" }).click();
  await expect(
    page.getByRole("heading", { name: /Get to know/ }),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});
test("live CSRF rejection, private session cookie, and session invalidation", async ({
  request,
}) => {
  const csrf = await request.get("/api/csrf");
  expect(csrf.status()).toBe(200);
  const cookies = await request.storageState();
  const session = cookies.cookies.find((c) => c.name === "almanac_session");
  expect(session?.httpOnly).toBe(true);
  expect(session?.sameSite).toBe("Lax");
  const missing = await request.post("/api/login", {
    data: { email: "nobody@example.test", password: "no token" },
  });
  expect(missing.status()).toBe(419);
  const token = (await csrf.json()).token;
  const email = `security-${Date.now()}@example.test`;
  const created = await request.post("/api/register", {
    headers: { "X-CSRF-TOKEN": token },
    data: {
      name: "Synthetic Security",
      email,
      password,
      password_confirmation: password,
      timezone: "Asia/Manila",
    },
  });
  expect(created.status()).toBe(201);
  const state = await request.storageState();
  const authCookie = state.cookies.find((c) => c.name === "almanac_session")!;
  expect(authCookie.value).not.toBe(session?.value);
  const token2 = (await (await request.get("/api/csrf")).json()).token;
  expect(
    (
      await request.delete("/api/account", {
        headers: { "X-CSRF-TOKEN": token2 },
        data: { password },
      })
    ).status(),
  ).toBe(204);
  expect((await request.get("/api/journal")).status()).toBe(401);
});

test("local recovery email resets password and revokes existing sessions", async ({
  page,
  request,
}) => {
  const { readdirSync, readFileSync, unlinkSync, existsSync } =
    await import("node:fs");
  const dir = new URL(
    "../../backend/storage/app/private/mail/",
    import.meta.url,
  );
  const before = new Set<string>(existsSync(dir) ? readdirSync(dir) : []);
  const email = `recovery-${Date.now()}@example.test`;
  const csrf = (await (await request.get("/api/csrf")).json()).token;
  expect(
    (
      await request.post("/api/register", {
        headers: { "X-CSRF-TOKEN": csrf },
        data: {
          name: "Synthetic Recovery",
          email,
          password,
          password_confirmation: password,
          timezone: "Asia/Manila",
        },
      })
    ).status(),
  ).toBe(201);
  await page.goto("/forgot-password");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Send recovery link" }).click();
  await expect(page.getByRole("status")).toContainText("If an account matches");
  const filename = readdirSync(dir).find((f) => !before.has(f))!;
  expect(filename).toBeTruthy();
  const mail = readFileSync(new URL(filename, dir), "utf8")
    .replace(/=\r?\n/g, "")
    .replace(/=3D/g, "=");
  const match = mail.match(
    /https?:\/\/[^\s<>"']+\/reset-password\?token=[^\s<>"']+/,
  );
  expect(match).toBeTruthy();
  const link = new URL(match![0].replaceAll("&amp;", "&"));
  await page.goto(link.pathname + link.search);
  await page
    .getByLabel("Password", { exact: true })
    .fill("updated private journal phrase");
  await page
    .getByLabel("Confirm password")
    .fill("updated private journal phrase");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByRole("status")).toContainText("Password updated");
  expect((await request.get("/api/user")).status()).toBe(401);
  await page.getByRole("link", { name: "Return to sign in" }).click();
  await page.getByLabel("Email address").fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("updated private journal phrase");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A journal that fits you." }),
  ).toBeVisible();
  const token = (await (await page.request.get("/api/csrf")).json()).token;
  expect(
    (
      await page.request.delete("/api/account", {
        headers: { "X-CSRF-TOKEN": token },
        data: { password: "updated private journal phrase" },
      })
    ).status(),
  ).toBe(204);
  unlinkSync(new URL(filename, dir));
});
