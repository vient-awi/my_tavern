/**
 * 《触角》论坛的 MVU 数据层。
 *
 * 与状态栏不同：论坛读写的是**最新楼层**的 stat_data，不是当前界面所在楼层的快照。
 * 界面挂在 AI 刚生成的那条消息上，而网友的帖子、公告、通知就写在同一轮回复里。
 * 读当前楼层的快照会读到这条回复生成**之前**的状态——当轮刚发生的事要等下一轮才看得见。
 */

const LATEST: VariableOption = { type: 'message', message_id: 'latest' };

/** 串行化"读-改-写"。Mvu.replaceMvuData 是整体替换，并发写会基于旧快照互相覆盖（连点两次点赞就丢一次） */
let tail: Promise<unknown> = Promise.resolve();

function runTransaction<T>(操作名: string, op: () => Promise<T>): Promise<T> {
  const next = tail.catch(() => undefined).then(async () => {
    const 起始 = performance.now();
    try {
      return await op();
    } finally {
      const 耗时 = Math.round(performance.now() - 起始);
      if (耗时 >= 250) console.info(`[触角] MVU 事务完成：${操作名}（${耗时}ms）`);
    }
  });
  tail = next.catch(() => undefined);
  return next;
}

export async function waitForMvu(): Promise<boolean> {
  const w = window as any;
  if (typeof w.waitGlobalInitialized === 'function') {
    // 界面挂载时 MVU 可能还没就绪；等它，但不让等待失败阻断界面
    try {
      await w.waitGlobalInitialized('Mvu');
    } catch (error) {
      console.warn('[触角] 等待 MVU 初始化失败:', error);
    }
  }
  if (typeof Mvu === 'undefined' || !Mvu) {
    console.warn('[触角] MVU 变量框架未初始化');
    return false;
  }
  return true;
}

export async function readStatData(): Promise<Record<string, any> | null> {
  if (!(await waitForMvu())) return null;
  return Mvu.getMvuData(LATEST)?.stat_data ?? null;
}

/**
 * 读出最新楼层的 stat_data，交给 mutator 就地修改，再整体写回。
 * mutator 里直接改对象即可；抛错则不写回。
 */
export async function mutateStatData(操作名: string, mutator: (statData: Record<string, any>) => void): Promise<void> {
  await runTransaction(操作名, async () => {
    if (!(await waitForMvu())) return;
    const mvuData = Mvu.getMvuData(LATEST);
    if (!mvuData) {
      console.error('[触角] 取不到 MVU 数据，写入被跳过:', 操作名);
      return;
    }
    if (!mvuData.stat_data) mvuData.stat_data = {};
    mutator(mvuData.stat_data);
    await Mvu.replaceMvuData(mvuData, LATEST);
  });
}
