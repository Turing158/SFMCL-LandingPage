// Exact palette values from SFMCL-T src/styles.css, including dark variants.
export const appearancePalettes = [
  {
    id: "forest",
    name: "主世界配色",
    light: { accent: "#32785b", onAccent: "#ffffff", bg: "#f6f8f5", panel: "#ffffff", soft: "#eaf3ec", line: "#e3e9e3", ink: "#24332c", sidebar: "#173e2e" },
    dark: { accent: "#81c69b", onAccent: "#10261a", bg: "#121b17", panel: "#1b2821", soft: "#283e30", line: "#334339", ink: "#e3eee6", sidebar: "#102d21" },
  },
  {
    id: "nether",
    name: "地狱配色",
    light: { accent: "#9b3d28", onAccent: "#ffffff", bg: "#fbf3ed", panel: "#fffaf6", soft: "#f6e3d6", line: "#ebd8ce", ink: "#3c211e", sidebar: "#3b1d1a" },
    dark: { accent: "#f0a15e", onAccent: "#351b13", bg: "#1e1313", panel: "#2e1d1b", soft: "#452b21", line: "#51342e", ink: "#f6e6d7", sidebar: "#231314" },
  },
  {
    id: "end",
    name: "末地配色",
    light: { accent: "#70508c", onAccent: "#ffffff", bg: "#f7f6e9", panel: "#fffdf2", soft: "#efe5f2", line: "#e2ddc8", ink: "#302737", sidebar: "#272030" },
    dark: { accent: "#c5a2df", onAccent: "#26182f", bg: "#15111d", panel: "#231d2e", soft: "#372a44", line: "#44394f", ink: "#eeecd2", sidebar: "#1b1425" },
  },
  {
    id: "sift",
    name: "筛界配色",
    light: { accent: "#9b3e5e", onAccent: "#ffffff", bg: "#edf9f6", panel: "#fffafb", soft: "#f9e5ec", line: "#d6e8e5", ink: "#293c40", sidebar: "#214d51" },
    dark: { accent: "#f1a0b8", onAccent: "#371d2a", bg: "#12272c", panel: "#1d363c", soft: "#432d3b", line: "#36545c", ink: "#f7eff3", sidebar: "#173d44" },
  },
] as const;
