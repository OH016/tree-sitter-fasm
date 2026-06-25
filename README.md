# tree-sitter-fasm

A [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for
[FASM](https://flatassembler.net/) (flat assembler), built for syntax
highlighting.

It is intentionally forgiving rather than a full assembly validator: it
tokenizes FASM correctly (registers, numbers in all FASM radixes, `;` comments,
strings) and captures the structure highlighting needs such as labels, data
definitions (`msg db ...`), and `macro` / `struc` `{ ... }` bodies. Keyword
*classification* (directives, segment attributes, format names) lives in
[`queries/highlights.scm`](queries/highlights.scm) via `#match?` predicates, so
those lists are easy to extend.

Used by the [zed-fasm](https://github.com/kmschr/zed-fasm) Zed extension.
