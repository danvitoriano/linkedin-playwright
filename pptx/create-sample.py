#!/usr/bin/env python3
"""Gera example.pptx com 3 slides vazios para testar notas do apresentador."""

from pathlib import Path

from pptx import Presentation
from pptx.util import Inches

OUT = Path(__file__).resolve().parent / "example.pptx"
SLIDE_COUNT = 3


def main() -> None:
    prs = Presentation()
    blank = prs.slide_layouts[6]  # blank

    for i in range(SLIDE_COUNT):
        slide = prs.slides.add_slide(blank)
        box = slide.shapes.add_textbox(Inches(1), Inches(2), Inches(8), Inches(1))
        box.text_frame.text = f"Slide {i + 1}"

    prs.save(OUT)
    print(f"Criado: {OUT} ({SLIDE_COUNT} slides)")


if __name__ == "__main__":
    main()
