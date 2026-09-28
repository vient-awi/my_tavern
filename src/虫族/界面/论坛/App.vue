<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { BOARDS } from './boards';
import { 载入界面状态, 改界面状态, 界面状态, 重置界面状态, 冲刷界面状态 } from './界面状态';
import {
  载入论坛数据,
  全部帖子,
  公告列表,
  公告表,
  昵称,
  论坛声望,
  标签表,
  标签下帖子,
  热门话题列表,
  热议话题下帖子,
  话题全称,
  搜索帖子,
  未读通知数,
  私信表,
  通知,
  我的帖子,
  板块帖子,
  发帖,
  点赞帖子,
  点赞评论,
  评论帖子,
  回复评论,
  回复私信,
  标记通知已读,
  改论坛昵称,
} from './数据';
import type { 帖子, 热门话题 } from './数据';
import { 图标, 板块图标 } from './图标';
import 用户头像 from './components/用户头像.vue';
import PostList from './components/PostList.vue';
import PostDetail from './components/PostDetail.vue';
import PostCompose from './components/PostCompose.vue';
import Mailbox from './components/Mailbox.vue';
import NoticeBoard from './components/NoticeBoard.vue';
import NoticeDetail from './components/NoticeDetail.vue';
import TopicBoard from './components/TopicBoard.vue';
import TopicView from './components/TopicView.vue';
import SearchPanel from './components/SearchPanel.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import ProfilePage from './components/ProfilePage.vue';

/* ---------- 界面状态 ---------- */

/** 退出 = 面板收起。这是唯一没进 $界面状态 的一项：它是"这次要不要看"，不是"上次看到哪" */
const 已退出 = ref(false);

const 状态 = 界面状态;
const 视图 = computed(() => 状态.value.视图);
const 当前板块 = computed(() => 状态.value.板块);
const 当前帖子ID = computed(() => 状态.value.帖子ID);
const 当前公告ID = computed(() => 状态.value.公告ID);
const 当前话题 = computed(() => 状态.value.话题);
const 当前热议ID = computed(() => 状态.value.热议ID);
const 搜索词 = computed(() => 状态.value.搜索词);
const 每页条数 = computed(() => 状态.value.每页条数);

function 去(视图名: typeof 状态.value.视图, 附加: Partial<typeof 状态.value> = {}) {
  改界面状态({ 视图: 视图名, ...附加 });
}

function 回列表() {
  去('list', { 帖子ID: '', 公告ID: '' });
}
function 切板块(k: string) {
  if (k === '我的主页') {
    去('home');
    return;
  }
  去('list', { 板块: k, 帖子ID: '' });
}

/** 从「发布新帖」进发帖页。发帖板块默认接着当前浏览的板块走 */
function 去发帖() {
  const 默认板块 = (BOARDS as readonly string[]).includes(当前板块.value) && 当前板块.value !== '热门'
    ? 当前板块.value
    : '匿名树洞';
  去('compose', { 板块: 默认板块 });
}

function 打开帖子(ID: string) {
  去('detail', { 帖子ID: ID });
}

function 打开公告(ID: string) {
  去('notice', { 公告ID: ID });
}

function 打开话题(标签: string) {
  去('topic', { 话题: 标签, 热议ID: '' });
}

/** 热议榜点进来：走同一个话题页，但带上热议对象 */
function 打开热议(话题: 热门话题) {
  去('topic', { 话题: '', 热议ID: 话题.ID });
}

/* ---------- 派生 ---------- */

const 昵称值 = computed(() => 昵称.value);
const 声望值 = computed(() => 论坛声望.value);

const 列表内容 = computed<帖子[]>(() => 板块帖子(当前板块.value, 每页条数.value));

const 当前帖子 = computed(() => 全部帖子.value.find(p => p.ID === 当前帖子ID.value));
const 当前公告 = computed(() => 公告列表.value.find(a => a.ID === 当前公告ID.value));

/** 热议话题对象。「AI 刚把这条话题删了」时要能落到 null，所以用 find 不用下标 */
const 当前热议 = computed<热门话题 | null>(
  () => 热门话题列表.value.find(t => t.ID === 当前热议ID.value) ?? null,
);
const 话题内容 = computed(() =>
  当前热议.value ? 热议话题下帖子(当前热议.value) : 标签下帖子(当前话题.value),
);

const 搜索结果 = computed(() => 搜索帖子(搜索词.value));

const 私信数 = computed(() => Object.keys(私信表.value).length);
const 未读数 = computed(() => 未读通知数.value);
/** 消息角标：私信条数 + 未读通知数 */
const 消息角标 = computed(() => 私信数.value + 未读数.value);

/** 刷新按钮转一圈，不然点了没反馈，不知道刷没刷 */
const 正在刷新 = ref(false);
async function 刷新() {
  正在刷新.value = true;
  try {
    await 载入论坛数据();
    检查视图有效性();
  } finally {
    // 太快闪完反而像没反应，最少转 400ms
    setTimeout(() => (正在刷新.value = false), 400);
  }
}

/** 视图指向的东西已经不在了（AI 清了旧帖、换了公告、撤了话题），就退回列表 */
function 检查视图有效性() {
  if (视图.value === 'detail' && 当前帖子ID.value && !当前帖子.value) 回列表();
  if (视图.value === 'notice' && 当前公告ID.value && !当前公告.value) 回列表();
  if (视图.value === 'topic' && 当前热议ID.value && !当前热议.value) 回列表();
}

/* ---------- 挂载 ---------- */

onMounted(async () => {
  await 载入界面状态();
  await 载入论坛数据();
  检查视图有效性();
});

// 界面被替换掉之前，把防抖窗口里还没落盘的界面状态冲出去
window.addEventListener('beforeunload', 冲刷界面状态);

/* ---------- 操作 ---------- */

async function 提交帖子(标题: string, 正文: string, 板块: string) {
  await 发帖(标题, 正文, 板块 as (typeof BOARDS)[number]);
  改界面状态({ 草稿标题: '', 草稿正文: '' });
  回列表();
}

async function 提交评论(ID: string, 内容: string) {
  await 评论帖子(ID, 内容);
}

async function 提交回复评论(ID: string, 下标: number, 内容: string) {
  await 回复评论(ID, 下标, 内容);
}

async function 提交回信(对方: string, 内容: string) {
  await 回复私信(对方, 内容);
}

/** 改昵称是玩家自己的操作：写进变量，之后的新帖新评论都用新名字 */
async function 改昵称(v: string) {
  await 改论坛昵称(v);
}
</script>

<template>
  <div class="tc-forum">
    <!-- 顶部：站名 + 欢迎语。抄的是设定里那份主页示例的调子 -->
    <div class="tc-f-top">
      <div class="tc-f-title">
        <span class="tc-f-logo">
          <i :class="['fa-solid', 图标.站点]" />《触角》
        </span>
        <span class="tc-f-sub">雌虫专属交流空间</span>
      </div>
      <div class="tc-f-welcome">
        欢迎回来，<b>{{ 昵称值 }}</b>！愿您今日也能寻得甘霖。
      </div>
      <div class="tc-f-topright">
        <用户头像 :昵称="昵称值" :我的="true" :尺寸="30" />
      </div>
    </div>

    <template v-if="已退出">
      <div class="tc-f-empty">
        终端收起来了。
        <button class="tc-f-btn" style="margin-left: 8px" @click="已退出 = false">
          <i :class="['fa-solid', 图标.刷新]" />重新打开
        </button>
      </div>
    </template>

    <template v-else>
      <!-- 导航：左边板块，右边站点功能 -->
      <div class="tc-f-nav">
        <button
          v-for="b in BOARDS"
          :key="b"
          class="tc-f-navbtn"
          :class="{ 'tc-f-navbtn--on': 当前板块 === b && 视图 === 'list' }"
          @click="切板块(b)">
          <i :class="['fa-solid', 板块图标(b)]" />{{ b }}
        </button>
        <button
          class="tc-f-navbtn"
          :class="{ 'tc-f-navbtn--on': 视图 === 'home' }"
          @click="切板块('我的主页')">
          <i :class="['fa-solid', 图标.我的主页]" />我的主页
        </button>

        <span class="tc-f-navgap" />

        <button
          class="tc-f-navbtn"
          :class="{ 'tc-f-navbtn--on': 视图 === 'mail' }"
          title="消息"
          @click="去('mail')">
          <i :class="['fa-solid', 图标.消息]" />消息
          <span v-if="消息角标" class="tc-f-badge">{{ 消息角标 }}</span>
        </button>
        <button
          class="tc-f-navbtn"
          :class="{ 'tc-f-navbtn--on': 视图 === 'compose' }"
          title="发布新帖"
          @click="去发帖">
          <i :class="['fa-solid', 图标.发布]" />发帖
        </button>
        <button
          class="tc-f-navbtn"
          :class="{ 'tc-f-navbtn--on': 视图 === 'search' }"
          title="搜索帖子"
          @click="去('search')">
          <i :class="['fa-solid', 图标.搜索]" />搜索
        </button>
        <button
          class="tc-f-navbtn"
          :class="{ 'tc-f-navbtn--on': 视图 === 'settings' }"
          title="设置"
          @click="去('settings')">
          <i :class="['fa-solid', 图标.设置]" />设置
        </button>
        <button class="tc-f-navbtn" :class="{ 'tc-f-navbtn--spin': 正在刷新 }" title="刷新页面" @click="刷新">
          <i :class="['fa-solid', 图标.刷新]" />刷新
        </button>
        <button class="tc-f-navbtn tc-f-navbtn--quit" title="退出" @click="已退出 = true">
          <i :class="['fa-solid', 图标.退出]" />退出
        </button>
      </div>

      <!-- 列表页：公告 + 热门话题 + 帖子 -->
      <template v-if="视图 === 'list'">
        <NoticeBoard :公告="公告列表" @open="打开公告" />

        <TopicBoard :话题="热门话题列表" @open="打开热议" />

        <!-- 分类标签。跟上面的热议榜是两回事：这个点进去看同类帖子 -->
        <div v-if="标签表.length" class="tc-f-topicbar">
          <span class="tc-f-topiclabel">
            <i :class="['fa-solid', 图标.评论]" />帖子标签
          </span>
          <button
            v-for="t in 标签表.slice(0, 8)"
            :key="t.标签"
            class="tc-f-topic-chip"
            @click="打开话题(t.标签)">
            {{ 话题全称(t.标签) }} <span class="tc-f-chipnum">{{ t.帖子们.length }}</span>
          </button>
        </div>

        <PostList
          :posts="列表内容"
          :board="当前板块"
          :mine="昵称值"
          @open="打开帖子"
          @话题="打开话题" />
      </template>

      <!-- 帖子详情 -->
      <PostDetail
        v-else-if="视图 === 'detail' && 当前帖子"
        :post="当前帖子"
        :mine="昵称值"
        @back="回列表"
        @like="点赞帖子"
        @comment="提交评论"
        @likeComment="点赞评论"
        @replyComment="提交回复评论"
        @话题="打开话题" />

      <!-- 公告全文 -->
      <NoticeDetail v-else-if="视图 === 'notice' && 当前公告" :公告="当前公告" @back="回列表" />

      <!-- 话题：热议榜点进来的，或帖子标签点进来的，共用一页 -->
      <TopicView
        v-else-if="视图 === 'topic'"
        :标签="当前话题"
        :热议="当前热议"
        :帖子="话题内容"
        :mine="昵称值"
        @back="回列表"
        @open="打开帖子" />

      <!-- 搜索 -->
      <SearchPanel
        v-else-if="视图 === 'search'"
        :关键词="搜索词"
        :结果="搜索结果"
        :mine="昵称值"
        :话题="标签表"
        @update:关键词="v => 改界面状态({ 搜索词: v })"
        @back="回列表"
        @open="打开帖子"
        @话题="打开话题" />

      <!-- 我的主页 -->
      <ProfilePage
        v-else-if="视图 === 'home'"
        :我的帖子="我的帖子"
        @back="回列表"
        @open="打开帖子" />

      <!-- 设置 -->
      <SettingsPanel
        v-else-if="视图 === 'settings'"
        :昵称="昵称值"
        :每页条数="每页条数"
        @update:昵称="改昵称"
        @update:每页条数="v => 改界面状态({ 每页条数: v })"
        @update:草稿标题="v => 改界面状态({ 草稿标题: v })"
        @update:草稿正文="v => 改界面状态({ 草稿正文: v })"
        @back="回列表"
        @重置="重置界面状态" />

      <!-- 发帖 -->
      <PostCompose
        v-else-if="视图 === 'compose'"
        :标题="状态.草稿标题"
        :正文="状态.草稿正文"
        :板块="当前板块"
        :昵称="昵称值"
        @update:标题="v => 改界面状态({ 草稿标题: v })"
        @update:正文="v => 改界面状态({ 草稿正文: v })"
        @update:板块="v => 改界面状态({ 板块: v })"
        @back="回列表"
        @submit="提交帖子" />
      <!-- 消息区 -->
      <Mailbox
        v-else-if="视图 === 'mail'"
        :私信="私信表"
        :点赞通知="通知.点赞"
        :回复通知="通知.回复"
        :系统通知="通知.系统"
        @back="回列表"
        @回信="提交回信"
        @已读="标记通知已读" />

      <!-- 兜底：状态指向的页面不在了 -->
      <div v-else class="tc-f-empty">
        这一页翻不到了。
        <button class="tc-f-btn" style="margin-left: 8px" @click="回列表">
          <i :class="['fa-solid', 图标.返回]" />回首页
        </button>
      </div>

      <!-- 页脚 -->
      <div class="tc-f-foot">
        <span>
          <i :class="['fa-solid', 图标.页脚]" />© 星历 4412 年 《触角》理事会
        </span>
        <span class="tc-f-foot-sep">·</span>
        <span>匿名 IP 保护中</span>
      </div>
    </template>
  </div>
</template>
