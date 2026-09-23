import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i];
  const value = process.argv[i + 1];
  if (!key?.startsWith('--') || !value || value.startsWith('--')) {
    throw new Error('Usage: prepare-design-system-preview.mjs --package-dir <path> [--project-dir <path>] [--theme-dir <path>]');
  }
  args.set(key.slice(2), value);
}

const projectDir = path.resolve(args.get('project-dir') ?? process.cwd());
const packageDir = path.resolve(args.get('package-dir') ?? '');
if (!args.has('package-dir')) throw new Error('--package-dir must point to the installed kit directory.');
const sourceCatalog = path.join(packageDir, 'dist/storybook');
const catalogFiles = await Promise.all(['index.html', 'index.json', 'iframe.html'].map((file) => fs.access(path.join(sourceCatalog, file))));
void catalogFiles;

const requestedThemeDir = args.get('theme-dir') ?? 'src/theme';
const themeDir = path.resolve(projectDir, requestedThemeDir);
const themeStat = await fs.stat(themeDir).catch((error) => error.code === 'ENOENT' ? null : Promise.reject(error));
if (themeStat && !themeStat.isDirectory()) throw new Error(`Theme path is not a directory: ${themeDir}`);
if (themeStat) await fs.access(path.join(themeDir, 'theme.css'));

const outputDir = path.join(projectDir, '.telos/design-system-preview');
const telosDir = path.dirname(outputDir);
const telosStat = await fs.lstat(telosDir).catch((error) => error.code === 'ENOENT' ? null : Promise.reject(error));
if (telosStat?.isSymbolicLink() || (telosStat && !telosStat.isDirectory())) {
  throw new Error(`Preview parent must be a regular directory: ${telosDir}`);
}
const markerPath = path.join(outputDir, '.managed-by-build-with-telos');
const outputStat = await fs.lstat(outputDir).catch((error) => error.code === 'ENOENT' ? null : Promise.reject(error));
if (outputStat?.isSymbolicLink() || (outputStat && !outputStat.isDirectory())) {
  throw new Error(`Preview output must be a regular directory: ${outputDir}`);
}
if (outputStat) {
  const marker = await fs.readFile(markerPath, 'utf8').catch(() => '');
  if (marker.trim() !== 'build-with-telos') {
    throw new Error(`Refusing to replace an unowned preview directory: ${outputDir}`);
  }
  await fs.rm(outputDir, { recursive: true, force: true });
}

await fs.mkdir(outputDir, { recursive: true });
await fs.cp(sourceCatalog, outputDir, { recursive: true, dereference: false });
if (themeStat) {
  const themeOutput = path.join(outputDir, 'theme');
  await fs.rm(themeOutput, { recursive: true, force: true });
  await fs.cp(themeDir, themeOutput, { recursive: true, dereference: false });
}
await fs.writeFile(markerPath, 'build-with-telos\n');
const ignorePath = path.join(projectDir, '.gitignore');
const ignoreRule = '/.telos/design-system-preview/';
const gitignore = await fs.readFile(ignorePath, 'utf8').catch((error) => error.code === 'ENOENT' ? '' : Promise.reject(error));
if (!gitignore.split(/\r?\n/).includes(ignoreRule)) {
  await fs.writeFile(ignorePath, `${gitignore}${gitignore && !gitignore.endsWith('\n') ? '\n' : ''}${ignoreRule}\n`);
}
console.log(`Prepared the Telos component preview at ${outputDir}`);
console.log(`Serve it with: python3 -m http.server 6006 --bind 127.0.0.1 --directory "${outputDir}"`);
