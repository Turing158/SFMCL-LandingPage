import { createHash } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceArgument = process.argv.indexOf("--source");
const source = resolve(
  sourceArgument >= 0
    ? process.argv[sourceArgument + 1]
    : "D:/EducationalData/rust/SFMCL-T/SFMCL-T",
);
const manifest = [];
async function copyTree(from, to, filter = () => true) {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    if (!filter(entry.name) || entry.isSymbolicLink()) continue;
    const origin = join(from, entry.name);
    const destination = join(to, entry.name);
    if (entry.isDirectory()) await copyTree(origin, destination, filter);
    else if (entry.isFile()) {
      await copyFile(origin, destination);
      if (from.startsWith(join(source, "src"))) {
        const relative = destination
          .slice(join(root, "embed/sfmcl-ui/src").length + 1)
          .replaceAll("\\", "/");
        manifest.push({
          path: relative,
          sha256: createHash("sha256")
            .update(await readFile(origin))
            .digest("hex"),
        });
      }
    }
  }
}
await copyTree(
  join(source, "src"),
  join(root, "embed/sfmcl-ui/src"),
  (name) =>
    !/\.(test|spec)\./.test(name) && !["__tests__", "tests"].includes(name),
);
await copyTree(join(source, "public/assets"), join(root, "public/assets"));
await mkdir(join(root, "embed/sfmcl-ui/src-tauri/icons"), { recursive: true });
await copyFile(
  join(source, "src-tauri/icons/icon.ico"),
  join(root, "embed/sfmcl-ui/src-tauri/icons/icon.ico"),
);
await writeFile(
  join(root, "embed/sfmcl-ui/source-manifest.json"),
  JSON.stringify(
    { source, files: manifest.sort((a, b) => a.path.localeCompare(b.path)) },
    null,
    2,
  ) + "\n",
);
console.log(
  `已同步 ${manifest.length} 个前端文件，所有原始组件与样式保持逐字节一致。`,
);
