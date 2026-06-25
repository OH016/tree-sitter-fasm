; Structural captures (from the grammar)

(register) @variable.builtin

(current_address) @constant.builtin

(macro_keyword) @keyword

(size_operator) @keyword

(data_directive) @keyword

(label
  name: (identifier) @label)

(data_definition
  name: (identifier) @variable)

(assignment
  name: (identifier) @constant)

; Treat every instruction mnemonic and macro invocation as a function. FASM
; directives are also parsed as instructions; they are recolored as keywords by
; the #match? rules below (which come later and therefore win in Zed).
(instruction
  mnemonic: (identifier) @function)

(macro_definition
  name: (identifier) @function)

; Literals

(number) @number

(float) @number.float

(string) @string

(comment) @comment

; Operators & punctuation

(operator) @operator

"=" @operator

[
  ","
  ":"
] @punctuation.delimiter

[
  "{"
  "}"
  "["
  "]"
  "("
  ")"
] @punctuation.bracket

; FASM directives — parsed as instruction mnemonics, recolored as keywords.
((instruction
  mnemonic: (identifier) @keyword)
  (#match? @keyword "^(?i)(format|segment|section|entry|stack|heap|public|extrn|extern|include|org|align|times|virtual|load|store|repeat|rept|irp|irps|while|if|else|end|break|postpone|purge|macro|struc|restruc|common|forward|local|match|define|restore|fix|equ|assert|display|err|use16|use32|use64|namespace|label|data|file)$"))

; Segment / section attribute keywords (operands of `segment` / `section`).
((identifier) @keyword
  (#match? @keyword "(?i)^(readable|writeable|writable|executable|shareable|discardable|notpageable|resource|fixups|import|export|native|gui|console|efi|efiboot|efiruntime|dll|wdm|nx|large)$"))

; Output format / type names (operands of `format`: ELF64, PE, COFF, ...).
((identifier) @type
  (#match? @type "(?i)^(elf|elf64|elfexe|elfruntime|pe|pe64|peconsole|pegui|ms|ms64|coff|mz|bin|binary|at)$"))
