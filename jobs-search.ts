import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./env.js";

loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.join(__dirname, "linkedin-auth.json");

const KEYWORDS = process.env.JOB_KEYWORDS ?? "desenvolvedor software";
const LOCATION = process.env.JOB_LOCATION ?? "Brasil";
const MAX_RESULTS = Number(process.env.JOB_MAX_RESULTS ?? "25");
const DELAY_MS = Number(process.env.DELAY_MS ?? "3000");

function buildJobsSearchUrl(): string {
  const params = new URLSearchParams({
    keywords: KEYWORDS,
    location: LOCATION,
    f_TPR: "r604800", // últimos 7 dias
  });
  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
}

async function main() {
  if (!fs.existsSync(STATE_PATH)) {
    console.error(`Sessão não encontrada. Rode primeiro: npm run login`);
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: process.env.HEADLESS === "true",
    slowMo: 80,
  });

  const context = await browser.newContext({ storageState: STATE_PATH });
  const page = await context.newPage();
  const searchUrl = buildJobsSearchUrl();

  console.log(`Buscando vagas tech no LinkedIn...\n`);
  console.log(`  Palavras-chave: ${KEYWORDS}`);
  console.log(`  Local: ${LOCATION}`);
  console.log(`  URL: ${searchUrl}\n`);

  await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
  await sleep(4000);

  const jobs = await collectJobListings(page, MAX_RESULTS);

  if (jobs.length === 0) {
    console.log(
      "Nenhuma vaga encontrada na lista. O LinkedIn pode ter alterado o DOM — ajuste os seletores em jobs-search.ts.",
    );
  } else {
    console.log(`Encontradas ${jobs.length} vaga(s):\n`);
    for (const [i, job] of jobs.entries()) {
      console.log(`${i + 1}. ${job.title}`);
      if (job.company) console.log(`   Empresa: ${job.company}`);
      if (job.location) console.log(`   Local: ${job.location}`);
      if (job.url) console.log(`   ${job.url}`);
      console.log();
    }
  }

  console.log("Navegador aberto — feche manualmente ou pressione Ctrl+C.");
  await sleep(60_000);
  await browser.close();
}

type JobListing = {
  title: string;
  company: string | null;
  location: string | null;
  url: string | null;
};

async function collectJobListings(
  page: import("playwright").Page,
  max: number,
): Promise<JobListing[]> {
  const results: JobListing[] = [];
  const seen = new Set<string>();

  const cardSelectors = [
    "li.scaffold-layout__list-item",
    "div.job-card-container",
    "ul.jobs-search__results-list > li",
  ];

  for (const selector of cardSelectors) {
    const cards = page.locator(selector);
    const count = await cards.count();
    if (count === 0) continue;

    for (let i = 0; i < count && results.length < max; i++) {
      const card = cards.nth(i);

      const title =
        (await card
          .locator("a.job-card-list__title, a.job-card-container__link")
          .first()
          .textContent()
          .catch(() => null)) ??
        (await card
          .locator("strong")
          .first()
          .textContent()
          .catch(() => null));

      const company = await card
        .locator(
          ".job-card-container__company-name, .artdeco-entity-lockup__subtitle",
        )
        .first()
        .textContent()
        .catch(() => null);

      const locationText = await card
        .locator(
          ".job-card-container__metadata-item, .job-card-container__metadata-wrapper li",
        )
        .first()
        .textContent()
        .catch(() => null);

      const href = await card
        .locator("a[href*='/jobs/view/']")
        .first()
        .getAttribute("href")
        .catch(() => null);

      const normalizedTitle = title?.trim();
      if (!normalizedTitle || seen.has(normalizedTitle)) continue;

      seen.add(normalizedTitle);
      results.push({
        title: normalizedTitle,
        company: company?.trim() ?? null,
        location: locationText?.trim() ?? null,
        url: href
          ? new URL(href, "https://www.linkedin.com").toString()
          : null,
      });
    }

    if (results.length > 0) break;
  }

  return results;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
