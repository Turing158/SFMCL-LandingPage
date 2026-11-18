import { resourceGroups } from "../../src/data";
import type { LocalizedName, LocalResource, Project } from "./src/types";

interface Sample {
  kind: string;
  title: string;
  slug: string;
  tag: string;
  description: string;
  icon: string;
  localizedName?: LocalizedName;
  loaders: string[];
}

const samples: Sample[] = resourceGroups.flatMap((group) => group.cards
  .filter((card) => card.slug !== "iris") // Iris is a mod, not a shader pack.
  .map((card) => ({
    kind: group.projectType, title: card.title, slug: card.slug, tag: card.tag,
    description: card.desc, icon: `/assets/resource-${card.slug}.png`,
    localizedName: card.localizedName,
    loaders: group.projectType !== "mod" ? [] :
      card.slug === "sodium" ? ["Fabric"] : ["Fabric", "Forge"],
  })));
samples.push({
  kind: "modpack", title: "Fabulously Optimized", slug: "fabulously-optimized",
  localizedName: { name: "难以置信的优化", aliases: ["FO"] },
  tag: "性能优化", description: "面向原版玩法的 Fabric 性能优化整合包。",
  icon: "", loaders: ["Fabric"],
});

export function sampleCategories(kind: string) {
  const tags = new Set(samples.filter((sample) => sample.kind === kind).map((sample) => sample.tag));
  return Array.from(tags, (tag) => ({ id: tag, name: tag }));
}

export function searchSamples({
  kind, query = "", gameVersion, category, loader, source = "modrinth",
}: {
  kind: string; query?: string; gameVersion?: string; category?: string;
  loader?: string; source?: string;
}) {
  const term = query.trim().toLowerCase();
  const items: Project[] = samples.filter((sample) => {
    const names = [sample.title, sample.slug, sample.localizedName?.name, ...(sample.localizedName?.aliases ?? [])];
    return sample.kind === kind && (!category || sample.tag === category)
      && (!gameVersion || gameVersion === "1.20.1")
      && (!loader || sample.loaders.includes(loader))
      && names.some((name) => name?.toLowerCase().includes(term));
  }).map((sample) => ({
    id: sample.slug, source, slug: sample.slug, title: sample.title,
    localizedName: sample.localizedName, description: sample.description, icon: sample.icon,
    categories: [sample.tag], versions: ["1.20.1"], author: "展示示例",
    downloads: 0, website: "", body: "",
  }));
  return { items, total: items.length };
}

export function localModSamples(versionPath: string): LocalResource[] {
  return samples.filter((sample) => sample.kind === "mod").map((sample) => ({
    kind: "mod", name: sample.title, localizedName: sample.localizedName,
    path: `${versionPath}/mods/${sample.slug}.jar`, entryType: "file",
    description: sample.description, icon: sample.icon, version: "", authors: "展示示例",
    disabled: false, size: null, details: {},
  }));
}
