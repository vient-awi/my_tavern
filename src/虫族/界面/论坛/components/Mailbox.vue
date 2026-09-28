<script setup lang="ts">
import { computed, ref } from 'vue';
import type { 通知条目 } from '../数据';
import { 图标 } from '../图标';
import 用户头像 from './用户头像.vue';

const props = defineProps<{
  私信: Record<string, string>;
  点赞通知: 通知条目[];
  回复通知: 通知条目[];
  系统通知: 通知条目[];
}>();

const emit = defineEmits<{
  back: [];
  回信: [对方: string, 内容: string];
  '已读': [类别: '点赞' | '回复' | '系统'];
}>();

const 页签 = ref<'私信' | '点赞' | '回复' | '系统'>('私信');

const 私信列表 = computed(() => Object.entries(props.私信 ?? {}));

const 未读 = computed(() => ({  点赞: props.点赞通知.filter(n => !n.已读).length,
  回复: props.回复通知.filter(n => !n.已读).length,
  系统: props.系统通知.filter(n => !n.已读).length,
}));

const 当前列表 = computed(() => {
  if (页签.value === '点赞') return props.点赞通知;
  if (页签.value === '回复') return props.回复通知;
  if (页签.value === '系统') return props.系统通知;
  return [];
});

/** 四类各配一个图标，跟顶部导航一致 */
const 页签图标 = computed(() => ({
  私信: 图标.私信,
  点赞: 图标.点赞,
  回复: 图标.回复,
  系统: 图标.系统提示,
}) as Record<string, string>);

/** 打开某一类时标记已读，让角标消失 */
function 切页签(k: typeof 页签.value) {
  页签.value = k;
  if (k !== '私信') emit('已读', k);
}

/* 回信 */
const 回信对象 = ref('');
const 回信内容 = ref('');

function 开始回信(谁: string) {
  回信对象.value = 回信对象.value === 谁 ? '' : 谁;
  回信内容.value = '';
}

function 发送回信() {
  if (!回信内容.value.trim() || !回信对象.value) return;
  emit('回信', 回信对象.value, 回信内容.value);
  回信内容.value = '';
  回信对象.value = '';
}

/** 通知条目的正文：点赞/回复用「来源 + 摘要」，系统用「标题 + 内容」 */
function 通知主文(n: 通知条目) {
  return n.标题 ? n.标题 : n.来源 || '网友';
}

function 通知副文(n: 通知条目) {
  return n.内容 ? n.内容 : n.摘要 || '';
}
</script>

<template>
  <div class="tc-f-detail">
    <button class="tc-f-btn" style="margin-bottom: 9px" @click="$emit('back')">
      <i :class="['fa-solid', 图标.返回]" />返回列表
    </button>

    <div class="tc-f-tabs">
      <button
        v-for="k in (['私信', '点赞', '回复', '系统'] as const)"
        :key="k"
        class="tc-f-navbtn"
        :class="{ 'tc-f-navbtn--on': 页签 === k }"
        @click="切页签(k)">
        <i :class="['fa-solid', 页签图标[k]]" />{{ k }}
        <span v-if="k === '私信' ? 私信列表.length : 未读[k]" class="tc-f-badge">
          {{ k === '私信' ? 私信列表.length : 未读[k] }}
        </span>
      </button>
    </div>

    <!-- 私信 -->
    <template v-if="页签 === '私信'">
      <div v-if="私信列表.length === 0" class="tc-f-empty">收件箱是空的。</div>
      <div v-for="[谁, 内容] in 私信列表" :key="谁" class="tc-f-mail">
        <div class="tc-f-comment-head" style="padding-bottom: 0">
          <用户头像 :昵称="谁" :尺寸="28" />
          <span class="tc-f-comment-name">{{ 谁 }}</span>
          <span class="tc-f-mail-tag"><i :class="['fa-solid', 图标.私信]" />私信</span>
        </div>
        <div class="tc-f-mail-body">{{ 内容 }}</div>
        <button class="tc-f-mini" style="margin-top: 6px" @click="开始回信(谁)">
          <i :class="['fa-solid', 图标.回复]" />{{ 回信对象 === 谁 ? '取消' : '回信' }}
        </button>
        <div v-if="回信对象 === 谁" class="tc-f-replybox">
          <textarea v-model="回信内容" class="tc-f-textarea" style="min-height: 56px" placeholder="写回信…" />
          <button
            class="tc-f-btn tc-f-btn--primary"
            style="margin-top: 5px"
            :disabled="!回信内容.trim()"
            @click="发送回信">
            发送
          </button>
        </div>
      </div>
    </template>

    <!-- 三类通知 -->
    <template v-else>
      <div v-if="当前列表.length === 0" class="tc-f-empty">这里还没有消息。</div>
      <div v-for="(n, i) in 当前列表" :key="i" class="tc-f-mail" :class="{ 'tc-f-mail--unread': !n.已读 }">
        <div class="tc-f-comment-head" style="padding-bottom: 0">
          <用户头像 :昵称="通知主文(n)" :尺寸="28" />
          <span class="tc-f-comment-name">{{ 通知主文(n) }}</span>
          <span class="tc-f-mail-tag">{{ 页签 }}</span>
          <span v-if="!n.已读" class="tc-f-mail-dot" />
        </div>
        <div v-if="通知副文(n)" class="tc-f-mail-body">{{ 通知副文(n) }}</div>
      </div>
      <div class="tc-f-note">
        消息由 AI 按剧情补充：真有网友点了赞、回了帖，这里才会冒出新的一条。
      </div>
    </template>
  </div>
</template>
