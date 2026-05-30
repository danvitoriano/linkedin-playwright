# Busca de vagas tech no LinkedIn

Automação com Playwright para abrir o LinkedIn Jobs, filtrar vagas de tecnologia e listar os resultados no terminal.

## Pré-requisitos

Mesma sessão do fluxo principal:

```bash
npm install
npm run setup
npm run login
```

## Uso

```bash
npm run jobs:search
```

## Variáveis (`.env`)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `JOB_KEYWORDS` | `desenvolvedor software` | Termos da busca |
| `JOB_LOCATION` | `Brasil` | Localização |
| `JOB_MAX_RESULTS` | `25` | Máximo de vagas listadas |
| `DELAY_MS` | `3000` | Pausas entre ações (ms) |
| `HEADLESS` | `false` | `true` para rodar sem janela |

Exemplo:

```env
JOB_KEYWORDS=react typescript frontend
JOB_LOCATION=São Paulo
JOB_MAX_RESULTS=10
```

## Observações

- O LinkedIn altera o DOM com frequência. Se a lista vier vazia, atualize os seletores em `jobs-search.ts`.
- Use com moderação e de acordo com os [termos de uso](https://www.linkedin.com/legal/user-agreement) da plataforma.
