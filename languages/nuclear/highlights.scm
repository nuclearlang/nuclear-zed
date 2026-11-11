; General first: in Zed a later pattern wins over an earlier one for the same node.
(identifier) @variable
(type_identifier) @type

((identifier) @type.builtin
  (#match? @type.builtin "^(string|int|double|bool|void|dynamic|num|float|number|any|object|never)$"))

; calls: `name(...)`, `Type(...)`, `.method(...)`
((identifier) @function . (parenthesized))
((type_identifier) @constructor . (parenthesized))

; members: `.name`, `?.name`, `$field`
("." . (identifier) @property)
("?." . (identifier) @property)
("." . (identifier) @function . (parenthesized))
("?." . (identifier) @function . (parenthesized))
("$" . (identifier) @property)

; named arguments `f(name = value)` and parameters / object keys `name: value`
(parenthesized ["(" ","] . (identifier) @variable.parameter . "=")
(parenthesized ["(" ","] . (identifier) @variable.parameter . "?"? . ":")
(braces ["{" ","] . (identifier) @property . ":")

((identifier) @variable.special (#eq? @variable.special "_"))

(comment) @comment
((comment) @comment.doc (#match? @comment.doc "^//[^\\n]*\\n"))

(string ["\"" "'" "\"\"\"" "'''" "r\"" "r'" "r\"\"\"" "r'''"] @string)
(string_content) @string
(string "$" @string)
(escape_sequence) @string.escape

(number) @number
(decorator) @attribute

["use" "from" "as" "if" "else" "for" "in" "while" "match" "return" "break" "continue" "yield" "try" "catch"
 "finally" "throw" "and" "or" "not" "is"] @keyword
"~" @keyword
["true" "false"] @boolean
"null" @constant.builtin
["this" "super"] @variable.special

["=>" "->" "..." ".." "?." "??=" "??" "?" "==" "!=" "<=" ">="
 "**=" "~/=" ">>>=" "<<=" ">>=" "&=" "^=" "|=" "%=" "+=" "-=" "*=" "/="
 "**" "~/" ">>>" "<<" ">>" "<" ">" "=" "+" "-" "*" "/" "%" "&" "^" "|" "!" "$"] @operator
["(" ")" "[" "]" "{" "}"] @punctuation.bracket
["," ":" "."] @punctuation.delimiter
(interpolation ["${" "}"] @punctuation.special)
