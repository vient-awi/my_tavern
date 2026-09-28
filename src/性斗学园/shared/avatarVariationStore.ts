import { NAME_ALIASES } from '../战斗界面/enemyDatabase';
import { getAvatarResourceName } from '../性斗学园脚本/phone/backstreetAvatarSettings';

export const CHARACTER_AVATAR_VARIATIONS_VARIABLE_KEY = '性斗学园头像差分记录';
export const AVATAR_VARIATIONS_UPDATED_EVENT = 'fatria-avatar-variations-updated';

const CHARACTER_VARIABLE_OPTION: VariableOption = { type: 'character' };
export const AVATAR_VARIATION_KEYS = ['低好感', '中好感', '高好感', '服从', '平等', '支配'] as const;

export type AvatarVariationKey = (typeof AVATAR_VARIATION_KEYS)[number];

export interface AvatarVariationConfig {
  characterName: string;
  imageFolder: string;
}

export interface AvatarVariationOption {
  key: AvatarVariationKey;
  label: string;
  url: string;
}

interface AvatarAvailabilityCacheEntry {
  promise: Promise<boolean>;
  expiresAt: number;
}

const avatarAvailabilityCache = new Map<string, AvatarAvailabilityCacheEntry>();
const AVATAR_AVAILABILITY_TIMEOUT_MS = 2_500;
const AVATAR_AVAILABILITY_FAILURE_TTL_MS = 30_000;

/**
 * Check a remote avatar without allowing one stalled CDN request to block a page.
 * Successful checks stay cached for the lifetime of the script; failed checks are
 * retried after a short period so newly uploaded images are picked up automatically.
 */
export function isAvatarUrlAvailable(url: string): Promise<boolean> {
  const normalizedUrl = String(url || '').trim();
  if (!normalizedUrl) return Promise.resolve(false);

  const cached = avatarAvailabilityCache.get(normalizedUrl);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  let entry!: AvatarAvailabilityCacheEntry;
  const promise = new Promise<boolean>(resolve => {
    const image = new Image();
    let settled = false;
    const finish = (available: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve(available);
      entry.expiresAt = available ? Number.MAX_SAFE_INTEGER : Date.now() + AVATAR_AVAILABILITY_FAILURE_TTL_MS;
    };
    const timeoutId = window.setTimeout(() => {
      image.src = '';
      finish(false);
    }, AVATAR_AVAILABILITY_TIMEOUT_MS);

    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = normalizedUrl;
  });

  entry = { promise, expiresAt: Number.MAX_SAFE_INTEGER };
  avatarAvailabilityCache.set(normalizedUrl, entry);
  return promise;
}

/** Probe a small number of avatar URLs at a time to avoid starving normal images. */
export async function filterAvailableAvatarVariationOptions(
  options: AvatarVariationOption[],
  maxConcurrent = 3,
): Promise<AvatarVariationOption[]> {
  if (options.length === 0) return [];

  const available = new Array<boolean>(options.length).fill(false);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < options.length) {
      const index = nextIndex++;
      available[index] = await isAvatarUrlAvailable(options[index].url);
    }
  };

  const workerCount = Math.min(Math.max(1, maxConcurrent), options.length);
  await Promise.all(Array.from({ length: workerCount }, worker));
  return options.filter((_, index) => available[index]);
}

export interface AvatarVariationMutationResult {
  changed: boolean;
  unlockedCount: number;
  characters: string[];
}

export interface AvatarVariationRecord {
  unlocked: AvatarVariationKey[];
  selected?: AvatarVariationKey | null;
}

export type SerializableAvatarVariationMap = Record<string, AvatarVariationRecord>;

// characterName 使用改版的男性名（匹配关系系统中的名字）
// imageFolder 保留原版女性名（头像差分资源存放在原版角色名目录下）
export const AVATAR_VARIATION_CONFIGS: AvatarVariationConfig[] = [
  // ── 教师 / 学生会 ──
  { characterName: '阿尔伯特温特', imageFolder: '爱丽丝温特' },
  { characterName: '白石响二', imageFolder: '白石响子' },
  { characterName: '神崎凛司', imageFolder: '神崎凛' },
  { characterName: '艾伦海德', imageFolder: '艾琳海德' },
  { characterName: '九条凛士', imageFolder: '九条凛音' },
  // ── 男权协会 ──
  { characterName: '沙恩斯通', imageFolder: '莎拉斯通' },
  { characterName: '维克多戈德温', imageFolder: '维多利亚戈德温' },
  { characterName: '谢尔盖克里姆希尔德', imageFolder: '雪莉克里姆希尔德' },
  // ── BF社 ──
  { characterName: '明日郎', imageFolder: '明日香' },
  { characterName: '埃米尔威廉姆斯', imageFolder: '艾米丽威廉姆斯' },
  // ── 体育联盟 ──
  { characterName: '安东科兹洛夫', imageFolder: '安娜科兹洛娃' },
  { characterName: '赵廷廷', imageFolder: '赵婷婷' },
  // ── 研究会 ──
  { characterName: '克劳迪奥威斯特', imageFolder: '克劳迪娅威斯特' },
  { characterName: '月下枫', imageFolder: '月下香' },
  { characterName: '埃里克施耐德', imageFolder: '艾丽卡施耐德' },
  { characterName: '维克托', imageFolder: '维纳斯' },
  { characterName: '索菲安', imageFolder: '索菲亚' },
  { characterName: '中岛诗人', imageFolder: '中岛诗织' },
  { characterName: '如月诗之', imageFolder: '如月诗乃' },
  { characterName: '森立花', imageFolder: '森莉花' },
  { characterName: '天宫院扶志', imageFolder: '天宫院抚子' },
  // ── 地下联盟 ──
  { characterName: '卢纳拉克缇斯', imageFolder: '露娜拉克缇丝' },
  { characterName: '伊利亚斯夜羽', imageFolder: '伊丽莎白夜羽' },
  { characterName: '弗洛里安梅斯梅尔', imageFolder: '弗洛拉梅斯梅尔' },
  { characterName: '布伦希尔特', imageFolder: '布伦希尔德' },
  { characterName: '伊登阿斯莫德', imageFolder: '伊甸阿斯莫德' },
  // ── 雄堕会 ──
  { characterName: '蛾', imageFolder: '蝶' },
  // ── 各年级学生 ──
  { characterName: '上杉亚树', imageFolder: '上杉亚衣' },
  { characterName: '阿米利奥安斯华斯', imageFolder: '阿米莉亚安斯华斯' },
  { characterName: '樱井结人', imageFolder: '樱井结衣' },
  { characterName: '安杰', imageFolder: '安琪' },
  { characterName: '美崎绫', imageFolder: '美咲绫' },
  { characterName: '角楯凛太', imageFolder: '角楯花凛' },
  { characterName: '索亚伊万诺夫', imageFolder: '索亚伊万诺娃' },
  { characterName: '凰天翔', imageFolder: '凰天羽' },
  { characterName: '赤城朱斗', imageFolder: '赤城朱音' },
  { characterName: '蓝原结人', imageFolder: '蓝原结衣' },
  { characterName: '橘美树', imageFolder: '橘美玲' },
  { characterName: '克里奥佩特罗七世', imageFolder: '克里奥佩特拉七世' },
  { characterName: '星野光太', imageFolder: '星野光' },
  { characterName: '望月静人', imageFolder: '望月静' },
  { characterName: '早坂雷纳', imageFolder: '早坂蕾娜' },
  { characterName: '伊尼奥德瓦卢瓦', imageFolder: '伊尼亚德瓦卢瓦' },
  { characterName: '纳罗', imageFolder: '娜拉' },
  { characterName: '小鸟游雏人', imageFolder: '小鸟游雏子' },
  { characterName: '猫宫宁次', imageFolder: '猫宫宁宁' },
  { characterName: '犬饲真人', imageFolder: '犬饲真子' },
  { characterName: '纳塔利斯斯迈尔', imageFolder: '娜塔莎斯迈尔' },
  { characterName: '铃木惠太', imageFolder: '铃木惠美' },
  { characterName: '白川千秋', imageFolder: '白川千夏' },
  { characterName: '黑塔少爷', imageFolder: '黑塔小姐' },
  { characterName: '月城遥斗', imageFolder: '月城遥' },
  { characterName: '桃乃恋', imageFolder: '桃乃爱' },
  { characterName: '风雄', imageFolder: '风音' },
  { characterName: '铃雄', imageFolder: '铃音' },
  { characterName: '山田花男', imageFolder: '山田花子' },
  { characterName: '佐藤幸男', imageFolder: '佐藤幸子' },
  { characterName: '利安', imageFolder: '莉莉安' },
  { characterName: '李小峰', imageFolder: '李小云' },
  { characterName: '樱岛麻生', imageFolder: '麻衣' },
  { characterName: '潘多罗', imageFolder: '潘多拉小姐' },
  { characterName: '辣弟子阳菜', imageFolder: '辣妹子阳菜' },
  { characterName: '真白渚', imageFolder: '真白凪沙' },
  { characterName: '深海龙鳗郎', imageFolder: '深海龙鳗娘' },
  { characterName: '海葵郎', imageFolder: '海葵娘' },
  { characterName: '水母郎海月', imageFolder: '水母娘海月' },
  { characterName: '蚌珠王子', imageFolder: '蚌珠公主' },
  { characterName: '伊利亚', imageFolder: '伊莉雅' },
  // ── Boss 角色 ──
  { characterName: '伊登芙宁', imageFolder: '伊甸芙宁' },
  { characterName: '艾格纳斯', imageFolder: '艾格妮丝' },
  { characterName: '米利奥', imageFolder: '米莉' },
  { characterName: '加拉泰斯', imageFolder: '伽拉娜' },
  { characterName: '鲁美', imageFolder: '露美' },
  { characterName: '墨痕', imageFolder: '墨柒' },
  { characterName: '缪修斯', imageFolder: '缪斯' },
  { characterName: '响木天斗', imageFolder: '响木天音' },
  { characterName: '维斯艾尔', imageFolder: '维斯伊尔' },
  { characterName: '弗林', imageFolder: '芙莲' },
  { characterName: '梅铎', imageFolder: '梅朵' },
  { characterName: '柳烟峰', imageFolder: '柳烟霞' },
  { characterName: '查尔斯', imageFolder: '夏洛特' },
  { characterName: '利维坦', imageFolder: '莉莉丝' },
  { characterName: '利林', imageFolder: '莉莉娜' },
  { characterName: '安杰利科', imageFolder: '安洁莉卡' },
  { characterName: '云峰', imageFolder: '云溪' },
  { characterName: '玄寒', imageFolder: '玄霜' },
  { characterName: '菲利克斯', imageFolder: '菲奥娜' },
  { characterName: '马塞尔', imageFolder: '玛德琳' },
  { characterName: '伊萨克', imageFolder: '伊莎贝拉' },
  { characterName: '阿德尔伯特', imageFolder: '阿黛尔' },
  { characterName: '梅菲斯托', imageFolder: '梅菲丝' },
  { characterName: '贝利亚尔', imageFolder: '贝尔芬格' },
  { characterName: '马利奥', imageFolder: '玛利亚' },
  { characterName: '特雷斯', imageFolder: '特蕾莎' },
  { characterName: '塞勒涅', imageFolder: '赛莲' },
  { characterName: '贝阿托', imageFolder: '贝阿切丝特' },
  { characterName: '青鹏', imageFolder: '青鸢' },
  { characterName: '沐心岚', imageFolder: '沐芯兰' },
  // ── 驱魔 Boss ──
  { characterName: '克洛伊斯', imageFolder: '克洛伊' },
  { characterName: '僵尸天翔', imageFolder: '僵尸天羽' },
  { characterName: '八尺先生', imageFolder: '八尺夫人' },
  { characterName: '维斯佩罗', imageFolder: '薇丝佩菈' },
  { characterName: '黑崎晴雷', imageFolder: '黑崎晴雯' },
  { characterName: '克里斯', imageFolder: '克莉丝汀' },
  { characterName: '阿曼德', imageFolder: '阿曼达' },
  { characterName: '威尔', imageFolder: '薇尔' },
  { characterName: '万魔之父', imageFolder: '万魔之母' },
  { characterName: '鬼祝男椿', imageFolder: '鬼巫女椿' },
  { characterName: '玉藻', imageFolder: '玉藻前' },
  { characterName: '天狗郎', imageFolder: '天狗' },
  { characterName: '络新夫', imageFolder: '络新妇' },
  { characterName: '雪男', imageFolder: '雪女' },
  { characterName: '黑暗史莱姆郎', imageFolder: '黑暗史莱姆' },
  { characterName: '石像鬼郎', imageFolder: '石像鬼娘' },
  { characterName: '暗精灵郎', imageFolder: '暗精灵娘' },
  { characterName: '淫蛇男妖', imageFolder: '淫蛇女妖' },
  { characterName: '淫虎郎', imageFolder: '淫虎娘' },
  { characterName: '夜叉郎', imageFolder: '夜叉娘' },
  { characterName: '狼郎', imageFolder: '狼娘' },
  { characterName: '恶灵郎', imageFolder: '恶灵娘' },
  { characterName: '南瓜头郎', imageFolder: '南瓜头娘' },
  { characterName: '男吊', imageFolder: '女吊' },
];

function emptyMutationResult(): AvatarVariationMutationResult {
  return {
    changed: false,
    unlockedCount: 0,
    characters: [],
  };
}

function normalizeCharacterName(name: string): string {
  return String(name || '')
    .trim()
    .replace(/[·・‧•\s\u3000._\-\u2014]/g, '');
}

function normalizeVariationKey(value: unknown): AvatarVariationKey | null {
  return AVATAR_VARIATION_KEYS.includes(value as AvatarVariationKey) ? (value as AvatarVariationKey) : null;
}

function uniqueVariationKeys(value: unknown): AvatarVariationKey[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: AvatarVariationKey[] = [];
  for (const item of value) {
    const key = normalizeVariationKey(item);
    if (key && !result.includes(key)) {
      result.push(key);
    }
  }

  return result;
}

function readCharacterVariables(): Record<string, any> {
  try {
    const globalAny = window as any;
    if (typeof globalAny.getVariables === 'function') {
      return globalAny.getVariables(CHARACTER_VARIABLE_OPTION) || {};
    }
  } catch (error) {
    console.warn('[性斗学园] 读取角色变量失败:', error);
  }

  return {};
}

function saveAvatarVariationMap(unlockMap: SerializableAvatarVariationMap): boolean {
  try {
    const globalAny = window as any;
    if (typeof globalAny.insertOrAssignVariables === 'function') {
      globalAny.insertOrAssignVariables(
        { [CHARACTER_AVATAR_VARIATIONS_VARIABLE_KEY]: unlockMap },
        CHARACTER_VARIABLE_OPTION,
      );
      return true;
    }
  } catch (error) {
    console.warn('[性斗学园] 写入头像差分变量失败:', error);
  }

  return false;
}

function notifyAvatarVariationsUpdated(result: AvatarVariationMutationResult) {
  if (!result.changed) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(AVATAR_VARIATIONS_UPDATED_EVENT, {
      detail: {
        characters: result.characters,
        unlockedCount: result.unlockedCount,
      },
    }),
  );
}

function addChangedCharacter(result: AvatarVariationMutationResult, characterName: string) {
  if (!result.characters.includes(characterName)) {
    result.characters.push(characterName);
  }
}

export function getAvatarVariationConfigForCharacter(characterName: string): AvatarVariationConfig | null {
  const normalizedName = normalizeCharacterName(characterName);
  if (!normalizedName) {
    return null;
  }

  const createDefaultConfig = (name: string): AvatarVariationConfig => ({
    characterName: name,
    imageFolder: name,
  });

  const direct = AVATAR_VARIATION_CONFIGS.find(
    config =>
      normalizeCharacterName(config.characterName) === normalizedName ||
      normalizeCharacterName(config.imageFolder) === normalizedName,
  );
  if (direct) {
    return direct;
  }

  const aliasTarget = NAME_ALIASES[normalizedName];
  const candidates = [aliasTarget, aliasTarget?.replace(/_\d+$/g, ''), normalizedName.replace(/_\d+$/g, '')].filter(
    (candidate): candidate is string => typeof candidate === 'string' && candidate.length > 0,
  );

  for (const candidate of candidates) {
    const matched = AVATAR_VARIATION_CONFIGS.find(
      config => normalizeCharacterName(config.characterName) === normalizeCharacterName(candidate),
    );
    if (matched) {
      return matched;
    }
  }

  if (aliasTarget) {
    return createDefaultConfig(aliasTarget);
  }

  const byFullName = [...AVATAR_VARIATION_CONFIGS].sort((a, b) => b.characterName.length - a.characterName.length);
  const includedConfig = byFullName.find(config =>
    normalizedName.includes(normalizeCharacterName(config.characterName)),
  );
  if (includedConfig) {
    return includedConfig;
  }

  const aliases = Object.entries(NAME_ALIASES).sort((a, b) => b[0].length - a[0].length);
  for (const [alias, fullName] of aliases) {
    if (!normalizedName.includes(normalizeCharacterName(alias))) {
      continue;
    }

    const matched = AVATAR_VARIATION_CONFIGS.find(
      config => normalizeCharacterName(config.characterName) === normalizeCharacterName(fullName),
    );
    if (matched) {
      return matched;
    }

    return createDefaultConfig(fullName);
  }

  return createDefaultConfig(characterName.trim());
}

export function getAvatarVariationCharacterName(characterName: string): string | null {
  return getAvatarVariationConfigForCharacter(characterName)?.characterName ?? null;
}

function normalizeAvatarVariationMap(rawValue: unknown): SerializableAvatarVariationMap {
  if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
    return {};
  }

  const result: SerializableAvatarVariationMap = {};
  for (const [characterName, rawRecord] of Object.entries(rawValue as Record<string, unknown>)) {
    const config = getAvatarVariationConfigForCharacter(characterName);
    if (!config || !rawRecord || typeof rawRecord !== 'object' || Array.isArray(rawRecord)) {
      continue;
    }

    const record = rawRecord as Record<string, unknown>;
    const unlocked = uniqueVariationKeys(record.unlocked);
    const selected = normalizeVariationKey(record.selected);
    result[config.characterName] = {
      unlocked,
      ...(selected && unlocked.includes(selected) ? { selected } : {}),
    };
  }

  return result;
}

function getCharacterAvatarVariationMap(): SerializableAvatarVariationMap {
  return normalizeAvatarVariationMap(readCharacterVariables()[CHARACTER_AVATAR_VARIATIONS_VARIABLE_KEY]);
}

function addAvatarVariationKeysToMap(
  unlockMap: SerializableAvatarVariationMap,
  characterName: string,
  keys: Iterable<AvatarVariationKey>,
): number {
  const config = getAvatarVariationConfigForCharacter(characterName);
  if (!config) {
    return 0;
  }

  const existingRecord = unlockMap[config.characterName] || { unlocked: [] };
  const unlocked = new Set(uniqueVariationKeys(existingRecord.unlocked));
  let addedCount = 0;

  for (const key of keys) {
    if (unlocked.has(key)) {
      continue;
    }

    unlocked.add(key);
    addedCount++;
  }

  if (addedCount > 0) {
    unlockMap[config.characterName] = {
      unlocked: [...unlocked],
      ...(existingRecord.selected && unlocked.has(existingRecord.selected)
        ? { selected: existingRecord.selected }
        : {}),
    };
  }

  return addedCount;
}

function addAvatarKeysToMutationResult(
  result: AvatarVariationMutationResult,
  characterName: string,
  addedCount: number,
) {
  if (addedCount <= 0) {
    return;
  }

  result.changed = true;
  result.unlockedCount += addedCount;
  addChangedCharacter(result, characterName);
}

function getUnlockKeysFromRelationship(relationship: Record<string, any>): AvatarVariationKey[] {
  const result: AvatarVariationKey[] = [];
  const favor = Number(relationship.好感度);
  if (Number.isFinite(favor)) {
    if (favor > 30) result.push('低好感');
    if (favor > 60) result.push('中好感');
    if (favor > 90) result.push('高好感');
  }

  switch (String(relationship.誓约 || '无')) {
    case '被支配型':
      result.push('服从');
      break;
    case '平等型':
      result.push('平等');
      break;
    case '支配型':
      result.push('支配');
      break;
  }

  return result;
}

export async function unlockAvatarVariationsFromMvuData(mvuData: Mvu.MvuData): Promise<AvatarVariationMutationResult> {
  const result = emptyMutationResult();
  const relationships = mvuData.stat_data?.关系系统;
  if (!relationships || typeof relationships !== 'object') {
    return result;
  }

  const unlockMap = getCharacterAvatarVariationMap();

  for (const [characterName, relationship] of Object.entries(relationships)) {
    if (characterName === '在场人物' || !relationship || typeof relationship !== 'object') {
      continue;
    }

    const config = getAvatarVariationConfigForCharacter(characterName);
    if (!config) {
      continue;
    }

    const addedCount = addAvatarVariationKeysToMap(
      unlockMap,
      config.characterName,
      getUnlockKeysFromRelationship(relationship as Record<string, any>),
    );
    addAvatarKeysToMutationResult(result, config.characterName, addedCount);
  }

  if (result.changed) {
    saveAvatarVariationMap(unlockMap);
    notifyAvatarVariationsUpdated(result);
  }

  return result;
}

export async function getAllAvatarVariationRecordsByCharacter(): Promise<SerializableAvatarVariationMap> {
  return getCharacterAvatarVariationMap();
}

export async function getUnlockedAvatarVariationOptions(characterName: string): Promise<AvatarVariationOption[]> {
  const config = getAvatarVariationConfigForCharacter(characterName);
  if (!config) {
    return [];
  }

  const unlockMap = await getAllAvatarVariationRecordsByCharacter();
  return uniqueVariationKeys(unlockMap[config.characterName]?.unlocked).map(key => ({
    key,
    label: key,
    url: getAvatarVariationUrl(config, key),
  }));
}

export function getAllAvatarVariationOptions(characterName: string): AvatarVariationOption[] {
  const config = getAvatarVariationConfigForCharacter(characterName);
  if (!config) {
    return [];
  }

  return AVATAR_VARIATION_KEYS.map(key => ({
    key,
    label: key,
    url: getAvatarVariationUrl(config, key),
  }));
}

export async function getSelectedAvatarVariationKey(characterName: string): Promise<AvatarVariationKey | null> {
  const config = getAvatarVariationConfigForCharacter(characterName);
  if (!config) {
    return null;
  }

  const unlockMap = await getAllAvatarVariationRecordsByCharacter();
  const record = unlockMap[config.characterName];
  return record?.selected && record.unlocked.includes(record.selected) ? record.selected : null;
}

export async function getSelectedAvatarVariationUrl(characterName: string): Promise<string | null> {
  const config = getAvatarVariationConfigForCharacter(characterName);
  const selectedKey = await getSelectedAvatarVariationKey(characterName);
  return config && selectedKey ? getAvatarVariationUrl(config, selectedKey) : null;
}

export async function selectAvatarVariation(characterName: string, key: AvatarVariationKey | null): Promise<boolean> {
  const config = getAvatarVariationConfigForCharacter(characterName);
  if (!config) {
    return false;
  }

  const unlockMap = getCharacterAvatarVariationMap();
  const record = unlockMap[config.characterName];
  if (!record) {
    return false;
  }

  if (key && !record.unlocked.includes(key)) {
    return false;
  }

  const nextRecord: AvatarVariationRecord = {
    unlocked: record.unlocked,
    selected: key,
  };
  unlockMap[config.characterName] = nextRecord;

  const changed = record.selected !== nextRecord.selected;
  if (changed) {
    saveAvatarVariationMap(unlockMap);
    window.dispatchEvent(
      new CustomEvent(AVATAR_VARIATIONS_UPDATED_EVENT, {
        detail: {
          characters: [config.characterName],
          unlockedCount: 0,
        },
      }),
    );
  }

  return changed;
}

export function getAvatarVariationUrl(config: AvatarVariationConfig, key: AvatarVariationKey): string {
  const imageFolder = getAvatarResourceName(config.imageFolder);
  return `https://img.vinsimage.org/性斗学园/头像差分/${encodeURIComponent(imageFolder)}/${encodeURIComponent(key)}.png`;
}
