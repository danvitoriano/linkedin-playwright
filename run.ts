import { chromium, type Locator, type Page } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./env.js";
import { DEFAULT_MESSAGE, MESSAGE_CONFIGURED } from "./message.js";

loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.join(__dirname, "linkedin-auth.json");

const MESSAGE = process.env.LINKEDIN_MESSAGE ?? DEFAULT_MESSAGE;
const MAX_INVITES = Number(process.env.MAX_INVITES ?? "5");
const DELAY_MS = Number(process.env.DELAY_MS ?? "5000");

const INVITATIONS_URL =
  "https://www.linkedin.com/mynetwork/invitation-manager/";

async function main() {
  if (!process.env.LINKEDIN_MESSAGE && !MESSAGE_CONFIGURED) {
    console.error(`
Mensagem não configurada.

  • Edite message.ts, personalize DEFAULT_MESSAGE e defina MESSAGE_CONFIGURED = true
  • ou defina LINKEDIN_MESSAGE no arquivo .env

Rode npm run setup se ainda não tiver um arquivo .env.
`);
    process.exit(1);
  }

  if (!fs.existsSync(STATE_PATH)) {
    console.error(`Sessão não encontrada. Rode primeiro: npm run login`);
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: 80,
  });

  const context = await browser.newContext({ storageState: STATE_PATH });
  const page = await context.newPage();

  console.log(`Abrindo convites (máx. ${MAX_INVITES})...\n`);
  await page.goto(INVITATIONS_URL, { waitUntil: "domcontentloaded" });
  await sleep(3000);

  await openReceivedTab(page);

  let processed = 0;

  while (processed < MAX_INVITES) {
    const card = await findInvitationCard(page);
    if (!card) {
      console.log("Nenhum convite pendente encontrado.");
      break;
    }

    const name = await readCardName(card);
    const profilePath = await readProfilePath(card);

    console.log(`[${processed + 1}/${MAX_INVITES}] ${name ?? "Contato"}`);

    const accepted = await clickAccept(card);
    if (!accepted) {
      console.log("  Não foi possível aceitar — pulando.");
      await sleep(DELAY_MS);
      continue;
    }

    console.log("  Convite aceito.");
    await sleep(2000);

    if (profilePath) {
      try {
        const messaged = await sendMessageOnProfile(page, profilePath);
        console.log(
          messaged
            ? "  Mensagem enviada."
            : "  Mensagem não enviada (ajuste seletores se necessário).",
        );
      } catch (err) {
        console.log(`  Erro ao enviar mensagem: ${formatError(err)}`);
      }
    } else {
      console.log("  Perfil não identificado — mensagem ignorada.");
    }

    processed++;
    await page.goto(INVITATIONS_URL, { waitUntil: "domcontentloaded" });
    await sleep(2500);
    await openReceivedTab(page);
    await sleep(DELAY_MS);
  }

  console.log(`\nConcluído. Processados: ${processed}`);
  await browser.close();
}

async function openReceivedTab(page: Page) {
  const receivedTab = page
    .getByRole("button", { name: /^Recebidos$/i })
    .or(page.getByRole("button", { name: /^Received$/i }))
    .or(page.getByRole("tab", { name: /^Recebidos$/i }))
    .or(page.getByRole("tab", { name: /^Received$/i }));

  if (await receivedTab.first().isVisible().catch(() => false)) {
    await receivedTab.first().click();
    await sleep(1500);
  }
}

async function findInvitationCard(page: Page): Promise<Locator | null> {
  const selectors = [
    "motion-invitation-card",
    "li.invitation-card",
    "div.invitation-card",
    "main div[componentkey] div:has(button[aria-label*='Aceitar'])",
    "main div[componentkey] div:has(button[aria-label*='Accept'])",
  ];

  for (const selector of selectors) {
    const cards = page.locator(selector);
    const count = await cards.count();
    if (count > 0) {
      return cards.first();
    }
  }

  const acceptInMain = page
    .locator("main")
    .getByRole("button", { name: /^Aceitar$/i })
    .or(page.locator("main").getByRole("button", { name: /^Accept$/i }));

  if (await acceptInMain.first().isVisible().catch(() => false)) {
    return acceptInMain
      .first()
      .locator(
        "xpath=ancestor::motion-invitation-card | ancestor::div[contains(@class,'invitation')][1]",
      )
      .first();
  }

  return null;
}

async function readCardName(card: Locator): Promise<string | null> {
  const link = card.locator("a[href*='/in/']").first();
  const ariaLabel = await link.getAttribute("aria-label").catch(() => null);
  if (ariaLabel) {
    const match = ariaLabel.match(/^(.+?)(?:'s|'s|’s)?\s+(?:profile|perfil)/i);
    if (match?.[1]) return match[1].trim();
    if (!ariaLabel.toLowerCase().includes("inviting")) return ariaLabel.trim();
  }

  const text = await link.textContent().catch(() => null);
  return text?.trim().split("\n")[0] || null;
}

async function readProfilePath(card: Locator): Promise<string | null> {
  const link = card.locator("a[href*='/in/']").first();
  const href = await link.getAttribute("href").catch(() => null);
  if (!href) return null;

  try {
    const url = new URL(href, "https://www.linkedin.com");
    return url.pathname;
  } catch {
    return href.startsWith("/") ? href : null;
  }
}

async function clickAccept(card: Locator): Promise<boolean> {
  const acceptBtn = card
    .getByRole("button", { name: /^Aceitar$/i })
    .or(card.getByRole("button", { name: /^Accept$/i }))
    .or(card.locator('button[aria-label*="Aceitar"]'))
    .or(card.locator('button[aria-label*="Accept"]'))
    .first();

  if (await acceptBtn.isVisible().catch(() => false)) {
    await acceptBtn.click();
    return true;
  }

  return false;
}

async function getMessagingComposeUrl(page: Page): Promise<string | null> {
  const link = page.locator('a[href*="/messaging/compose"]').first();
  await link.waitFor({ state: "attached", timeout: 15_000 }).catch(() => null);

  const href = await link.getAttribute("href").catch(() => null);
  if (!href) return null;

  return new URL(href, "https://www.linkedin.com").toString();
}

async function sendMessageOnProfile(page: Page, profilePath: string): Promise<boolean> {
  const profileUrl = `https://www.linkedin.com${profilePath}`;
  await page.goto(profileUrl, { waitUntil: "domcontentloaded" });
  await sleep(2500);

  await dismissBlockingOverlays(page);

  let composeUrl = await getMessagingComposeUrl(page);
  if (!composeUrl) {
    await page.keyboard.press("Escape");
    await sleep(500);
    composeUrl = await getMessagingComposeUrl(page);
  }
  if (!composeUrl) {
    return false;
  }

  console.log("  Abrindo composer de mensagem...");
  await page.goto(composeUrl, { waitUntil: "domcontentloaded" });
  await sleep(2500);
  await dismissBlockingOverlays(page);

  const msgForm = page.locator(".msg-form, .msg-overlay-conversation-bubble--is-active").first();

  const composer = msgForm
    .locator(".msg-form__contenteditable")
    .or(msgForm.locator('motion-message-composer div[contenteditable="true"]'))
    .or(page.locator('div.msg-form__msg-content-container div[contenteditable="true"]'))
    .or(page.locator('div[role="textbox"][contenteditable="true"]'))
    .first();

  await composer.waitFor({ state: "visible", timeout: 15_000 }).catch(() => null);
  if (!(await composer.isVisible().catch(() => false))) {
    return false;
  }

  await scrollToElement(composer);
  await composer.click();
  await page.keyboard.insertText(MESSAGE);
  await sleep(800);

  await composer.click();
  await page.keyboard.press("Enter");
  console.log("  Enter pressionado para enviar.");
  await sleep(2000);
  return true;
}

async function scrollToElement(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await sleep(400);
}

async function dismissBlockingOverlays(page: Page) {
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    document.querySelectorAll(".artdeco-modal, #artdeco-modal-outlet").forEach((el) => {
      (el as HTMLElement).style.setProperty("display", "none", "important");
    });
  });
}

function formatError(err: unknown): string {
  if (err instanceof Error) return err.message.split("\n")[0];
  return String(err);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
