import { chromium, type Page } from "playwright";
import { loadEnv } from "./env.js";

loadEnv();

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdoHMvnNaYQIwUAOOiAIa_c2OAYbQkGTlDK9M9UF2jIchJjYA/viewform";
const HEADLESS = process.env.HEADLESS === "true";

interface FormularioCompleto {
  // Página 1
  email: string;
  nomeCompleto: string;
  organizacao: string;
  profissao: string;
  
  // Respostas das questões (índice das opções, começando em 0)
  questoes: {
    q1: number;  // Questão 1 - resposta 1 (índice 0)
    q2: number;  // Questão 2 - resposta 2 (índice 1)
    q3: number;  // Questão 3 - resposta 4 (índice 3)
    q4: number;  // Questão 4 - resposta 2 (índice 1)
    q5: string;  // Questão 5 - dissertativa
    q6: number;  // Questão 6 - resposta 4 (índice 3)
    q7: number;  // Questão 7 - resposta 2 (índice 1)
    q8: number;  // Questão 8 - resposta 1 (índice 0)
    q9: number;  // Questão 9 - resposta 3 (índice 2)
    q10: number; // Questão 10 - resposta 2 (índice 1)
    q11: number; // Questão 11 - resposta 4 (índice 3)
    q12: string; // Questão 12 - dissertativa
    q13: number; // Questão 13 - resposta 3 (índice 2)
    q14: number; // Questão 14 - resposta 4 (índice 3)
    q15: number; // Questão 15 - resposta 1 (índice 0)
  };
}

const respostasCompletas: FormularioCompleto = {
  email: "vitoriano08@gmail.com",
  nomeCompleto: "Danilo Vitoriano",
  organizacao: "diferentia.com.br",
  profissao: "Professor e Especialista em Tecnologia e Comunicação",
  
  questoes: {
    q1: 0,  // Resposta 1
    q2: 1,  // Resposta 2
    q3: 3,  // Resposta 4
    q4: 1,  // Resposta 2
    q5: `Usar POST para criação pois o server atribui o ID.

GET com ID no path pois é idempotente, portanto ideal para leitura.

PATCH para atualizar status porque é uma atualização parcial.

GET com filtros pois são opcionais.

Algumas boas práticas são: Substantivos no plural, versionamento na URI, uso correto dos status codes e nunca utilizar verbos na URI.`,
    q6: 3,  // Resposta 4
    q7: 1,  // Resposta 2
    q8: 0,  // Resposta 1
    q9: 2,  // Resposta 3
    q10: 1, // Resposta 2
    q11: 3, // Resposta 4
    q12: `Cache: armazena o que vem do backend e serve diretamente do gateway nas próximas requisições, aumentando velocidade e desempenho.

Invalidate Cache: força limpeza do cache armazenado.

No fluxo da operação de GET, o interceptor Cache ativa com TTL de 3600s. Já nas operações de POST, PUT, PATCH e DELETE, o Invalidate Cache ativa, apontando para a mesma key da consulta, ou seja, dispara a limpeza.

Não precisa criar uma nova versão da API. Adicionar cache é uma mudança transparente, o contrato permanece. A regra prática de versionamento para REST: se cria nova versão quando se tem quebra de contrato! E o caminho prático é:

Acessar API no Sensedia Manager e criar uma nova Revision da atual version;

Na aba Flows, adicionar o interceptor Cache na operação GET (lembrando: TTL 3600) e o Invalidate Cache nas outras operações (mutações)

Testar, em primeiro lugar, o ambiente homologado

Deploy!`,
    q13: 2, // Resposta 3
    q14: 3, // Resposta 4
    q15: 0, // Resposta 1
  }
};

async function preencherFormularioCompleto() {
  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: 150,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("🚀 Iniciando preenchimento do formulário Sensedia...\n");
    
    // PÁGINA 1 - Dados pessoais
    console.log("📄 PÁGINA 1 - Dados Pessoais");
    await page.goto(FORM_URL, { waitUntil: "domcontentloaded" });
    await sleep(3000);

    await preencherPagina1(page, respostasCompletas);
    
    console.log("➡️  Avançando para próxima página...\n");
    await clicarNext(page);
    await sleep(3000);

    // PÁGINA 2 - Questões
    console.log("📄 PÁGINA 2 - Questões da Avaliação");
    await preencherQuestoes(page, respostasCompletas.questoes);

    console.log("\n✅ Formulário preenchido completamente!");
    console.log("📤 Enviando formulário...");
    await sleep(2000);
    
    await enviarFormulario(page);
    
    console.log("\n🎉 Formulário enviado com sucesso!");
    console.log("⏸️  Aguardando 5 segundos antes de fechar...");
    await sleep(5000);
    
    await browser.close();
    
  } catch (error) {
    console.error("\n❌ Erro ao preencher formulário:", error);
    console.log("\n💡 Dica: Tire um screenshot para debug.");
  }
}

async function preencherPagina1(page: Page, dados: FormularioCompleto) {
  console.log("📧 Preenchendo Email...");
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.waitFor({ state: "visible", timeout: 10000 });
  await emailInput.fill(dados.email);
  await sleep(500);

  console.log("👤 Preenchendo Nome Completo...");
  // Google Forms usa inputs dentro de divs com classes específicas
  const allInputs = page.locator('input[type="text"]');
  const nomeInput = allInputs.nth(0); // Primeiro input de texto após o email
  await nomeInput.fill(dados.nomeCompleto);
  await sleep(500);

  console.log("🏢 Preenchendo Organização...");
  const orgInput = allInputs.nth(1); // Segundo input de texto
  await orgInput.fill(dados.organizacao);
  await sleep(500);

  console.log("💼 Preenchendo Profissão...");
  const profInput = allInputs.nth(2); // Terceiro input de texto
  await profInput.fill(dados.profissao);
  await sleep(500);

  console.log("✅ Página 1 preenchida!");
}

async function preencherQuestoes(page: Page, questoes: FormularioCompleto['questoes']) {
  // O Google Forms usa divs com role="radiogroup" para questões de múltipla escolha
  // Vamos preencher sequencialmente
  
  const questoesList = [
    { num: 1, resposta: questoes.q1, tipo: 'radio' },
    { num: 2, resposta: questoes.q2, tipo: 'radio' },
    { num: 3, resposta: questoes.q3, tipo: 'radio' },
    { num: 4, resposta: questoes.q4, tipo: 'radio' },
    { num: 5, resposta: questoes.q5, tipo: 'text' },
    { num: 6, resposta: questoes.q6, tipo: 'radio' },
    { num: 7, resposta: questoes.q7, tipo: 'radio' },
    { num: 8, resposta: questoes.q8, tipo: 'radio' },
    { num: 9, resposta: questoes.q9, tipo: 'radio' },
    { num: 10, resposta: questoes.q10, tipo: 'radio' },
    { num: 11, resposta: questoes.q11, tipo: 'radio' },
    { num: 12, resposta: questoes.q12, tipo: 'text' },
    { num: 13, resposta: questoes.q13, tipo: 'radio' },
    { num: 14, resposta: questoes.q14, tipo: 'radio' },
    { num: 15, resposta: questoes.q15, tipo: 'radio' },
  ];

  let radioIndex = 0;
  let textIndex = 0;

  for (const q of questoesList) {
    if (q.tipo === 'radio') {
      console.log(`   Questão ${q.num}: Selecionando opção ${(q.resposta as number) + 1}`);
      await selecionarOpcaoMultiplaEscolha(page, radioIndex, q.resposta as number);
      radioIndex++;
    } else {
      console.log(`   Questão ${q.num}: Preenchendo texto dissertativo`);
      await preencherTextoDissertativo(page, textIndex, q.resposta as string);
      textIndex++;
    }
    await sleep(800);
  }

  console.log("✅ Todas as questões preenchidas!");
}

async function selecionarOpcaoMultiplaEscolha(page: Page, questaoIndex: number, opcaoIndex: number) {
  // Encontra todos os radiogroups na página
  const radioGroups = page.locator('[role="radiogroup"]');
  const questao = radioGroups.nth(questaoIndex);
  
  // Dentro do radiogroup, pega todos os radio buttons
  const opcoes = questao.locator('[role="radio"]');
  const opcaoSelecionada = opcoes.nth(opcaoIndex);
  
  await opcaoSelecionada.click();
}

async function preencherTextoDissertativo(page: Page, questaoIndex: number, texto: string) {
  // Encontra todos os textareas na página (questões dissertativas)
  const textareas = page.locator('textarea');
  const textarea = textareas.nth(questaoIndex);
  
  await textarea.fill(texto);
}

async function clicarNext(page: Page) {
  // Google Forms usa "Avançar" em português
  const nextButton = page.getByRole('button', { name: /avançar|next/i });
  
  await nextButton.waitFor({ state: "visible", timeout: 10000 });
  await nextButton.click();
}

async function enviarFormulario(page: Page) {
  // Google Forms usa "Enviar" em português ou "Submit" em inglês
  const submitButton = page.getByRole('button', { name: /enviar|submit/i });
  
  await submitButton.waitFor({ state: "visible", timeout: 10000 });
  await submitButton.click();
  
  // Aguardar confirmação de envio
  await sleep(3000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Executar
preencherFormularioCompleto().catch((err) => {
  console.error(err);
  process.exit(1);
});
