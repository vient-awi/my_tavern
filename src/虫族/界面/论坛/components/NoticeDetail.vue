<script setup lang="ts">
import type { 公告 } from '../数据';
import { 图标 } from '../图标';

defineProps<{ 公告: 公告 }>();
defineEmits<{ back: [] }>();
</script>

<template>
  <div class="tc-f-detail">
    <button class="tc-f-btn" style="margin-bottom: 9px" @click="$emit('back')">
      <i :class="['fa-solid', 图标.返回]" />返回列表
    </button>

    <div class="tc-f-detail-head">
      <div class="tc-f-detail-title">
        <i :class="['fa-solid', 图标.公告]" style="color: var(--f-gold); margin-right: 6px" />{{ 公告.标题 }}
      </div>
      <div class="tc-f-announce-from">
        <i :class="['fa-solid', 图标.置顶]" />{{ 公告.发布者 }}
      </div>
      <div class="tc-f-detail-body">{{ 公告.正文 }}</div>
    </div>
    <div class="tc-f-note">公告是理事会口径的通知，不能点赞也不能评论。</div>
  </div>
</template>
