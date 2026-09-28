/** 饱食度：0~12 的食量刻度，不是百分比。低值危险，高值饱足 */
export function satietyTier(v: number): 'danger' | 'warning' | 'normal' | 'good' {
  if (v <= 2) return 'danger';
  if (v <= 5) return 'warning';
  if (v <= 8) return 'normal';
  return 'good';
}

/** 通用数值条配色。invert 为真时，低值反而安全。max 为该变量的满值 */
export function barTier(v: number, invert = false, max = 100): 'danger' | 'warning' | 'success' {
  const n = invert ? max - v : v;
  const p = (n / max) * 100;
  if (p <= 20) return 'danger';
  if (p <= 45) return 'warning';
  return 'success';
}

/** 精神力各等级对应的数值上限。等级是天花板，数值只是当前储量 */
export const PSYCHE_CAPS: Record<string, number> = {
  C: 29,
  B: 49,
  A: 69,
  S: 84,
  SS: 94,
  SSS: 100,
};

/** 主角声望的满值。比论坛声望高一个量级 */
export const REPUTATION_MAX = 1000;

/** 军衔阶梯与对应的累计军功门槛，从低到高。军功过线只代表有资格，授衔由军部决定 */
export const RANKS: { 衔: string; 军功: number }[] = [
  { 衔: '少尉', 军功: 0 },
  { 衔: '中尉', 军功: 40 },
  { 衔: '上尉', 军功: 150 },
  { 衔: '少校', 军功: 500 },
  { 衔: '中校', 军功: 1100 },
  { 衔: '上校', 军功: 2000 },
  { 衔: '准将', 军功: 3200 },
  { 衔: '少将', 军功: 5000 },
  { 衔: '中将', 军功: 7500 },
  { 衔: '上将', 军功: 11000 },
  { 衔: '大将', 军功: 16000 },
];

/** 下一级军衔与还差的军功。已是最高衔或衔名不在表里时返回 null */
export function nextRank(当前衔: string, 军功: number): { 衔: string; 还差: number } | null {
  const i = RANKS.findIndex(r => r.衔 === 当前衔);
  if (i < 0 || i >= RANKS.length - 1) return null;
  const 下一 = RANKS[i + 1];
  return { 衔: 下一.衔, 还差: Math.max(0, 下一.军功 - 军功) };
}
