<script setup lang="ts">
import { computed } from 'vue';
import { 话题全称, type 帖子, type 热门话题 } from '../数据';
import { 缩写 } from '../缩写';
import { 图标 } from '../图标';
import 用户头像 from './用户头像.vue';

/**
 * 话题页。两种来源合用一个组件：
 *   - 热议话题（热议榜点进来的）：显示标题与全网热度
 *   - 分类标签（帖子上的蓝色小标签点进来的）：显示标签与帖子数
 * 用 热议 这个 prop 区分。
 */
const props = defineProps<{
  标签: string;
  帖子: 帖子[];
  mine: string;
  /** 热议话题对象。传了就是热议榜点进来的 */
  热议?: 热门话题 | null;
}>();

defineEmits<{ back: []; open: [ID: string] }>();

function 摘要(正文: string) {
  const s = (正文 ?? '').replace(/\s+/g, ' ').trim();
  return s.length > 64 ? s.slice(0, 64) + '…' : s;
}

const 标题 = computed(() => 话题全称(props.热议 ? props.热议.标题 : props.标签));
</script>

<template>
  <div>
    <div class="tc-f-detail" style="padding-bottom: 0">
      <button class="tc-f-btn" @click="$emit('back')">
        <i :class="['fa-solid', 图标.返回]" />返回列表
      </button>

      <div class="tc-f-secthead" style="padding: 11px 0 0">
        <span class="tc-f-secttitle" style="font-size: 14px">
          <i :class="['fa-solid', 热议 ? 图标.热门话题 : 图标.评论]" />{{ 标题 }}
        </span>
        <span v-if="热议" class="tc-f-topic-heat" style="font-size: 12px">
          <i :class="['fa-solid', 图标.热度]" />{{ 缩写(热议.热度) }} 讨论
        </span>
        <span v-else class="tc-f-sectnum">{{ 帖子.length }} 帖</span>
      </div>

      <div v-if="热议" class="tc-f-note" style="margin: 6px 0 0">
        这是全站热议话题，下面的帖子是正在聊它的。
      </div>
    </div>

    <div v-if="帖子.length === 0" class="tc-f-empty">
      {{ 热议 ? '全网在聊，但《触角》上还没人开帖。' : '这个话题下还没有帖子。' }}
    </div>
    <div v-else class="tc-f-list" style="padding-top: 10px">
      <article v-for="p in 帖子" :key="p.ID" class="tc-f-post" @click="$emit('open', p.ID)">
        <用户头像 :昵称="p.作者" :我的="p.作者 === mine" :尺寸="30" />
        <div class="tc-f-post-main">
          <div class="tc-f-post-head">
            <span v-if="p.标记" class="tc-f-mark" :class="`tc-f-mark--${p.标记}`">{{ p.标记 }}</span>
            <span class="tc-f-post-title">{{ p.标题 }}</span>
          </div>
          <div class="tc-f-post-meta">
            <span>{{ p.作者 }}<template v-if="p.作者 === mine">（我）</template></span>
            <span v-if="p.发布时间" class="tc-f-time">{{ p.发布时间 }}</span>
            <span class="tc-f-time">{{ p.板块 }}</span>
          </div>
          <div v-if="p.正文" class="tc-f-excerpt">{{ 摘要(p.正文) }}</div>
          <div class="tc-f-post-foot">
            <span class="tc-f-stat-hot"><i :class="['fa-solid', 图标.热度]" />{{ 缩写(p.点赞) }}</span>
            <span><i :class="['fa-solid', 图标.评论]" />{{ 缩写(p.评论.length) }}</span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
