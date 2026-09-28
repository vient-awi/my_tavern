<script setup lang="ts">
import { computed } from 'vue';
import { BOARDS } from '../boards';
import { 图标, 板块图标 } from '../图标';
import 用户头像 from './用户头像.vue';

const props = defineProps<{
  标题: string;
  正文: string;
  板块: string;
  /** 发帖人昵称，用来预览头像与署名 */
  昵称: string;
}>();

const emit = defineEmits<{
  back: [];
  submit: [标题: string, 正文: string, 板块: string];
  'update:标题': [v: string];
  'update:正文': [v: string];
  'update:板块': [v: string];
}>();

/** 草稿的正文存在界面状态里（切走再回来不丢），所以这里用 props + 事件而不是本地 ref */
const 标题 = computed({
  get: () => props.标题,
  set: v => emit('update:标题', v),
});
const 正文 = computed({
  get: () => props.正文,
  set: v => emit('update:正文', v),
});
const 板块 = computed({
  get: () => props.板块,
  set: v => emit('update:板块', v),
});

function 提交() {
  if (!标题.value.trim()) return;
  emit('submit', 标题.value, 正文.value, 板块.value);
}
</script>

<template>
  <div class="tc-f-detail">
    <button class="tc-f-btn" style="margin-bottom: 9px" @click="$emit('back')">
      <i :class="['fa-solid', 图标.返回]" />返回列表
    </button>

    <div class="tc-f-secthead" style="padding: 0 0 6px">
      <span class="tc-f-secttitle">
        <i :class="['fa-solid', 图标.发布]" />发布新帖
      </span>
    </div>

    <div class="tc-f-field">
      <label class="tc-f-label">标题</label>
      <input v-model="标题" class="tc-f-input" placeholder="给帖子起个标题" />
    </div>

    <div class="tc-f-field">
      <label class="tc-f-label">板块</label>
      <select v-model="板块" class="tc-f-select">
        <option v-for="b in BOARDS" :key="b" :value="b">{{ b }}</option>
      </select>
    </div>

    <div class="tc-f-field">
      <label class="tc-f-label">正文</label>
      <textarea v-model="正文" class="tc-f-textarea" placeholder="匿名发言，随便说。" />
    </div>

    <!-- 发布前的样子：真论坛发帖框下面都挂一行「以谁的身份发」 -->
    <div class="tc-f-signrow">
      <用户头像 :昵称="昵称" :我的="true" :尺寸="28" />
      <span>将以「{{ 昵称 }}」的身份，发到</span>
      <span class="tc-f-boardtag">
        <i :class="['fa-solid', 板块图标(板块)]" />{{ 板块 }}
      </span>
    </div>

    <button class="tc-f-btn tc-f-btn--primary" :disabled="!标题.trim()" @click="提交">发布</button>
    <div class="tc-f-note">
      发布后帖子会进「我的主页」，并出现在你选的板块里。网友的回复由 AI 在后续剧情里补充。
    </div>
  </div>
</template>
