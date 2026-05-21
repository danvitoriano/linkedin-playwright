# Hands-on — ReAct com LangChain

Demo ao vivo para os slides **6–7** (*HANDS ON - Implementando ReAct - Parte 1*) da aula FIAP *IA vs Agentes de IA*.

O script usa:

| Conceito (aula) | Implementação |
|-----------------|---------------|
| `temperature=0` | `ChatOpenAI(..., temperature=0)` |
| Busca web | ferramenta **serpapi** (SerpAPI) |
| Calculadora | ferramenta **llm-math** |
| Rastro no console | `AgentExecutor(..., verbose=True)` |
| Missão de teste | população do Brasil ^ 0.5 |

## Requisitos

- Python 3.9+
- Conta [OpenAI](https://platform.openai.com/api-keys) com crédito
- Chave [SerpAPI](https://serpapi.com/manage-api-key) (plano gratuito tem cota limitada)

## Setup

```bash
cd hands-on/react-agent
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edite .env com OPENAI_API_KEY e SERPAPI_API_KEY
```

Você também pode colar as chaves no **`.env` da raiz do repo** (`linkedin-playwright/.env`), desde que inclua estas linhas (além das do LinkedIn):

```env
OPENAI_API_KEY=sk-proj-xxxxxxxx
OPENAI_MODEL=gpt-4o-mini
SERPAPI_API_KEY=xxxxxxxx
```

**Erro 401 (`Incorrect API key`)** — a OpenAI rejeitou a chave: costuma ser placeholder `sk-...`, chave revogada, typo ou aspas a mais no `.env`. Gere outra em [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

## Executar

```bash
python react_demo.py
```

Outra pergunta:

```bash
python react_demo.py "Quantos habitantes tem São Paulo vezes 2?"
```

Sem rastro ReAct no console:

```bash
python react_demo.py --quiet
```

## O que você deve ver

Com `verbose=True` (padrão), o terminal mostra o ciclo **Thought → Action → Observation** até o agente buscar a população (SerpAPI) e calcular a raiz (llm-math), e só então imprimir a resposta final.

## Referências do deck

- [LangChain](https://www.langchain.com)
- [SerpAPI](https://serpapi.com)
- [LLM-Math (docs legado)](https://python.langchain.com/docs/integrations/tools/llm_math/)

## Notas

- O prompt ReAct está embutido no script (sem download do LangSmith Hub).
- APIs do ecossistema LangChain evoluem; este exemplo usa `create_react_agent` + `load_tools`, alinhado ao espírito do slide (SerpAPI + llm-math + ReAct).
