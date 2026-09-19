# my_tavern

## 工作流优先级

本项目以 **tavern-cards** 那套工作流为主，但两套按「创作 / 工程」分工，不是二选一。

**创作侧**（写什么：世界观、人物、剧情、文风、MVU 变量、世界书条目）走 `tavern-design` → `tavern-cards`。设计阶段由 `tavern-design` 产出 `design-spec.md`，再交给 `tavern-cards` 做项目创建与创作规划。

**工程侧**（跑不跑得起来）走 TavernWeave：API 与宏的精确查证 `sillytavern-api-reference`、真机调试 `sillytavern-runtime-debug`、性能与安全审查 `sillytavern-rolecard-performance` / `sillytavern-rolecard-security`、组件抽取与流水线 `sillytavern-component-update` / `sillytavern-card-pipeline`、运行时依赖账本与 prompt 预算 `tavern-card-builder`。

TavernWeave 的其余独有能力照常使用：Soul 模式、洗稿、照镜子、全量审查、资料库、蓝图。

全局 `~/.claude/CLAUDE.md` 是 TavernWeave 面向所有项目的通用前门，现已声明项目级 CLAUDE.md 优先。其中「新项目 / 接手卡二创路由给 `orchestrate-project-blueprint` 与 `tavern-card-builder`」与「TW 文件写入前先过 `consult-tavernweave-library`」两条，在本项目的**创作侧**不适用；工程侧仍按 TavernWeave 规则走。

## 前端与视觉 skill 的分层

四个相关 skill 分属不同层，不是同层的竞争关系：

| 层 | Skill | 用途 |
| --- | --- | --- |
| 审美 | `frontend-design` | 只定视觉方向：配色、排版、动效取舍 |
| 运行时实现 | `tavern-ui` | **本项目酒馆内嵌前端的默认选择**：模板工程 → Vue 3 → 变量导入 → CSS 色彩变量命名 → 打包 jsdelivr → 正则占位符 |
| 运行时实现 | `sillytavern-embedded-ui` | 仅在 `tavern-ui` 未覆盖时兜底：框架中立手写、宿主集成契约 |
| 组件库 | `shadcn-tailwind-ui` | React / shadcn / Radix 类界面，与酒馆无关 |

1. 酒馆消息楼层内的前端实现，以 `tavern-ui` 为准；`sillytavern-embedded-ui` 只做兜底，不与它并行使用。
2. `frontend-design` 只在需要确定视觉方向时调用，不接管实现细节。
3. React / shadcn 类界面走 `shadcn-tailwind-ui`，与酒馆前端无关。

## 其他

- tavern-cards 三个 skill 由 `C:\Users\51745\tavern-cards-src` 经符号链接接入 `~/.claude/skills/`，更新用 `git -C C:\Users\51745\tavern-cards-src pull`。源码目录一旦移动，链接会断，需手工重建。
- `.agents/skills/` 下的 skill（`tavern-helper-frontend`、`tavern-helper-script`、`mvu-*`）Claude Code 不加载，只服务 Cline / Codex / Gemini / Copilot。
- `.cardrc.json` 与 `.claude/` 已在 `.gitignore` 中，不入库。
