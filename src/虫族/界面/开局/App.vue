<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../store';
import {
  APPETITES,
  DEFAULT_NICKNAME,
  FORUM_ACTIVITY,
  ORIGINS,
  PSYCHES,
  TAILHOOKS,
} from './options';

const store = useDataStore();

const 姓名 = ref('');
const 出身 = ref(ORIGINS[0].key);
const 食量 = ref(APPETITES[0].key);
const 精神力 = ref(PSYCHES[2].key);
const 尾勾 = ref<string>(TAILHOOKS[0].key);
const 论坛 = ref<string>(FORUM_ACTIVITY[1].key);
const 昵称 = ref(DEFAULT_NICKNAME);

const 已提交 = ref(false);

const 选中出身 = computed(() => ORIGINS.find(o => o.key === 出身.value) ?? ORIGINS[0]);
const 选中食量 = computed(() => APPETITES.find(a => a.key === 食量.value) ?? APPETITES[0]);
const 选中精神 = computed(() => PSYCHES.find(p => p.key === 精神力.value) ?? PSYCHES[2]);
const 选中论坛 = computed(() => FORUM_ACTIVITY.find(f => f.key === 论坛.value) ?? FORUM_ACTIVITY[1]);

const 可提交 = computed(() => 姓名.value.trim().length > 0 && 昵称.value.trim().length > 0);

/** 提交：把面板上的选择写进 MVU 变量，然后让 AI 铺开第一幕 */
async function 提交() {
  if (!可提交.value) return;

  const 主角 = store.data.主角;
  主角.姓名 = 姓名.value.trim();
  主角.所属 = 选中出身.value.所属;
  主角.军功 = 选中出身.value.军功;
  主角.声望 = 选中出身.value.声望;
  主角.精神力.数值 = 选中精神.value.数值;
  主角.精神力.等级 = 选中精神.value.等级;
  主角.饱食度 = 选中食量.value.初始饱食;
  主角.尾勾 = 尾勾.value as '未生长' | '已生长';

  store.data.论坛.昵称 = 昵称.value.trim();
  store.data.论坛.声望 = 选中论坛.value.声望;

  已提交.value = true;

  // 把玩家的开局设定作为用户消息发出，再让 AI 铺开场景
  const 描述 = [
    `【开局设定】`,
    `姓名：${主角.姓名}`,
    `出身：${选中出身.value.name}（${选中出身.value.所属}）`,
    `食量：${选中食量.value.name}`,
    `精神力：${主角.精神力.等级} 级`,
    `尾勾：${主角.尾勾}`,
    `《触角》昵称：${store.data.论坛.昵称}`,
  ]
    .filter(Boolean)
    .join('\n');

  await createChatMessages([{ role: 'user', name: 主角.姓名, message: 描述 }]);
  triggerSlash('/trigger');
}
</script>

<template>
  <div class="tc-open">
    <div class="tc-o-head">
      <div class="tc-o-title">虫族 · 开局设定</div>
      <div class="tc-o-sub">确认这几项之后，从你踏上星港大道的那一刻开始。</div>
    </div>

    <!-- 提交完成 -->
    <div v-if="已提交" class="tc-o-done">
      <div class="tc-o-done-title">设定已写入</div>
      <div>翻到下一楼，从星港大道开始。</div>
    </div>

    <template v-else>
      <div class="tc-o-body">
        <section class="tc-o-sect">
          <div class="tc-o-secttitle">她是谁</div>

          <div class="tc-o-field">
            <label class="tc-o-label">姓名</label>
            <input v-model="姓名" class="tc-o-input" placeholder="给这只雌虫起个名字" />
          </div>

          <div class="tc-o-field">
            <label class="tc-o-label">出身</label>
            <div class="tc-o-opts">
              <button
                v-for="o in ORIGINS"
                :key="o.key"
                class="tc-o-opt"
                :class="{ 'tc-o-opt--on': 出身 === o.key }"
                @click="出身 = o.key">
                <span class="tc-o-opt-name">{{ o.name }}</span>
                <span class="tc-o-opt-desc">{{ o.desc }}</span>
              </button>
            </div>
          </div>

          <div class="tc-o-field">
            <label class="tc-o-label">尾勾</label>
            <div class="tc-o-opts">
              <button
                v-for="t in TAILHOOKS"
                :key="t.key"
                class="tc-o-opt"
                :class="{ 'tc-o-opt--on': 尾勾 === t.key }"
                @click="尾勾 = t.key">
                <span class="tc-o-opt-name">{{ t.name }}</span>
                <span class="tc-o-opt-desc">{{ t.desc }}</span>
              </button>
            </div>
          </div>
        </section>

        <section class="tc-o-sect">
          <div class="tc-o-secttitle">她的身体</div>

          <div class="tc-o-field">
            <label class="tc-o-label">食量</label>
            <div class="tc-o-opts">
              <button
                v-for="a in APPETITES"
                :key="a.key"
                class="tc-o-opt"
                :class="{ 'tc-o-opt--on': 食量 === a.key }"
                @click="食量 = a.key">
                <span class="tc-o-opt-name">{{ a.name }}</span>
                <span class="tc-o-opt-desc">{{ a.desc }}</span>
              </button>
            </div>
            <div class="tc-o-hint">影响初始饱食度（{{ 选中食量.初始饱食 }}/12）与消耗节奏：{{ 选中食量.掉速 }}。</div>
          </div>

          <div class="tc-o-field">
            <label class="tc-o-label">精神力</label>
            <div class="tc-o-opts">
              <button
                v-for="p in PSYCHES"
                :key="p.key"
                class="tc-o-opt"
                :class="{ 'tc-o-opt--on': 精神力 === p.key }"
                @click="精神力 = p.key">
                <span class="tc-o-opt-name">{{ p.name }}</span>
                <span class="tc-o-opt-desc">{{ p.desc }}</span>
              </button>
            </div>
          </div>
        </section>

        <section class="tc-o-sect">
          <div class="tc-o-secttitle">她的另一面</div>

          <div class="tc-o-field">
            <label class="tc-o-label">《触角》昵称</label>
            <input v-model="昵称" class="tc-o-input" :placeholder="DEFAULT_NICKNAME" />
            <div class="tc-o-hint">雌虫之间的匿名论坛。你在上面叫这个名字。</div>
          </div>

          <div class="tc-o-field">
            <label class="tc-o-label">论坛活跃度</label>
            <div class="tc-o-opts">
              <button
                v-for="f in FORUM_ACTIVITY"
                :key="f.key"
                class="tc-o-opt"
                :class="{ 'tc-o-opt--on': 论坛 === f.key }"
                @click="论坛 = f.key">
                <span class="tc-o-opt-name">{{ f.name }}</span>
                <span class="tc-o-opt-desc">{{ f.desc }}</span>
              </button>
            </div>
          </div>
        </section>

        <div class="tc-o-preview">
          <span class="tc-o-chip">军功 <b>{{ 选中出身.军功 }}</b></span>
          <span class="tc-o-chip">声望 <b>{{ 选中出身.声望 }}</b></span>
          <span class="tc-o-chip">所属 <b>{{ 选中出身.所属 }}</b></span>
          <span class="tc-o-chip">精神力 <b>{{ 选中精神.等级 }}</b></span>
          <span class="tc-o-chip">饱食 <b>{{ 选中食量.初始饱食 }}/12</b></span>
          <span class="tc-o-chip">论坛声望 <b>{{ 选中论坛.声望 }}</b></span>
        </div>
      </div>

      <div class="tc-o-actions">
        <button class="tc-o-btn tc-o-btn--primary" :disabled="!可提交" @click="提交">开始</button>
        <span v-if="!可提交" class="tc-o-err">姓名和昵称都要填。</span>
      </div>
    </template>
  </div>
</template>
