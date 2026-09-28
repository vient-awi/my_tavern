export type BackstreetAvatarMode = 'chibi' | 'normal';

export const DEFAULT_BACKSTREET_AVATAR_MODE: BackstreetAvatarMode = 'chibi';
export const BACKSTREET_CONTACT_AVATAR_STORAGE_KEY = 'fatria-backstreet-contact-avatar-modes-v1';

const NORMAL_AVATAR_FILE_NAME_OVERRIDES: Record<string, string> = {
  黑无常: '无常',
  无常_小黑: '无常',
  白无常: '无常',
  无常_小白: '无常',
  沐心岚: '沐芯兰_1',
  克里斯: '克莉丝汀_1',
  贝阿托: '贝阿切丝特',
  青鹏: '青鸢',
};

/**
 * 正常头像完整 URL 覆盖（按角色本名直接指定，不走默认 img.vinsimage.org 目录）。
 * 用于头像文件托管在其它 CDN 的角色。
 */
const NORMAL_AVATAR_URL_OVERRIDES: Record<string, string> = {
  加藤鹰子: 'https://cdn.jsdelivr.net/gh/vient-awi/myyy@main/头像/加藤鹰子.png',
  佐藤健子: 'https://cdn.jsdelivr.net/gh/vient-awi/myyy@main/头像/佐藤健子.png',
  田中勇子: 'https://cdn.jsdelivr.net/gh/vient-awi/myyy@main/头像/田中勇子.png',
  李芳: 'https://cdn.jsdelivr.net/gh/vient-awi/myyy@main/头像/李芳.png',
};

const Q_AVATAR_NAMES = new Set([
  '上杉亚衣',
  '中岛诗织',
  '九条凛音',
  '云溪',
  '伊丽莎白夜羽',
  '伊尼亚德瓦卢瓦',
  '伊甸芙宁',
  '伊莎贝拉',
  '伽拉娜',
  '佐藤幸子',
  '僵尸天羽',
  '克劳迪娅威斯特',
  '克洛伊',
  '阿曼达',
  '克莉丝汀_1',
  '八尺夫人',
  '凰天羽',
  '响木天音',
  '响木天音校服',
  '堕落铃音',
  '墨柒',
  '夏洛特',
  '天宫院抚子',
  '女主',
  '如月诗乃',
  '娜塔莎斯迈尔',
  '安娜科兹洛娃',
  '安洁莉卡',
  '安琪',
  '小鸟游雏子',
  '山田花子',
  '布伦希尔德',
  '弗洛拉梅斯梅尔',
  '早坂蕾娜',
  '明日香',
  '星野光',
  '月下香',
  '月城遥',
  '望月静',
  '李小云',
  '柳烟霞',
  '桃乃爱',
  '梅朵',
  '梅菲丝',
  '森莉花',
  '樱井结衣',
  '樱岛麻衣',
  '沐芯兰',
  '沐芯兰_1',
  '潘多拉小姐',
  '爱丽丝温特',
  '特蕾莎',
  '犬饲真子',
  '猫宫宁宁',
  '玄霜',
  '玛利亚',
  '玛德琳',
  '男主',
  '白川千夏',
  '白石响子',
  '神崎凛',
  '米莉',
  '索亚伊万诺娃',
  '索菲亚',
  '绫濑川',
  '维多利亚戈德温',
  '维斯伊尔',
  '缪斯',
  '美咲绫',
  '艾丽卡施耐德',
  '艾格妮丝',
  '艾琳海德',
  '阿米莉亚安斯华斯',
  '艾米丽威廉姆斯',
  '芙莲',
  '角楯花凛',
  '莉莉丝',
  '莉莉娜',
  '莉莉安',
  '莎拉斯通',
  '菲奥娜',
  '蓝原结衣',
  '薇丝佩菈',
  '薇尔',
  '蝶',
  '贝尔芬格',
  '贝阿切丝特',
  '赤城朱音',
  '赵婷婷',
  '铃木惠美',
  '铃音',
  '辣妹子阳菜',
  '阿黛尔',
  '雪',
  '雪莉克里姆希尔德',
  '零',
  '露娜拉克缇丝',
  '露美',
  '青鸢',
  '风',
  '风音',
  '鬼巫女椿',
  '鬼樱',
  '黑塔小姐',
  '黑崎晴雯',
  '真白凪沙',
  '深海龙鳗娘',
  '海葵娘',
  '水母娘海月',
  '蚌珠公主',
  '伊莉雅',
]);

/**
 * 男版显示名 → 女版资源名映射（用于Q版头像查找）
 * Q版头像文件在服务器上仍以原版女性名命名
 */
export const CHIBI_RESOURCE_NAME_MAP: Record<string, string> = {
  白石响二: '白石响子',
  弗洛里安梅斯梅尔: '弗洛拉梅斯梅尔',
  布伦希尔特: '布伦希尔德',
  维克多戈德温: '维多利亚戈德温',
  埃里克施耐德: '艾丽卡施耐德',
  谢尔盖克里姆希尔德: '雪莉克里姆希尔德',
  白川千秋: '白川千夏',
  埃米尔威廉姆斯: '艾米丽威廉姆斯',
  安东科兹洛夫: '安娜科兹洛娃',
  克劳迪奥威斯特: '克劳迪娅威斯特',
  中岛诗人: '中岛诗织',
  黑塔少爷: '黑塔小姐',
  卢纳拉克缇斯: '露娜拉克缇丝',
  伊利亚斯夜羽: '伊丽莎白夜羽',
  樱岛麻生: '樱岛麻衣',
  潘多罗: '潘多拉小姐',
  阿米利奥安斯华斯: '阿米莉亚安斯华斯',
  森立花: '森莉花',
  如月诗之: '如月诗乃',
  樱井结人: '樱井结衣',
  角楯凛太: '角楯花凛',
  月城遥斗: '月城遥',
  上杉亚树: '上杉亚衣',
  天宫院扶志: '天宫院抚子',
  索亚伊万诺夫: '索亚伊万诺娃',
  九条凛士: '九条凛音',
  赤城朱斗: '赤城朱音',
  蓝原结人: '蓝原结衣',
  橘美树: '橘美玲',
  克里奥佩特罗七世: '克里奥佩特拉七世',
  星野光太: '星野光',
  望月静人: '望月静',
  早坂雷纳: '早坂蕾娜',
  伊尼奥德瓦卢瓦: '伊尼亚德瓦卢瓦',
  小鸟游雏人: '小鸟游雏子',
  猫宫宁次: '猫宫宁宁',
  犬饲真人: '犬饲真子',
  纳塔利斯斯迈尔: '娜塔莎斯迈尔',
  铃木惠太: '铃木惠美',
  山田花男: '山田花子',
  佐藤幸男: '佐藤幸子',
  沐心岚: '沐芯兰_1',
  伊登芙宁: '伊甸芙宁',
  伊登阿斯莫德: '伊甸阿斯莫德',
  艾格纳斯: '艾格妮丝',
  维克托: '维纳斯',
  索菲安: '索菲亚',
  利安: '莉莉安',
  艾伦海德: '艾琳海德',
  神崎凛司: '神崎凛',
  阿尔伯特温特: '爱丽丝温特',
  沙恩斯通: '莎拉斯通',
  明日郎: '明日香',
  赵廷廷: '赵婷婷',
  李小峰: '李小云',
  月下枫: '月下香',
  蛾: '蝶',
  安杰: '安琪',
  美崎绫: '美咲绫',
  桃乃恋: '桃乃爱',
  风雄: '风音',
  铃雄: '铃音',
  凰天翔: '凰天羽',
  纳罗: '娜拉',
  弗林: '芙莲',
  克里斯: '克莉丝汀_1',
  加拉泰斯: '伽拉娜',
  鲁美: '露美',
  墨痕: '墨柒',
  缪修斯: '缪斯',
  响木天斗: '响木天音',
  维斯艾尔: '维斯伊尔',
  米利奥: '米莉',
  梅铎: '梅朵',
  辣弟子阳菜: '辣妹子阳菜',
  玄寒: '玄霜',
  青鹏: '青鸢',
  云峰: '云溪',
  梅菲斯托: '梅菲丝',
  贝阿托: '贝阿切丝特',
  特雷斯: '特蕾莎',
  马利奥: '玛利亚',
  塞勒涅: '赛莲',
  查尔斯: '夏洛特',
  柳烟峰: '柳烟霞',
  菲利克斯: '菲奥娜',
  贝利亚尔: '贝尔芬格',
  伊萨克: '伊莎贝拉',
  马塞尔: '玛德琳',
  阿德尔伯特: '阿黛尔',
  利维坦: '莉莉丝',
  利林: '莉莉娜',
  安杰利科: '安洁莉卡',
  维斯佩罗: '薇丝佩菈',
  僵尸天翔: '僵尸天羽',
  克洛伊斯: '克洛伊',
  威尔: '薇尔',
  阿曼德: '阿曼达',
  八尺先生: '八尺夫人',
  万魔之父: '万魔之母',
  鬼祝男椿: '鬼巫女椿',
  玉藻: '玉藻前',
  天狗郎: '天狗',
  络新夫: '络新妇',
  雪男: '雪女',
  淫蛇男妖: '淫蛇女妖',
  淫虎郎: '淫虎娘',
  夜叉郎: '夜叉娘',
  狼郎: '狼娘',
  恶灵郎: '恶灵娘',
  南瓜头郎: '南瓜头娘',
  黑暗史莱姆郎: '黑暗史莱姆',
  石像鬼郎: '石像鬼娘',
  暗精灵郎: '暗精灵娘',
  男吊: '女吊',
  黑崎晴雷: '黑崎晴雯',
  加藤鹰子: '加藤鹰',
  佐藤健子: '佐藤健',
  田中勇子: '田中勇',
  李芳: '李强',
  真白渚: '真白凪沙',
  深海龙鳗郎: '深海龙鳗娘',
  海葵郎: '海葵娘',
  水母郎海月: '水母娘海月',
  蚌珠王子: '蚌珠公主',
  伊利亚: '伊莉雅',
};

function normalizeName(name: string): string {
  return String(name || '').trim();
}

export function getAvatarResourceName(name: string): string {
  // 敌人库用下划线区分战斗阶段/形态，头像目录只按角色本名存放。
  return normalizeName(name).replace(/_[^_]+$/u, '');
}

export function normalizeBackstreetAvatarMode(value: unknown): BackstreetAvatarMode {
  return value === 'normal' ? 'normal' : 'chibi';
}

export function getNormalAvatarUrl(fullName: string): string {
  const rawName = getAvatarResourceName(fullName);

  // 优先使用完整 URL 覆盖（头像托管在其它 CDN 的角色，按原始本名匹配）
  const overriddenUrl = NORMAL_AVATAR_URL_OVERRIDES[rawName];
  if (overriddenUrl) return overriddenUrl;

  // 男版显示名 → 女版资源名映射（头像文件在服务器上仍以原版女性名命名）
  const resourceName = CHIBI_RESOURCE_NAME_MAP[rawName] || rawName;
  const avatarFileName = NORMAL_AVATAR_FILE_NAME_OVERRIDES[resourceName] || resourceName;

  return `https://img.vinsimage.org/性斗学园/头像/${encodeURIComponent(avatarFileName)}.png`;
}

export function getChibiAvatarName(fullName: string): string | null {
  const rawName = getAvatarResourceName(fullName);
  if (!rawName) return null;

  // 男版显示名 → 女版资源名映射（Q版头像文件在服务器上仍以原版女性名命名）
  const resourceName = CHIBI_RESOURCE_NAME_MAP[rawName] || rawName;

  const candidates = [resourceName, `${resourceName}_1`, `${resourceName}1`, resourceName.replace(/\s+/g, '')];
  return candidates.find(candidate => Q_AVATAR_NAMES.has(candidate)) || null;
}

export function getChibiAvatarUrl(chibiName: string): string {
  return `https://img.vinsimage.org/性斗学园/Q版头像/${encodeURIComponent(chibiName)}.png`;
}

export function getDefaultPlayerAvatarUrl(gender: unknown): string {
  const avatarName = String(gender || '').trim() === '女' ? '男主' : '女主';
  return getChibiAvatarUrl(avatarName);
}

export function hasChibiAvatar(fullName: string): boolean {
  return Boolean(getChibiAvatarName(fullName));
}

export function loadContactAvatarModes(): Record<string, BackstreetAvatarMode> {
  try {
    const raw = window.localStorage?.getItem(BACKSTREET_CONTACT_AVATAR_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const modes: Record<string, BackstreetAvatarMode> = {};
    for (const [name, mode] of Object.entries(parsed || {})) {
      const normalizedName = normalizeName(name);
      if (normalizedName) {
        modes[normalizedName] = normalizeBackstreetAvatarMode(mode);
      }
    }
    return modes;
  } catch {
    return {};
  }
}

export function saveContactAvatarModes(modes: Record<string, BackstreetAvatarMode>): void {
  try {
    window.localStorage?.setItem(BACKSTREET_CONTACT_AVATAR_STORAGE_KEY, JSON.stringify(modes));
  } catch {
    // localStorage 不可用时保留当前运行态即可。
  }
}
