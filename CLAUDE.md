# my_tavern

## 工作流优先级

本项目以 **tavern-cards** 那套工作流为主，但两套按「创作 / 工程」分工，不是二选一。

**创作侧**（写什么：世界观、人物、剧情、文风、MVU 变量、世界书条目）走 `tavern-design` → `tavern-cards`。设计阶段由 `tavern-design` 产出 `design-spec.md`，再交给 `tavern-cards` 做项目创建与创作规划。

**工程侧**（跑不跑得起来）走 TavernWeave：API 与宏的精确查证 `sillytavern-api-reference`、真机调试 `sillytavern-runtime-debug`、性能与安全审查 `sillytavern-rolecard-performance` / `sillytavern-rolecard-security`、组件抽取与流水线 `sillytavern-component-update` / `sillytavern-card-pipeline`、运行时依赖账本与 prompt 预算 `tavern-card-builder`。

TavernWeave 的其余独有能力照常使用：Soul 模式、洗稿、照镜子、全量审查、资料库、蓝图。

全局 `~/.claude/CLAUDE.md` 是 TavernWeave 面向所有项目的通用前门，现已声明项目级 CLAUDE.md 优先。其中「新项目 / 接手卡二创路由给 `orchestrate-project-blueprint` 与 `tavern-card-builder`」与「TW 文件写入前先过 `consult-tavernweave-library`」两条，在本项目的**创作侧**不适用；工程侧仍按 TavernWeave 规则走。

## 前端与视觉 skill 的分层

相关 skill 分属不同层，**层与层之间可以并用，只有同层才互斥**：

| 层 | Skill | 用途 |
| --- | --- | --- |
| 视觉设计 | `impeccable` | **视觉方向的首选**（已装插件完整版 v4.4.0）：设计决策、等级提升/收敛（bolder / quieter）、配色、排版、组件评审，外加 **24 个斜杠命令**（`/impeccable audit`、`polish`、`critique`…）和 **61 条反模式检测**（含 AI 生成感特征） |
| 视觉设计 | `frontend-design` | 同层备选：轻量设计取向，`impeccable` 未覆盖时用 |
| 动效 | `animate` | **动效首选**：从零做动画，按序决定该不该动 → 目的 → 工具 → 属性 → 曲线时长 → 中断退场，并写出实现 |
| 动效 | `transitions-dev`（未装） | 32 个现成 CSS 过渡片段，需要照抄时用 |
| 运行时实现 | `tavern-ui` | **本项目酒馆内嵌前端的默认选择**：模板工程 → Vue 3 → 变量导入 → CSS 色彩变量命名 → 打包 jsdelivr → 正则占位符 |
| 运行时实现 | `sillytavern-embedded-ui` | 仅在 `tavern-ui` 未覆盖时兜底：框架中立手写、宿主集成契约 |
| 组件库 | `shadcn-tailwind-ui` | React / shadcn / Radix 类界面，与酒馆无关 |

### 规则

1. **酒馆内嵌界面任务必须同时调用实现层和设计层**：
   - 实现走 `tavern-ui`（工程链、变量、打包、占位符）
   - 视觉走 `impeccable`（配色、字体、布局取舍、避免套模板）
   - 有动效就走 `animate`
   它们的 description 里没有「酒馆」「状态栏」这类词，不会自己触发，**必须显式调用**。
2. 动手写界面前先过设计层，拿到配色 / 字体 / 布局的明确取舍，再按 `tavern-ui` 的工程链落地。
3. 同层互斥：实现层内以 `tavern-ui` 为准，`sillytavern-embedded-ui` 只做兜底；设计层内以 `impeccable` 为准，`frontend-design` 备选。
4. React / shadcn 类界面走 `shadcn-tailwind-ui`，与酒馆前端无关。

### 动效相关 skill 的分工（全部来自 emilkowalski/skills，MIT）

| Skill | 何时用 |
| --- | --- |
| `animate` | 要做动画、加动效、做个过渡 —— 直接写实现 |
| `review-animations` | 审查**已有**动效代码，按高标准挑刺 |
| `improve-animations` | 扫整个 codebase 出动效审计报告（**只读**，不改代码） |
| `find-animation-opportunities` | 找「该动但没动」的地方，并否决不该动的（**只读**） |
| `animation-vocabulary` | 只知道效果的模糊描述、想要准确术语时 |
| `emil-design-eng` | UI 打磨哲学、组件设计、看不见的细节（动效偏多，也含通用设计） |
| `pick-ui-library` | 从精选库列表里选合适的（数字滚动、OTP、图表…） |
| `apple-design` | 手势驱动 UI、弹簧动画、拖拽/滑动/面板、动量与可中断过渡、材质与层次 |

**`impeccable` 说明（插件完整版 v4.4.0）**：走 `claude plugin install impeccable@impeccable --scope user`，装在 `~/.claude/plugins/cache/impeccable/`。含**引擎二进制、61 条反模式检测、24 个斜杠命令、4 个子 agent，以及 3 组自动 hook**（`SessionStart` / 每次 `Edit`·`Write` / `Stop`），hook 会自动扫描改动过的 UI 文件并把结果注入对话，耗时约 90–160ms。

引擎二进制**不在插件里**，预置在 `~/.impeccable/bin/0.1.6/impeccable.exe`。**升级插件后 VERSION 会变，必须重新预置对应版本**，否则每次编辑都会卡到超时——本机直连 GitHub 不通，官方 launcher 会去那里下载。补二进制走 npm（可达）：

```bash
curl -sL -o cw.tgz https://registry.npmjs.org/@impeccable/cli-windows-x64/-/cli-windows-x64-<版本>.tgz
tar -xzf cw.tgz && mkdir -p ~/.impeccable/bin/<版本>
cp package/bin/impeccable.exe ~/.impeccable/bin/<版本>/impeccable.exe
```

市场从本地克隆 `C:\Users\51745\impeccable-src` 添加（直连 GitHub 会静默失败）。

## 发布与构建产物

`dist/` **在 `.gitignore` 中，日常不入库**——它可由 `src/` 随时重建。

**发版时必须用 `-f` 强制添加**，否则加不进去：

```bash
pnpm build
git add -f dist/性斗学园/性斗学园脚本/index.js
```

酒馆通过 jsDelivr **`@main`** 外链加载该文件（不用版本标签；本地 `v3.6.x`/`v3.7.x`
标签是上游的，仅用于对比上游版本）。完整流程见
[src/性斗学园/发布与更新流程.md](src/性斗学园/发布与更新流程.md)。

## 其他

- tavern-cards 三个 skill 由 `C:\Users\51745\tavern-cards-src` 经符号链接接入 `~/.claude/skills/`，更新用 `git -C C:\Users\51745\tavern-cards-src pull`。源码目录一旦移动，链接会断，需手工重建。
- `.agents/skills/` 下的 skill（`tavern-helper-frontend`、`tavern-helper-script`、`mvu-*`）Claude Code 不加载，只服务 Cline / Codex / Gemini / Copilot。
- `.cardrc.json`、`.claude/`、`dist/`、`酒馆数据/` 已在 `.gitignore` 中，不入库。
