import { version as launcherVersion } from "../embed/sfmcl-ui/source-manifest.json";

export const REPO = "https://github.com/Turing158/SFMCL-Transformed";
export const RELEASES = `${REPO}/releases`;
export const VERSION = launcherVersion;

export const loaders = [
  {
    name: "Fabric",
    image: "Fabric.png",
    label: "轻装上阵，自由扩展。",
    text: "轻量的模组加载器，安装时可附带 Fabric API。为自己的世界挑选需要的模组，保持简单，也保留可能。",
    tags: ["轻量加载器", "可附带 Fabric API"],
    parts: ["Minecraft", "Fabric", "Fabric API（可选）"],
  },
  {
    name: "Forge",
    image: "Forge.png",
    label: "熟悉的模组，熟悉的世界。",
    text: "为丰富的 Forge 模组生态准备游戏环境。支持选择兼容的 Forge + OptiFine 组合，具体可用版本以安装列表为准。",
    tags: ["丰富模组生态", "兼容组合检查"],
    parts: ["Minecraft", "Forge", "OptiFine（兼容版本）"],
  },
  {
    name: "NeoForge",
    image: "NeoForge.png",
    label: "新一代模组冒险。",
    text: "安装 NeoForge，探索对应版本的模组与整合包。启动器统一处理游戏与加载器安装，游戏目录可独立管理。",
    tags: ["现代模组生态", "独立游戏目录"],
    parts: ["Minecraft", "NeoForge", "你的模组"],
  },
  {
    name: "Quilt",
    image: "quiltmc.png",
    label: "给自己的世界，多一种选择。",
    text: "选择 Quilt 加载器和适配的游戏版本。资源中心可按版本筛选模组，安装前请确认项目所需的加载器与依赖。",
    tags: ["社区加载器", "按版本筛选"],
    parts: ["Minecraft", "Quilt", "兼容模组"],
  },
  {
    name: "OptiFine",
    image: "Optifine.png",
    label: "从画面细节，找到新风景。",
    text: "为可用的 Minecraft 版本安装 OptiFine。支持兼容的 Forge 组合；光影与材质包的适用条件请查看各资源说明。",
    tags: ["画面与性能设置", "支持兼容 Forge 组合"],
    parts: ["Minecraft", "OptiFine", "你的画面设置"],
  },
  {
    name: "LiteLoader",
    image: "LiteLoader.png",
    label: "老版本，也有新的故事。",
    text: "为历史游戏版本准备 LiteLoader 环境，继续使用对应的轻量模组。可安装的版本与组件由安装列表提供。",
    tags: ["历史版本支持", "轻量模组"],
    parts: ["Minecraft", "LiteLoader", "经典模组"],
  },
];

export const resourceGroups = [
  {
    id: "mods",
    name: "模组",
    projectType: "mod",
    heading: "世界的可能，由你扩展。",
    description:
      "从性能优化到全新玩法，按游戏版本与加载器筛选，找到适合你的下一块拼图。",
    cards: [
      {
        title: "Sodium",
        desc: "让方块世界的每一帧，都更加流畅。",
        slug: "sodium",
        tint: "#f6e8de",
        tag: "性能优化",
      },
      {
        title: "Just Enough Items",
        desc: "从合成配方到物品用途，随手可查。",
        slug: "jei",
        tint: "#e5ead9",
        tag: "实用工具",
      },
      {
        title: "AppleSkin",
        desc: "饥饿值与饱和度，让每一餐心中有数。",
        slug: "appleskin",
        tint: "#efe1df",
        tag: "游戏辅助",
      },
    ],
  },
  {
    id: "resourcepacks",
    name: "材质包",
    projectType: "resourcepack",
    heading: "熟悉的方块，全新的质感。",
    description:
      "换一种方式看见你的世界。浏览材质包、查看版本信息，下载到自己的游戏目录。",
    cards: [
      {
        title: "Fresh Animations",
        desc: "为世界里的小伙伴，注入更多生动细节。",
        slug: "fresh-animations",
        tint: "#e1e9db",
        tag: "生物动画",
      },
      {
        title: "Faithful 32x",
        desc: "保留原版的熟悉感，发现更细腻的纹理。",
        slug: "faithful-32x",
        tint: "#e7e5db",
        tag: "高清材质",
      },
      {
        title: "Better Leaves",
        desc: "蓬松的树叶，让每一片森林更加生动。",
        slug: "better-leaves",
        tint: "#e4e9dc",
        tag: "原版焕新",
      },
    ],
  },
  {
    id: "shaders",
    name: "光影",
    projectType: "shader",
    heading: "日出、微风，和一束好光。",
    description:
      "发现社区光影资源，查看适用版本和依赖。搭配支持的加载器，把风景留在自己的世界里。",
    cards: [
      {
        title: "Complementary",
        desc: "柔和的光影，重新发现日常风景。",
        slug: "complementary-reimagined",
        tint: "#e9e5d6",
        tag: "光影效果",
      },
      {
        title: "BSL Shaders",
        desc: "从晨光到星夜，为冒险增添电影感。",
        slug: "bsl-shaders",
        tint: "#dce7e8",
        tag: "氛围光影",
      },
      {
        title: "Iris",
        desc: "为 Fabric 生态开启光影体验。",
        slug: "iris",
        tint: "#e6dfee",
        tag: "光影加载器",
      },
    ],
  },
  {
    id: "datapacks",
    name: "数据包",
    projectType: "datapack",
    heading: "用小小的规则，创造新故事。",
    description:
      "为存档加入自定义内容与玩法。下载数据包后，将它放入目标世界的 datapacks 文件夹。",
    cards: [
      {
        title: "Terralith",
        desc: "越过下一座山，遇见意想不到的地貌。",
        slug: "terralith",
        tint: "#dce8da",
        tag: "地形生成",
      },
      {
        title: "Tectonic",
        desc: "更开阔的山川，容纳更远的冒险。",
        slug: "tectonic",
        tint: "#dde5e9",
        tag: "世界生成",
      },
      {
        title: "Incendium",
        desc: "深入下界，在炽热之地展开新旅程。",
        slug: "incendium",
        tint: "#eee0d8",
        tag: "下界探索",
      },
    ],
  },
];

export const faqs = [
  [
    "支持哪些操作系统？",
    "目前提供 Windows x64 和 x86 版本。x64 适用于 Windows 10 / 11 64 位系统；x86 适用于 Windows 10 32 位系统，也可在 64 位 Windows 上运行。",
  ],
  [
    "需要自己安装 Java 吗？",
    "需要。Minecraft 使用的 Java 需另行准备。你可以在设置中扫描或手动添加 Java，再根据游戏版本选择合适的运行环境。",
  ],
  [
    "支持正版账号和第三方登录吗？",
    "支持 Microsoft 设备授权、离线角色与第三方 Yggdrasil 登录，也支持 LittleSkin OAuth 登录。第三方角色用于单人游戏或采用对应验证服务的服务器，不能代替 Microsoft 正版认证。",
  ],
  [
    "已有的游戏与整合包可以导入吗？",
    "可以添加已有的游戏目录，也可以拖入整合包压缩文件或完整客户端目录。支持 Modrinth、CurseForge、MCBBS、MultiMC / Prism 等格式；服务端包和不兼容的自定义补丁会提示原因。",
  ],
  [
    "单文件版和安装版有什么区别？",
    "安装版提供安装流程，并可在缺少 WebView2 时联网下载安装环境。单文件版可以直接运行，但需要系统已经安装 WebView2 Runtime。两种版本都需要另行准备 Java。",
  ],
];
