# linkedin-playwright

Automação com [Playwright](https://playwright.dev/) para aceitar convites de conexão recebidos no LinkedIn e enviar uma mensagem de boas-vindas para cada novo contato.

## Requisitos

- Node.js 18+
- Conta no LinkedIn

## Instalação

```bash
npm install
```

O script `postinstall` instala o Chromium usado pelo Playwright.

## Uso

### 1. Salvar sessão (login manual)

```bash
npm run login
```

Um navegador abre na página de login. Faça login normalmente e, quando estiver no feed, volte ao terminal e pressione **Enter**. A sessão é salva em `linkedin-auth.json` (arquivo ignorado pelo Git).

### 2. Aceitar convites e enviar mensagens

```bash
npm run run
```

O script abre o gerenciador de convites, aceita até `MAX_INVITES` convites na aba **Recebidos** e envia a mensagem padrão no perfil de cada contato.

## Configuração

Copie `.env.example` para `.env` e ajuste se necessário:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `MAX_INVITES` | `5` | Quantidade máxima de convites processados por execução |
| `DELAY_MS` | `5000` | Intervalo (ms) entre cada convite |
| `LINKEDIN_MESSAGE` | texto em `message.ts` | Mensagem enviada; use `\n` para quebras de linha |

O texto padrão fica em [`message.ts`](./message.ts). Edite esse arquivo ou defina `LINKEDIN_MESSAGE` no `.env`.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run login` | Login manual e gravação da sessão |
| `npm run run` | Aceita convites e envia mensagens |

## Observações

- O LinkedIn altera o DOM com frequência. Se aceitar ou enviar mensagem falhar, pode ser necessário atualizar os seletores em `run.ts`.
- Use com moderação para respeitar os limites e termos de uso da plataforma.
- Não commite `linkedin-auth.json` nem `.env` — ambos estão no `.gitignore`.
