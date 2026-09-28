/**
 * 论坛界面自己的记忆。
 *
 * 存在 MVU 的 `论坛.$界面状态` 里。`$` 前缀 = AI 看不见也改不了，纯属界面内部事务。
 *
 * 为什么非要存进变量：论坛界面是靠 AI 回复末尾的 <ForumPlaceHolder/> 被正则替换出来的，
 * 每条回复都重新挂载一次组件。状态留在组件的 ref 里，一挂载就归零——这就是
 * "刷到一半放下终端，几轮后再打开回到首页"的原因。
 */
import { ref } from 'vue';
import { mutateStatData, readStatData } from './mvu';

export type ForumView =
  | 'list'
  | 'detail'
  | 'compose'
  | 'mail'
  | 'notice'
  | 'topic'
  | 'search'
  | 'settings'
  | 'home';

export interface ForumUiState {
  视图: ForumView;
  板块: string;
  帖子ID: string;
  公告ID: string;
  /** 帖子分类标签，如「洛希前线」。跟热议ID 二者只会有一个非空 */
  话题: string;
  /** 热议话题表里的 ID。走同一个话题页，靠这个字段区分两种来源 */
  热议ID: string;
  搜索词: string;
  私信对象: string;
  草稿标题: string;
  草稿正文: string;
  每页条数: number;
}

export const DEFAULT_UI_STATE: ForumUiState = {
  视图: 'list',
  板块: '热门',
  帖子ID: '',
  公告ID: '',
  话题: '',
  热议ID: '',
  搜索词: '',
  私信对象: '',
  草稿标题: '',
  草稿正文: '',
  每页条数: 12,
};

/** 模块级单例：同一时刻页面上只会有一个论坛界面，多个组件共享这份状态 */
export const 界面状态 = ref<ForumUiState>({ ...DEFAULT_UI_STATE });

let 写回定时器: ReturnType<typeof setTimeout> | null = null;

/** 尚未落盘的那部分改动。防抖窗口内多次改动会合并成一次写回 */
let 待写回: Partial<ForumUiState> = {};

function 立刻写回(改动: Partial<ForumUiState>) {
  void mutateStatData('写回界面状态', stat => {
    stat.论坛 = stat.论坛 ?? {};
    stat.论坛.$界面状态 = { ...(stat.论坛.$界面状态 ?? {}), ...改动 };
  }).catch(error => console.warn('[触角] 界面状态写回失败:', error));
}

/**
 * 从 MVU 读出上次的界面状态。读不到就保持默认。
 * 挂载时调一次，之后的读写都走内存里的 界面状态。
 */
export async function 载入界面状态(): Promise<void> {
  const stat = await readStatData();
  const 存档 = stat?.论坛?.$界面状态;
  界面状态.value = { ...DEFAULT_UI_STATE, ...(存档 ?? {}) };
  // 视图指向的帖子可能已经被 AI 清掉了，交给调用方用 检查视图有效性() 兜底
}

/** 改界面状态。写回是防抖的：连点板块按钮不会每次都落盘 */
export function 改界面状态(改动: Partial<ForumUiState>): void {
  界面状态.value = { ...界面状态.value, ...改动 };
  待写回 = { ...待写回, ...改动 };
  if (写回定时器) clearTimeout(写回定时器);
  写回定时器 = setTimeout(() => {
    写回定时器 = null;
    const 批 = 待写回;
    待写回 = {};
    立刻写回(批);
  }, 300);
}

/** 关掉界面前把还没落盘的改动冲出去。用于 beforeunload 这类时机 */
export function 冲刷界面状态(): void {
  if (写回定时器) {
    clearTimeout(写回定时器);
    写回定时器 = null;
  }
  if (Object.keys(待写回).length === 0) return;
  const 批 = 待写回;
  待写回 = {};
  立刻写回(批);
}

/** 回首页。退出论坛、或状态指向的东西已经不在了时用 */
export function 重置界面状态(): void {
  改界面状态({ ...DEFAULT_UI_STATE, 每页条数: 界面状态.value.每页条数 });
}
