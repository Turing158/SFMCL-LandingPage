import { readFile, realpath, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { launcherDependencies, listFiles } from "./launcher-dependencies.mjs";

export async function pruneLauncher(root) {
  const sourceRoot = resolve(root, "embed/sfmcl-ui/src");
  const assetsRoot = resolve(root, "public/assets");
  const graph = await launcherDependencies(root);
  const candidates = [];
  const ambientTypes = await readFile(join(root, "src/vite-env.d.ts"), "utf8");
  for (const file of await listFiles(sourceRoot)) {
    if (graph.modules.has(file)) continue;
    // Ambient declarations are implicit dependencies. Only remove the duplicate
    // Vite declaration already supplied by the website's TypeScript entry.
    if (file.endsWith(".d.ts") && await readFile(file, "utf8") !== ambientTypes)
      continue;
    candidates.push({ file, boundary: sourceRoot, kind: "code" });
  }
  for (const file of await listFiles(assetsRoot)) {
    const path = relative(assetsRoot, file).replaceAll("\\", "/");
    const belongsToLauncher = /^(?:DefaultGameIcon|element|icons|players|minecraft)\//.test(path) ||
      /^launcher-(?:light|dark)\.webp$/.test(path);
    if (belongsToLauncher && !graph.assetUsed(path))
      candidates.push({ file, boundary: assetsRoot, kind: "asset" });
  }
  // Resolve and validate every target before any deletion. Only unlink regular
  // files inside these two workspace folders; never remove a directory tree.
  for (const candidate of candidates) {
    const boundary = await realpath(candidate.boundary);
    const actual = await realpath(candidate.file);
    const path = relative(boundary, actual);
    if (!path || path.startsWith("..") || isAbsolute(path))
      throw new Error(`清理路径超出展示区：${candidate.file}`);
    candidate.bytes = (await stat(candidate.file)).size;
  }
  for (const candidate of candidates) await unlink(candidate.file);
  const manifestPath = join(root, "embed/sfmcl-ui/source-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const removedCode = new Set(candidates.filter((item) => item.kind === "code")
    .map((item) => relative(sourceRoot, item.file).replaceAll("\\", "/")));
  manifest.files = manifest.files.filter((file) => !removedCode.has(file.path));
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  return {
    code: removedCode.size,
    assets: candidates.filter((item) => item.kind === "asset").length,
    bytes: candidates.reduce((sum, item) => sum + item.bytes, 0),
    retainedCode: manifest.files.length,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  console.log(JSON.stringify(await pruneLauncher(root), null, 2));
}
