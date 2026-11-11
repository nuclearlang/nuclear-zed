/**
 * Tree-sitter grammar of NuclearLang for Zed: a token-level grammar (comments, strings with interpolation,
 * numbers, words, operators and nested brackets). It never fails on half-written code; the meaning of each
 * name (declaration, kind, parameter, library function...) comes from the language server's semantic tokens.
 */
const KEYWORDS = [
  'use', 'from', 'as', 'if', 'else', 'for', 'in', 'while', 'match', 'return', 'break', 'continue', 'yield',
  'try', 'catch', 'finally', 'throw', 'and', 'or', 'not', 'is', 'true', 'false', 'null', 'this', 'super',
];
const OPERATORS = [
  '=>', '->', '...', '..', '.', '?.', '??=', '??', '?', '==', '!=', '<=', '>=',
  '**=', '~/=', '>>>=', '<<=', '>>=', '&=', '^=', '|=', '%=', '+=', '-=', '*=', '/=',
  '**', '~/', '>>>', '<<', '>>', '<', '>', '=', '+', '-', '*', '/', '%', '&', '^', '|', '~', '$', '!', ':', ',',
];

module.exports = grammar({
  name: 'nuclear',
  extras: (_) => [/\s/],
  word: ($) => $.identifier,

  rules: {
    source_file: ($) => repeat($._item),

    _item: ($) => choice(
      $.comment, $.string, $.number, $.decorator, $.identifier, $.type_identifier,
      $.parenthesized, $.list, $.braces, ...KEYWORDS, ...OPERATORS,
    ),

    // `// text` and its continuation lines ` * text` (the `*` under the second `/`)
    comment: (_) => token(/\/\/[^\n]*(\n[ \t]*\*[^\n]*)*/),

    string: ($) => choice(
      seq('"""', repeat(choice($._double_content, $.escape_sequence, $.interpolation, token.immediate('"'), token.immediate('$'))), '"""'),
      seq("'''", repeat(choice($._single_content, $.escape_sequence, $.interpolation, token.immediate("'"), token.immediate('$'))), "'''"),
      seq('"', repeat(choice($._double_content, $.escape_sequence, $.interpolation, token.immediate('$'))), '"'),
      seq("'", repeat(choice($._single_content, $.escape_sequence, $.interpolation, token.immediate('$'))), "'"),
      // raw strings `r"..."`: no escapes, no interpolation
      seq('r"""', repeat(choice($._raw_double, token.immediate('"'))), '"""'),
      seq("r'''", repeat(choice($._raw_single, token.immediate("'"))), "'''"),
      seq('r"', repeat($._raw_double), '"'),
      seq("r'", repeat($._raw_single), "'"),
    ),
    _double_content: ($) => alias(token.immediate(prec(1, /[^"\\$]+/)), $.string_content),
    _single_content: ($) => alias(token.immediate(prec(1, /[^'\\$]+/)), $.string_content),
    _raw_double: ($) => alias(token.immediate(/[^"]+/), $.string_content),
    _raw_single: ($) => alias(token.immediate(/[^']+/), $.string_content),
    escape_sequence: (_) => token.immediate(/\\(u\{[0-9A-Fa-f]+\}|.)/),
    interpolation: ($) => seq(token.immediate('${'), repeat($._item), '}'),

    number: (_) => /0x[0-9A-Fa-f_]+|0b[01_]+|\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d[\d_]*)?/,
    decorator: (_) => token(seq('@', /[A-Za-z_]\w*(\.[A-Za-z_]\w*)*/)),
    identifier: (_) => /[a-z_][A-Za-z0-9_]*/,
    type_identifier: (_) => /[A-Z][A-Za-z0-9_]*/,

    parenthesized: ($) => seq('(', repeat($._item), ')'),
    list: ($) => seq('[', repeat($._item), ']'),
    braces: ($) => seq('{', repeat($._item), '}'),
  },
});
