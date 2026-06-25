/**
 * FASM (flat assembler) grammar for tree-sitter.
 *
 * Goal is good syntax highlighting, not full assembly validation. The grammar
 * tokenizes correctly (registers vs identifiers vs numbers vs strings) and
 * captures the structure highlighting needs: labels, data definitions, and
 * macro/struc `{ }` bodies. Keyword *classification* (directives, format
 * attributes, instruction mnemonics) is left to queries/highlights.scm so the
 * lists stay easy to extend.
 *
 * FASM is case-insensitive for instructions, registers and operators, so those
 * token patterns use the `i` flag.
 */

const REGISTER = /(?:r[abcd]x|e[abcd]x|[abcd]x|[abcd][hl]|r(?:8|9|1[0-5])[bwd]?|[er]?(?:sp|bp|si|di)|[sb]pl|[sd]il|[re]?ip|[cdesfg]s|cr[0-8]|dr[0-7]|tr[0-7]|st(?:[0-7])?|mm[0-7]|[xyz]mm(?:3[01]|[12][0-9]|[0-9]))/i;

const DATA_DIRECTIVE = /d[bwdqtpfo]|r[bwdqtpfo]|du|file/i;

module.exports = grammar({
  name: 'fasm',

  extras: $ => [/[ \t\r]/, $.comment, $.line_continuation],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat(choice($._statement, $._newline)),

    _newline: $ => '\n',

    _statement: $ => choice(
      $.label,
      $.macro_definition,
      $.assignment,
      $.data_definition,
      $.instruction,
    ),

    // `start:`
    label: $ => seq(field('name', $.identifier), ':'),

    // `macro write a, b { ... }` / `struc point x, y { ... }`
    macro_definition: $ => seq(
      field('keyword', $.macro_keyword),
      field('name', $.identifier),
      optional($._operand_list),
      repeat($._newline),
      $.block,
    ),

    macro_keyword: $ => token(/macro|struc|irp|irps/i),

    block: $ => seq('{', repeat(choice($._statement, $._newline)), '}'),

    // `msg_len = $ - msg`
    assignment: $ => prec.right(seq(
      field('name', $.identifier),
      '=',
      optional($._operand_list),
    )),

    // `msg db "hi", 0` / `rb 16`
    data_definition: $ => prec.right(seq(
      optional(field('name', $.identifier)),
      field('directive', $.data_directive),
      optional($._operand_list),
    )),

    data_directive: $ => token(DATA_DIRECTIVE),

    // `mov rax, 1` / `format ELF64 EXECUTABLE 3`
    instruction: $ => prec.right(seq(
      field('mnemonic', $.identifier),
      optional($._operand_list),
    )),

    // Operands may be separated by commas or just whitespace (FASM directives
    // like `segment readable executable` use whitespace).
    _operand_list: $ => repeat1(seq($._operand, optional(','))),

    _operand: $ => choice(
      $.register,
      $.number,
      $.float,
      $.string,
      $.memory,
      $.group,
      $.size_operator,
      $.current_address,
      $.identifier,
      $.operator,
    ),

    memory: $ => seq('[', repeat(choice($._operand, ':')), ']'),
    group: $ => seq('(', repeat(choice($._operand, ':')), ')'),

    register: $ => token(REGISTER),

    size_operator: $ => token(/byte|word|dword|qword|tword|tbyte|fword|pword|dqword|qqword|ptr/i),

    current_address: $ => choice('$$', '$'),

    operator: $ => token(/[+\-*/&|~^]|<<|>>|mod|and|or|xor|not|shl|shr|rva|plt/i),

    identifier: $ => /[A-Za-z_.?][A-Za-z0-9_.?@~]*/,

    number: $ => token(choice(
      /0[xX][0-9A-Fa-f]+/,
      /[0-9][0-9A-Fa-f]*[hH]/,
      /0[bB][01]+/,
      /[01]+[bB]/,
      /[0-7]+[oqOQ]/,
      /[0-9]+/,
    )),

    float: $ => token(/[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?/),

    string: $ => choice(
      seq('"', repeat(choice(/[^"]/, '""')), '"'),
      seq("'", repeat(choice(/[^']/, "''")), "'"),
    ),

    comment: $ => token(seq(';', /.*/)),

    line_continuation: $ => token(seq('\\', /\r?\n/)),
  },
});
