"""Mapeamento roteiro (11 blocos) → 16 slides do deck FIAP."""

from __future__ import annotations

import re

# slides 1–16 → chave do bloco 1–11 (None = sem nota)
SLIDE_MAP: list[int | None] = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    9,
    10,
    10,
    11,
    11,
    11,
    None,
]

DEFAULT_SYNTHESIS = """Em síntese, nesta aula vimos que:

1. LLMs são motores de raciocínio, não interfaces de chat.
2. O framework ReAct traz resiliência através do rastro explícito de pensamento.
3. Sistemas Multiagentes são a resposta para a escalabilidade e saturação de contexto.

Camada "So What?": A IA deixou de ser uma camada de texto para se tornar a espinha dorsal de sistemas operacionais autônomos."""

DEFAULT_REFERENCES = """Referências de Aprofundamento:

• Andrew Ng (2024): What's next for AI agentic workflows.
• Lilian Weng (2023): LLM Powered Autonomous Agents.
• Yao et al. (2023): ReAct: Synergizing Reasoning and Acting in Language Models."""


def split_section_11(section_text: str) -> tuple[str, str, str]:
    """Divide bloco 11 em corpo (slide 13), síntese (14) e referências (15)."""
    text = section_text.strip()
    if "Em síntese" not in text:
        return text, DEFAULT_SYNTHESIS, DEFAULT_REFERENCES

    before, rest = text.split("Em síntese", 1)
    main = before.strip()
    rest = "Em síntese" + rest

    if "Referências" in rest:
        synthesis_part, ref_part = rest.split("Referências", 1)
        return main, synthesis_part.strip(), ("Referências" + ref_part).strip()

    return main, rest.strip(), DEFAULT_REFERENCES


def note_for_slide(
    slide_index: int,
    sections: dict[int, str],
    *,
    synthesis: str | None = None,
    references: str | None = None,
) -> str:
    """slide_index: 1-based."""
    key = SLIDE_MAP[slide_index - 1]
    if key is None:
        return ""

    section = sections.get(key, "")
    if key != 11:
        return section

    main, syn, refs = split_section_11(section)
    if slide_index == 13:
        return main
    if slide_index == 14:
        return synthesis or syn
    if slide_index == 15:
        return references or refs
    return section


def build_notes_list(
    sections: dict[int, str],
    slide_count: int = 16,
) -> list[str]:
    return [note_for_slide(i, sections) for i in range(1, slide_count + 1)]
