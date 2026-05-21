# Notas do apresentador em PPTX

Experimenta adicionar **notas do apresentador** a um PowerPoint a partir de um arquivo de texto ou JSON — sem abrir o app; o `.pptx` é editado direto (OOXML via [python-pptx](https://python-pptx.readthedocs.io/)).

## Requisitos

- Python 3.9+
- Dependência: `python-pptx`

```bash
cd pptx
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Uso (seu PPTX + seu arquivo de notas)

Informe **dois caminhos**: o PowerPoint e o arquivo de notas.

```bash
# Da raiz do repo (rode pptx:setup uma vez antes)
npm run pptx:notes -- /caminho/apresentacao.pptx /caminho/notas.txt
```

Com saída em outro lugar:

```bash
npm run pptx:notes -- deck.pptx notas.txt -o /caminho/deck-final.pptx
```

Dentro de `pptx/` com o venv ativo:

```bash
cd pptx && source .venv/bin/activate
python add-notes.py ~/Downloads/meu-deck.pptx ~/Documents/notas.txt
python add-notes.py deck.pptx notas.json -o deck-com-notas.pptx
```

A saída padrão fica ao lado do PPTX original: `meu-deck-com-notas.pptx`.

## Teste com exemplo incluído

```bash
npm run pptx:setup
npm run pptx:notes:example
```

Ou manualmente: `python create-sample.py` e depois `python add-notes.py example.pptx notes.example.txt`.

## Formato do arquivo de notas

### Texto (`.txt`)

Uma nota por slide, blocos separados por **linha em branco**:

```text
Abrir com contexto.

Mostrar roadmap.

Encerrar com CTA.
```

Alternativa: **uma linha por slide** (sem linhas em branco entre elas).

### JSON (`.json`)

Array (índice = slide, começando em 0 na lista, slide 1 = primeiro item):

```json
["Nota slide 1", "Nota slide 2", "Nota slide 3"]
```

Ou objeto com chave por slide:

```json
{
  "1": "Nota slide 1",
  "2": "Nota slide 2"
}
```

## Arquivos gerados

| Arquivo | Descrição |
|---------|-----------|
| `example.pptx` | Deck de exemplo (3 slides) |
| `example-com-notas.pptx` | Saída após `add-notes.py` |
| `notes.example.txt` | Notas de exemplo |

Arquivos `.pptx` gerados localmente estão no `.gitignore`; use `create-sample.py` para recriar o exemplo.
