import { defineMvuDataStore } from '@util/mvu';
import { Schema } from '../schema';

/**
 * 只读快照：本楼层自带的 MVU 数据。
 *
 * 状态栏用它正合适——状态栏要显示的就是"这条回复发出时"的角色状态。
 *
 * 论坛**不要**用它：论坛界面挂在 AI 刚生成的那条消息上，而网友的新帖、公告、
 * 通知是同一条回复里的 MVU 命令写进去的。读本楼层快照读到的是这条回复生成
 * **之前**的状态，当轮刚发生的事要等下一轮才看得见。论坛走 `论坛/mvu.ts`
 * 的最新楼层读写。
 */
export const useDataStore = defineMvuDataStore(Schema, {
  type: 'message',
  message_id: getCurrentMessageId(),
});
