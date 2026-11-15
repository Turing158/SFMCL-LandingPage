import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import ts from "typescript";

const extensions = ["", ".ts", ".tsx", ".js", ".jsx", ".json", ".css"];
const slash = (path) => path.replaceAll("\\", "/");
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

async function resolveImport(file, specifier) {
  if (!specifier.startsWith(".")) return;
  const base = resolve(dirname(file), specifier.split(/[?#]/)[0]);
  for (const extension of extensions) {
    const path = base + extension;
    if (await stat(path).then((value) => value.isFile()).catch(() => false))
      return path;
  }
  for (const extension of extensions.slice(1)) {
    const path = join(base, "index" + extension);
    if (await stat(path).then((value) => value.isFile()).catch(() => false))
      return path;
  }
}

// Include type imports, dynamic imports and CSS, not just Rollup's runtime graph.
// Computed asset paths retain every matching candidate rather than guessing
// which visual states the visitor will choose.
export async function launcherDependencies(root) {
  const modules = new Set();
  const assets = new Set();
  const assetPatterns = [];
  let ambiguousModules = false;
  const visitAsset = (parts) => {
    const index = parts[0].indexOf("assets/");
    if (index < 0) return;
    const first = parts[0].slice(index + "assets/".length);
    if (parts.length === 1) {
      if (first.endsWith("/"))
        assetPatterns.push(new RegExp("^" + escape(first)));
      else assets.add(first.split(/[?#]/)[0]);
    } else {
      assetPatterns.push(new RegExp("^" + [first, ...parts.slice(1)]
        .map(escape).join(".*") + "$"));
    }
  };
  const visit = async (file) => {
    if (modules.has(file)) return;
    modules.add(file);
    const extension = extname(file);
    if (![".ts", ".tsx", ".js", ".jsx", ".css", ".html", ".json"].includes(extension))
      return;
    const content = await readFile(file, "utf8");
    const imports = new Set();
    if ([".ts", ".tsx", ".js", ".jsx"].includes(extension)) {
      const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
      const walk = (node) => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
          node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier))
          imports.add(node.moduleSpecifier.text);
        if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) &&
          ts.isStringLiteral(node.argument.literal))
          imports.add(node.argument.literal.text);
        if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword &&
          node.arguments[0] && ts.isStringLiteral(node.arguments[0]))
          imports.add(node.arguments[0].text);
        else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
          ambiguousModules = true;
        if (ts.isCallExpression(node) && /^import\.meta\.glob(?:Eager)?$/.test(node.expression.getText(source)))
          ambiguousModules = true;
        if (ts.isNewExpression(node) && node.expression.getText(source) === "URL" &&
          node.arguments?.[0] && ts.isStringLiteral(node.arguments[0]))
          imports.add(node.arguments[0].text);
        if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
          visitAsset([node.text]);
        if (ts.isTemplateExpression(node))
          visitAsset([node.head.text, ...node.templateSpans.map((span) => span.literal.text)]);
        ts.forEachChild(node, walk);
      };
      walk(source);
    } else if (extension === ".json") {
      const walk = (value) => {
        if (typeof value === "string") visitAsset([value]);
        else if (value && typeof value === "object") Object.values(value).forEach(walk);
      };
      walk(JSON.parse(content));
    } else {
      for (const match of content.matchAll(/(?:url\(\s*["']?|(?:src|href)=["'])([^"')\s>]+)/g)) {
        const reference = match[1].replace(/^["']/, "");
        visitAsset([reference]);
        if (reference.startsWith(".")) imports.add(reference);
      }
      for (const match of content.matchAll(/@import\s+["']([^"']+)["']/g))
        imports.add(match[1]);
    }
    for (const specifier of imports) {
      const dependency = await resolveImport(file, specifier);
      if (dependency) await visit(dependency);
    }
  };
  // The website shares launcher assets; its references protect those files too.
  for (const entry of ["src/main.tsx", "index.html", "embed/sfmcl-ui/boot.tsx", "embed/sfmcl-ui/index.html"])
    await visit(resolve(root, entry));
  if (ambiguousModules) {
    // An unresolvable dynamic import may reach any source or bundled asset.
    // Retain them all until its dependencies can be identified reliably.
    for (const file of await listFiles(resolve(root, "embed/sfmcl-ui/src")))
      modules.add(file);
    assetPatterns.push(/^/);
  }
  const assetUsed = (path) => {
    const relative = slash(path);
    if (assets.has(relative) || assetPatterns.some((pattern) => pattern.test(relative)))
      return true;
    // Keep licenses and provenance alongside the retained images and fonts.
    return /(?:^|\/)(?:README\.md|sources\.(?:json|js)|[^/]*OFL[^/]*\.txt)$/i.test(relative);
  };
  return { modules, assetUsed };
}
