<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../store';
import { satietyTier, barTier, PSYCHE_CAPS, REPUTATION_MAX, nextRank } from './tiers';

const store = useDataStore();
const open = ref(false);

const 主角 = computed(() => store.data.主角);
const 世界 = computed(() => store.data.世界);
const 关系 = computed(() => store.data.关系);
const 论坛 = computed(() => store.data.论坛);

const 饱食 = computed(() => Math.round(主角.value.饱食度));
const 饱食档位 = computed(() => satietyTier(饱食.value));
const 挨饿 = computed(() => 饱食.value <= 4);

const 精神上限 = computed(() => PSYCHE_CAPS[主角.value.精神力.等级] ?? 100);
const 下一级 = computed(() => nextRank(主角.value.军衔, 主角.value.军功));

const 蜜源列表 = computed(() => Object.entries(关系.value.蜜源名册 ?? {}));
const 雄虫列表 = computed(() => Object.entries(关系.value.雄虫关系 ?? {}));

function pct(v: number, max = 100) {
  return `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
}

function tierOf(v: number, invert = false, max = 100) {
  return barTier(v, invert, max);
}
</script>

<template>
  <div class="tc-status">
    <!-- 标题栏：始终可见 -->
    <div class="tc-head" :class="{ 'tc-head--open': open }" @click="open = !open">
      <span class="tc-name">{{ 主角.姓名 === '待初始化' ? '未命名雌虫' : 主角.姓名 }}</span>
      <span class="tc-phase">{{ 主角.军衔 }}</span>

      <div class="tc-head-meters">
        <div class="tc-meter">
          <span class="tc-meter-label">饱食</span>
          <div class="tc-pips">
            <i
              v-for="i in 12"
              :key="i"
              class="tc-pip"
              :class="{
                'tc-pip--on': i <= 饱食,
                'tc-pip--warn': 饱食档位 === 'warning',
                'tc-pip--danger': 饱食档位 === 'danger',
              }" />
          </div>
          <span class="tc-meter-value">{{ 饱食 }}/12</span>
        </div>

        <div class="tc-meter">
          <span class="tc-meter-label">精神力</span>
          <span class="tc-meter-value">{{ 主角.精神力.等级 }} · {{ 主角.精神力.数值 }}/{{ 精神上限 }}</span>
        </div>

        <span class="tc-chevron" :class="{ 'tc-chevron--open': open }">▼</span>
      </div>
    </div>

    <!-- 展开区 -->
    <div v-if="open" class="tc-body">
      <section>
        <div class="tc-section-title">当前</div>
        <div class="tc-rows">
          <div class="tc-row"><span class="tc-row-key">时间</span><span class="tc-row-val">{{ 世界.当前时间 }}</span></div>
          <div class="tc-row"><span class="tc-row-key">区域</span><span class="tc-row-val">{{ 世界.当前区域 }}</span></div>
          <div class="tc-row"><span class="tc-row-key">场景</span><span class="tc-row-val">{{ 世界.当前场景 }}</span></div>
          <div class="tc-row"><span class="tc-row-key">近期</span><span class="tc-row-val">{{ 世界.近期事务 }}</span></div>
        </div>
      </section>

      <section>
        <div class="tc-section-title">军籍</div>
        <div class="tc-rows">
          <div class="tc-row"><span class="tc-row-key">军衔</span><span class="tc-row-val">{{ 主角.军衔 }}</span></div>
          <div class="tc-row"><span class="tc-row-key">所属</span><span class="tc-row-val">{{ 主角.所属 }}</span></div>
          <div class="tc-row"><span class="tc-row-key">军功</span><span class="tc-row-val">{{ 主角.军功 }}</span></div>
          <div v-if="下一级" class="tc-row">
            <span class="tc-row-key">下一级</span>
            <span class="tc-row-val">{{ 下一级.衔 }} · 还差 {{ 下一级.还差 }}</span>
          </div>
          <div class="tc-row"><span class="tc-row-key">尾勾</span><span class="tc-row-val">{{ 主角.尾勾 }}</span></div>
        </div>
        <div class="tc-bar-row" style="margin-top: 6px">
          <span class="tc-row-key">声望</span>
          <div class="tc-bar" style="flex: 1">
            <div
              class="tc-bar-fill"
              :class="`tc-bar-fill--${tierOf(主角.声望, false, REPUTATION_MAX)}`"
              :style="{ width: pct(主角.声望, REPUTATION_MAX) }" />
          </div>
          <span class="tc-meter-value">{{ 主角.声望 }}</span>
        </div>
      </section>

      <section>
        <div class="tc-section-title">蜜源名册</div>
        <div v-if="蜜源列表.length === 0" class="tc-empty">名册还是空的。</div>
        <div v-else class="tc-grid">
          <div v-for="[名, m] in 蜜源列表" :key="名" class="tc-card">
            <div class="tc-card-head">
              <span class="tc-card-name">{{ 名 }}</span>
              <span class="tc-card-tag">{{ m.关系 }}</span>
            </div>
            <div class="tc-rows">
              <div class="tc-row"><span class="tc-row-key">身份</span><span class="tc-row-val">{{ m.身份 }}</span></div>
              <div class="tc-row"><span class="tc-row-key">蜜质</span><span class="tc-row-val">{{ m.蜜质 }}</span></div>
              <div class="tc-row"><span class="tc-row-key">状态</span><span class="tc-row-val">{{ m.身体状态 }}</span></div>
            </div>
            <div class="tc-bar-row">
              <span class="tc-row-key">亲密</span>
              <div class="tc-bar" style="flex: 1">
                <div class="tc-bar-fill" :style="{ width: pct(m.亲密度) }" />
              </div>
            </div>
            <div class="tc-bar-row">
              <span class="tc-row-key">供给</span>
              <div class="tc-bar" style="flex: 1">
                <div class="tc-bar-fill" :class="`tc-bar-fill--${tierOf(m.供给能力)}`" :style="{ width: pct(m.供给能力) }" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div class="tc-section-title">雄虫关系</div>
        <div v-if="雄虫列表.length === 0" class="tc-empty">还没记下谁。</div>
        <div v-else class="tc-grid">
          <div v-for="[名, m] in 雄虫列表" :key="名" class="tc-card">
            <div class="tc-card-head"><span class="tc-card-name">{{ 名 }}</span></div>
            <div class="tc-bar-row">
              <span class="tc-row-key">好感</span>
              <div class="tc-bar" style="flex: 1">
                <div class="tc-bar-fill" :class="`tc-bar-fill--${tierOf(m.好感度)}`" :style="{ width: pct(m.好感度) }" />
              </div>
              <span class="tc-meter-value">{{ m.好感度 }}</span>
            </div>
            <div class="tc-bar-row">
              <span class="tc-row-key">信任</span>
              <div class="tc-bar" style="flex: 1">
                <div class="tc-bar-fill" :style="{ width: pct(m.信任度) }" />
              </div>
              <span class="tc-meter-value">{{ m.信任度 }}</span>
            </div>
            <div v-if="m.备注" class="tc-muted-note" style="margin-top: 5px">{{ m.备注 }}</div>
          </div>
        </div>
      </section>

      <section>
        <div class="tc-section-title">《触角》</div>
        <div class="tc-bar-row">
          <span class="tc-row-key">昵称</span>
          <span class="tc-row-val">{{ 论坛.昵称 }}</span>
        </div>
        <div class="tc-bar-row">
          <span class="tc-row-key">声望</span>
          <div class="tc-bar" style="flex: 1">
            <div class="tc-bar-fill" :class="`tc-bar-fill--${tierOf(论坛.声望)}`" :style="{ width: pct(论坛.声望) }" />
          </div>
          <span class="tc-meter-value">{{ 论坛.声望 }}</span>
        </div>
      </section>
    </div>

    <!-- 情境覆盖：饿急了 -->
    <div v-if="挨饿" class="tc-alert">
      <span class="tc-alert-icon">▲</span>
      <span v-if="饱食 <= 2">饿急了。体力与判断力明显下降。</span>
      <span v-else>饥饿开始影响判断。</span>
    </div>
  </div>
</template>
