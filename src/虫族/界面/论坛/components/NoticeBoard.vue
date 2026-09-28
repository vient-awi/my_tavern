<script setup lang="ts">
import { 图标 } from '../图标';

/** 公告条：列表页顶部。点标题进全文 */
defineProps<{
  公告: { ID: string; 标题: string; 正文: string; 发布者: string; 置顶: boolean }[];
}>();

defineEmits<{ open: [ID: string] }>();
</script>

<template>
  <div class="tc-f-notice">
    <div class="tc-f-notice-title">
      <i :class="['fa-solid', 图标.置顶]" />置顶公告
    </div>
    <div v-if="公告.length === 0" class="tc-f-notice-row" style="cursor: default; color: var(--f-ink-faint)">
      理事会暂时没贴新东西。
    </div>
    <button
      v-for="a in 公告"
      :key="a.ID"
      class="tc-f-notice-row"
      @click="$emit('open', a.ID)">
      {{ a.标题 }}
    </button>
  </div>
</template>
