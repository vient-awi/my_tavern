/**
 * 论坛的数据读写：把 MVU 变量里的东西取出来，把玩家的操作写回去。
 *
 * 组件不直接碰 MVU。所有写入都走这里，改动点集中在一处，也好统一做并发串行化。
 */
import { computed, ref } from 'vue';
import { mutateStatData, readStatData } from './mvu';
import { 归一板块, type BoardKey } from './boards';

/** 一条评论 */
export interface 评论 {
  昵称: string;
  内容: string;
  点赞: number;
  我的点赞: boolean;
  时间: string;
  回复: 子评论[];
}

/** 楼中楼里的一条回复。结构与评论相同，只是不再往下嵌套 */
export interface 子评论 {
  昵称: string;
  内容: string;
  点赞: number;
  我的点赞: boolean;
  时间: string;
}

/** 帖子角标。空字符串 = 不挂 */
export type 帖子标记 = '' | '置顶' | '爆' | '热' | '新';

/** 一条帖子。ID 是它在 帖子 表里的键 */
export interface 帖子 {
  ID: string;
  标题: string;
  作者: string;
  板块: BoardKey;
  正文: string;
  点赞: number;
  我的点赞: boolean;
  标记: 帖子标记;
  发布时间: string;
  话题: string[];
  评论: 评论[];
}

export interface 公告 {
  ID: string;
  标题: string;
  正文: string;
  发布者: string;
  置顶: boolean;
}

/**
 * 一条热门话题。
 *
 * 注意它跟帖子的「话题」字段不是一回事：
 * 那个是帖子的分类标签（#洛希前线#，一帖归哪类），
 * 这个是全站热议榜（一句有情绪的话 + 全网讨论量）。两套数据各自独立。
 */
export interface 热门话题 {
  ID: string;
  标题: string;
  热度: number;
  相关帖子: string[];
}

export interface 通知条目 {
  来源?: string;
  摘要?: string;
  标题?: string;
  内容?: string;
  已读: boolean;
}

/** 界面内存里的数据副本。每次写入后与 MVU 重新对齐 */
export const 昵称 = ref('落雨天');
export const 论坛声望 = ref(0);
export const 帖子表 = ref<Record<string, any>>({});
export const 话题表_raw = ref<Record<string, any>>({});
export const 公告表 = ref<Record<string, any>>({});
export const 通知 = ref<{ 点赞: 通知条目[]; 回复: 通知条目[]; 系统: 通知条目[] }>({
  点赞: [],
  回复: [],
  系统: [],
});
export const 私信表 = ref<Record<string, string>>({});

/**
 * 从 MVU 读出来的东西必须深拷贝一份再放进 ref。
 *
 * `Mvu.getMvuData()` 返回的是它内部那个对象本身，`mutateStatData` 的 mutator 又是
 * 就地改它。若这里直接存引用，写回后 ref 里装的和 MVU 里装的是同一批数组对象——
 * 内容变了、引用没变，Vue 判定「没更新」，界面就不重画（典型症状：通知标了已读，
 * 角标不消失）。拷贝一次，两边彻底断开。
 */
function 拷贝<T>(v: T): T {
  return v == null ? v : JSON.parse(JSON.stringify(v));
}

/** 载入。界面挂载时调一次，每次写回后也会再调一次，让界面与变量重新对齐 */
export async function 载入论坛数据(): Promise<void> {
  const stat = await readStatData();
  const 论坛 = stat?.论坛 ?? {};
  昵称.value = 论坛.昵称 ?? '落雨天';
  论坛声望.value = Number(论坛.声望 ?? 0);
  帖子表.value = 拷贝(论坛.帖子 ?? {});
  话题表_raw.value = 拷贝(论坛.热门话题 ?? {});
  公告表.value = 拷贝(论坛.公告 ?? {});
  通知.value = {
    点赞: 拷贝(论坛.通知?.点赞 ?? []),
    回复: 拷贝(论坛.通知?.回复 ?? []),
    系统: 拷贝(论坛.通知?.系统 ?? []),
  };
  私信表.value = 拷贝(论坛.私信 ?? {});
}

/* ---------- 派生数据 ---------- */

function 数字(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** 取评论数组。老数据里评论是 {昵称: 内容} 的对象，这里一并兼容 */
function 取评论(p: any): 评论[] {
  const raw = p?.评论;
  if (Array.isArray(raw)) {
    return raw.map(c => ({
      昵称: c?.昵称 ?? '匿名',
      内容: c?.内容 ?? '',
      点赞: 数字(c?.点赞),
      我的点赞: !!c?.我的点赞,
      时间: String(c?.时间 ?? ''),
      回复: Array.isArray(c?.回复)
        ? c.回复.map((r: any) => ({
            昵称: r?.昵称 ?? '匿名',
            内容: r?.内容 ?? '',
            点赞: 数字(r?.点赞),
            我的点赞: !!r?.我的点赞,
            时间: String(r?.时间 ?? ''),
          }))
        : [],
    }));
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw).map(([谁, 内容]) => ({
      昵称: 谁,
      内容: String(内容 ?? ''),
      点赞: 0,
      我的点赞: false,
      时间: '',
      回复: [],
    }));
  }
  return [];
}

function 取话题(p: any): string[] {
  const raw = p?.话题;
  if (Array.isArray(raw)) return raw.map(t => 规范话题(String(t))).filter(Boolean);
  if (typeof raw === 'string' && raw.trim()) return [规范话题(raw)];
  return [];
}

/** 话题统一成带 # 号的形式，方便比对与展示 */
export function 规范话题(值: string): string {
  const s = (值 ?? '').trim().replace(/^#+/, '').replace(/#+$/, '');
  return s ? `#${s}#` : '';
}

/** 「#洛希前线#」→「洛希前线」 */
export function 话题名(标签: string): string {
  return 标签.replace(/^#+/, '').replace(/#+$/, '');
}

/**
 * 热议话题的显示写法：「#标题#」。
 *
 * AI 填 标题 时可能手滑带上井号，这里统一剥掉再加回去，
 * 免得界面上出现「##军雄临产期##」这种。话题页与热议榜共用。
 */
export function 话题全称(标题: string): string {
  return 规范话题(标题);
}

/** 全部帖子，按 ID 排序（ID 是发帖顺序） */
export const 全部帖子 = computed<帖子[]>(() =>
  Object.entries(帖子表.value)
    .map(([ID, p]) => ({
      ID,
      标题: p?.标题 ?? '(无标题)',
      作者: p?.作者 ?? '匿名',
      板块: 归一板块(p?.板块),
      正文: p?.正文 ?? '',
      点赞: 数字(p?.点赞),
      我的点赞: !!p?.我的点赞,
      标记: 归一标记(p?.标记),
      发布时间: String(p?.发布时间 ?? ''),
      话题: 取话题(p),
      评论: 取评论(p),
    }))
    .sort((a, b) => 数字(a.ID) - 数字(b.ID) || a.ID.localeCompare(b.ID)),
);

/** 变量里的标记值不可信，认不出来的就当作没标记 */
function 归一标记(v: unknown): 帖子标记 {
  const s = String(v ?? '').trim().replace(/^\[|\]$/g, '');
  return (['置顶', '爆', '热', '新'] as const).includes(s as any) ? (s as 帖子标记) : '';
}

/** 我的帖子 */
export const 我的帖子 = computed(() => 全部帖子.value.filter(p => p.作者 === 昵称.value));

/** 我收到的总赞数（我发的帖子 + 我在别人帖下的评论） */
export const 收到总赞数 = computed(() => {
  let 计 = 我的帖子.value.reduce((和, p) => 和 + p.点赞, 0);
  for (const p of 全部帖子.value) {
    for (const c of p.评论) {
      if (c.昵称 === 昵称.value) 计 += c.点赞;
      for (const r of c.回复) if (r.昵称 === 昵称.value) 计 += r.点赞;
    }
  }
  return 计;
});

/** 按板块取帖子。热门 = 全站热度最高的若干条，其余 = 该板块全部 */
export function 板块帖子(板块: string, 每页 = 12): 帖子[] {
  if (板块 === '热门') {
    return [...全部帖子.value].sort((a, b) => 热度(b) - 热度(a)).slice(0, 每页);
  }
  return 全部帖子.value.filter(p => p.板块 === 板块);
}

/** 热度：点赞 + 评论数加权。热门板块和「🔥」标记都用它 */
export function 热度(p: 帖子): number {
  return p.点赞 + p.评论.length * 2;
}

/**
 * 热门话题榜：全站热议，直接读变量里的 热门话题 表，按热度排。
 *
 * 这里**不**从帖子里聚合。热议榜的「1.2k 讨论」是全网热度，跟《触角》上有几条
 * 帖子在聊它是两码事——AI 自己维护热度数字。相关帖子只是给玩家一个入口，
 * 可以一条都没有（全网在聊但没人开帖）。
 */
export const 热门话题列表 = computed<热门话题[]>(() =>
  Object.entries(话题表_raw.value)
    .map(([ID, t]: [string, any]) => ({
      ID,
      标题: String(t?.标题 ?? '').trim(),
      热度: 数字(t?.热度),
      相关帖子: Array.isArray(t?.相关帖子) ? t.相关帖子.map((x: any) => String(x)) : [],
    }))
    .filter(t => t.标题)
    .sort((a, b) => b.热度 - a.热度),
);

/**
 * 帖子的分类标签聚合：有哪些标签、各带多少帖。
 *
 * 与上面的热议榜无关——这个是「#洛希前线#」这类归类，点进去看同类的帖子。
 */
export const 标签表 = computed(() => {
  const 表 = new Map<string, 帖子[]>();
  for (const p of 全部帖子.value) {
    for (const t of p.话题) {
      if (!表.has(t)) 表.set(t, []);
      表.get(t)!.push(p);
    }
  }
  return [...表.entries()]
    .map(([标签, 帖子们]) => ({ 标签, 帖子们 }))
    .sort((a, b) => b.帖子们.length - a.帖子们.length || a.标签.localeCompare(b.标签));
});

/** 某个分类标签下的帖子 */
export function 标签下帖子(标签: string): 帖子[] {
  return 全部帖子.value.filter(p => p.话题.includes(标签));
}

/**
 * 某个热议话题下的帖子。
 *
 * 走「相关帖子」里记的 ID。AI 可能写了不存在的 ID（帖子被删了），
 * 这里过滤掉，免得点进去看到空白。
 */
export function 热议话题下帖子(话题: 热门话题): 帖子[] {
  const 全部 = 全部帖子.value;
  return 话题.相关帖子
    .map(ID => 全部.find(p => p.ID === ID))
    .filter((p): p is 帖子 => !!p);
}

/** 搜索：标题、正文、作者三处都看 */
export function 搜索帖子(关键词: string): 帖子[] {
  const k = 关键词.trim().toLowerCase();
  if (!k) return [];
  return 全部帖子.value.filter(
    p =>
      p.标题.toLowerCase().includes(k) || p.正文.toLowerCase().includes(k) || p.作者.toLowerCase().includes(k),
  );
}

/** 公告：置顶的排前面，同档按 ID */
export const 公告列表 = computed<公告[]>(() =>
  Object.entries(公告表.value)
    .map(([ID, a]) => ({
      ID,
      标题: a?.标题 ?? '(无标题)',
      正文: a?.正文 ?? '',
      发布者: a?.发布者 ?? '《触角》理事会',
      置顶: a?.置顶 !== false,
    }))
    .sort((a, b) => Number(b.置顶) - Number(a.置顶) || 数字(a.ID) - 数字(b.ID)),
);

/** 未读消息数：私信数 + 三类通知里未读的条数 */
export const 未读通知数 = computed(
  () =>
    通知.value.点赞.filter(n => !n.已读).length +
    通知.value.回复.filter(n => !n.已读).length +
    通知.value.系统.filter(n => !n.已读).length,
);

/* ---------- 写入 ---------- */

/** 帖子 ID 的分配。$帖子计数 增加后返回新 ID */
export async function 分配帖子ID(): Promise<string> {
  return 分配ID('$帖子计数', '帖子', '分配帖子ID');
}

/** 通用 ID 分配：计数落后于实际最大 ID 时以实际最大值为准，避免撞号 */
async function 分配ID(计数字段: string, 表字段: string, 操作名: string): Promise<string> {
  let 新ID = '';
  await mutateStatData(操作名, stat => {
    stat.论坛 = stat.论坛 ?? {};
    const 当前 = 数字(stat.论坛[计数字段]);
    // 计数落后于实际最大 ID 时（比如 AI 自己取了 ID），以实际最大值为准，避免撞号
    const 最大 = Object.keys(stat.论坛[表字段] ?? {}).reduce((m, k) => Math.max(m, 数字(k)), 0);
    const 下一个 = Math.max(当前, 最大) + 1;
    stat.论坛[计数字段] = 下一个;
    新ID = String(下一个);
  });
  return 新ID || `${Date.now()}`;
}

/** 发帖。板块由玩家在发帖页选，不再被丢掉 */
export async function 发帖(标题: string, 正文: string, 板块: BoardKey, 话题: string[] = []): Promise<void> {
  const 标题净 = 标题.trim();
  if (!标题净) return;
  const ID = await 分配帖子ID();
  await mutateStatData('发帖', stat => {
    stat.论坛 = stat.论坛 ?? {};
    stat.论坛.帖子 = stat.论坛.帖子 ?? {};
    stat.论坛.帖子[ID] = {
      标题: 标题净,
      作者: stat.论坛.昵称 ?? 昵称.value,
      板块,
      正文: 正文.trim(),
      点赞: 0,
      我的点赞: false,
      // 刚发出来的帖子挂「新」，等 AI 后续按剧情改成「热」或「爆」
      标记: '新',
      发布时间: '刚刚',
      话题,
      评论: [],
    };
  });
  await 载入论坛数据();
}

/** 给帖子点赞／取消。点赞数与我的点赞同步 */
export async function 点赞帖子(帖子ID: string): Promise<void> {
  await mutateStatData('点赞帖子', stat => {
    const p = stat.论坛?.帖子?.[帖子ID];
    if (!p) return;
    const 已赞 = !p.我的点赞;
    p.我的点赞 = 已赞;
    p.点赞 = Math.max(0, 数字(p.点赞) + (已赞 ? 1 : -1));
  });
  await 载入论坛数据();
}

/** 给评论点赞／取消。评论用「数组下标路径」定位：父帖 ID + 评论下标 + 可选的回复下标 */
export async function 点赞评论(帖子ID: string, 评论下标: number, 回复下标?: number): Promise<void> {
  await mutateStatData('点赞评论', stat => {
    const p = stat.论坛?.帖子?.[帖子ID];
    const c = p?.评论?.[评论下标];
    if (!c) return;
    const 目标 = 回复下标 === undefined ? c : c.回复?.[回复下标];
    if (!目标) return;
    const 已赞 = !目标.我的点赞;
    目标.我的点赞 = 已赞;
    目标.点赞 = Math.max(0, 数字(目标.点赞) + (已赞 ? 1 : -1));
  });
  await 载入论坛数据();
}

/** 发一条新评论 */
export async function 评论帖子(帖子ID: string, 内容: string): Promise<void> {
  const 净 = 内容.trim();
  if (!净) return;
  await mutateStatData('发表评论', stat => {
    const p = stat.论坛?.帖子?.[帖子ID];
    if (!p) return;
    if (!Array.isArray(p.评论)) p.评论 = [];
    p.评论.push({
      昵称: stat.论坛.昵称 ?? 昵称.value,
      内容: 净,
      点赞: 0,
      我的点赞: false,
      时间: '刚刚',
      回复: [],
    });
  });
  await 载入论坛数据();
}

/** 在别人的评论下回复（楼中楼） */
export async function 回复评论(帖子ID: string, 评论下标: number, 内容: string): Promise<void> {
  const 净 = 内容.trim();
  if (!净) return;
  await mutateStatData('回复评论', stat => {
    const c = stat.论坛?.帖子?.[帖子ID]?.评论?.[评论下标];
    if (!c) return;
    if (!Array.isArray(c.回复)) c.回复 = [];
    c.回复.push({
      昵称: stat.论坛.昵称 ?? 昵称.value,
      内容: 净,
      点赞: 0,
      我的点赞: false,
      时间: '刚刚',
    });
  });
  await 载入论坛数据();
}

/** 回一条私信。玩家的回复追加在原文后面，保持一段连续对话的样子 */
export async function 回复私信(对方: string, 内容: string): Promise<void> {
  const 净 = 内容.trim();
  if (!净 || !对方) return;
  await mutateStatData('回复私信', stat => {
    stat.论坛 = stat.论坛 ?? {};
    stat.论坛.私信 = stat.论坛.私信 ?? {};
    const 原文 = String(stat.论坛.私信[对方] ?? '');
    stat.论坛.私信[对方] = `${原文}${原文 ? '\n\n' : ''}我：${净}`;
  });
  await 载入论坛数据();
}

/** 改论坛昵称。改完只影响之后的新帖与新评论，旧帖上的署名不动 */
export async function 改论坛昵称(新名: string): Promise<void> {
  const 净 = 新名.trim();
  if (!净) return;
  await mutateStatData('改论坛昵称', stat => {
    stat.论坛 = stat.论坛 ?? {};
    stat.论坛.昵称 = 净;
  });
  await 载入论坛数据();
}

/** 把三类通知标成已读 */export async function 标记通知已读(类别: '点赞' | '回复' | '系统' | '全部'): Promise<void> {
  await mutateStatData('标记通知已读', stat => {
    const 表 = stat.论坛?.通知;
    if (!表) return;
    const 清 = (arr: any[]) => {
      for (const n of arr ?? []) n.已读 = true;
    };
    if (类别 === '点赞' || 类别 === '全部') 清(表.点赞);
    if (类别 === '回复' || 类别 === '全部') 清(表.回复);
    if (类别 === '系统' || 类别 === '全部') 清(表.系统);
  });
  await 载入论坛数据();
}
