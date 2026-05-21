# Roteiros FIAP (Aula 01)

## Versão 1 (`v1`)

Roteiro original em `sections_v1.json`. Saída: `..._rev2-com-notas.pptx`.

```bash
npm run pptx:fiap:v1
```

## Versão 2 (`v2`) — novo roteiro

Notas por slide em **`slides_v2.json`** (16 entradas, uma por slide do deck).

```bash
npm run pptx:fiap:v2
```

Saída: `.../AIAT_Fase 01_IA vs Agentes de IA_Aula 01_rev2-notas-v2.pptx`

Alternativa: roteiro em `roteiro-v2.txt` (blocos `1.`–`11.`) — use `--roteiro` se não quiser o JSON.

Sempre usa o PPTX **original** `AIAT_Fase 01_IA vs Agentes de IA_Aula 01_rev2.pptx` (não o `-com-notas`).

### Mapeamento v2 (seu roteiro → 16 slides do deck)

| Deck | Conteúdo das notas |
|------|-------------------|
| 1 | Capa |
| 2 | Mudança de mentalidade |
| 3 | Limitação do paradigma |
| 4 | Anatomia do agente |
| 5 | ReAct |
| 6–7 | Hands-on (mesmo texto nos dois) |
| 8 | Zero-shot vs agentic |
| 9 | Gargalo / agente único |
| 10–11 | MAS |
| 12 | Devin |
| 13 | Tendências |
| 14 | Sem roteiro (síntese no deck) |
| 15 | Lista completa de referências no navegador (favoritos 01–13) |
| 16 | vazio |

### Referências no navegador (por slide)

Cada nota unificada (via `fiap_merge_notes.py` + `npm run pptx:fiap:v2`):

1. Roteiro falado (v2 em `slides_v2.json`)
2. Roteiro técnico v1 (quando complementa o v2)
3. **REFERÊNCIAS NO NAVEGADOR** (links numerados; dica da pasta Chrome só no slide 5)
4. **Camada "So What?"** e **Conectivo** (do v1)

Referências em `slide_references.json` (pasta Chrome **Agentes IA - Recursos**).

| Slide | Slide do deck | Favoritos |
|-------|---------------|-----------|
| 5 | O Framework ReAct | 03 ReAct |
| 6–7 | HANDS ON ReAct Parte 1 | 04 LangChain, 05 SerpAPI, 06 LLM-Math |
| 8 | Zero-Shot vs. Agentic Workflow | 01 Andrew Ng |
| 9 | O Gargalo da Complexidade | 02 Lilian Weng |
| 12 | Case Devin | 10 Devin, 13 GitHub |
| 13 | Tendências e Acessibilidade | 11 Claude, 12 Cursor, 09 OpenClaw, 07 CrewAI, 08 n8n |
| 15 | Referências (slide do deck) | 01–13 (lista completa) |

## Mapeamento v1 (11 blocos → 16 slides)

| Slides | Bloco |
|--------|-------|
| 1–8 | 1–8 |
| 9–10 | 9 |
| 11–12 | 10 |
| 13 | 11 (antes de "Em síntese") |
| 14 | 11 ("Em síntese…") |
| 15 | 11 ("Referências…") |
| 16 | vazio |
