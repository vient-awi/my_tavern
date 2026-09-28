import { type Character, type CombatLogEntry, type Item } from './types';
import {
  clearStoredPlayerAvatar,
  getStoredPlayerAvatarSyncUrl,
  resolveStoredPlayerAvatar,
  saveStoredPlayerAvatar,
  saveStoredPlayerAvatarBlob,
} from '../shared/localPreferences';

// R2 立绘基础路径
const R2_PORTRAIT_BASE_URL = 'https://img.vinsimage.org/性斗学园/立绘';

// 随机图片 URL（降级使用）
const RANDOM_IMAGE_URLS = [
  'https://picsum.photos/400/600?random=1',
  'https://picsum.photos/400/600?random=2',
  'https://picsum.photos/400/600?random=3',
  'https://picsum.photos/400/600?random=4',
  'https://picsum.photos/400/600?random=5',
];

/**
 * 立绘名映射表：改版男名 → 原版女名（CDN文件名使用原版女名）
 * 所有立绘CDN资源保持原版女性名文件名不变
 */
const PORTRAIT_NAME_MAP: Record<string, string> = {
  // 教师/学生会
  阿尔伯特温特: '爱丽丝温特',
  白石响二: '白石响子',
  神崎凛司: '神崎凛',
  艾伦海德: '艾琳海德',
  九条凛士: '九条凛音',
  // 男权协会
  沙恩斯通: '莎拉斯通',
  维克多戈德温: '维多利亚戈德温',
  // BF社
  明日郎: '明日香',
  埃米尔威廉姆斯: '艾米丽威廉姆斯',
  // 体育联盟
  安东科兹洛夫: '安娜科兹洛娃',
  赵廷廷: '赵婷婷',
  // 研究会
  克劳迪奥威斯特: '克劳迪娅威斯特',
  月下枫: '月下香',
  埃里克施耐德: '艾丽卡施耐德',
  维克托: '维纳斯',
  索菲安: '索菲亚',
  中岛诗人: '中岛诗织',
  如月诗之: '如月诗乃',
  森立花: '森莉花',
  天宫院扶志: '天宫院抚子',
  // 地下联盟
  卢纳拉克缇斯: '露娜拉克缇丝',
  伊利亚斯夜羽: '伊丽莎白夜羽',
  弗洛里安梅斯梅尔: '弗洛拉梅斯梅尔',
  布伦希尔特: '布伦希尔德',
  伊登阿斯莫德: '伊甸阿斯莫德',
  // 雄堕会
  蛾: '蝶',
  // 各年级学生
  上杉亚树: '上杉亚衣',
  阿米利奥安斯华斯: '阿米莉亚安斯华斯',
  樱井结人: '樱井结衣',
  安杰: '安琪',
  美崎绫: '美咲绫',
  角楯凛太: '角楯花凛',
  索亚伊万诺夫: '索亚伊万诺娃',
  凰天翔: '凰天羽',
  赤城朱斗: '赤城朱音',
  蓝原结人: '蓝原结衣',
  橘美树: '橘美玲',
  克里奥佩特罗七世: '克里奥佩特拉七世',
  星野光太: '星野光',
  望月静人: '望月静',
  早坂雷纳: '早坂蕾娜',
  伊尼奥德瓦卢瓦: '伊尼亚德瓦卢瓦',
  纳罗: '娜拉',
  小鸟游雏人: '小鸟游雏子',
  猫宫宁次: '猫宫宁宁',
  犬饲真人: '犬饲真子',
  纳塔利斯斯迈尔: '娜塔莎斯迈尔',
  铃木惠太: '铃木惠美',
  谢尔盖克里姆希尔德: '雪莉克里姆希尔德',
  白川千秋: '白川千夏',
  黑塔少爷: '黑塔小姐',
  月城遥斗: '月城遥',
  桃乃恋: '桃乃爱',
  风雄: '风音',
  铃雄: '铃音',
  山田花男_伪装: '山田花子_伪装',
  山田花男: '山田花子',
  佐藤幸男: '佐藤幸子',
  利安: '莉莉安',
  李小峰: '李小云',
  樱岛麻生: '樱岛麻衣',
  潘多罗: '潘多拉小姐',
  // Boss角色
  沐心岚_1: '沐芯兰_1',
  沐心岚_2: '沐芯兰_2',
  沐心岚_3: '沐芯兰_3',
  伊登芙宁: '伊甸芙宁',
  克里斯_1: '克莉丝汀_1',
  克里斯_2: '克莉丝汀_2',
  艾格纳斯: '艾格妮丝',
  米利奥: '米莉',
  加拉泰斯: '伽拉娜',
  鲁美: '露美',
  墨痕: '墨柒',
  缪修斯: '缪斯',
  响木天斗: '响木天音',
  维斯艾尔: '维斯伊尔',
  弗林: '芙莲',
  梅铎: '梅朵',
  柳烟峰: '柳烟霞',
  查尔斯: '夏洛特',
  利维坦: '莉莉丝',
  利林: '莉莉娜',
  安杰利科: '安洁莉卡',
  云峰: '云溪',
  玄寒: '玄霜',
  菲利克斯: '菲奥娜',
  马塞尔: '玛德琳',
  伊萨克: '伊莎贝拉',
  阿德尔伯特: '阿黛尔',
  梅菲斯托: '梅菲丝',
  贝利亚尔: '贝尔芬格',
  马利奥: '玛利亚',
  特雷斯: '特蕾莎',
  // 驱魔Boss
  克洛伊斯: '克洛伊',
  克洛伊斯_魔化面: '克洛伊_魔化面',
  威尔: '薇尔',
  阿曼德: '阿曼达',
  鬼祝男椿_一阶段: '鬼巫女椿_一阶段',
  万魔之父_一阶段: '万魔之母_一阶段',
  万魔之父: '万魔之母',
  八尺先生_慈父: '八尺夫人_慈母',
  八尺先生_真父: '八尺夫人_真母',
  八尺先生: '八尺夫人',
  初拥吸血郎: '初拥吸血姬',
  暗精灵郎: '暗精灵娘',
  石像鬼郎: '石像鬼娘',
  雪男: '雪女',
  络新夫: '络新妇',
  天狗郎: '天狗',
  黑暗史莱姆郎: '黑暗史莱姆',
  淫蛇男妖: '淫蛇女妖',
  淫虎郎: '淫虎娘',
  男吊: '女吊',
  狼郎: '狼娘',
  恶灵郎: '恶灵娘',
  南瓜头郎: '南瓜头娘',
  鬼祝男椿: '鬼巫女椿',
  僵尸天翔: '僵尸天羽',
  玉藻_一阶段: '玉藻前_一阶段',
  玉藻: '玉藻前',
  夜叉郎: '夜叉娘',
  // 夏日DLC / 转学生 等（女性资源名）
  真白渚: '真白凪沙',
  深海龙鳗郎: '深海龙鳗娘',
  海葵郎: '海葵娘',
  水母郎海月: '水母娘海月',
  蚌珠王子: '蚌珠公主',
  伊利亚: '伊莉雅',
  沐心岚: '沐芯兰',
  克里斯: '克莉丝汀_1',
  // 音译异形（显示男名 → 资源女名）
  青鹏: '青鸢',
  贝阿托: '贝阿切丝特',
  塞勒涅: '赛莲',
  // cgConfig中性转但enemyDatabase未改的角色（安全映射）
  黑崎晴雷: '黑崎晴雯',
  维斯佩罗: '薇丝佩菈',
  // 反向特例：显示名保持女性化，男性名为资源名（兜底，通常走 jsDelivr 外链）
  加藤鹰子: '加藤鹰',
  佐藤健子: '佐藤健',
  田中勇子: '田中勇',
  李芳: '李强',
};

/**
 * 根据敌人全名生成立绘 URL（自动映射为原版女名CDN文件名）
 * @param fullName 敌人的完整名称（可以是改版男名）
 * @returns 立绘 URL
 */
export function getEnemyPortraitUrl(fullName: string): string {
  if (!fullName) {
    return getRandomImageUrl();
  }
  // 映射为原版女名（CDN文件名保持不变）
  const cdnName = PORTRAIT_NAME_MAP[fullName] || fullName;
  // URL 编码处理中文字符
  const encodedName = encodeURIComponent(cdnName);
  return `${R2_PORTRAIT_BASE_URL}/${encodedName}.png`;
}

/**
 * 获取随机图片 URL
 * @returns 随机图片 URL
 */
export function getRandomImageUrl(): string {
  const index = Math.floor(Math.random() * RANDOM_IMAGE_URLS.length);
  return RANDOM_IMAGE_URLS[index];
}

/**
 * 获取玩家自定义头像（同步偏好 URL）
 * @returns 玩家头像 URL 或 null
 */
export function getPlayerCustomAvatar(): string | null {
  return getStoredPlayerAvatarSyncUrl();
}

export async function resolvePlayerCustomAvatar(): Promise<string | null> {
  return resolveStoredPlayerAvatar();
}

/**
 * 保存玩家自定义头像 URL 到本地偏好
 * @param avatarUrl 头像 URL
 */
export function savePlayerCustomAvatar(avatarUrl: string): void {
  saveStoredPlayerAvatar(avatarUrl);
  console.info('[战斗界面] 玩家自定义头像已保存');
}

export async function savePlayerCustomAvatarBlob(blob: Blob): Promise<string> {
  const objectUrl = await saveStoredPlayerAvatarBlob(blob);
  console.info('[战斗界面] 玩家自定义头像已保存');
  return objectUrl;
}

/**
 * 清除玩家自定义头像
 */
export function clearPlayerCustomAvatar(): void {
  clearStoredPlayerAvatar();
  console.info('[战斗界面] 玩家自定义头像已清除');
}

// 创建日志辅助函数
const createLog = (msg: string, source: string, type: CombatLogEntry['type'] = 'info'): CombatLogEntry => ({
  id: Math.random().toString(36).substr(2, 9),
  turn: 0,
  message: msg,
  source,
  type,
});

// --- 玩家物品 ---
export const PLAYER_ITEMS: Item[] = [
  {
    id: 'i1',
    name: '强走饮料',
    description: '恢复 30 点耐力。',
    quantity: 3,
    staminaRestore: 30,
    effect: (user: Character, _target: Character) => {
      user.stats.currentEndurance = Math.min(user.stats.maxEndurance, user.stats.currentEndurance + 30);
      return createLog(`${user.name} 喝下 [强走饮料]，耐力恢复了。`, 'player', 'heal');
    },
  },
  {
    id: 'i2',
    name: '抑制剂',
    description: '减少 20 点当前快感。',
    quantity: 2,
    pleasureReduce: 20,
    effect: (user: Character, _target: Character) => {
      user.stats.currentPleasure = Math.max(0, user.stats.currentPleasure - 20);
      return createLog(`${user.name} 注射了 [抑制剂]，身体稍微冷却下来。`, 'player', 'heal');
    },
  },
];

// --- 创建默认角色数据 ---
export function createDefaultPlayer(): Character {
  // 优先使用自定义头像，否则使用随机图片
  const customAvatar = getPlayerCustomAvatar();
  const avatarUrl = customAvatar || getRandomImageUrl();

  return {
    id: 'player',
    name: '学园偶像',
    avatarUrl,
    isPlayer: true,
    statusEffects: [],
    items: PLAYER_ITEMS.map(i => ({ ...i })),
    skills: [],
    stats: {
      maxEndurance: 100,
      currentEndurance: 100,
      maxPleasure: 100,
      currentPleasure: 0,
      climaxCount: 0,
      maxClimaxCount: 3,
      sexPower: 25,
      baseEndurance: 15,
      evasion: 10,
      dodgeProfileEvasion: 10,
      crit: 5,
      charm: 30,
      luck: 15,
      level: 1,
    },
  };
}

export function createDefaultEnemy(): Character {
  return {
    id: 'enemy',
    name: '风纪委员长',
    avatarUrl: getRandomImageUrl(),
    isPlayer: false,
    statusEffects: [],
    items: [],
    skills: [],
    stats: {
      maxEndurance: 150,
      currentEndurance: 150,
      maxPleasure: 100,
      currentPleasure: 0,
      climaxCount: 0,
      maxClimaxCount: 3,
      sexPower: 20,
      baseEndurance: 20,
      evasion: 5,
      dodgeProfileEvasion: 5,
      crit: 10,
      charm: 10,
      luck: 5,
      level: 1,
    },
  };
}

// --- 高潮文本 ---
export const CLIMAX_TEXTS = [
  (name: string) => `${name} 身体弓起，眼神失焦，无法抑制地颤抖着...`,
  (name: string) => `剧烈的快感如潮水般淹没了 ${name} 的理智...`,
  (name: string) => `${name} 发出了甜美的悲鸣，身体彻底瘫软下来...`,
];
