<script setup lang="ts">
import { computed } from 'vue';
import { 缩写 } from '../缩写';
import { 图标 } from '../图标';
import type { 热门话题 } from '../数据';

/**
 * 全站热议榜。
 *
 * 注意跟帖子上那些蓝色小标签（分类标签）是两回事：
 * 这里是「全网此刻在聊什么」，一条一句有情绪的话 + 讨论量；
 * 那边是「这帖归哪一类」。数据源也不同，这个读 论坛.热门话题。
 */
const props = defineProps<{
  话题: 热门话题[];
  /** 最多显示几条，超出的不显示 */
  上限?: number;
}>();

defineEmits<{ open: [话题: 热门话题] }>();

const 显示 = computed(() => props.话题.slice(0, props.上限 ?? 8));
</script>

<template>
  <div v-if="显示.length" class="tc-f-topics">
    <div class="tc-f-secthead" style="padding: 0 0 6px">
      <span class="tc-f-secttitle">
        <i :class="['fa-solid', 图标.热门话题]" />热门话题
      </span>
    </div>

    <button
      v-for="(t, i) in 显示"
      :key="t.ID"
      class="tc-f-topic-row"
      @click="$emit('open', t)">
      <span class="tc-f-topic-rank" :class="{ 'tc-f-topic-rank--top': i < 3 }">{{ i + 1 }}</span>
      <span class="tc-f-topic-text">#{{ t.标题 }}#</span>
      <span class="tc-f-topic-heat">
        <i :class="['fa-solid', 图标.热度]" />{{ 缩写(t.热度) }}
      </span>
    </button>
  </div>
</template>
