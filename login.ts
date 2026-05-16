import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.join(__dirname, "linkedin-auth.json");

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.linkedin.com/login", {
    waitUntil: "domcontentloaded",
  });

  console.log("\n1. Faça login no navegador que abriu.");
  console.log("2. Quando estiver no feed (página inicial), volte aqui e pressione Enter.\n");

  await waitForEnter();

  await context.storageState({ path: STATE_PATH });
  console.log(`Sessão salva em: ${STATE_PATH}`);
  console.log("Próximo passo: npm run run\n");

  await browser.close();
}

function waitForEnter(): Promise<void> {
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once("data", () => resolve());
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
