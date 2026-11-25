/**
 * Mensagem enviada a cada novo contato depois que o convite é aceito.
 *
 * Preencha o nome e o link da newsletter abaixo (ou use NEWSLETTER_NAME e
 * NEWSLETTER_URL no `.env`). Enquanto o link estiver vazio, `npm run run`
 * não inicia — assim ninguém envia a mensagem sem o link da assinatura.
 *
 * Para um texto totalmente diferente, defina LINKEDIN_MESSAGE no `.env`.
 */
export const NEWSLETTER_NAME = "";
export const NEWSLETTER_URL = "";

/** Nome usado na assinatura da mensagem. */
export const SIGNATURE = "Dan Vitoriano";

type NewsletterConfig = {
  name: string;
  url: string;
};

/** Lê a configuração do `.env` com fallback para as constantes acima. */
export function newsletterConfig(): NewsletterConfig {
  return {
    name: process.env.NEWSLETTER_NAME?.trim() || NEWSLETTER_NAME,
    url: process.env.NEWSLETTER_URL?.trim() || NEWSLETTER_URL,
  };
}

/** `true` quando há link de newsletter configurado. */
export function isConfigured(): boolean {
  return newsletterConfig().url.length > 0;
}

/**
 * Monta a mensagem. Chame só depois de `loadEnv()` — os valores vêm do `.env`.
 */
export function buildMessage(): string {
  const { name, url } = newsletterConfig();
  const title = name ? `a newsletter ${name}` : "a minha newsletter";

  return `Olá! Obrigado por se conectar — seja bem-vindo(a) à minha rede.

Escrevo ${title} aqui no LinkedIn, em parceria com a Oracle: cada edição traz conteúdo prático sobre tecnologia, IA e carreira.

Se fizer sentido para você, a assinatura é por aqui:
${url}

Qualquer dúvida, me chama na mensagem.

Abraço,
${SIGNATURE}`;
}
