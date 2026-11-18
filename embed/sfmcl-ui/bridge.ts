import type {
  Bootstrap,
  Settings,
  Tasks,
  Version,
  VersionSettings,
} from "./src/types";
import type { HomeContentConfig } from "./src/homeContentConfig";
import { playerPreviewDefaults } from "./src/playerPreview";
import type { MultiplayerSnapshot } from "./src/useMultiplayer";
import { version as launcherVersion } from "./source-manifest.json";
import { localModSamples, sampleCategories, searchSamples } from "./resourceSamples";

// Only the browser/IPC boundary is adapted. The application components and CSS
// are the original files, and all demo operations stay in this frame's memory.
// Register before the application mounts so dropped files and links cannot open
// desktop import overlays or replace the browser preview with a dropped URL.
const previewDragEvents = ["dragenter", "dragover", "dragleave", "drop"] as const;
const ignorePreviewDrop = (event: DragEvent) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "none";
};
previewDragEvents.forEach((event) =>
  window.addEventListener(event, ignorePreviewDrop, true),
);
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    previewDragEvents.forEach((event) =>
      window.removeEventListener(event, ignorePreviewDrop, true),
    );
  });

const desktopDropEvents = new Set([
  "tauri://drag-enter",
  "tauri://drag-over",
  "tauri://drag-leave",
  "tauri://drag-drop",
  "yggdrasil-card-drop",
]);
type Payload = Record<string, any>;
const theme =
  new URLSearchParams(location.search).get("theme") === "dark"
    ? "dark"
    : "light";
const directory = "C:/Minecraft";
const data: Bootstrap = {
  version: launcherVersion,
  dataDir: "C:/SFMCL-T",
  defaultDownloadCacheDir: "C:/SFMCL-T/downloads/cache",
  players: [
    {
      uuid: "showcase-alex",
      name: "Alex",
      online: false,
      skin: "",
      slim: false,
    },
    {
      uuid: "showcase-steve",
      name: "Steve",
      online: false,
      skin: "",
      slim: false,
    },
  ],
  settings: {
    schemaVersion: 1,
    gameDirs: [{ name: "我的世界", path: directory }],
    activeDir: directory,
    activeVersion: "1.21.4",
    activePlayer: "showcase-alex",
    javaPath: "C:/Java/jdk-21/bin/javaw.exe",
    javaPaths: ["C:/Java/jdk-21/bin/javaw.exe"],
    autoMemory: true,
    memoryMb: 4096,
    isolation: true,
    fullscreen: false,
    width: 1280,
    height: 720,
    windowTitle: "",
    customInfo: "SFMCL-T",
    windowMode: "default",
    windowMonitor: "",
    windowX: 0,
    windowY: 0,
    launcherAction: "keep",
    restoreLauncher: true,
    serverEnabled: false,
    serverHost: "",
    serverPort: 25565,
    quickPlayEnabled: false,
    quickPlayWorld: "",
    processPriority: "normal",
    jvmArgsEnabled: false,
    jvmArgs: "",
    gameArgs: "",
    offlineLan: false,
    theme,
    accent: "forest",
    backgroundType: "none",
    background: "",
    hardwareAcceleration: true,
    homeCleanMode: false,
    homeNoticeLayout: "masonry",
    ...playerPreviewDefaults,
    downloadTaskDisplay: "always",
    minecraftDownloadSource: "auto",
    downloadConcurrency: 8,
    downloadCacheDir: "",
    microsoftClientId: "",
    closeOnLaunch: false,
  } as Settings,
};
const versions: Version[] = ["1.21.4", "1.20.1-Fabric"].map((id) => ({
  id,
  version: id.split("-")[0],
  kind: "release",
  loader: id.includes("Fabric") ? "Fabric" : "Vanilla",
  path: `${directory}/.minecraft/versions/${id}`,
  directory,
  javaMajor: id.includes("Fabric") ? 17 : 21,
  icon: "",
}));
const tasks: Tasks = {
  jobs: [...versions.map((version, index) => ({
    id: `showcase-game-${index}`,
    createdAt: Math.floor(Date.now() / 1000) - (index + 1) * 300,
    title: `启动 ${version.id}`,
    status: "running" as const,
    steps: ["检查环境", "准备游戏文件", "启动 Java", "游戏运行"].map((name, step) => ({
      name, status: step === 3 ? "running" as const : "completed" as const,
      detail: step === 3 ? "游戏已启动" : "成功",
    })),
    currentStep: 3,
    log: [`Minecraft ${version.version} 已启动`],
    launch: {
      versionId: version.id, gameVersion: version.version, directory,
      playerName: index === 0 ? "Alex" : "Steve", offlineLan: false, running: true,
    },
  })), {
    id: "showcase-install", title: "安装 Minecraft 1.21.4", status: "completed",
    steps: ["检查环境", "下载游戏", "安装完成"].map((name) => ({
      name, status: "completed", detail: "成功",
    })),
    currentStep: 2, log: ["Minecraft 1.21.4 安装成功"],
  }],
  downloads: ["Minecraft 1.21.4", "Fabric API", "Sodium"].map((title, i) => ({
    id: `showcase-download-${i}`,
    title,
    status: i === 0 ? "running" : i === 1 ? "paused" : "completed",
    downloaded: i === 2 ? 104857600 : 67108864,
    total: 104857600,
    unknownSize: false,
    completed: i === 2 ? 80 : 51,
    failed: 0,
    fileCount: 80,
    speed: i === 0 ? 5242880 : 0,
    workers: i === 0 ? 8 : 0,
    steps: [],
  })),
};
let homeContent: HomeContentConfig = {
  schemaVersion: 1,
  widgets: [
    { id: "showcase:player", type: "player", visible: true },
    { id: "showcase:version", type: "version", visible: true },
    { id: "builtin:notices", type: "notices", visible: true },
  ],
};
const notices: Payload[] = [
  {
    id: "showcase:welcome",
    preset: false,
    title: "准备好，下一次冒险。",
    category: "欢迎",
    content:
      "**欢迎来到 SFMCL-T。**\n\n选择角色、准备版本，然后开始你的下一次冒险。",
  },
];
const hidden: string[] = [];
const versionSettings = new Map<string, VersionSettings>();
const copy = <T>(value: T): T => structuredClone(value);
// Reuse the fixed task snapshot between polls so
// the launcher does not render its entire tree every 500 ms for identical data.
const tasksSnapshot = copy(tasks);
const gameSettings = () => copy(data.settings);
const javaRuntime = (path: string) => ({
  path,
  major: Number(path.match(/jdk-(\d+)/)?.[1] || 21),
  version: "21.0.1",
  architecture: "x64",
});
const previewSuccess = (message = "操作成功") =>
  window.dispatchEvent(new CustomEvent("sfmcl-preview-success", { detail: message }));
const multiplayer: MultiplayerSnapshot = {
  state: "idle", sessionId: null, role: null,
  componentReady: true, componentVersion: "2.6.4",
  tunnelReady: true, tunnelVersion: "2026.10.7", componentJobId: null,
  name: "", gameVersion: "", address: null, worldOpen: false,
  members: [], error: null,
};
const callbacks = new Map<number, (event: unknown) => void>();
const listeners = new Map<number, { event: string; handler: number }>();
let callbackId = 0;
let listenerId = 0;
let maximized = false;

export function setPreviewTheme(next: string) {
  data.settings.theme = next === "dark" ? "dark" : "light";
}
export function setPreviewExpanded(value: boolean) {
  maximized = value;
  listeners.forEach((listener, id) => {
    if (listener.event === "tauri://resize")
      callbacks.get(listener.handler)?.({
        event: listener.event,
        id,
        payload: { width: 1120, height: 640 },
      });
  });
}

async function request(operation: string, payload: Payload) {
  switch (operation) {
    case "bootstrap":
      return copy(data);
    case "tasks":
      return tasksSnapshot;
    case "settings.save":
      data.settings = copy(payload as Settings);
      previewSuccess("设置修改成功");
      return copy(data.settings);
    case "versions.list":
      return copy(
        versions.filter((version) =>
          version.directory === (payload.directory || data.settings.activeDir),
        ).map((version) => ({
          ...version,
          isolation: data.settings.isolation,
          independentSettings:
            versionSettings.get(version.id)?.useGlobal === false,
        })),
      );
    case "versions.favorites":
      return copy(
        versions
          .filter((v) => v.favorite)
          .map((v) => ({ ...v, directory: v.directory || directory,
            directoryName: data.settings.gameDirs.find((d) => d.path === v.directory)?.name || "我的世界" })),
      );
    case "versions.select":
      data.settings.activeVersion = payload.id;
      if (payload.directory) data.settings.activeDir = payload.directory;
      return;
    case "versions.detail": {
      const version = versions.find((item) => item.id === payload.id) || versions[0];
      return {
        id: version.id, clientVersion: version.version,
        libraries: version.loader === "Fabric" ? [{ name: "net.fabricmc:fabric-loader:0.16.10" }] : [],
      };
    }
    case "versions.settings.get":
      return copy(
        versionSettings.get(payload.id) || {
          useGlobal: true,
          settings: gameSettings(),
        },
      );
    case "versions.settings.save":
      versionSettings.set(payload.id, copy(payload.config));
      previewSuccess("设置修改成功");
      return copy(payload.config);
    case "players.list":
      return copy(data.players);
    case "players.select":
      data.settings.activePlayer = payload.id;
      return;
    case "system.memory":
      return { availableMb: 16384 };
    case "multiplayer.status":
      return copy(multiplayer);
    case "multiplayer.check-local-port":
      return { reachable: true };
    case "multiplayer.official.preview":
    case "multiplayer.preview":
      return { name: "周末的生存世界", gameVersion: "1.21.4", server: "" };
    case "multiplayer.prepare":
    case "multiplayer.create":
    case "multiplayer.official.create":
    case "multiplayer.join":
    case "multiplayer.official.join":
    case "multiplayer.leave":
      previewSuccess("操作成功");
      return copy(multiplayer);
    case "system.monitors":
      return {
        supported: true,
        monitors: [
          { id: "showcase-display", primary: true, width: 1920, height: 1080 },
        ],
      };
    case "game.launch-options":
      return {
        supportsQuickPlay: true,
        directory,
        worlds: [{ id: "My World", name: "我的世界" }],
      };
    case "java.discover":
      return data.settings.javaPaths.map(javaRuntime);
    case "java.list":
      return (payload.paths || data.settings.javaPaths).map(javaRuntime);
    case "java.probe":
      return javaRuntime(payload.path);
    case "java.paths.save":
      data.settings.javaPaths = copy(payload.paths);
      return copy(payload.paths);
    case "home.content.get":
      return copy(homeContent);
    case "home.content.save":
      homeContent = copy(payload as HomeContentConfig);
      return copy(homeContent);
    case "notices.list":
      return copy(notices);
    case "notices.refresh":
      return { items: copy(notices), error: "" };
    case "notices.hidden":
      return copy(hidden);
    case "manifest":
      return {
        versions: ["1.21.4", "1.20.1", "1.19.4"].map((id) => ({
          id,
          type: "release",
          releaseTime: "2024-12-03T00:00:00Z",
          url: "",
        })),
      };
    case "loaders":
      return [
        {
          kind: payload.kind,
          version: payload.kind === "Fabric" ? "0.16.10" : "47.2.18",
          metadata: {},
        },
      ];
    case "resources.categories":
      return sampleCategories(payload.kind);
    case "resources.search":
      return searchSamples({ ...payload, kind: payload.kind });
    case "resources.local": {
      const version = versions.find((item) => item.id === payload.versionId);
      return payload.kind === "mod" && version?.loader === "Fabric"
        ? localModSamples(version.path) : [];
    }
    case "image":
      return "/assets/steve.png";
    case "updates":
      return { status: "latest", currentVersion: data.version, latestVersion: data.version };
    default:
      previewSuccess();
      return { success: true, message: "操作成功" };
  }
}

const runtime = window as unknown as {
  isTauri: boolean;
  __TAURI_INTERNALS__: unknown;
  __TAURI_EVENT_PLUGIN_INTERNALS__: unknown;
};
runtime.isTauri = true;
runtime.__TAURI_EVENT_PLUGIN_INTERNALS__ = {
  unregisterListener: (id: number) => listeners.delete(id),
};
runtime.__TAURI_INTERNALS__ = {
  metadata: {
    currentWindow: { label: "main" },
    currentWebview: { label: "main" },
  },
  transformCallback: (callback: (event: unknown) => void) => {
    const id = ++callbackId;
    callbacks.set(id, callback);
    return id;
  },
  unregisterCallback: (id: number) => callbacks.delete(id),
  invoke: async (command: string, args: Payload = {}) => {
    if (command === "request")
      return request(args.operation, args.payload || {});
    if (command === "plugin:event|listen") {
      const id = ++listenerId;
      if (!desktopDropEvents.has(args.event))
        listeners.set(id, { event: args.event, handler: args.handler });
      return id;
    }
    if (command === "plugin:event|unlisten") {
      listeners.delete(args.eventId);
      return;
    }
    if (command === "plugin:window|is_maximized") return maximized;
    if (command === "plugin:window|toggle_maximize") {
      maximized = !maximized;
      window.parent.postMessage(
        { type: "sfmcl-preview-expand", expanded: maximized },
        location.origin,
      );
      listeners.forEach((listener, id) => {
        if (listener.event === "tauri://resize")
          callbacks.get(listener.handler)?.({
            event: listener.event,
            id,
            payload: { width: 1120, height: 640 },
          });
      });
      return;
    }
    if (command === "plugin:window|close") {
      window.parent.postMessage(
        { type: "sfmcl-preview-close" },
        location.origin,
      );
      return;
    }
    if (command === "plugin:dialog|open" || command === "plugin:dialog|save")
      return null;
    if (command === "plugin:opener|open_url") {
      previewSuccess("打开成功");
      return;
    }
    if (
      command === "minimize_window" ||
      command === "startup_window" ||
      command === "plugin:window|start_dragging" ||
      command === "plugin:window|minimize"
    )
      return;
    previewSuccess();
    return;
  },
};

// The iframe passes scrolling to the site unless an application panel has room
// to scroll. Native application input, popovers and internal scrolling remain.
window.addEventListener(
  "wheel",
  (event) => {
    let node = event.target instanceof Element ? event.target : null;
    while (node && node !== document.body) {
      const style = getComputedStyle(node);
      const room =
        event.deltaY > 0
          ? node.scrollTop + node.clientHeight < node.scrollHeight - 1
          : node.scrollTop > 0;
      if (
        /(auto|scroll)/.test(style.overflowY) &&
        node.scrollHeight > node.clientHeight &&
        room
      )
        return;
      node = node.parentElement;
    }
    if (window.parent !== window) {
      event.preventDefault();
      window.parent.postMessage(
        {
          type: "sfmcl-preview-wheel",
          deltaY: event.deltaY,
          deltaMode: event.deltaMode,
        },
        location.origin,
      );
    }
  },
  { passive: false },
);
window.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      !document.querySelector(
        'dialog[open], [role="dialog"], .context-menu, [role="listbox"]',
      )
    ) {
      window.parent.postMessage(
        { type: "sfmcl-preview-close" },
        location.origin,
      );
    }
  },
  true,
);
