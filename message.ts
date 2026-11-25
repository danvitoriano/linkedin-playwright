/**
 * Mensagem enviada a cada novo contato depois que o convite é aceito.
 *
 * Para usar outro texto, defina LINKEDIN_MESSAGE no `.env` — ele sobrescreve
 * tudo aqui.
 */
export const DEFAULT_MESSAGE = `Oi! Obrigado por se conectar comigo aqui no LinkedIn.

Eu sou o Dan Vitoriano, falo de tecnologia e IA e hoje trabalho no mercado financeiro. Recentemente fiz uma parceria muito legal com uma das maiores empresas de tecnologia do mundo, a Oracle.

Escrevi um artigo na minha newsletter Fora da Bolha Tech juntando a Oracle e a Mariah Carey. Assim como a Mariah "não conhece" a J.Lo, muita gente não sabe que a Oracle tem uma das clouds mais robustas do mundo, além de uma plataforma gigante de cursos, laboratórios e projetos prontos pra você estudar, testar e tirar certificações. Tudo gratuito.

Lá no artigo estão todos os links: https://www.linkedin.com/pulse/i-dont-know-her-dan-vitoriano-hsgfe/

Se gostar, deixa uma curtida e um comentário, que me ajuda muito!`;

export function buildMessage(): string {
  return DEFAULT_MESSAGE;
}

