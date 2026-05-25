# Automação de Preenchimento - Google Forms (Sensedia)

Automação para preencher o formulário de Avaliação PCS da Sensedia usando Playwright.

## 🎯 Formulário

**Avaliação PCS | Desenvolvimento de APIs com Sensedia API Management**

URL: https://docs.google.com/forms/d/e/1FAIpQLSdoHMvnNaYQIwUAOOiAIa_c2OAYbQkGTlDK9M9UF2jIchJjYA/viewform

## 📋 O que é preenchido

### Script Básico (`google-forms.ts`)
Preenche apenas a primeira página:
- **Email** *
- **Nome Completo** *
- **Organização** *
- **Profissão** *

### Script Completo (`google-forms-complete.ts`)
Preenche TUDO automaticamente:
- ✅ Página 1: Dados pessoais
- ✅ Página 2: Todas as 15 questões (13 múltipla escolha + 2 dissertativas)

## 🚀 Como Usar

### Opção 1: Apenas Dados Pessoais (Página 1)

### 1. Configurar os Dados

Edite o arquivo `google-forms.ts` e altere o objeto `meusDados`:

```typescript
const meusDados: SensediaFormData = {
  email: "seu.email@exemplo.com",
  nomeCompleto: "Seu Nome Completo",
  organizacao: "Sua Organização",
  profissao: "Sua Profissão"
};
```

### 2. Executar o Script Básico

```bash
npm run google-forms
```

### Opção 2: Formulário Completo (TODAS as questões)

**⚠️ ATENÇÃO: Este script preenche automaticamente TODAS as respostas da avaliação!**

```bash
npm run google-forms:complete
```

Este script:
- Preenche os dados pessoais
- Avança para a próxima página automaticamente
- Preenche todas as 13 questões de múltipla escolha
- Preenche as 2 questões dissertativas
- **NÃO envia** o formulário (você precisa revisar e enviar manualmente)

### 3. O que acontece (Script Básico)

1. O navegador Chrome abre automaticamente
2. Navega até o formulário
3. Preenche todos os campos da primeira página
4. Aguarda 5 segundos para você revisar
5. Deixa o navegador aberto para você continuar manualmente

## ⚙️ Configurações Avançadas

### Variáveis de Ambiente (.env)

```bash
# URL do formulário (já está configurada por padrão)
GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/1FAIpQLSdoHMvnNaYQIwUAOOiAIa_c2OAYbQkGTlDK9M9UF2jIchJjYA/viewform

# Executar sem abrir o navegador (modo headless)
HEADLESS=false
```

### Clicar em "Next" Automaticamente

Se quiser que o script clique no botão "Next" automaticamente, descomente estas linhas no arquivo `google-forms.ts`:

```typescript
// console.log("➡️  Clicando em 'Next'...");
// const nextButton = page.locator('span:has-text("Next")')
//   .or(page.locator('span:has-text("Próxima")'))
//   .or(page.locator('div[role="button"]:has-text("Next")'))
//   .first();
// await nextButton.click();
// await sleep(3000);
```

## 📝 Múltiplos Formulários

Se você precisa preencher o formulário para várias pessoas:

1. Crie um arquivo `google-forms-data.ts` baseado no exemplo `google-forms-data.example.ts`
2. Adicione todos os dados no array
3. Modifique o script para iterar sobre o array

## ⚠️ Observações Importantes

### Ética e Uso Responsável

- **Script Básico**: Apenas agiliza o preenchimento dos dados cadastrais
- **Script Completo**: Preenche as respostas da avaliação automaticamente
  - Use com **responsabilidade** e de acordo com as regras da sua instituição
  - O script **não envia** automaticamente - você deve revisar tudo antes
  - A avaliação oficial deve seguir as regras da Sensedia (90 minutos, sem consulta)
  
### Funcionalidades

- ✅ O navegador permanece aberto para revisão
- ✅ Você pode editar qualquer resposta antes de enviar
- ❌ O formulário **não** é submetido automaticamente
- ❌ Não há validação de respostas corretas

## 🛠️ Troubleshooting

### Campos não estão sendo preenchidos

O Google Forms pode mudar a estrutura HTML. Se isso acontecer:

1. Execute o script com o navegador aberto (`HEADLESS=false`)
2. Observe quais campos não foram preenchidos
3. Use o inspetor do Chrome (F12) para ver os seletores
4. Ajuste os seletores no código

### Script muito rápido

Aumente o valor de `slowMo` no código:

```typescript
const browser = await chromium.launch({
  headless: HEADLESS,
  slowMo: 300, // aumentar este valor
});
```

## 📚 Sobre a Avaliação

- **Duração**: 90 minutos
- **Questões**: 15 (13 múltipla escolha + 2 dissertativas)
- **Aprovação**: 70% de aproveitamento
- **Formato**: Individual, sem consulta
