#!/usr/bin/env node
/**
 * 从 论坛实测数据.yaml 生成两份派生产物：
 *
 *   1. 假变量.js            —— 离线自测页用的全局变量（普通 script，供自测页.js 读取）
 *   2. 论坛实测数据.patch.json —— 往酒馆存档打补丁用的 JSON Patch
 *
 * 用法：node cards/虫族/测试数据/生成实测数据.mjs
 *
 * 为什么不手改这两份文件：它们的内容跟 yaml 是同一份数据的两种写法，
 * 手改必然对不上。改数据只改 yaml，然后重跑本脚本。
 *
 * 用 `yaml` 而不是 js-yaml：项目 node_modules 里只有前者被提升到顶层，
 * 而这是普通 node 脚本，走不了打包器的解析。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const 本目录 = dirname(fileURLToPath(import.meta.url));
const yaml路径 = join(本目录, '论坛实测数据.yaml');

const 文档 = YAML.parse(readFileSync(yaml路径, 'utf8'));
const 论坛 = 文档?.论坛;
if (!论坛) {
  console.error('✗ yaml 里没有「论坛:」段，检查一下文件是不是被改坏了');
  process.exit(1);
}

/* ── 1. 假变量.js ─────────────────────────────────────────────── */

const 假变量 =
  '// 由 论坛实测数据.yaml 生成，不要手改。重新生成见 生成实测数据.mjs\n' +
  'var 假数据_论坛 = ' +
  JSON.stringify({ 论坛 }, null, 2) +
  ';\n';

writeFileSync(join(本目录, '假变量.js'), 假变量, 'utf8');

/* ── 2. JSON Patch ────────────────────────────────────────────
   整段 replace 掉 /stat_data/论坛 最省事，也不会有「旧字段残留」的问题：
   加字段不用补 add 操作，删字段不用补 remove 操作。
   连 $帖子计数、$公告计数、$话题计数 一起覆盖，避免新帖子 ID 撞车。
   代价是补丁体积大一点，本地实测场景无所谓。 */

const 补丁 = [
  {
    op: 'replace',
    path: '/stat_data/论坛',
    value: 论坛,
  },
];

writeFileSync(join(本目录, '论坛实测数据.patch.json'), JSON.stringify(补丁, null, 2) + '\n', 'utf8');

/* ── 汇总 ───────────────────────────────────────────────────── */

const 帖子数 = Object.keys(论坛.帖子 ?? {}).length;
const 话题数 = Object.keys(论坛.热门话题 ?? {}).length;
const 公告数 = Object.keys(论坛.公告 ?? {}).length;
console.log(`✓ 假变量.js            帖子 ${帖子数} / 热议 ${话题数} / 公告 ${公告数}`);
console.log('✓ 论坛实测数据.patch.json  1 个 replace 操作（整段 /stat_data/论坛）');
