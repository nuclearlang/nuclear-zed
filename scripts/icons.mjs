// Converts the VS Code icon themes (theme/icons.mjs writes them to vscode/icon-themes) to a Zed icon theme:
// zed/icon_themes/chernobyl-icons.json + the SVGs in zed/icons/.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const zed = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(zed, '../nuclear-vscode/icon-themes'); // the sibling extension's icons (plan 006)
const variants = [['Chernobyl Icons', 'chernobyl'], ['Chernobyl Soft Icons', 'chernobyl-soft']];

rmSync(join(zed, 'icons'), { recursive: true, force: true });
cpSync(source, join(zed, 'icons'), { recursive: true, filter: (p) => !p.endsWith('.json') });

const themes = variants.map(([name, slug]) => {
  const t = JSON.parse(readFileSync(join(source, `${slug}-icon-theme.json`), 'utf8'));
  const path = (id) => t.iconDefinitions[id].iconPath.replace(/^\.\//, './icons/');
  const dir = (closed, open) => ({ collapsed: path(closed), expanded: path(open ?? closed) });
  const file_icons = Object.fromEntries(Object.keys(t.iconDefinitions).map((id) => [id, { path: path(id) }]));
  file_icons.default = { path: path(t.file) };
  return {
    name,
    appearance: 'dark',
    directory_icons: dir(t.folder, t.folderExpanded),
    named_directory_icons: Object.fromEntries(
      Object.entries(t.folderNames).map(([n, id]) => [n, dir(id, t.folderNamesExpanded[n])]),
    ),
    file_stems: t.fileNames,
    file_suffixes: t.fileExtensions,
    file_icons,
  };
});
mkdirSync(join(zed, 'icon_themes'), { recursive: true });
writeFileSync(
  join(zed, 'icon_themes/chernobyl-icons.json'),
  JSON.stringify({ $schema: 'https://zed.dev/schema/icon_themes/v0.3.0.json', name: 'Chernobyl Icons', author: 'NuclearLang', themes }) + '\n',
);
console.log('wrote zed/icon_themes/chernobyl-icons.json');
