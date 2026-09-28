<script setup lang="ts">
import { computed } from 'vue';
import { 话题名, type 帖子 } from '../数据';
import { 缩写 } from '../缩写';
import { 图标 } from '../图标';
import 用户头像 from './用户头像.vue';

const props = defineProps<{
  关键词: string;
  结果: 帖子[];
  mine: string;
  /** 界面上已有哪些话题标签，用作点击提示 */
  话题: { 标签: string; 帖子们: 帖子[] }[];
}>();

const emit = defineEmits<{
  back: [];
  open: [ID: string];
  'update:关键词': [v: string];
  话题: [标签: string];
}>();

const 词 = computed({
  get: () => props.关键词,
  set: v => emit('update:关键词', v),
});

function 摘要(正文: string) {
  const s = (正文 ?? '').replace(/\s+/g, ' ').trim();
  return s.length > 62 ? s.slice(0, 62) + '…' : s;
}
</script>

<template>
  <div>
    <div class="tc-f-detail" style="padding-bottom: 0">
      <button class="tc-f-btn" @click="$emit('back')">
        <i :class="['fa-solid', 图标.返回]" />返回列表
      </button>

      <div class="tc-f-field" style="margin-top: 10px">
        <label class="tc-f-label">
          <i :class="['fa-solid', 图标.搜索]" />搜索帖子
        </label>
        <input v-model="词" class="tc-f-input" placeholder="按标题、正文或发帖人昵称找" />
      </div>

      <div v-if="!词.trim()" class="tc-f-note">输入关键词即可搜索。下面是站上已有的分类标签。</div>
      <div v-if="!词.trim() && 话题.length" class="tc-f-topicbar" style="padding: 0 0 10px">
        <button v-for="t in 话题" :key="t.标签" class="tc-f-topic-chip" @click="$emit('话题', t.标签)">
          {{ 话题名(t.标签) }} <span class="tc-f-chipnum">{{ t.帖子们.length }}</span>
        </button>
      </div>
    </div>

    <template v-if="词.trim()">
      <div class="tc-f-secthead">
        <span class="tc-f-secttitle">
          <i :class="['fa-solid', 图标.搜索]" />搜索结果
        </span>
        <span class="tc-f-sectnum">{{ 结果.length }} 帖</span>
      </div>
      <div v-if="结果.length === 0" class="tc-f-empty">没找到跟「{{ 词.trim() }}」有关的帖子。</div>
      <div v-else class="tc-f-list">
        <article v-for="p in 结果" :key="p.ID" class="tc-f-post" @click="$emit('open', p.ID)">
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
    </template>
  </div>
</template>
