import gettingStarted from "../docs/01-快速上手.md?raw";
import accounts from "../docs/02-角色与登录.md?raw";
import versions from "../docs/03-版本与游戏目录.md?raw";
import install from "../docs/04-安装加载器.md?raw";
import modpacks from "../docs/05-导入整合包.md?raw";
import resources from "../docs/06-资源中心.md?raw";
import java from "../docs/07-Java与启动设置.md?raw";
import appearance from "../docs/08-外观与本地数据.md?raw";
import multiplayer from "../docs/09-联机教程.md?raw";

export const docSections = [
  { id: "getting-started", content: gettingStarted },
  { id: "accounts", content: accounts },
  { id: "versions", content: versions },
  { id: "install", content: install },
  { id: "modpacks", content: modpacks },
  { id: "resources", content: resources },
  { id: "java", content: java },
  { id: "appearance", content: appearance },
  { id: "multiplayer", content: multiplayer },
].map((section) => ({
  ...section,
  title: section.content.split(/\r?\n/, 1)[0].replace(/^#\s+/, ""),
}));
