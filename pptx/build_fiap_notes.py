#!/usr/bin/env python3
"""Gera JSON de notas FIAP (v1 embutido ou v2 a partir de roteiro .txt)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from apply_fiap import load_sections_v1
from fiap_constants import notes_json_path, roteiro_path
from fiap_mapping import build_notes_list
from parse_roteiro import parse_roteiro_file

PPTX_DIR = Path(__file__).resolve().parent


def main() -> int:
    parser = argparse.ArgumentParser(description="Gera fiap-aula01-notas-{revision}.json")
    parser.add_argument("--revision", "-r", default="v1", choices=["v1", "v2"])
    parser.add_argument("--roteiro", type=Path, default=None)
    args = parser.parse_args()

    if args.revision == "v1":
        sections = load_sections_v1()
    else:
        roteiro = args.roteiro or roteiro_path(args.revision)
        if not roteiro.is_file():
            print(f"Erro: {roteiro} não encontrado", file=sys.stderr)
            return 1
        sections = parse_roteiro_file(roteiro)
        if not sections:
            print(f"Erro: sem seções numeradas em {roteiro}", file=sys.stderr)
            return 1

    notes = build_notes_list(sections)
    out = notes_json_path(args.revision)
    out.write_text(json.dumps(notes, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Gerado: {out} ({len(notes)} entradas)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
