/**
 * 图标表。
 *
 * 论坛里原来到处是 emoji（🔥📝🍯💢👤💬），全部换成 FontAwesome。
 * 原因：emoji 的字号与基线由系统字体决定，同一段 CSS 在不同设备上大小不一、
 * 有的还会渲染成彩色方块，跟整体排版打架。FontAwesome 是矢量图标，
 * 尺寸颜色都跟着 CSS 走。
 *
 * 酒馆助手运行时已经注入 FontAwesome，直接用 `fa-*` 类名即可，不需要额外引 CDN。
 * 用法：<i :class="['fa-solid', 图标.点赞]" />
 */

export const 图标 = {
  /* 板块 */
  热门板块: 'fa-fire',
  求助专区: 'fa-circle-question',
  蜜事交流: 'fa-jar',
  匿名树洞: 'fa-mask',
  热门板块别名: 'fa-fire',

  /* 站点 */
  站点: 'fa-bug',
  公告: 'fa-bullhorn',
  置顶: 'fa-thumbtack',
  热门话题: 'fa-arrow-trend-up',
  最新帖子: 'fa-file-lines',
  页脚: 'fa-shield-halved',

  /* 互动 */
  点赞: 'fa-heart',
  点赞空心: 'fa-heart',
  评论: 'fa-comment-dots',
  热度: 'fa-fire-flame-curved',
  楼层: 'fa-layer-group',
  楼主: 'fa-crown',
  回复: 'fa-reply',

  /* 导航 */
  搜索: 'fa-magnifying-glass',
  消息: 'fa-envelope',
  我的主页: 'fa-user',
  设置: 'fa-gear',
  刷新: 'fa-rotate-right',
  发布: 'fa-pen-to-square',
  退出: 'fa-right-from-bracket',
  返回: 'fa-arrow-left',

  /* 消息区四类 */
  私信: 'fa-envelope-open-text',
  系统提示: 'fa-circle-info',

  /* 设置项 */
  每页条数: 'fa-list-ol',
  昵称: 'fa-signature',
  重置: 'fa-rotate-left',
} as const;

/** 板块名 → 图标名 */
export function 板块图标(板块: string): string {
  switch (板块) {
    case '热门':
      return 图标.热门板块;
    case '求助专区':
      return 图标.求助专区;
    case '蜜事交流':
      return 图标.蜜事交流;
    case '匿名树洞':
      return 图标.匿名树洞;
    default:
      return 图标.最新帖子;
  }
}
