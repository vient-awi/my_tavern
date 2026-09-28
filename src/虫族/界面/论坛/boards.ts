/** 板块列表，与《触角》论坛条目的板块定义一致 */
export const BOARDS = ['热门', '求助专区', '蜜事交流', '匿名树洞'] as const;

export type BoardKey = (typeof BOARDS)[number];

/** 板块的适用判定：老数据或 AI 漏写板块时，兜到匿名树洞，帖子不会凭空消失 */
export function 归一板块(值: unknown): BoardKey {
  return (BOARDS as readonly string[]).includes(值 as string) ? (值 as BoardKey) : '匿名树洞';
}
