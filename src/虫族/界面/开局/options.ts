import { BOARDS } from '../论坛/boards';

/** 出身：决定初始军功、声望与所属 */
export interface Origin {
  key: string;
  name: string;
  desc: string;
  军功: number;
  声望: number;
  所属: string;
}

export const ORIGINS: Origin[] = [
  {
    key: '指挥官院',
    name: '指挥官院首席',
    desc: '毕业即挂上尉衔，两年内拿下数场大捷。战报上见过这个名字的人不少，但还远不到家喻户晓。',
    军功: 320,
    声望: 260,
    所属: '军校指挥官院',
  },
  {
    key: '舰队',
    name: '舰队一线出身',
    desc: '从舰上的值更官做起，跟着舰队打了六年的硬仗。战功实打实，名气差一口气。',
    军功: 480,
    声望: 210,
    所属: '第三舰队',
  },
  {
    key: '军部',
    name: '军部参谋转任',
    desc: '在军部做过三年作战参谋，纸上推演过上百场仗，实战履历薄。',
    军功: 150,
    声望: 240,
    所属: '军部参谋本部',
  },
  {
    key: '边军',
    name: '边军轮战出身',
    desc: '在几处次要前线轮着守了八年。没几个人记得住她的名字，但她的兵记得。',
    军功: 400,
    声望: 150,
    所属: '第九边军',
  },
];

/** 食量：对应饱食度上限与消耗节奏。本卡主角食量大，这是玩法重心之一 */
export interface Appetite {
  key: string;
  name: string;
  desc: string;
  初始饱食: number;
  掉速: string;
}

export const APPETITES: Appetite[] = [
  {
    key: '大胃袋',
    name: '大胃袋',
    desc: '食量远超同侪，一天要取好几次蜜。饿急了能吸空三个军雄。',
    初始饱食: 11,
    掉速: '每轮掉1，用精神力或战斗再掉1~2',
  },
  {
    key: '标准',
    name: '一般食量',
    desc: '和大多数雌虫一样，一天取一到两次蜜就够。',
    初始饱食: 9,
    掉速: '每两轮掉1',
  },
  {
    key: '蜜瘾',
    name: '蜜瘾体质',
    desc: '身体对虫蜜的吸收效率低，要吃得比别人多才顶得住。饿起来比别人快。',
    初始饱食: 10,
    掉速: '每轮掉1，情绪波动时额外掉1',
  },
];

/** 精神力：初始数值与等级 */
export interface Psyche {
  key: string;
  name: string;
  desc: string;
  数值: number;
  等级: 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
}

export const PSYCHES: Psyche[] = [
  { key: 'C', name: 'C 级', desc: '军中偏下。打不动军用级甲壳。', 数值: 22, 等级: 'C' },
  { key: 'B', name: 'B 级', desc: '军中普通水准。', 数值: 45, 等级: 'B' },
  { key: 'A', name: 'A 级', desc: '精锐。能压制成建制的翼族。', 数值: 62, 等级: 'A' },
  { key: 'S', name: 'S 级', desc: '顶尖。一个照面能让整片空域失声。', 数值: 78, 等级: 'S' },
];

/** 尾勾：雌虫的第二性征，单向开关 */
export const TAILHOOKS = [
  { key: '已生长', name: '已生长', desc: '尾勾已经长成。藏在衣下，平时不露。' },
  { key: '未生长', name: '未生长', desc: '尾勾还没长出来。身体成熟度偏晚。' },
] as const;

/** 参与论坛的活跃度，决定初始论坛声望 */
export const FORUM_ACTIVITY = [
  { key: '潜水', name: '潜水党', desc: '只看不发。声望 5。', 声望: 5 },
  { key: '常客', name: '普通常客', desc: '偶尔冒泡，有人认得这个昵称。声望 41。', 声望: 41 },
  { key: '活跃', name: '活跃用户', desc: '发帖带热度，说话有人接。声望 68。', 声望: 68 },
] as const;

/** 默认昵称，玩家可改 */
export const DEFAULT_NICKNAME = '落雨天';

export { BOARDS };
