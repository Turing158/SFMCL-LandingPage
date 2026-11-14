import type {
  Bootstrap,
  DownloadSpec,
  Job,
  LocalDataResult,
  LocalResource,
  Player,
  Settings,
  Tasks,
  Version,
  VersionSettings,
  YggdrasilLogin,
} from "./src/types";
import type { HomeContentConfig } from "./src/homeContentConfig";
import { playerPreviewDefaults } from "./src/playerPreview";

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
  version: "0.1.1",
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
    theme,
    accent: "forest",
    backgroundType: "none",
    background: "",
    hardwareAcceleration: true,
    homeCleanMode: false,
    homeNoticeLayout: "masonry",
    ...playerPreviewDefaults,
    downloadTaskDisplay: "active",
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
  javaMajor: 21,
  icon: "",
}));
const tasks: Tasks = {
  jobs: [],
  downloads: ["Minecraft 1.21.4", "Fabric API"].map((title, i) => ({
    id: `showcase-download-${i}`,
    title,
    status: i === 0 ? "running" : "paused",
    downloaded: 67108864,
    total: 104857600,
    unknownSize: false,
    completed: 51,
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
let notices: Payload[] = [
  {
    id: "showcase:welcome",
    preset: false,
    title: "准备好，下一次冒险。",
    category: "欢迎",
    content:
      "**欢迎来到 SFMCL-T。**\n\n选择角色、准备版本，然后开始你的下一次冒险。",
  },
];
let hidden: string[] = [];
const versionSettings = new Map<string, VersionSettings>();
const copy = <T>(value: T): T => structuredClone(value);
// Demo tasks only change through controls. Reuse the snapshot between polls so
// the launcher does not render its entire tree every 500 ms for identical data.
let tasksSnapshot: Tasks | undefined;
const gameSettings = () => copy(data.settings);
const javaRuntime = (path: string) => ({
  path,
  major: Number(path.match(/jdk-(\d+)/)?.[1] || 21),
  version: "21.0.1",
  architecture: "x64",
});
const previewSuccess = (message = "操作成功") =>
  window.dispatchEvent(new CustomEvent("sfmcl-preview-success", { detail: message }));
const previewTimers = new Set<number>();
const later = (action: () => void, delay: number) => {
  const id = window.setTimeout(() => {
    previewTimers.delete(id);
    action();
  }, delay);
  previewTimers.add(id);
};
if (import.meta.hot)
  import.meta.hot.dispose(() => previewTimers.forEach((id) => clearTimeout(id)));
const downloadFiles = new Map<string, DownloadSpec[]>();
const loginSessions = new Map<string, YggdrasilLogin>();
const dataOperations = new Map<string, { kind: LocalDataResult["kind"]; path: string }>();
const localResources: { versionId: string; item: LocalResource }[] = [];
const authorizationUrl = new URL("#preview-authorization", location.href).href;
const addPlayer = (name: string, online = false, yggdrasil?: Player["yggdrasil"]) => {
  const player: Player = {
    uuid: crypto.randomUUID(), name, online, skin: "", slim: false,
    ...(yggdrasil ? { yggdrasil } : {}),
  };
  data.players.push(player);
  data.settings.activePlayer = player.uuid;
  return copy(player);
};
const addJob = (title: string, names = ["操作完成"]): Job => {
  const job: Job = {
    id: crypto.randomUUID(), title, status: "completed",
    steps: names.map((name) => ({ name, status: "completed", detail: "成功" })),
    currentStep: names.length - 1, log: [`${title}成功`],
  };
  tasks.jobs.unshift(job);
  tasksSnapshot = undefined;
  return job;
};
const addDownload = (title: string, file?: DownloadSpec) => {
  const id = crypto.randomUUID();
  const total = file?.size || 1048576;
  tasks.downloads.unshift({
    id, title, status: "completed", downloaded: total, total,
    unknownSize: false, completed: 1, failed: 0, fileCount: 1,
    speed: 0, workers: 0, steps: [{ name: "下载完成", status: "completed", detail: "成功" }],
  });
  if (file) downloadFiles.set(id, [copy(file)]);
  tasksSnapshot = undefined;
  return id;
};
const installVersion = (payload: Payload) => {
  const id = String(payload.name || payload.minecraft || "示例整合包");
  const root = payload.root || data.settings.activeDir;
  const loader = payload.loader?.kind || "Vanilla";
  if (!versions.some((version) => version.id === id && version.directory === root))
    versions.push({
      id, version: payload.minecraft || "1.21.4", kind: "release", loader,
      path: `${root}/.minecraft/versions/${id}`, directory: root, javaMajor: 21, icon: "",
    });
  addJob(`安装 ${id}`, ["检查文件", "安装游戏", "安装完成"]);
  addDownload(`Minecraft ${id}`);
  return id;
};
const thirdPartyLogin = (payload: Payload): YggdrasilLogin => {
  const sessionId = payload.sessionId || crypto.randomUUID();
  const server = payload.server || "https://littleskin.cn/api/yggdrasil";
  const login: YggdrasilLogin = {
    sessionId, server, serverName: server.includes("littleskin") ? "LittleSkin" : "第三方皮肤站",
    profiles: [{ id: crypto.randomUUID(), name: "Alex" }],
  };
  loginSessions.set(sessionId, login);
  return copy(login);
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
      return tasksSnapshot ??= copy(tasks);
    case "settings.save":
      data.settings = copy(payload as Settings);
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
    case "versions.favorite": {
      const version = versions.find((v) => v.id === payload.id);
      if (version) version.favorite = payload.favorite;
      return true;
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
      return copy(payload.config);
    case "versions.rename": {
      const version = versions.find((v) => v.id === payload.id &&
        v.directory === (payload.directory || data.settings.activeDir));
      if (version) {
        const previousId = version.id;
        version.id = payload.name;
        version.path = `${version.directory}/.minecraft/versions/${payload.name}`;
        if (versionSettings.has(previousId)) {
          versionSettings.set(version.id, versionSettings.get(previousId)!);
          versionSettings.delete(previousId);
        }
        if (data.settings.activeVersion === previousId) data.settings.activeVersion = version.id;
      }
      return true;
    }
    case "versions.icon": {
      const version = versions.find((v) => v.id === payload.id);
      if (version) version.icon = payload.path ? "/assets/DefaultGameIcon/Minecraft.png" : "";
      return true;
    }
    case "versions.repair":
      return addJob(`修复 ${payload.id}`, ["检查游戏文件", "修复完成"]).id;
    case "versions.delete": {
      const index = versions.findIndex((v) => v.id === payload.id &&
        v.directory === (payload.directory || data.settings.activeDir));
      if (index >= 0) versions.splice(index, 1);
      versionSettings.delete(payload.id);
      if (data.settings.activeVersion === payload.id)
        data.settings.activeVersion = versions.find((v) => v.directory === data.settings.activeDir)?.id || "";
      return true;
    }
    case "players.list":
      return copy(data.players);
    case "players.select":
      data.settings.activePlayer = payload.id;
      return;
    case "players.add":
      return addPlayer(String(payload.name));
    case "players.reorder":
      data.players.sort(
        (a, b) => payload.ids.indexOf(a.uuid) - payload.ids.indexOf(b.uuid),
      );
      return copy(data.players);
    case "players.remove":
      data.players = data.players.filter((p) => p.uuid !== payload.id);
      if (data.settings.activePlayer === payload.id)
        data.settings.activePlayer = data.players[0]?.uuid || "";
      return;
    case "players.login": {
      addPlayer("MinecraftPlayer", true);
      const job = addJob("Microsoft 登录", [
        "等待浏览器授权", "验证 Xbox Live", "验证 Minecraft 账号", "保存角色",
      ]);
      return { jobId: job.id, userCode: "SUCCESS", verificationUri: authorizationUrl, expiresIn: 900 };
    }
    case "players.yggdrasil.login":
      return thirdPartyLogin(payload);
    case "players.yggdrasil.oauth.begin": {
      const login = thirdPartyLogin(payload);
      return { sessionId: login.sessionId, userCode: "SUCCESS", verificationUri: authorizationUrl, expiresIn: 900 };
    }
    case "players.yggdrasil.oauth.wait":
      return copy(loginSessions.get(payload.sessionId) || thirdPartyLogin(payload));
    case "players.yggdrasil.select": {
      const login = loginSessions.get(payload.sessionId);
      if (login) {
        const profile = login.profiles.find((p) => p.id === payload.profileId) || login.profiles[0];
        addPlayer(profile.name, true, {
          server: login.server, serverName: login.serverName,
          homepage: new URL(login.server).origin, profileId: profile.id,
        });
        loginSessions.delete(payload.sessionId);
      }
      return true;
    }
    case "players.yggdrasil.cancel":
      loginSessions.delete(payload.sessionId);
      return;
    case "players.refresh":
      return copy(data.players.find((p) => p.uuid === payload.id));
    case "players.rename": {
      const player = data.players.find((p) => p.uuid === payload.id);
      if (player) player.name = payload.name;
      return copy(player);
    }
    case "players.skin.preview":
      return "/assets/steve.png";
    case "players.skin": {
      const player = data.players.find((p) => p.uuid === payload.id);
      if (player) {
        player.skin = payload.path ? "/assets/steve.png" : "";
        player.slim = !!payload.slim;
      }
      return copy(player);
    }
    case "players.namechange":
      return { nameChangeAllowed: true, changedAt: null, createdAt: null };
    case "players.capes": {
      const player = data.players.find((p) => p.uuid === payload.id);
      const capes = [{ id: "showcase-cape", name: "示例披风",
        url: "/assets/steve.png", active: player?.cape === "/assets/steve.png" }];
      if (player) player.capes = capes;
      return copy(capes);
    }
    case "players.cape": {
      const player = data.players.find((p) => p.uuid === payload.id);
      if (player) {
        player.cape = payload.capeId ? "/assets/steve.png" : "";
        player.capes?.forEach((cape) => { cape.active = cape.id === payload.capeId; });
      }
      return copy(player);
    }
    case "launch": {
      const job = addJob(`启动 ${payload.id || data.settings.activeVersion}`, ["准备游戏", "游戏运行"]);
      job.status = "running";
      job.steps[1].status = "running";
      previewSuccess("游戏启动成功");
      later(() => {
        if (job.status === "running") {
          job.status = "completed";
          job.steps[1].status = "completed";
          tasksSnapshot = undefined;
        }
      }, 3000);
      return job.id;
    }
    case "jobs.cancel": {
      const job = tasks.jobs.find((j) => j.id === payload.id);
      if (job && job.status !== "completed") {
        job.status = "cancelled";
        job.steps.forEach((step) => { if (step.status === "running") step.status = "cancelled"; });
        tasksSnapshot = undefined;
      }
      return;
    }
    case "path.open":
    case "downloads.cache.open":
    case "local-data.recovery.open":
      previewSuccess("打开成功");
      return;
    case "local-data.prepare": {
      const id = crypto.randomUUID();
      const operation = { kind: payload.kind, path: payload.path };
      dataOperations.set(id, operation);
      return { id, ...operation,
        ...(payload.kind === "restore" ? { backup: { createdAt: Math.floor(Date.now() / 1000), fileCount: 8, totalBytes: 1048576 } } : {}),
      };
    }
    case "local-data.execute": {
      const operation = dataOperations.get(payload.id);
      if (operation) {
        if (operation.kind === "migrate") data.dataDir = operation.path;
        data.localDataResult = { ...operation, success: true,
          message: { migrate: "本地数据迁移成功", backup: "本地数据备份成功", restore: "本地数据还原成功" }[operation.kind] };
        dataOperations.delete(payload.id);
        later(() => window.dispatchEvent(new Event("sfmcl-preview-restart")), 200);
      }
      return true;
    }
    case "system.memory":
      return { availableMb: 16384 };
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
    case "notices.visibility":
      hidden = hidden.filter((id) => id !== payload.id);
      if (payload.hidden) hidden.push(payload.id);
      return copy(hidden);
    case "notices.create":
      notices.unshift({
        id: crypto.randomUUID(),
        preset: false,
        title: payload.title,
        content: payload.content,
      });
      return copy(notices);
    case "notices.delete":
      notices = notices.filter((n) => n.id !== payload.id);
      return copy(notices);
    case "downloads.control": {
      if (payload.action === "clear")
        tasks.downloads = tasks.downloads.filter((d) => d.id !== payload.id);
      const download = tasks.downloads.find((d) => d.id === payload.id);
      if (download) {
        download.status =
          payload.action === "pause"
            ? "paused"
            : payload.action === "cancel"
              ? "cancelled"
              : "running";
        download.speed = download.status === "running" ? 5242880 : 0;
      }
      tasksSnapshot = undefined;
      return;
    }
    case "downloads.files":
      if (downloadFiles.has(payload.id))
        return downloadFiles.get(payload.id)!.map((spec) => ({
          spec: copy(spec), status: "completed", downloaded: spec.size || 1048576,
          total: spec.size || 1048576, attempts: 1,
        }));
      return [
        {
          spec: {
            url: "",
            path: `${directory}/.minecraft/versions/1.21.4/client.jar`,
            size: 104857600,
          },
          status:
            tasks.downloads.find((d) => d.id === payload.id)?.status ||
            "paused",
          downloaded: 67108864,
          total: 104857600,
          attempts: 1,
        },
      ];
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
    case "install":
      return installVersion(payload);
    case "modpacks.inspect":
      return {
        token: crypto.randomUUID(), format: "Modrinth", name: "示例整合包",
        version: "1.0", minecraft: "1.21.4", loader: { kind: "Fabric", version: "0.16.10" },
        optionalFiles: [], fileCount: 8,
      };
    case "modpacks.install":
      return installVersion({ ...payload, loader: { kind: "Fabric", version: "0.16.10" } });
    case "modpacks.discard":
    case "modpacks.supplyFile":
      return true;
    case "resources.categories":
      return [
        { id: "optimization", name: "性能优化" },
        { id: "worldgen", name: "世界生成" },
      ];
    case "resources.search": {
      const items = ["性能优化", "世界拓展", "实用工具"]
        .map((name, i) => ({
          id: `showcase-resource-${i}`,
          source: payload.source || "modrinth",
          title: `示例：${name}`,
          description: "浏览版本、分类与项目信息，找到适合自己世界的资源。",
          author: "界面演示",
          icon: "",
          downloads: 0,
          categories: [name],
          versions: ["1.21.4", "1.20.1"],
          website: "",
          body: "",
        }))
        .filter((item) =>
          item.title
            .toLowerCase()
            .includes((payload.query || "").toLowerCase()),
        );
      return { total: items.length, items: copy(items) };
    }
    case "resources.detail":
      return {
        id: payload.id,
        source: payload.source || "modrinth",
        title: "示例资源",
        description: "资源中心界面演示",
        author: "界面演示",
        icon: "",
        downloads: 0,
        categories: ["性能优化"],
        versions: ["1.21.4"],
        website: "",
        body: "## 资源详情\n\n在这里查看资源介绍、适用版本与前置依赖。选择合适的版本，即可安装到你的游戏中。",
      };
    case "resources.files":
      return [
        {
          id: "showcase-file",
          name: "示例资源",
          version: "1.0",
          date: "2024-12-03",
          gameVersions: [payload.gameVersion || "1.21.4"],
          loaders: [payload.loader || "fabric"],
          file: { url: "", path: "示例资源.jar", size: 1048576 },
          dependencies: [],
        },
      ];
    case "resources.local":
      return copy(localResources.filter((resource) =>
        resource.versionId === payload.versionId && resource.item.kind === payload.kind,
      ).map((resource) => resource.item));
    case "resources.download": {
      const file: DownloadSpec = payload.file;
      const title = payload.title || file.path;
      const id = addDownload(title, file);
      if (payload.versionId) {
        const folder = { mod: "mods", resourcepack: "resourcepacks", shader: "shaderpacks" }[payload.kind as string] || "downloads";
        const version = versions.find((v) => v.id === payload.versionId);
        const name = file.path.split(/[\\/]/).pop() || "示例资源.jar";
        const path = `${version?.path || directory}/${folder}/${name}`;
        if (!localResources.some((r) => r.item.path === path))
          localResources.push({ versionId: payload.versionId, item: {
            name, path, kind: payload.kind, entryType: "file", description: "安装成功",
            version: "1.0", authors: "界面演示", icon: "", disabled: false,
            size: file.size || 1048576, details: {},
          } });
      }
      return id;
    }
    case "resources.localSize":
      return localResources.find((r) => r.item.path === payload.path)?.item.size || 1048576;
    case "resources.localProject":
      return { id: "showcase-resource-0" };
    case "resources.toggle": {
      const resource = localResources.find((r) => r.item.path === payload.path);
      const path = payload.disabled ? `${payload.path}.disabled` : payload.path.replace(/\.disabled$/, "");
      if (resource) { resource.item.disabled = payload.disabled; resource.item.path = path; }
      return path;
    }
    case "resources.deletePack": {
      const index = localResources.findIndex((r) => r.item.path === payload.path);
      if (index >= 0) localResources.splice(index, 1);
      return true;
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
    if (command === "plugin:dialog|open" || command === "plugin:dialog|save") {
      const options = args.options || {};
      if (options.directory) {
        if (options.title?.includes("本地数据")) return "C:/SFMCL-T-new";
        return `${directory}/示例目录`;
      }
      const extensions: string[] = options.filters?.[0]?.extensions || [];
      if (extensions.includes("exe")) return "C:/Java/jdk-21/bin/javaw.exe";
      if (extensions.includes("png")) return "C:/SFMCL-T/skin.png";
      if (command === "plugin:dialog|save") return `C:/SFMCL-T/${options.defaultPath || "data-backup.zip"}`;
      return options.title?.includes("本地数据备份") ? "C:/SFMCL-T/data-backup.zip" : "C:/SFMCL-T/示例整合包.mrpack";
    }
    if (command === "plugin:opener|open_url") {
      if (args.url === authorizationUrl) return;
      if (/^https?:\/\//.test(args.url))
        window.open(args.url, "_blank", "noopener,noreferrer");
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
