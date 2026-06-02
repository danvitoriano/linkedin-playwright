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

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

type RawJob = {
  title: string;
  company: string | null;
  metadata: string | null;
  url: string | null;
  cardText: string | null;
};

type ParsedJob = {
  title: string;
  company: string;
  workMode: string;
  applyUrl: string;
};

async function main() {
  if (!fs.existsSync(STATE_PATH)) {
    console.error("Sessão não encontrada. Rode: npm run login");
    process.exit(1);
  }

  const headless = process.env.HEADLESS !== "false";
  const browser = await chromium.launch({
    headless,
    channel: headless ? undefined : "chrome",
    slowMo: headless ? 0 : 50,
  });

  const context = await browser.newContext({ storageState: STATE_PATH });
  const page = await context.newPage();

  console.error(`Abrindo: ${JOBS_URL}\n`);
  await page.goto(JOBS_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await sleep(5000);

  for (let i = 0; i < 6; i++) {
    const list = page.locator(
      ".jobs-search-results-list, .scaffold-layout__list",
    );
    if (await list.first().isVisible().catch(() => false)) {
      await list.first().evaluate((el) => {
        el.scrollTop += 900;
      });
    } else {
      await page.mouse.wheel(0, 900);
    }
    await sleep(1000);
  }

  const rawJobs = await scrapeJobs(page);
  await browser.close();

  const parsed = dedupeAndParse(rawJobs).slice(0, 12);
  if (parsed.length < 10) {
    console.error(`Aviso: apenas ${parsed.length} vagas únicas encontradas na página.`);
  }

  const top10 = parsed.slice(0, 10);
  const markdown = GROQ_API_KEY
    ? await formatWithGroq(top10, rawJobs)
    : formatMarkdownLocally(top10);

  console.log(markdown);
}

async function scrapeJobs(page: import("playwright").Page): Promise<RawJob[]> {
  return page.evaluate(() => {
    const items: RawJob[] = [];

    const cards = document.querySelectorAll(
      "li.scaffold-layout__list-item, div.job-card-container",
    );

    cards.forEach((card) => {
      const titleEl = card.querySelector(
        "a.job-card-list__title, a.job-card-container__link",
      );
      const companyEl = card.querySelector(
        ".job-card-container__company-name, .artdeco-entity-lockup__subtitle",
      );
      const metaEls = card.querySelectorAll(
        ".job-card-container__metadata-item, .job-card-container__metadata-wrapper li",
      );
      const linkEl = card.querySelector(
        "a[href*='/jobs/view/']",
      ) as HTMLAnchorElement | null;

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
        cardText: (card.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 400),
      });
    });

    return items;
  });
}

function dedupeAndParse(jobs: RawJob[]): ParsedJob[] {
  const seen = new Set<string>();
  const out: ParsedJob[] = [];

  for (const job of jobs) {
    const jobId = job.url?.match(/\/jobs\/view\/(\d+)/)?.[1];
    if (!jobId || seen.has(jobId)) continue;
    seen.add(jobId);

    const title = cleanTitle(job.title);
    const company = job.company?.trim() ?? "Não informada";
    const workMode = inferWorkMode(job.metadata, job.cardText);
    const applyUrl = job.url ?? "";

    if (!title || !applyUrl) continue;

    out.push({ title, company, workMode, applyUrl });
  }

  return out;
}

function cleanTitle(raw: string): string {
  const normalized = raw
    .replace(/\s+/g, " ")
    .replace(/ with verification/gi, "")
    .trim();

  const half = Math.floor(normalized.length / 2);
  if (half > 10 && normalized.slice(0, half) === normalized.slice(half)) {
    return normalized.slice(0, half).trim();
  }

  const parts = normalized.split(" ").filter(Boolean);
  const mid = Math.ceil(parts.length / 2);
  const first = parts.slice(0, mid).join(" ");
  const second = parts.slice(mid).join(" ");
  if (first && first === second) return first;

  return normalized;
}

function inferWorkMode(metadata: string | null, cardText: string | null): string {
  const text = `${metadata ?? ""} ${cardText ?? ""}`;
  if (/\(Remote\)|\bRemote\b|Remoto/i.test(text)) return "Remota";
  if (/\(Hybrid\)|\bHybrid\b|Híbrid/i.test(text)) return "Híbrida";
  if (/\(On-site\)|\bOn-site\b|Presencial/i.test(text)) return "Presencial";
  return "Não informado";
}

async function formatWithGroq(
  jobs: ParsedJob[],
  rawJobs: RawJob[],
): Promise<string> {
  const payload = {
    instruction:
      "Analise as vagas e produza uma lista em markdown com exatamente 10 itens (ou menos se não houver 10). Para cada vaga use: nome da vaga, empresa, modalidade (Presencial, Remota ou Híbrida), e link completo para inscrição. Use os links fornecidos sem encurtar. Corrija títulos duplicados. Responda APENAS com o markdown, em português.",
    jobs,
    rawContext: rawJobs.slice(0, 15),
  };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Você estrutura listas de vagas de emprego em markdown limpo e preciso.",
        },
        {
          role: "user",
          content: JSON.stringify(payload, null, 2),
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Groq API erro (${res.status}): ${err.slice(0, 300)}`);
    console.error("Usando formatação local.\n");
    return formatMarkdownLocally(jobs);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) return formatMarkdownLocally(jobs);
  return content;
}

function formatMarkdownLocally(jobs: ParsedJob[]): string {
  const lines = [
    "# Top 10 vagas recomendadas (LinkedIn)",
    "",
    `Página: [LinkedIn Jobs — Recommended](${JOBS_URL})`,
    "",
  ];

  jobs.forEach((job, i) => {
    lines.push(`## ${i + 1}. ${job.title}`);
    lines.push("");
    lines.push(`- **Empresa:** ${job.company}`);
    lines.push(`- **Modalidade:** ${job.workMode}`);
    lines.push(`- **Inscrição:** ${job.applyUrl}`);
    lines.push("");
  });

  return lines.join("\n");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
