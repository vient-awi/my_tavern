<script setup lang="ts">
import { computed } from 'vue';
import { 头像字, 头像色 } from '../头像';

const props = withDefaults(
  defineProps<{
    昵称: string;
    /** 是不是「我」。是的话固定朱砂色 */
    我的?: boolean;
    /** 是不是本帖楼主。是的话固定金色 */
    楼主?: boolean;
    /** 边长，单位 px */
    尺寸?: number;
  }>(),
  { 我的: false, 楼主: false, 尺寸: 34 },
);

const 色 = computed(() => 头像色(props.昵称, props.我的, props.楼主));
const 字 = computed(() => 头像字(props.昵称));
</script>

<template>
  <span
    class="tc-f-av"
    :style="{
      '--av-w': 尺寸 + 'px',
      '--av-fg': 色.字,
      '--av-bg': 色.底,
      fontSize: Math.round(尺寸 * 0.42) + 'px',
    }"
    :title="昵称">
    {{ 字 }}
  </span>
</template>
