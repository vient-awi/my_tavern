/**
 * 七美德装备定义
 * 每个Boss击败后掉落对应的七美德道具
 */

export interface VirtueItem {
  id: string;
  name: string;
  bossName: string; // 掉落的Boss名称（用于匹配）
  bossAliases: string[]; // Boss的其他名称
  description: string;
  bonuses: {
    魅力加成?: number;
    幸运加成?: number;
    基础性斗力加成?: number;
    基础性斗力成算?: number;
    基础忍耐力加成?: number;
    基础忍耐力成算?: number;
    闪避率加成?: number;
    暴击率加成?: number;
  };
}

/**
 * 七美德装备列表
 */
export const VIRTUE_ITEMS: VirtueItem[] = [
  {
    id: 'virtue_patience',
    name: '忍耐之披风',
    bossName: '克里斯',
    bossAliases: ['christine', '暴怒'],
    description: '曾经承受过最疯狂怒火的织物，如今能让穿戴者在狂澜中如磐石般稳固。它是防守流派的核心。',
    bonuses: {
      基础忍耐力加成: 60,
      基础忍耐力成算: 80,
    },
  },
  {
    id: 'virtue_kindness',
    name: '仁爱之吊坠',
    bossName: '沐心岚',
    bossAliases: ['muxinlan', '嫉妒'],
    description: '嫉妒的终点是理解与包容。这枚吊坠散发着令人心安的光芒，能让敌人的动作在温柔的氛围中变得迟疑。',
    bonuses: {
      魅力加成: 160,
    },
  },
  {
    id: 'virtue_diligence',
    name: '勤勉之护腕',
    bossName: '伊登芙宁',
    bossAliases: ['eden', '芙宁', '懒惰'],
    description: '从永恒的停滞中提取的纯粹动能。它时刻督促着持有者，将每一分意志都转化为实打实的破坏力。',
    bonuses: {
      基础性斗力加成: 60,
      基础性斗力成算: 80,
    },
  },
  {
    id: 'virtue_humility',
    name: '谦卑之冕',
    bossName: '伊利亚斯夜羽',
    bossAliases: ['elizabeth', '夜羽', '伊利亚斯夜羽', '傲慢'],
    description: '只有真正低下头颅的人，才能看清命运洒在土壤里的金砂。放弃了浮夸的辞藻，换来了冥冥中的眷顾。',
    bonuses: {
      幸运加成: 160,
    },
  },
  {
    id: 'virtue_charity',
    name: '慷慨之指环',
    bossName: '黑崎晴雷',
    bossAliases: ['heisaki', '晴雯', '贪婪', '龙魔男'],
    description: '龙魔男金库中最珍贵的宝藏并非夺来的金币，而是这份"舍弃"的勇气。越是不计代价，收获就越是丰厚。',
    bonuses: {
      暴击率加成: 30,
      基础性斗力加成: 200,
    },
  },
  {
    id: 'virtue_chastity',
    name: '贞洁之束带',
    bossName: '维斯佩罗',
    bossAliases: ['vespera', '色欲'],
    description: '纯粹的意志化作无形的屏障。它并非拒绝爱，而是拒绝堕落，让穿戴者在感官的诱惑中始终保持轻盈。',
    bonuses: {
      闪避率加成: 20,
      基础忍耐力加成: 250,
    },
  },
  {
    id: 'virtue_temperance',
    name: '节制之王冠',
    bossName: '艾格纳斯',
    bossAliases: ['agnes', '暴食', '蔷薇', '鼠族公主'],
    description:
      '曾经属于暴食公主的华丽王冠，如今被净化为自律的象征。它教导持有者：真正的富足不在于吞噬一切，而在于知足常乐。',
    bonuses: {
      闪避率加成: 60,
    },
  },
];

/**
 * 根据敌人名称查找对应的美德装备
 * @param enemyName 敌人名称
 * @returns 对应的美德装备，如果没有则返回undefined
 */
export function getVirtueItemByBoss(enemyName: string): VirtueItem | undefined {
  if (!enemyName) return undefined;

  const normalizedName = enemyName.toLowerCase();

  return VIRTUE_ITEMS.find(item => {
    // 检查主名称
    if (normalizedName.includes(item.bossName.toLowerCase())) {
      return true;
    }
    // 检查别名
    return item.bossAliases.some(alias => normalizedName.includes(alias.toLowerCase()));
  });
}

/**
 * 创建美德装备的MVU数据结构（用于放入背包）
 * @param item 美德装备定义
 * @returns MVU背包物品结构
 */
export function createVirtueItemMvuData(item: VirtueItem) {
  return {
    等级: 'SS',
    描述: item.description,
    类型: '装备',
    部位: '特殊装备',
    加成属性: {
      魅力加成: item.bonuses.魅力加成 ?? 0,
      幸运加成: item.bonuses.幸运加成 ?? 0,
      基础性斗力加成: item.bonuses.基础性斗力加成 ?? 0,
      基础性斗力成算: item.bonuses.基础性斗力成算 ?? 0,
      基础忍耐力加成: item.bonuses.基础忍耐力加成 ?? 0,
      基础忍耐力成算: item.bonuses.基础忍耐力成算 ?? 0,
      闪避率加成: item.bonuses.闪避率加成 ?? 0,
      暴击率加成: item.bonuses.暴击率加成 ?? 0,
    },
    数量: 1,
  };
}
