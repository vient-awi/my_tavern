<script setup lang="ts">
import { computed } from 'vue';
import { 话题名, type 帖子 } from '../数据';
import { 缩写 } from '../缩写';
import { 图标 } from '../图标';
import 用户头像 from './用户头像.vue';

const props = defineProps<{
  posts: 帖子[];
  board: string;
  mine: string;
  /** 我的主页下，标题换成「我发过的帖子」 */
  主页面?: boolean;
}>();

defineEmits<{ open: [ID: string]; 话题: [标签: string] }>();

/** 摘要：取正文前若干字，去掉换行 */
function 摘要(正文: string) {
  const s = (正文 ?? '').replace(/\s+/g, ' ').trim();
  return s.length > 64 ? s.slice(0, 64) + '…' : s;
}

const 标题 = computed(() => {
  if (props.主页面) return '我发过的帖子';
  return props.board === '热门' ? '热门板块 · 全站热度' : props.board;
});

const 区块图标 = computed(() => {
  if (props.主页面) return 图标.我的主页;
  return props.board === '热门' ? 图标.热门板块 : 图标.最新帖子;
});
</script>

<template>
  <div>
    <div class="tc-f-secthead">
      <span class="tc-f-secttitle">
        <i :class="['fa-solid', 区块图标]" />{{ 标题 }}
      </span>
      <span class="tc-f-sectnum">{{ posts.length }} 帖</span>
    </div>

    <div v-if="posts.length === 0" class="tc-f-empty">
      {{ 主页面 ? '你还没发过帖子。' : '这个板块暂时没有帖子。' }}
    </div>

    <div v-else class="tc-f-list">
      <article
        v-for="p in posts"
        :key="p.ID"
        class="tc-f-post"
        :class="{ 'tc-f-post--hot': p.标记 === '爆' || p.标记 === '热' || p.标记 === '置顶' }"
        @click="$emit('open', p.ID)">
        <用户头像 :昵称="p.作者" :我的="p.作者 === mine" :尺寸="34" />

        <div class="tc-f-post-main">
          <div class="tc-f-post-head">
            <span v-if="p.标记" class="tc-f-mark" :class="`tc-f-mark--${p.标记}`">{{ p.标记 }}</span>
            <span class="tc-f-post-title">{{ p.标题 }}</span>
          </div>

          <div class="tc-f-post-meta">
            <span>{{ p.作者 }}<template v-if="p.作者 === mine">（我）</template></span>
            <span v-if="p.发布时间" class="tc-f-time">{{ p.发布时间 }}</span>
            <span v-if="board !== '热门' && !主页面" class="tc-f-time">{{ p.板块 }}</span>
          </div>

          <div v-if="p.正文" class="tc-f-excerpt">{{ 摘要(p.正文) }}</div>

          <div class="tc-f-post-foot">
            <span class="tc-f-stat-hot">
              <i :class="['fa-solid', 图标.热度]" />{{ 缩写(p.点赞) }}
            </span>
            <span>
              <i :class="['fa-solid', 图标.评论]" />{{ 缩写(p.评论.length) }}
            </span>
            <span v-if="p.话题.length" class="tc-f-post-topics">
              <button
                v-for="t in p.话题"
                :key="t"
                class="tc-f-topic-chip"
                @click.stop="$emit('话题', t)">
                {{ 话题名(t) }}
              </button>
            </span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
