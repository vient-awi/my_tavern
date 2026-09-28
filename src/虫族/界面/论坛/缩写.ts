/**
 * 数字的论坛写法。
 *
 * 真论坛不会把「2483」原样写出来，都缩成「2.4k」。设定样例里也是这么写的
 * （🔥点赞 2.4k、🔥 1.2k评论、892）。四位数以下照原样，够大才缩写。
 */

/** 千位以下照原样；千位起缩成 k；百万起缩成 m */
export function 缩写(值: unknown): string {
  const n = Number(值);
  if (!Number.isFinite(n)) return '0';
  const 数 = Math.floor(Math.abs(n));
  if (数 < 1000) return String(数);

  if (数 < 1000000) {
    const 千 = 数 / 1000;
    // 10k 以下保留一位小数（2.4k），10k 以上取整（24k）
    return (千 < 10 ? 千.toFixed(1).replace(/\.0$/, '') : String(Math.floor(千))) + 'k';
  }

  const 百萬 = 数 / 1000000;
  return (百萬 < 10 ? 百萬.toFixed(1).replace(/\.0$/, '') : String(Math.floor(百萬))) + 'm';
}

/** 点赞这类数字，缩写后加个「赞」字显得啰嗦，界面上只用缩写本身 */
export function 千分位(值: unknown): string {
  const n = Number(值);
  if (!Number.isFinite(n)) return '0';
  return 缩写(n);
}
