# linkedin-playwright

Automação com [Playwright](https://playwright.dev/) para aceitar convites de conexão **recebidos** no LinkedIn e enviar uma mensagem de boas-vindas para cada novo contato — por padrão, divulgando a sua newsletter do LinkedIn.

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

1. **Newsletter** — preencha `NEWSLETTER_NAME` e `NEWSLETTER_URL` no `.env`. Para mudar o texto, edite [`message.ts`](./message.ts).
2. **LinkedIn** — `npm run login`: faça login no navegador que abrir e pressione **Enter** no terminal quando estiver no feed. A sessão fica em `linkedin-auth.json` (local, ignorado pelo Git).
3. **Executar** — `npm run run`: aceita convites na aba **Recebidos** e envia sua mensagem.

Opcional: ajuste `MAX_INVITES` e `DELAY_MS` no arquivo `.env` (criado pelo `npm run setup`). O padrão aceita **todos** os convites pendentes.

## Configuração

### Conta LinkedIn

Não há usuário/senha no código. O login é sempre manual:

```bash
npm run login
```

Se a sessão expirar, rode `npm run login` de novo.

### Mensagem de boas-vindas

O texto padrão em [`message.ts`](./message.ts) agradece a conexão e convida a pessoa a assinar a sua newsletter do LinkedIn, mencionando a parceria com a Oracle. O nome e o link vêm do `.env`:

```env
NEWSLETTER_NAME=Nome da sua newsletter
NEWSLETTER_URL=https://www.linkedin.com/newsletters/...
```

| Forma | Quando usar |
|-------|-------------|
| `NEWSLETTER_NAME` / `NEWSLETTER_URL` no `.env` | **Recomendado** — mantém o texto padrão e só troca nome e link |
| [`message.ts`](./message.ts) | Reescrever o texto, mudar a assinatura ou tirar a menção à Oracle |
| `LINKEDIN_MESSAGE` no `.env` | Substituir a mensagem inteira; use `\n` para quebras de linha |

Sem `NEWSLETTER_URL` (e sem `LINKEDIN_MESSAGE`), `npm run run` **não inicia** — assim ninguém envia o convite para a newsletter sem o link da assinatura.

### Variáveis de ambiente (`.env`)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `NEWSLETTER_NAME` | — | Nome da newsletter citado na mensagem |
| `NEWSLETTER_URL` | — | Link de assinatura (**obrigatório**) |
| `MAX_INVITES` | `0` | Convites por execução; `0` ou `todos` = sem limite |
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

## Experimento: notas do apresentador (PPTX)

Na branch `feat/pptx-presenter-notes`, a pasta [`pptx/`](./pptx/) adiciona notas do apresentador a um `.pptx` a partir de um arquivo `.txt` ou `.json` (Python + `python-pptx`). Veja [`pptx/README.md`](./pptx/README.md).

```bash
npm run pptx:setup
npm run pptx:notes -- caminho/apresentacao.pptx caminho/notas.txt
npm run pptx:fiap:v2   # após colar roteiro em pptx/notes/roteiro-v2.txt
```

## Estrutura

```
├── message.ts      # Mensagem da newsletter (nome/link via .env)
├── login.ts        # Login manual → linkedin-auth.json
├── run.ts          # Aceitar convites e enviar mensagens
├── env.ts          # Carrega .env
├── setup.ts        # Configuração inicial
├── .env.example
├── pptx/           # Notas do apresentador em PPTX (experimento)
└── PROMPT.md       # Spec para recriar com IA
```

## Observações

- O LinkedIn altera o DOM com frequência. Se aceitar ou enviar mensagem falhar, pode ser necessário atualizar os seletores em `run.ts`. Após 3 falhas seguidas ao aceitar, a execução para sozinha.
- Aceitar **todos** os convites de uma vez envia muitas mensagens em sequência. O LinkedIn limita ações em volume e pode restringir a conta: comece com `MAX_INVITES` baixo, confira o resultado e aumente o `DELAY_MS` se aparecer algum aviso.
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
