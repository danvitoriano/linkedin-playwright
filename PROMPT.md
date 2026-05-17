# Recriar este projeto com IA

Use este arquivo se preferir **gerar o projeto do zero** no [Cursor](https://cursor.com), **Claude Code** ou outro assistente — em vez de clonar o repositório.

## Como usar

1. Abra um chat novo no Cursor ou Claude Code.
2. Copie **todo o bloco abaixo** (da linha "Crie um projeto..." até o fim dos requisitos de qualidade).
3. Cole e envie. Ajuste nome da pasta ou detalhes se quiser.
4. Depois de gerado, siga o mesmo fluxo do README: `npm install` → configurar `message.ts` → `npm run login` → `npm run run`.

---

## Prompt (copiar a partir daqui)

Crie um projeto Node.js em TypeScript chamado `linkedin-playwright` para automatizar o LinkedIn com Playwright. O objetivo é aceitar convites de conexão recebidos e enviar uma mensagem de boas-vindas para cada novo contato. O projeto deve ser **genérico**: quem baixar configura a própria conta (login manual) e a própria mensagem — sem credenciais nem texto pessoal no repositório.

### Stack e setup

- **Node.js 18+**, **TypeScript** (strict, ES2022, ESM com `"type": "module"`).
- **Playwright** (`^1.52`) com **Chromium** instalado via `postinstall`: `playwright install chromium`.
- **tsx** para executar `.ts` diretamente.
- **@types/node** para tipos.
- `tsconfig.json`: `moduleResolution: "bundler"`, `noEmit: true`, incluir `*.ts` na raiz.
- Sem framework web; scripts CLI na raiz.

### Estrutura de arquivos

```
linkedin-playwright/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore          # node_modules, linkedin-auth.json, .env, playwright-report, test-results
├── README.md           # em português, onboarding para quem clona
├── PROMPT.md           # este prompt para recriar com IA
├── message.ts          # DEFAULT_MESSAGE genérico + MESSAGE_CONFIGURED (boolean)
├── env.ts              # carrega .env sem sobrescrever process.env existente
├── setup.ts            # copia .env.example → .env e imprime próximos passos
├── login.ts            # login manual + storageState
└── run.ts              # aceitar convites + enviar mensagens
```

### message.ts

- Exportar `MESSAGE_CONFIGURED = false` por padrão.
- Exportar `DEFAULT_MESSAGE` com texto de **exemplo** (placeholder), não conteúdo de uma pessoa real.
- Em `run.ts`, se `!MESSAGE_CONFIGURED && !process.env.LINKEDIN_MESSAGE`, sair com mensagem clara pedindo para configurar antes de rodar.

### env.ts

- Ler `.env` na raiz, ignorar linhas vazias e comentários `#`, suportar valores entre aspas e `\n` em `LINKEDIN_MESSAGE`.
- Não sobrescrever variáveis já definidas no ambiente.

### setup.ts + package.json

- Script `"setup": "tsx setup.ts"` que cria `.env` se não existir e lista os passos (editar message.ts, login, run).

### Fluxo de autenticação (`login.ts`)

1. Chromium **não headless** em `https://www.linkedin.com/login`.
2. Usuário faz login no navegador e pressiona **Enter** no terminal quando estiver no feed.
3. Salvar `storageState` em `linkedin-auth.json` (gitignored).
4. Fechar o browser.

### Fluxo principal (`run.ts`)

1. `loadEnv()` no início.
2. Validar mensagem configurada (ver `message.ts` acima).
3. Validar `linkedin-auth.json`; senão, erro pedindo `npm run login`.
4. Chromium `headless: false`, `slowMo: 80`, contexto com `storageState`.
5. `https://www.linkedin.com/mynetwork/invitation-manager/`, aba **Recebidos** / **Received**.
6. Loop até `MAX_INVITES` (padrão 5, de `.env`):
   - Card de convite com seletores resilientes (fallbacks): `motion-invitation-card`, `li.invitation-card`, botões Aceitar/Accept, etc.
   - Nome e `profilePath` via `a[href*='/in/']`.
   - Aceitar convite (PT/EN).
   - Ir ao perfil → URL `a[href*="/messaging/compose"]` → preencher `contenteditable` → enviar com `insertText` + **Enter**.
   - Voltar aos convites, `DELAY_MS` entre iterações (padrão 5000).
7. Logs em português; erros por contato não param o lote inteiro.

### Utilitários em `run.ts`

- `dismissBlockingOverlays`: Escape + esconder `.artdeco-modal`.
- `sleep()`, `__dirname` via `fileURLToPath(import.meta.url)`.

### README (português)

- Seção "Começar em 3 passos": clone, `npm install`, `npm run setup`, editar `message.ts`, `npm run login`, `npm run run`.
- Tabela de configuração (conta, mensagem, `.env`).
- Link para `PROMPT.md` como alternativa de recriar com IA.
- Avisos: DOM do LinkedIn, termos de uso, não commitar sessão.

### Requisitos de qualidade

- TypeScript tipado (`Locator`, `Page`).
- Seletores com fallbacks; suporte PT/EN.
- Browser visível; sem senha no código.
- Projeto mínimo, focado em `setup`, `login` e `run`.

## Resumo técnico

| Aspecto | Escolha |
|--------|---------|
| Automação | Playwright + Chromium |
| Linguagem | TypeScript (ESM) |
| Execução | tsx |
| Auth | Login manual + `storageState` |
| Config | `.env` + `message.ts` + `MESSAGE_CONFIGURED` |
| Onboarding | `npm run setup` |
| IA | Este arquivo (`PROMPT.md`) |
