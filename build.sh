#!/usr/bin/env sh
# Builds the Zed extension and installs it into Zed (the same files Zed writes when it installs an extension):
#   zed/build.sh              build + install into ${XDG_DATA_HOME:-~/.local/share}/zed/extensions/installed/nuclearlang
# Needs: rustup target wasm32-wasip2, node; tree-sitter (cargo install tree-sitter-cli) only if grammar.js changed.
# The language server is ~/.local/bin/nuclear-lsp (the nuclear repository's install.sh installs it with its dialects).
set -eu
ZED=$(cd "$(dirname "$0")" && pwd)
OUT=${XDG_DATA_HOME:-$HOME/.local/share}/zed/extensions/installed/nuclearlang
TS=$(command -v tree-sitter || echo "$HOME/.cargo/bin/tree-sitter")

# grammar: regenerate the parser and its wasm when grammar.js changed (the installed extension uses the wasm; Zed's
# own build of the published extension reads grammar/ at the commit extension.toml names)
cd "$ZED/grammar"
if [ ! -f nuclear.wasm ] || [ grammar.js -nt nuclear.wasm ]; then
  "$TS" generate
  "$TS" build --wasm -o nuclear.wasm
fi

cd "$ZED"
node scripts/icons.mjs >/dev/null
cargo build --release --quiet --target wasm32-wasip2

rm -rf "$OUT"
mkdir -p "$OUT/grammars"
cp -R extension.toml languages themes icon_themes icons "$OUT/"
cp target/wasm32-wasip2/release/zed_nuclearlang.wasm "$OUT/extension.wasm"
cp grammar/nuclear.wasm "$OUT/grammars/nuclear.wasm"
echo "Zed extension installed in $OUT (Zed reloads it by itself; if not, restart Zed)"
