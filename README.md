# linkedin-playwright

Automação com [Playwright](https://playwright.dev/) para aceitar convites de conexão **recebidos** no LinkedIn e enviar uma mensagem de boas-vindas para cada novo contato.

Cada pessoa usa **a própria conta** (login manual no navegador) e **a própria mensagem** — nada de credenciais ou texto pessoal no repositório.

## Requisitos

- [Node.js](https://nodejs.org/) 18+
- Conta no LinkedIn

## Começar em 3 passos

```bash
git clone <url-do-repositorio>
cd linkedin-playwright
npm install
npm run setup
```

Depois:

1. **Mensagem** — edite [`message.ts`](./message.ts): troque o texto de exemplo e defina `MESSAGE_CONFIGURED = true`.
2. **LinkedIn** — `npm run login`: faça login no navegador que abrir e pressione **Enter** no terminal quando estiver no feed. A sessão fica em `linkedin-auth.json` (local, ignorado pelo Git).
3. **Executar** — `npm run run`: aceita convites na aba **Recebidos** e envia sua mensagem.

Opcional: ajuste `MAX_INVITES` e `DELAY_MS` no arquivo `.env` (criado pelo `npm run setup`).

## Configuração

### Conta LinkedIn

Não há usuário/senha no código. O login é sempre manual:

```bash
npm run login
```

Se a sessão expirar, rode `npm run login` de novo.

### Mensagem de boas-vindas

| Forma | Quando usar |
|-------|-------------|
| [`message.ts`](./message.ts) | **Recomendado** — textos longos, várias linhas, fácil de editar |
| `LINKEDIN_MESSAGE` no `.env` | Mensagem curta; use `\n` para quebras de linha |

Enquanto `MESSAGE_CONFIGURED` for `false` e `LINKEDIN_MESSAGE` não estiver no `.env`, `npm run run` **não inicia** — assim ninguém envia o texto de exemplo por engano.

### Variáveis de ambiente (`.env`)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `MAX_INVITES` | `5` | Máximo de convites processados por execução |
| `DELAY_MS` | `5000` | Pausa (ms) entre cada convite |
| `LINKEDIN_MESSAGE` | — | Sobrescreve `message.ts` (opcional) |

O arquivo `.env` é carregado automaticamente ao rodar `npm run run`.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run setup` | Cria `.env` a partir de `.env.example` e mostra os próximos passos |
| `npm run login` | Login manual e gravação da sessão |
| `npm run run` | Aceita convites e envia mensagens |

## Recriar com IA (Cursor, Claude Code, etc.)

Se preferir montar o projeto do zero em vez de clonar, use [`PROMPT.md`](./PROMPT.md): copie o prompt para o assistente e peça para gerar a mesma estrutura (Playwright, TypeScript, login com `storageState`, aceitar convites, mensagem configurável).

## Estrutura

```
├── message.ts      # Sua mensagem + MESSAGE_CONFIGURED
├── login.ts        # Login manual → linkedin-auth.json
├── run.ts          # Aceitar convites e enviar mensagens
├── env.ts          # Carrega .env
├── setup.ts        # Configuração inicial
├── .env.example
└── PROMPT.md       # Spec para recriar com IA
```

## Observações

- O LinkedIn altera o DOM com frequência. Se aceitar ou enviar mensagem falhar, pode ser necessário atualizar os seletores em `run.ts`.
- Use com moderação para respeitar os limites e os [termos de uso](https://www.linkedin.com/legal/user-agreement) da plataforma.
- **Não commite** `linkedin-auth.json`, `.env` nem dados de sessão — estão no `.gitignore`.

## Aviso

Projeto de código aberto para estudo e automação pessoal. Você é responsável pelo que fizer com a sua conta no LinkedIn — use com bom senso e de acordo com os [termos da plataforma](https://www.linkedin.com/legal/user-agreement).

---

## Sobre quem mantém este projeto

**Dan Vitoriano** — conteúdo, cursos e projetos em tecnologia.

- **Site** — história, projetos e materiais gratuitos: [danvitoriano.com.br](https://danvitoriano.com.br)
- **Links** — cursos, cupons e iniciativas gratuitas: [links.danvitoriano.com.br](https://links.danvitoriano.com.br)
- **Newsletter** — [danvitoriano.substack.com](https://danvitoriano.substack.com)
- **YouTube** — tecnologia, [Orgulho Tech](https://youtube.com/@danvitoriano) e **Tech 40+**: [youtube.com/@danvitoriano](https://youtube.com/@danvitoriano)
- **Diferentia** — agentes de IA para o mercado financeiro: [linkedin.com/company/diferentiaofc](https://www.linkedin.com/company/diferentiaofc)

Quer trocar uma ideia ou fazer parte do grupo fechado? [Conecte no LinkedIn](https://www.linkedin.com/in/danvitoriano) e manda um **quero** na mensagem.
