"""Anexa blocos de referências no navegador às notas do orador por slide."""

from __future__ import annotations

import json
from pathlib import Path

NOTES_DIR = Path(__file__).resolve().parent / "notes"
REFS_PATH = NOTES_DIR / "slide_references.json"

MARKER_REFS = "REFERÊNCIAS NO NAVEGADOR"

ALL_REFS_ORDER = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
]


def load_reference_config(path: Path | None = None) -> dict:
    p = path or REFS_PATH
    return json.loads(p.read_text(encoding="utf-8"))


def _all_refs_flat(config: dict) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []
    for val in config.get("slides", {}).values():
        if not isinstance(val, list):
            continue
        for ref in val:
            num = ref.get("num", "")
            if num in seen:
                continue
            seen.add(num)
            out.append(ref)
    out.sort(
        key=lambda r: ALL_REFS_ORDER.index(r["num"])
        if r["num"] in ALL_REFS_ORDER
        else 99
    )
    return out


def _format_ref(ref: dict) -> str:
    autor = ref.get("autor") or ""
    autor_part = f" ({autor})" if autor else ""
    lines = [
        f"• {ref['num']}. {ref['recurso']}{autor_part}",
        f"  Função: {ref['funcao']}",
        f"  Integração: {ref['integracao']}",
        f"  {ref['url']}",
    ]
    return "\n".join(lines)


def format_browser_block(
    refs: list[dict],
    *,
    folder: str,
    show_folder_hint: bool = False,
) -> str:
    if not refs:
        return ""
    body = "\n\n".join(_format_ref(r) for r in refs)
    header = "REFERÊNCIAS NO NAVEGADOR"
    if show_folder_hint:
        header += (
            f'\n(Favoritos Chrome: "{folder}" — use o número de cada item ou '
            '"Abrir todos" na pasta)'
        )
    return f"{header}\n\n{body}"


def refs_for_slide(slide_index: int, config: dict | None = None) -> list[dict]:
    """slide_index: 1-based."""
    cfg = config or load_reference_config()
    slides = cfg.get("slides", {})
    key = str(slide_index)
    val = slides.get(key)
    if val == "all":
        return _all_refs_flat(cfg)
    if isinstance(val, list):
        return val
    return []


def strip_browser_block(note: str) -> str:
    if not note:
        return ""
    for sep in (f"\n\n---\n{MARKER_REFS}", f"\n---\n{MARKER_REFS}", f"\n\n{MARKER_REFS}"):
        if sep in note:
            return note.split(sep, 1)[0].rstrip()
    if MARKER_REFS in note:
        return note.split(MARKER_REFS, 1)[0].rstrip()
    return note.strip()
