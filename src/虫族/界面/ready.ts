/** 轮询直到条件成立。MVU 的 stat_data 由脚本异步写入，界面要等它落表 */
export async function waitUntil(条件: () => boolean, 超时毫秒 = 15000, 间隔毫秒 = 100): Promise<void> {
  const 起始 = Date.now();
  while (!条件()) {
    if (Date.now() - 起始 > 超时毫秒) {
      throw new Error('等待 MVU 变量超时');
    }
    await new Promise(r => setTimeout(r, 间隔毫秒));
  }
}

/** 两个界面共用的初始化：等 Mvu 接口就绪、等 stat_data 落表 */
export async function waitForStatData(): Promise<void> {
  await waitGlobalInitialized('Mvu');
  await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'));
}
