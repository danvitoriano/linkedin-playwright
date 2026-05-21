"""Caminhos do deck FIAP (sempre o .pptx original rev2, sem sufixo -com-notas)."""

from pathlib import Path

FIAP_PPTX = Path(
    "/Users/danvitoriano/Documents/PROJETOS/FIAP/final/"
    "AIAT_Fase 01_IA vs Agentes de IA_Aula 01_rev2.pptx"
)

PPTX_DIR = Path(__file__).resolve().parent
NOTES_DIR = PPTX_DIR / "notes"

SLIDE_COUNT = 16


def notes_json_path(revision: str) -> Path:
    if revision == "v1":
        return PPTX_DIR / "fiap-aula01-notas.json"
    return PPTX_DIR / f"fiap-aula01-notas-{revision}.json"


def roteiro_path(revision: str) -> Path:
    return NOTES_DIR / f"roteiro-{revision}.txt"


def output_pptx_path(revision: str) -> Path:
    stem = FIAP_PPTX.stem
    if revision == "v1":
        return FIAP_PPTX.with_name(f"{stem}-com-notas.pptx")
    return FIAP_PPTX.with_name(f"{stem}-notas-{revision}.pptx")
