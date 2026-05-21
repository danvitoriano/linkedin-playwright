"""Une roteiro v2, referências no navegador e camadas So What / Conectivo do v1."""

from __future__ import annotations

import json
import re
from pathlib import Path

from fiap_constants import NOTES_DIR, SLIDE_COUNT
from fiap_mapping import build_notes_list
from fiap_references import (
    format_browser_block,
    load_reference_config,
    refs_for_slide,
    strip_browser_block,
)

PPTX_DIR = Path(__file__).resolve().parent
SLIDES_V2_PATH = PPTX_DIR / "notes" / "slides_v2.json"


def load_sections_v1() -> dict[int, str]:
    path = NOTES_DIR / "sections_v1.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    return {int(k): v for k, v in data.items()}

def parse_v1_layers(text: str) -> tuple[str, str, str, str]:
    """Retorna (corpo, so_what, conectivo, referências_texto)."""
    if not text or not text.strip():
        return "", "", "", ""

    body = text.strip()
    refs = ""

    if "Referências de Aprofundamento" in body:
        body, refs = body.split("Referências de Aprofundamento", 1)
        body = body.strip()
        refs = ("Referências de Aprofundamento" + refs).strip()

    conectivo = ""
    m_con = re.search(r"\n\nConectivo:\s*", body)
    if m_con:
        conectivo = body[m_con.start() :].strip()
        body = body[: m_con.start()].strip()

    so_what = ""
    m_sw = re.search(r'\n\nCamada "So What\?":\s*', body)
    if m_sw:
        so_what = body[m_sw.start() :].strip()
        body = body[: m_sw.start()].strip()

    return body.strip(), so_what, conectivo, refs


def _join_parts(parts: list[str]) -> str:
    return "\n\n".join(p for p in parts if p and p.strip())


def merge_slide_note(
    slide_index: int,
    v2_script: str,
    v1_note: str,
    *,
    config: dict | None = None,
    folder_hint_slide: int = 5,
) -> str:
    cfg = config or load_reference_config()
    v2 = strip_browser_block(v2_script)
    v1_main, so_what, conectivo, v1_refs = parse_v1_layers(v1_note)

    body_parts: list[str] = []
    if v2:
        body_parts.append(v2)
    if v1_main and v1_main not in v2:
        body_parts.append(v1_main)

    parts: list[str] = []
    if body_parts:
        parts.append(_join_parts(body_parts))

    refs = refs_for_slide(slide_index, cfg)
    if refs:
        show_hint = slide_index == folder_hint_slide
        parts.append(
            format_browser_block(
                refs,
                folder=cfg.get("bookmark_folder", "Agentes IA - Recursos"),
                show_folder_hint=show_hint,
            )
        )

    if so_what:
        parts.append(so_what)
    if conectivo:
        parts.append(conectivo)

    # Slide 15: v1 refs só se não houver bloco numerado no navegador
    if v1_refs and slide_index != 15:
        parts.append(v1_refs)

    return _join_parts(parts)


def load_v2_scripts(path: Path | None = None) -> list[str]:
    p = path or SLIDES_V2_PATH
    notes = json.loads(p.read_text(encoding="utf-8"))
    return [strip_browser_block(n) for n in notes]


def build_unified_notes(
    v2_scripts: list[str] | None = None,
    v1_sections: dict[int, str] | None = None,
    slide_count: int = SLIDE_COUNT,
) -> list[str]:
    scripts = v2_scripts or load_v2_scripts()
    v1_list = build_notes_list(v1_sections or load_sections_v1(), slide_count)
    config = load_reference_config()

    out: list[str] = []
    for i in range(1, slide_count + 1):
        v2 = scripts[i - 1] if i - 1 < len(scripts) else ""
        v1 = v1_list[i - 1] if i - 1 < len(v1_list) else ""
        out.append(merge_slide_note(i, v2, v1, config=config))
    return out
