#!/usr/bin/env node
/**
 * scripts/screenshots.mjs — the interface screenshots of addendum 2.11 (D41).
 *
 * Section 3.1 of the thesis shows the interface, so every page needs a shot at
 * a fixed width, in Uzbek, against a database seeded with `seed_thesis_demo`.
 * This script takes them; it does not invent them. It needs a running frontend
 * and backend and a real account, so it is run on a machine that has both.
 *
 * Determinism is the point. Two runs over the same seed must produce the same
 * figures, or a figure in the thesis cannot be reproduced at the defence.
 * Hence: one fixed viewport per width, a fixed device scale, the light colour
 * scheme whatever the machine prefers, animations and transitions off, the
 * caret and focus rings hidden, and a wait for the network *and* the app's own
 * loading spinner before the shutter. The graph pages default to the `lev`
 * layout, which is deterministic (stage 7), so the same graph comes out the
 * same way rather than however dagre happened to settle.
 *
 * Usage
 *   npm run screenshots -- --out ~/Desktop/neuro_dj/docs/ui
 *
 *   --base <url>       frontend origin (default http://localhost:8080)
 *   --api <url>        backend origin (default http://localhost:8000)
 *   --out <dir>        output directory; files land in <out>/<lang>/ (default docs/ui)
 *   --widths <list>    viewport widths (default 1440,1280,768)
 *   --lang <code>      uz | en (default uz)
 *   --pages <list>     page names, comma separated (default: all; --list prints them)
 *   --topic <id>       the topic the topic and practice pages open
 *                      (default: the first topic this account's trajectory offers)
 *   --email <address>  account to sign in as (or SCREENSHOT_EMAIL)
 *   --password <text>  its password (or SCREENSHOT_PASSWORD)
 *   --scale <n>        device pixel ratio (default 2)
 *   --viewport-only    shoot the viewport instead of the whole page
 *   --list             print the page names and exit
 *
 * The instructor and admin pages need an account with the role (D15); with a
 * student account they are recorded as skipped rather than shot after a
 * redirect. Run it twice — once as a student, once as the staff account — to
 * cover every page. `manifest.json` records what was taken, what was skipped
 * and why, the topic id, the commit and the settings, so a figure in chapter
 * III can be traced back to the run that produced it.
 *
 * Playwright is not a dependency of the app, so install it first:
 *   npm i -D playwright && npx playwright install chromium
 */

import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

/** Every page of the interface, with what has to be on screen before the shot. */
const PAGES = [
  { name: "landing", route: "/", anonymous: true },
  { name: "auth", route: "/auth", anonymous: true },
  { name: "dashboard", route: "/dashboard" },
  { name: "learning-path", route: "/learning-path", ready: "[data-testid='learning-path-canvas']" },
  { name: "assessment", route: "/assessment" },
  { name: "mistakes", route: "/mistakes" },
  { name: "profile", route: "/profile" },
  { name: "topic", route: "/topic/{topic}", needsTopic: true },
  { name: "practice", route: "/topic/{topic}/assessment?mode=practice", needsTopic: true },
  {
    name: "curriculum-builder",
    route: "/instructor/curriculum-builder",
    roles: ["instructor", "admin"],
  },
  {
    name: "course-structure",
    route: "/instructor/curriculum-builder",
    roles: ["instructor", "admin"],
    // The structure editor of D39: the tree and the node editor.
    prepare: async (page) => {
      await page.getByTestId("builder-mode-edit").click();
      await page.waitForSelector("[data-testid='course-structure-editor']");
    },
  },
  {
    name: "prerequisite-editor",
    route: "/instructor/curriculum-builder",
    roles: ["instructor", "admin"],
    // The prerequisite editor is the second tab of that mode.
    prepare: async (page) => {
      await page.getByTestId("builder-mode-edit").click();
      await page.getByTestId("tab-prerequisites").click();
      await page.waitForSelector("[data-testid='prerequisite-editor']");
    },
  },
  { name: "users", route: "/admin/users", roles: ["admin"] },
];

const { values: flags } = parseArgs({
  options: {
    base: { type: "string", default: "http://localhost:8080" },
    api: { type: "string", default: "http://localhost:8000" },
    out: { type: "string", default: "docs/ui" },
    widths: { type: "string", default: "1440,1280,768" },
    lang: { type: "string", default: "uz" },
    pages: { type: "string" },
    topic: { type: "string" },
    email: { type: "string" },
    password: { type: "string" },
    scale: { type: "string", default: "2" },
    "viewport-only": { type: "boolean", default: false },
    list: { type: "boolean", default: false },
  },
});

if (flags.list) {
  for (const entry of PAGES) console.log(entry.name);
  process.exit(0);
}

const fail = (message) => {
  console.error(`screenshots: ${message}`);
  process.exit(1);
};

const widths = flags.widths
  .split(",")
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isFinite(value) && value > 0);
if (widths.length === 0) fail("--widths needs at least one positive number");

const wanted = flags.pages ? flags.pages.split(",").map((name) => name.trim()) : null;
if (wanted) {
  const unknown = wanted.filter((name) => !PAGES.some((entry) => entry.name === name));
  if (unknown.length > 0) fail(`unknown page(s): ${unknown.join(", ")} (try --list)`);
}
const targets = wanted ? PAGES.filter((entry) => wanted.includes(entry.name)) : PAGES;
const needsAccount = targets.some((entry) => !entry.anonymous);

const email = flags.email ?? process.env.SCREENSHOT_EMAIL;
const password = flags.password ?? process.env.SCREENSHOT_PASSWORD;
if (needsAccount && (!email || !password)) {
  fail(
    "every page but the landing and the sign-in form needs an account: pass " +
      "--email/--password or set SCREENSHOT_EMAIL/SCREENSHOT_PASSWORD",
  );
}

const scale = Number(flags.scale);
if (!Number.isFinite(scale) || scale <= 0) fail("--scale needs a positive number");

/** 16:10 on a desktop width, portrait tablet below it. */
const heightFor = (width) => (width >= 1024 ? Math.round(width * 0.625) : 1024);

/** No transition may be caught half-way: a fade differs between runs. */
const STILL_CSS =
  "*, *::before, *::after { animation: none !important; transition: none !important; " +
  "caret-color: transparent !important; } *:focus, *:focus-visible { outline: none !important; " +
  "box-shadow: none !important; }";

let playwright;
try {
  playwright = await import("playwright");
} catch {
  fail(
    "playwright is not installed. Run:\n" +
      "  npm i -D playwright && npx playwright install chromium",
  );
}

/** The commit the interface was built from, for the manifest. */
const commit = (() => {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
})();

/**
 * The account's role and the topic to open, read from the API rather than
 * guessed from the interface: the role is what the route guards check (D15),
 * and the topic comes from this learner's own trajectory, so the shot shows a
 * topic they have actually worked on.
 *
 * Login is CSRF-checked, cookie session or not (D16), so the token is fetched
 * first and sent back in the header, exactly as the SPA does.
 */
async function identify(request) {
  const outcome = { role: "anonymous", topic: flags.topic ?? null, error: null };
  if (!needsAccount) return outcome;
  try {
    const csrf = await request.get(`${flags.api}/api/accounts/csrf/`);
    const { csrfToken } = csrf.ok() ? await csrf.json() : {};
    const login = await request.post(`${flags.api}/api/accounts/token/`, {
      data: { email, password },
      headers: csrfToken ? { "X-CSRFToken": csrfToken } : {},
    });
    if (!login.ok()) {
      outcome.error = `login failed (${login.status()})`;
      return outcome;
    }
    const { access } = await login.json();
    const headers = { Authorization: `Bearer ${access}` };

    const profile = await request.get(`${flags.api}/api/accounts/profile/`, { headers });
    if (profile.ok()) outcome.role = (await profile.json()).role ?? "student";

    if (outcome.topic === null) {
      const trajectory = await request.get(`${flags.api}/api/learning/trajectory/`, { headers });
      if (trajectory.ok()) {
        const body = await trajectory.json();
        const item = body.next ?? body.items?.[0];
        if (item) outcome.topic = String(item.topic_id);
      }
    }
  } catch (error) {
    outcome.error = String(error);
  }
  return outcome;
}

/** Sign in through the form, so the session is exactly a real one (D16). */
async function signIn(page) {
  await page.goto(`${flags.base}/auth`, { waitUntil: "networkidle" });
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click("form button[type='submit']");
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 20_000 });
  await settle(page);
}

/** Wait for the network and for the app's own loading spinner to go away. */
async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page
    .waitForFunction(() => !document.querySelector("[role='status'][aria-label='loading']"), {
      timeout: 20_000,
    })
    .catch(() => {});
  // Two frames, so a layout that settles after the first paint is stable.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

const outDir = path.resolve(flags.out, flags.lang);
await mkdir(outDir, { recursive: true });

const browser = await playwright.chromium.launch();
const request = await playwright.request.newContext();
const { role, topic, error } = await identify(request);
if (error) fail(error);
if (needsAccount) console.log(`account: ${email} (role: ${role}), topic: ${topic ?? "none"}`);

const taken = [];
const skipped = [];

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: heightFor(width) },
    deviceScaleFactor: scale,
    // The thesis figures are light; the machine's own setting must not leak in.
    colorScheme: "light",
    reducedMotion: "reduce",
    locale: flags.lang === "uz" ? "uz-UZ" : "en-US",
  });

  // The language is a localStorage preference (lib/i18n.ts), and the style
  // goes in before the first render, so no page flashes the fallback language
  // or an animation. addInitScript runs on every navigation, addStyleTag only
  // on the document already open.
  await context.addInitScript(
    ({ lang, css }) => {
      try {
        localStorage.setItem("neurolearn.lang", lang);
      } catch {
        // A private window may refuse storage; the fallback language is fine.
      }
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.textContent = css;
        document.head.append(style);
      });
    },
    { lang: flags.lang, css: STILL_CSS },
  );

  const page = await context.newPage();
  if (needsAccount) await signIn(page);

  for (const target of targets) {
    if (target.needsTopic && !topic) {
      skipped.push({ page: target.name, width, reason: "no topic id (pass --topic)" });
      continue;
    }
    if (target.roles && !target.roles.includes(role)) {
      skipped.push({ page: target.name, width, reason: `needs role ${target.roles.join(" or ")}` });
      continue;
    }

    const route = target.route.replace("{topic}", topic ?? "");
    await page.goto(`${flags.base}${route}`, { waitUntil: "networkidle" });

    // A guard redirects rather than rendering; record that instead of shooting
    // whatever page the browser landed on.
    const landed = new URL(page.url()).pathname;
    if (landed !== route.split("?")[0]) {
      skipped.push({ page: target.name, width, reason: `redirected to ${landed}` });
      continue;
    }

    if (target.ready) await page.waitForSelector(target.ready, { timeout: 20_000 });
    if (target.prepare) await target.prepare(page);
    await settle(page);

    const file = path.join(outDir, `${target.name}-${width}.png`);
    await page.screenshot({ path: file, fullPage: !flags["viewport-only"] });
    taken.push({ page: target.name, route, width, file: path.basename(file) });
    console.log(`${width}px  ${target.name} → ${file}`);
  }

  await context.close();
}

await request.dispose();
await browser.close();

const manifest = {
  taken_at: new Date().toISOString(),
  base: flags.base,
  language: flags.lang,
  widths,
  device_scale_factor: scale,
  full_page: !flags["viewport-only"],
  account_role: role,
  topic_id: topic ? Number(topic) : null,
  frontend_commit: commit,
  screenshots: taken,
  skipped,
};
await writeFile(
  path.join(outDir, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(`\n${taken.length} screenshot(s) in ${outDir}`);
if (skipped.length > 0) {
  console.log(`${skipped.length} skipped:`);
  for (const entry of skipped) console.log(`  ${entry.page} @ ${entry.width}px — ${entry.reason}`);
}
