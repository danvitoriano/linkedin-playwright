#!/usr/bin/env python3
"""
Gera JSON de notas e aplica ao PPTX FIAP original (rev2).

Uso:
  python apply_fiap.py --revision v2
  python apply_fiap.py --revision v2 --roteiro notes/roteiro-v2.txt
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

from fiap_constants import (
    FIAP_PPTX,
    SLIDE_COUNT,
    notes_json_path,
    output_pptx_path,
    roteiro_path,
)
from fiap_mapping import build_notes_list
from fiap_merge_notes import build_unified_notes, load_v2_scripts
from parse_roteiro import parse_roteiro_file

PPTX_DIR = Path(__file__).resolve().parent


def load_sections_v1() -> dict[int, str]:
    import json

    path = PPTX_DIR / "notes" / "sections_v1.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    return {int(k): v for k, v in data.items()}


def main() -> int:
    parser = argparse.ArgumentParser(description="Aplica notas do orador ao PPTX FIAP")
    parser.add_argument(
        "--revision",
        "-r",
        default="v2",
        choices=["v1", "v2"],
        help="Versão do roteiro (v1=roteiro anterior embutido; v2=arquivo de texto)",
    )
    parser.add_argument(
        "--roteiro",
        type=Path,
        default=None,
        help="Arquivo .txt com roteiro (blocos 1. … 11.). Padrão: notes/roteiro-{revision}.txt",
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=FIAP_PPTX,
        help="PPTX de entrada (sempre o rev2 original)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="PPTX de saída (padrão: ...-notas-{revision}.pptx)",
    )
    args = parser.parse_args()

    if not args.input.is_file():
        print(f"Erro: PPTX não encontrado: {args.input}", file=sys.stderr)
        return 1

    slides_v2 = PPTX_DIR / "notes" / "slides_v2.json"

    if args.revision == "v1":
        sections = load_sections_v1()
        notes = build_notes_list(sections, SLIDE_COUNT)
    elif slides_v2.is_file() and not args.roteiro:
        notes = json.loads(slides_v2.read_text(encoding="utf-8"))
        if len(notes) != SLIDE_COUNT:
            print(
                f"Aviso: slides_v2.json tem {len(notes)} entradas; deck tem {SLIDE_COUNT}",
                file=sys.stderr,
            )
    else:
        roteiro = args.roteiro or roteiro_path(args.revision)
        if not roteiro.is_file():
            print(f"Erro: roteiro não encontrado: {roteiro}", file=sys.stderr)
            print(
                f"Cole o roteiro em {roteiro} ou em notes/slides_v2.json (16 notas)",
                file=sys.stderr,
            )
            return 1
        sections = parse_roteiro_file(roteiro)
        if not sections:
            print(f"Erro: nenhuma seção numerada em {roteiro}", file=sys.stderr)
            return 1
        missing = [n for n in range(1, 12) if n not in sections]
        if missing:
            print(f"Aviso: faltam seções no roteiro: {missing}", file=sys.stderr)
        notes = build_notes_list(sections, SLIDE_COUNT)

    if args.revision == "v2":
        scripts = load_v2_scripts() if slides_v2.is_file() and not args.roteiro else [
            "" for _ in range(SLIDE_COUNT)
        ]
        if args.roteiro or not slides_v2.is_file():
            scripts = notes  # roteiro v2 sem JSON: usa notas geradas do txt
        notes = build_unified_notes(v2_scripts=scripts)

    json_path = notes_json_path(args.revision)
    json_path.write_text(json.dumps(notes, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"JSON: {json_path} ({len(notes)} slides)")

    out = args.output or output_pptx_path(args.revision)
    cmd = [
        sys.executable,
        str(PPTX_DIR / "add-notes.py"),
        str(args.input.resolve()),
        str(json_path.resolve()),
        "-o",
        str(out.resolve()),
    ]
    result = subprocess.run(cmd, cwd=PPTX_DIR)
    return result.returncode


if __name__ == "__main__":
    sys.exit(main())
