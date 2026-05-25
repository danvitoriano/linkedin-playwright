import { chromium, type Page } from "playwright";
import { loadEnv } from "./env.js";

loadEnv();

// Configurações
const FORM_URL = process.env.GOOGLE_FORM_URL ?? "https://docs.google.com/forms/d/e/1FAIpQLSdoHMvnNaYQIwUAOOiAIa_c2OAYbQkGTlDK9M9UF2jIchJjYA/viewform";
const HEADLESS = process.env.HEADLESS === "true";

interface SensediaFormData {
  email: string;
  nomeCompleto: string;
  organizacao: string;
  profissao: string;
}

async function fillSensediaForm(formData: SensediaFormData) {
  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: 150,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🚀 Abrindo formulário de Avaliação PCS - Sensedia...\n");
  await page.goto(FORM_URL, { waitUntil: "domcontentloaded" });
  await sleep(3000);

  try {
    // Preencher Email
    console.log("📧 Preenchendo Email...");
    const emailInput = page.locator('input[type="email"]')
      .or(page.locator('input[aria-label*="Email"]'))
      .first();
    await emailInput.waitFor({ state: "visible", timeout: 10000 });
    await emailInput.fill(formData.email);
    await sleep(500);

    // Preencher Nome Completo
    console.log("👤 Preenchendo Nome Completo...");
    const nomeInput = page.locator('input[aria-label*="Nome Completo"]')
      .or(page.locator('div:has-text("Nome Completo") input'))
      .first();
    await nomeInput.fill(formData.nomeCompleto);
    await sleep(500);

    // Preencher Organização
    console.log("🏢 Preenchendo Organização...");
    const orgInput = page.locator('input[aria-label*="Organização"]')
      .or(page.locator('div:has-text("Organização") input'))
      .first();
    await orgInput.fill(formData.organizacao);
    await sleep(500);

    // Preencher Profissão
    console.log("💼 Preenchendo Profissão...");
    const profissaoInput = page.locator('input[aria-label*="Profissão"]')
      .or(page.locator('div:has-text("Profissão") input'))
      .first();
    await profissaoInput.fill(formData.profissao);
    await sleep(500);

    console.log("\n✅ Todos os campos foram preenchidos!");
    console.log("⏸️  Aguardando 5 segundos para você revisar...");
    await sleep(5000);

    // Opcional: clicar em "Next" automaticamente
    // Descomente as linhas abaixo se quiser que o script clique em "Next"
    // console.log("➡️  Clicando em 'Next'...");
    // const nextButton = page.locator('span:has-text("Next")')
    //   .or(page.locator('span:has-text("Próxima")'))
    //   .or(page.locator('div[role="button"]:has-text("Next")'))
    //   .first();
    // await nextButton.click();
    // await sleep(3000);

    console.log("\n🎉 Pronto! Você pode continuar manualmente a partir daqui.");
    
  } catch (error) {
    console.error("\n❌ Erro ao preencher formulário:", error);
    console.log("\n💡 Dica: O formulário pode ter mudado sua estrutura. Tire um screenshot para debug.");
  }

  // Não fechar o browser automaticamente para você ver o resultado
  console.log("\n⚠️  O navegador não será fechado automaticamente.");
  console.log("   Feche manualmente quando terminar de revisar.");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===============================================
// CONFIGURE SEUS DADOS AQUI
// ===============================================
const meusDados: SensediaFormData = {
  email: "vitoriano08@gmail.com",
  nomeCompleto: "Danilo Vitoriano",
  organizacao: "diferentia.com.br",
  profissao: "Professor e Especialista em Tecnologia e Comunicação"
};

// Executar
fillSensediaForm(meusDados).catch((err) => {
  console.error(err);
  process.exit(1);
});
