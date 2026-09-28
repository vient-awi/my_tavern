<script setup lang="ts">
import { computed, ref } from 'vue';
import { 话题名, type 帖子 } from '../数据';
import { 缩写 } from '../缩写';
import { 图标 } from '../图标';
import 用户头像 from './用户头像.vue';

const props = defineProps<{
  post: 帖子;
  mine: string;
}>();

const emit = defineEmits<{
  back: [];
  like: [ID: string];
  comment: [ID: string, 内容: string];
  likeComment: [ID: string, 评论下标: number, 回复下标?: number];
  replyComment: [ID: string, 评论下标: number, 内容: string];
  话题: [标签: string];
}>();

const 草稿 = ref('');
/** 正在回复哪条评论。null = 不在回复模式，在发新评论 */
const 回复目标 = ref<number | null>(null);
const 回复草稿 = ref('');

const 是楼主 = computed(() => props.post.作者 === props.mine);

function 提交评论() {
  if (!草稿.value.trim()) return;
  emit('comment', props.post.ID, 草稿.value);
  草稿.value = '';
}

function 开始回复(下标: number) {
  回复目标.value = 回复目标.value === 下标 ? null : 下标;
  回复草稿.value = '';
}

function 提交回复(下标: number) {
  if (!回复草稿.value.trim()) return;
  emit('replyComment', props.post.ID, 下标, 回复草稿.value);
  回复草稿.value = '';
  回复目标.value = null;
}
</script>

<template>
  <div class="tc-f-detail">
    <button class="tc-f-btn" style="margin-bottom: 10px" @click="$emit('back')">
      <i :class="['fa-solid', 图标.返回]" />返回列表
    </button>

    <!-- 主楼 -->
    <div class="tc-f-detail-head">
      <div class="tc-f-detail-title">
        <span v-if="post.标记" class="tc-f-mark" :class="`tc-f-mark--${post.标记}`" style="margin-right: 6px">{{ post.标记 }}</span>
        {{ post.标题 }}
      </div>

      <div class="tc-f-detail-who">
        <用户头像 :昵称="post.作者" :我的="是楼主" :尺寸="36" />
        <div>
          <div>
            <span class="tc-f-name">1楼 · {{ post.作者 }}</span>
            <span v-if="是楼主" class="tc-f-me" style="margin-left: 5px">我</span>
          </div>
          <div class="tc-f-detail-meta" style="margin: 0">
            <span class="tc-f-when">{{ post.发布时间 || '刚刚' }} · 板块 {{ post.板块 }}</span>
          </div>
        </div>
      </div>

      <div class="tc-f-detail-body">{{ post.正文 }}</div>

      <div class="tc-f-actions">
        <button
          class="tc-f-btn"
          :class="{ 'tc-f-btn--liked': post.我的点赞 }"
          @click="$emit('like', post.ID)">
          <i :class="['fa-solid', 图标.点赞]" />{{ post.我的点赞 ? '已赞' : '点赞' }} {{ 缩写(post.点赞) }}
        </button>
        <span style="font-family: var(--f-mono); font-size: 11px; color: var(--f-ink-faint)">
          <i :class="['fa-solid', 图标.评论]" /> {{ 缩写(post.评论.length) }}
        </span>
        <button
          v-for="t in post.话题"
          :key="t"
          class="tc-f-topic-chip"
          @click="$emit('话题', t)">
          {{ 话题名(t) }}
        </button>
      </div>
    </div>

    <!-- 评论区 -->
    <div class="tc-f-comments">
      <div v-if="post.评论.length === 0" class="tc-f-empty">还没有人评论。</div>

      <div v-for="(c, i) in post.评论" :key="i" class="tc-f-comment">
        <div class="tc-f-comment-head">
          <用户头像 :昵称="c.昵称" :我的="c.昵称 === mine" :楼主="c.昵称 === post.作者" :尺寸="28" />
          <span class="tc-f-comment-name">{{ c.昵称 }}</span>
          <span v-if="c.昵称 === post.作者" class="tc-f-op">
            <i :class="['fa-solid', 图标.楼主]" /> 楼主
          </span>
          <span v-if="c.昵称 === mine" class="tc-f-me">我</span>
          <span class="tc-f-floor" style="margin-left: auto">
            {{ i + 2 }}楼<template v-if="c.时间"> · {{ c.时间 }}</template>
          </span>
        </div>
        <div class="tc-f-comment-body">{{ c.内容 }}</div>

        <div class="tc-f-comment-foot">
          <button
            class="tc-f-mini"
            :class="{ 'tc-f-mini--on': c.我的点赞 }"
            @click="$emit('likeComment', post.ID, i)">
            <i :class="['fa-solid', 图标.点赞]" />{{ 缩写(c.点赞) }}
          </button>
          <button class="tc-f-mini" @click="开始回复(i)">
            <i :class="['fa-solid', 图标.回复]" />{{ 回复目标 === i ? '取消' : '回复' }}
          </button>
        </div>

        <!-- 楼中楼 -->
        <div v-if="c.回复.length" class="tc-f-replies">
          <div v-for="(r, j) in c.回复" :key="j" class="tc-f-reply">
            <div class="tc-f-comment-head">
              <span class="tc-f-comment-name">{{ r.昵称 }}</span>
              <span v-if="r.昵称 === post.作者" class="tc-f-op">
                <i :class="['fa-solid', 图标.楼主]" /> 楼主
              </span>
              <span v-if="r.昵称 === mine" class="tc-f-me">我</span>
              <span class="tc-f-floor" style="margin-left: auto">
                <i :class="['fa-solid', 图标.回复]" /> {{ i + 2 }}楼<template v-if="r.时间"> · {{ r.时间 }}</template>
              </span>
            </div>
            <div class="tc-f-comment-body">{{ r.内容 }}</div>
            <div class="tc-f-comment-foot" style="padding-left: 0">
              <button
                class="tc-f-mini"
                :class="{ 'tc-f-mini--on': r.我的点赞 }"
                @click="$emit('likeComment', post.ID, i, j)">
                <i :class="['fa-solid', 图标.点赞]" />{{ 缩写(r.点赞) }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="回复目标 === i" class="tc-f-replybox">
          <textarea
            v-model="回复草稿"
            class="tc-f-textarea"
            style="min-height: 58px"
            :placeholder="`回复 ${c.昵称}…`" />
          <button
            class="tc-f-btn tc-f-btn--primary"
            style="margin-top: 6px"
            :disabled="!回复草稿.trim()"
            @click="提交回复(i)">
            回复
          </button>
        </div>
      </div>
    </div>

    <div class="tc-f-field" style="margin-top: 12px">
      <label class="tc-f-label">以「{{ mine }}」的身份评论</label>
      <textarea v-model="草稿" class="tc-f-textarea" placeholder="说点什么…" />
    </div>
    <button class="tc-f-btn tc-f-btn--primary" :disabled="!草稿.trim()" @click="提交评论">
      <i :class="['fa-solid', 图标.评论]" />发表评论
    </button>
  </div>
</template>
