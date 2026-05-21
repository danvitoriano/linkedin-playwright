#!/usr/bin/env python3
"""Extrai blocos numerados (1. … 11.) de um arquivo de roteiro em texto."""

from __future__ import annotations

import re
from pathlib import Path


def _strip_comments(text: str) -> str:
    lines = [ln for ln in text.splitlines() if not ln.strip().startswith("#")]
    return "\n".join(lines).strip()


def parse_roteiro_text(text: str) -> dict[int, str]:
    text = _strip_comments(text)
    if not text:
        return {}

    # Preferência: blocos separados por linhas de traços
    chunks = re.split(r"\n-{5,}\n", text)
    sections: dict[int, str] = {}

    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        match = re.match(r"^(\d+)\.\s+", chunk)
        if match:
            sections[int(match.group(1))] = chunk

    if sections:
        return sections

    # Fallback: quebra em cada "N. " no início de bloco
    for match in re.finditer(r"(?:^|\n)(\d+)\.\s+[^\n]+", text):
        num = int(match.group(1))
        start = match.start(1) if match.start(1) != 0 else match.start() + 1
        next_match = re.search(r"(?:^|\n)\d+\.\s+", text[match.end() :])
        end = match.end() + next_match.start() if next_match else len(text)
        sections[num] = text[start:end].strip()

    return sections


def parse_roteiro_file(path: Path) -> dict[int, str]:
    return parse_roteiro_text(path.read_text(encoding="utf-8"))
