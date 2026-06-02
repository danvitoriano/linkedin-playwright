import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./env.js";

loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.join(__dirname, "linkedin-auth.json");

const JOBS_URL =
  process.env.JOBS_RECOMMENDED_URL ??
  "https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4408717429&discover=recommended&discoveryOrigin=JOBS_HOME_JYMBII";

async function main() {
  if (!fs.existsSync(STATE_PATH)) {
    console.error("Sessão não encontrada. Rode: npm run login");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true, slowMo: 50 });
  const context = await browser.newContext({ storageState: STATE_PATH });
  const page = await context.newPage();

  await page.goto(JOBS_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(5000);

  // scroll to load more cards
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(800);
  }

  const raw = await page.evaluate(() => {
    const items: Array<Record<string, string | null>> = [];

    const cards = document.querySelectorAll(
      "li.scaffold-layout__list-item, div.job-card-container, ul li[data-occludable-job-id]",
    );

    cards.forEach((card) => {
      const titleEl = card.querySelector(
        "a.job-card-list__title, a.job-card-container__link, strong",
      );
      const companyEl = card.querySelector(
        ".job-card-container__company-name, .artdeco-entity-lockup__subtitle",
      );
      const metaEls = card.querySelectorAll(
        ".job-card-container__metadata-item, .job-card-container__metadata-wrapper li, .artdeco-entity-lockup__caption",
      );
      const linkEl = card.querySelector("a[href*='/jobs/view/']") as HTMLAnchorElement | null;

      const title = titleEl?.textContent?.trim() ?? null;
      if (!title) return;

      const metas = Array.from(metaEls)
        .map((el) => el.textContent?.trim())
        .filter(Boolean);

      items.push({
        title,
        company: companyEl?.textContent?.trim() ?? null,
        metadata: metas.join(" | ") || null,
        url: linkEl?.href ?? null,
        cardText: (card.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 500),
      });
    });

    // fallback: all job view links on page
    if (items.length === 0) {
      document.querySelectorAll("a[href*='/jobs/view/']").forEach((a) => {
        const anchor = a as HTMLAnchorElement;
        const title = anchor.textContent?.trim();
        if (!title || title.length < 3) return;
        items.push({
          title,
          company: null,
          metadata: null,
          url: anchor.href,
          cardText: null,
        });
      });
    }

    return {
      pageTitle: document.title,
      url: location.href,
      items,
      bodySnippet: document.body.innerText.slice(0, 8000),
    };
  });

  console.log(JSON.stringify(raw, null, 2));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
