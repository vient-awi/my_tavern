<script setup lang="ts">
import { computed } from 'vue';
import { 图标 } from '../图标';
import 用户头像 from './用户头像.vue';

const props = defineProps<{
  昵称: string;
  每页条数: number;
}>();

const emit = defineEmits<{
  back: [];
  'update:昵称': [v: string];
  'update:每页条数': [v: number];
  'update:草稿标题': [v: string];
  'update:草稿正文': [v: string];
  重置: [];
}>();

const 名 = computed({
  get: () => props.昵称,
  set: v => emit('update:昵称', v),
});

const 页 = computed({
  get: () => props.每页条数,
  set: v => emit('update:每页条数', Number(v) || 12),
});

function 转存昵称() {
  emit('update:昵称', 名.value.trim() || '落雨天');
}

function 丢弃草稿() {
  emit('update:草稿标题', '');
  emit('update:草稿正文', '');
}
</script>

<template>
  <div class="tc-f-detail">
    <button class="tc-f-btn" style="margin-bottom: 9px" @click="$emit('back')">
      <i :class="['fa-solid', 图标.返回]" />返回列表
    </button>

    <div class="tc-f-secthead" style="padding: 0 0 7px">
      <span class="tc-f-secttitle">
        <i :class="['fa-solid', 图标.设置]" />设置
      </span>
    </div>

    <div class="tc-f-field">
      <label class="tc-f-label">
        <i :class="['fa-solid', 图标.昵称]" />论坛昵称
      </label>
      <!-- 预览一下改完之后头像长什么样：头像颜色是按昵称算的，换了名就换色 -->
      <div class="tc-f-nickrow">
        <用户头像 :昵称="名.trim() || '落雨天'" :我的="true" :尺寸="34" />
        <input v-model="名" class="tc-f-input" style="flex: 1" />
      </div>
      <button class="tc-f-btn" style="margin-top: 5px" :disabled="!名.trim()" @click="转存昵称">
        改昵称
      </button>
      <div class="tc-f-note">改的是你在《触角》上的显示名。改完，之后的新帖与新评论都用新名字。</div>
    </div>

    <div class="tc-f-field">
      <label class="tc-f-label">
        <i :class="['fa-solid', 图标.每页条数]" />每页显示条数
      </label>
      <select v-model.number="页" class="tc-f-select">
        <option :value="8">8 条</option>
        <option :value="12">12 条</option>
        <option :value="20">20 条</option>
        <option :value="30">30 条</option>
      </select>
    </div>

    <div style="margin-top: 4px">
      <button class="tc-f-btn" @click="丢弃草稿">
        <i :class="['fa-solid', 图标.发布]" />丢弃未发布的草稿
      </button>
      <button class="tc-f-btn" style="margin-left: 6px" @click="$emit('重置')">
        <i :class="['fa-solid', 图标.重置]" />回到首页
      </button>
    </div>
    <div class="tc-f-note">
      这里只有显示偏好与草稿，都存在论坛界面自己的记忆里，跟剧情变量互不影响。
    </div>
  </div>
</template>
