export const Schema = z.object({
  世界: z.object({
    当前时间: z.string().prefault('星历1207-03-01 08:00'),
    当前区域: z.string().prefault('首都星'),
    当前场景: z.string().prefault('前往星港的路上'),
    近期事务: z.string().prefault('前往星港，搭乘客船去洛希边境报到'),
  }).prefault({}),

  主角: z.object({
    姓名: z.string().prefault('待初始化'),
    精神力: z.object({
      数值: z.coerce.number().prefault(46),
      等级: z.enum(['C', 'B', 'A', 'S', 'SS', 'SSS']).prefault('B'),
    }).transform(精神 => ({
      ...精神,
      数值: _.clamp(精神.数值, 0, { C: 29, B: 49, A: 69, S: 84, SS: 94, SSS: 100 }[精神.等级]),
    })).prefault({}),
    饱食度: z.coerce.number()
      .transform(v => _.clamp(v, 0, 12))
      .describe('食量刻度，12为满，0为濒临饿毙。9~12饱足状态最好；6~8正常无影响；3~5开始饿，判断力略受影响；1~2饿急了，体力与判断力明显下降，此时能吸空三个军雄；0濒危，营养不良无法作战')
      .prefault(9),
    军衔: z.string().prefault('上尉'),
    军功: z.coerce.number().prefault(320),
    所属: z.string().prefault('军校指挥官院'),
    声望: z.coerce.number().transform(v => _.clamp(v, 0, 1000)).prefault(260),
    尾勾: z.enum(['未生长', '已生长']).prefault('已生长'),
  }).prefault({}),

  论坛: z.object({
    昵称: z.string().prefault('落雨天'),
    声望: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(41),

    // 帖子以 ID 为键：AI 改写整帖时路径仍是它自己写下的那个 ID，所以前后端必然读到同一帖。
    // 用标题做键会出问题——改标题就等于换了一帖。
    帖子: z.record(
      z.string().describe('帖子ID，从1起递增'),
      z.object({
        标题: z.string().prefault(''),
        作者: z.string().prefault('落雨天'),
        板块: z.enum(['热门', '求助专区', '蜜事交流', '匿名树洞']).prefault('匿名树洞'),
        正文: z.string().prefault(''),
        点赞: z.coerce.number().prefault(0),
        我的点赞: z.boolean().prefault(false),
        标记: z.enum(['', '置顶', '爆', '热', '新']).prefault('')
          .describe('列表页的角标。爆=全站炸了，热=讨论多，新=刚发的，置顶=理事会挂的。不确定就留空'),
        发布时间: z.string().prefault('')
          .describe('直接写能读的相对说法，如「3小时前」「昨天」「前天」。这里是虚构星历，没有真实时间可换算，你怎么写前端就怎么显示'),
        话题: z.array(z.string()).prefault([]).describe('帖子的分类标签，如 #洛希前线#。跟「热门话题」是两回事，那个是全站热议榜'),
        // 评论用数组而不是 {昵称: 内容}：同一个人可以评论多条，也能挂楼中楼
        评论: z.array(
          z.object({
            昵称: z.string().prefault(''),
            内容: z.string().prefault(''),
            点赞: z.coerce.number().prefault(0),
            我的点赞: z.boolean().prefault(false),
            时间: z.string().prefault('').describe('相对说法，如「1小时前」'),
            回复: z.array(
              z.object({
                昵称: z.string().prefault(''),
                内容: z.string().prefault(''),
                点赞: z.coerce.number().prefault(0),
                我的点赞: z.boolean().prefault(false),
                时间: z.string().prefault('').describe('相对说法，如「20分钟前」'),
              }).prefault({})
            ).prefault([]),
          }).prefault({})
        ).prefault([]),
      }).prefault({})
    ).prefault({}),

    // 全站热议榜。与帖子的「话题」字段是两回事：那个是帖子的分类标签（一帖归哪类），
    // 这个是全网正在聊什么（一条一句有情绪的话 + 讨论热度）。热度跟帖子数无关，AI 自己编。
    热门话题: z.record(
      z.string().describe('话题ID，从1起递增'),
      z.object({
        标题: z.string().prefault('').describe('一句有情绪的话，不带 # 号。如「军雄临产期实战是否违规」'),
        热度: z.coerce.number().prefault(0).describe('讨论量。显示时前端会缩写成 1.2k 这样'),
        相关帖子: z.array(z.string()).prefault([]).describe('正在聊这个话题的帖子ID'),
      }).prefault({})
    ).prefault({}),

    // 置顶公告走理事会官方口吻，和下面乱七八糟的帖子形成反差
    公告: z.record(
      z.string().describe('公告ID，从1起递增'),
      z.object({
        标题: z.string().prefault(''),
        正文: z.string().prefault(''),
        发布者: z.string().prefault('《触角》理事会'),
        置顶: z.boolean().prefault(true),
      }).prefault({})
    ).prefault({}),

    // 消息区四类通知。私信是玩家主动收发的，另外三类由 AI 按剧情补
    通知: z.object({
      点赞: z.array(
        z.object({
          来源: z.string().prefault(''),
          摘要: z.string().prefault(''),
          已读: z.boolean().prefault(false),
        }).prefault({})
      ).prefault([]),
      回复: z.array(
        z.object({
          来源: z.string().prefault(''),
          摘要: z.string().prefault(''),
          已读: z.boolean().prefault(false),
        }).prefault({})
      ).prefault([]),
      系统: z.array(
        z.object({
          标题: z.string().prefault(''),
          内容: z.string().prefault(''),
          已读: z.boolean().prefault(false),
        }).prefault({})
      ).prefault([]),
    }).prefault({}),

    私信: z.record(
      z.string().describe('发信人昵称'),
      z.string().prefault('')
    ).prefault({}),

    // $ 前缀 = AI 看不见也改不了。界面自己的记忆，与剧情无关。
    // 之前界面状态存在组件的 ref 里，而论坛每次回复都重新挂载，所以永远回到首页；存这里才留得住。
    $界面状态: z.object({
      视图: z.enum(['list', 'detail', 'compose', 'mail', 'notice', 'topic', 'search', 'settings', 'home']).prefault('list'),
      板块: z.string().prefault('热门'),
      帖子ID: z.string().prefault(''),
      公告ID: z.string().prefault(''),
      话题: z.string().prefault(''),
      搜索词: z.string().prefault(''),
      私信对象: z.string().prefault(''),
      草稿标题: z.string().prefault(''),
      草稿正文: z.string().prefault(''),
      草稿板块: z.enum(['热门', '求助专区', '蜜事交流', '匿名树洞']).prefault('匿名树洞'),
      每页条数: z.coerce.number().transform(v => _.clamp(v, 5, 50)).prefault(12),
    }).prefault({}),

    // 帖子/公告/话题的下一个可用 ID。$ 前缀，只有脚本和前端维护
    $帖子计数: z.coerce.number().prefault(0),
    $公告计数: z.coerce.number().prefault(0),
    $话题计数: z.coerce.number().prefault(0),
  }).prefault({}),

  关系: z.object({
    蜜源名册: z.record(
      z.string().describe('雄虫姓名'),
      z.object({
        身份: z.string().prefault('待确认'),
        关系: z.enum(['陌路', '萍水相逢', '固定蜜源', '雄侍']).prefault('陌路'),
        蜜质: z.string().prefault('待确认'),
        亲密度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
        供给能力: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
        身体状态: z.string().prefault('健康'),
      }).prefault({})
    ).prefault({}),
    雄虫关系: z.record(
      z.string().describe('雄虫姓名'),
      z.object({
        好感度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
        信任度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
        备注: z.string().prefault(''),
      }).prefault({})
    ).prefault({}),
  }).prefault({}),
});

export type Schema = z.output<typeof Schema>;
