<script setup lang="ts">
import { 昵称, 论坛声望, 收到总赞数 } from '../数据';
import type { 帖子 } from '../数据';
import { 缩写 } from '../缩写';
import { 图标 } from '../图标';
import 用户头像 from './用户头像.vue';

defineProps<{
  我的帖子: 帖子[];
}>();

defineEmits<{ back: []; open: [ID: string] }>();

/** 我发过的帖子收到的评论总数（含楼中楼） */
function 收到评论数(帖子们: 帖子[]) {
  return 帖子们.reduce(
    (和, p) => 和 + p.评论.length + p.评论.reduce((子, c) => 子 + c.回复.length, 0),
    0,
  );
}

/** 声望档位，与变量更新规则里的分档一致 */
function 声望档(v: number) {
  if (v >= 80) return '论坛风云人物';
  if (v >= 50) return '小有名气';
  if (v >= 20) return '常驻网友';
  return '新人';
}
</script>

<template>
  <div class="tc-f-detail">
    <button class="tc-f-btn" style="margin-bottom: 9px" @click="$emit('back')">
      <i :class="['fa-solid', 图标.返回]" />返回列表
    </button>

    <div class="tc-f-profile">
      <用户头像 :昵称="昵称" :我的="true" :尺寸="52" />
      <div class="tc-f-profile-name">{{ 昵称 }}</div>
      <div class="tc-f-profile-sub">
        <i :class="['fa-solid', 图标.我的主页]" />论坛声望 {{ 论坛声望 }} · {{ 声望档(论坛声望) }}
      </div>
      <div class="tc-f-stats">
        <div class="tc-f-stat">
          <div class="tc-f-stat-num">{{ 我的帖子.length }}</div>
          <div class="tc-f-stat-label">发帖</div>
        </div>
        <div class="tc-f-stat">
          <div class="tc-f-stat-num">{{ 缩写(收到总赞数) }}</div>
          <div class="tc-f-stat-label">收到赞</div>
        </div>
        <div class="tc-f-stat">
          <div class="tc-f-stat-num">{{ 缩写(收到评论数(我的帖子)) }}</div>
          <div class="tc-f-stat-label">收到评论</div>
        </div>
      </div>
    </div>

    <div class="tc-f-secthead" style="padding: 12px 0 0">
      <span class="tc-f-secttitle">
        <i :class="['fa-solid', 图标.最新帖子]" />我发过的帖子
      </span>
      <span class="tc-f-sectnum">{{ 我的帖子.length }} 帖</span>
    </div>

    <div v-if="我的帖子.length === 0" class="tc-f-empty">你还没发过帖子。</div>
    <div v-else class="tc-f-list" style="padding-left: 0; padding-right: 0">
      <article v-for="p in 我的帖子" :key="p.ID" class="tc-f-post" @click="$emit('open', p.ID)">
        <用户头像 :昵称="p.作者" :我的="true" :尺寸="30" />
        <div class="tc-f-post-main">
          <div class="tc-f-post-head">
            <span v-if="p.标记" class="tc-f-mark" :class="`tc-f-mark--${p.标记}`">{{ p.标记 }}</span>
            <span class="tc-f-post-title">{{ p.标题 }}</span>
          </div>
          <div class="tc-f-post-meta">
            <span class="tc-f-time">{{ p.板块 }}</span>
            <span v-if="p.发布时间" class="tc-f-time">{{ p.发布时间 }}</span>
          </div>
          <div class="tc-f-post-foot">
            <span class="tc-f-stat-hot"><i :class="['fa-solid', 图标.热度]" />{{ 缩写(p.点赞) }}</span>
            <span><i :class="['fa-solid', 图标.评论]" />{{ 缩写(p.评论.length) }}</span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
