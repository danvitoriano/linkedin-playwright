#!/usr/bin/env python3
"""
Adiciona notas do apresentador a um .pptx a partir de um arquivo de texto ou JSON.

Uso:
  python add-notes.py deck.pptx notas.txt
  python add-notes.py deck.pptx notas.json -o deck-final.pptx
  npm run pptx:notes -- deck.pptx notas.txt
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

from pptx import Presentation
from pptx.enum.shapes import PP_PLACEHOLDER
from pptx.text.text import TextFrame


def load_notes(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8").strip()
    if not text:
        return []

    if path.suffix.lower() == ".json":
        data = json.loads(text)
        if isinstance(data, list):
            return [str(x) for x in data]
        if isinstance(data, dict):
            keys = sorted(data.keys(), key=lambda k: int(re.sub(r"\D", "", k) or 0))
            return [str(data[k]) for k in keys]
        raise ValueError("JSON deve ser array ou objeto {slide: nota}")

    # .txt: blocos separados por linha em branco (ou uma linha = um slide)
    blocks = re.split(r"\n\s*\n", text)
    notes = [b.strip() for b in blocks if b.strip()]
    if len(notes) == 1 and "\n" not in notes[0]:
        # arquivo de uma linha só
        return notes
    if "\n" not in text and len(notes) <= 1:
        # uma nota por linha
        lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
        if lines:
            return lines
    return notes


def find_notes_template(prs: Presentation):
    for slide in prs.slides:
        if slide.has_notes_slide and slide.notes_slide.notes_text_frame is not None:
            return slide.notes_slide
        notes_slide = slide.notes_slide
        if notes_slide.notes_text_frame is not None:
            return notes_slide
    return None


def ensure_notes_text_frame(slide, template_notes_slide) -> TextFrame | None:
    notes_slide = slide.notes_slide
    text_frame = notes_slide.notes_text_frame
    if text_frame is not None:
        return text_frame
    if template_notes_slide is None:
        return None
    for placeholder in template_notes_slide.placeholders:
        if placeholder.placeholder_format.type == PP_PLACEHOLDER.BODY:
            notes_slide.shapes.clone_placeholder(placeholder)
            break
    return notes_slide.notes_text_frame


def apply_notes(prs: Presentation, notes: list[str]) -> int:
    template = find_notes_template(prs)
    applied = 0
    skipped: list[int] = []

    for i, slide in enumerate(prs.slides):
        if i >= len(notes) or not notes[i]:
            continue
        text_frame = ensure_notes_text_frame(slide, template)
        if text_frame is None:
            skipped.append(i + 1)
            continue
        text_frame.text = notes[i]
        applied += 1

    if skipped:
        print(
            f"Aviso: não foi possível gravar notas nos slides: {', '.join(map(str, skipped))}",
            file=sys.stderr,
        )
    return applied


def default_output(input_path: Path) -> Path:
    stem = input_path.stem
    return input_path.with_name(f"{stem}-com-notas.pptx")


def resolve_path(path: Path) -> Path:
    return path.expanduser().resolve()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Adiciona notas do apresentador a um PPTX",
        epilog="Exemplo: python add-notes.py ~/Apresentacao.pptx ~/notas.txt",
    )
    parser.add_argument(
        "pptx",
        nargs="?",
        type=Path,
        help="Arquivo .pptx de entrada",
    )
    parser.add_argument(
        "notes",
        nargs="?",
        type=Path,
        help="Arquivo .txt ou .json com as notas (um bloco/linha por slide)",
    )
    parser.add_argument(
        "-i",
        "--input",
        type=Path,
        help="Mesmo que o primeiro argumento (PPTX)",
    )
    parser.add_argument(
        "-n",
        "--notes-file",
        type=Path,
        dest="notes_file",
        help="Mesmo que o segundo argumento (arquivo de notas)",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=None,
        help="Arquivo .pptx de saída (padrão: <nome>-com-notas.pptx ao lado do original)",
    )
    args = parser.parse_args()

    pptx_path = args.pptx or args.input
    notes_path = args.notes or args.notes_file

    if not pptx_path or not notes_path:
        parser.print_help()
        print(
            "\nErro: informe o PPTX e o arquivo de notas.\n"
            "  python add-notes.py apresentacao.pptx notas.txt\n"
            "  npm run pptx:notes -- apresentacao.pptx notas.txt",
            file=sys.stderr,
        )
        return 1

    pptx_path = resolve_path(pptx_path)
    notes_path = resolve_path(notes_path)
    out_path = resolve_path(args.output) if args.output else None

    if not pptx_path.is_file():
        print(f"Erro: PPTX não encontrado: {pptx_path}", file=sys.stderr)
        return 1
    if pptx_path.suffix.lower() != ".pptx":
        print(f"Erro: esperado arquivo .pptx: {pptx_path}", file=sys.stderr)
        return 1
    if not notes_path.is_file():
        print(f"Erro: arquivo de notas não encontrado: {notes_path}", file=sys.stderr)
        return 1

    notes = load_notes(notes_path)
    if not notes:
        print(f"Erro: nenhuma nota em {notes_path}", file=sys.stderr)
        return 1

    out = out_path or default_output(pptx_path)
    prs = Presentation(str(pptx_path))
    slide_count = len(prs.slides)

    if len(notes) > slide_count:
        print(
            f"Aviso: {len(notes)} notas no arquivo, mas o deck tem {slide_count} slides. "
            "Notas extras serão ignoradas.",
            file=sys.stderr,
        )

    applied = apply_notes(prs, notes)
    prs.save(str(out))

    print(f"Entrada:  {pptx_path}")
    print(f"Notas:    {notes_path}")
    print(f"Slides no deck: {slide_count}")
    print(f"Notas no arquivo: {len(notes)}")
    print(f"Notas aplicadas: {applied}")
    print(f"Salvo: {out}")
    print("Abra no PowerPoint: Exibir → Notas (ou modo Apresentador).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
