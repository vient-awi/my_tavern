<template>
  <div class="quest-page">
    <!-- 主线任务 -->
    <div class="quest-section" v-if="mainQuest && mainQuest.名称">
      <div class="section-header">
        <i class="fas fa-star"></i>
        <span>主线任务</span>
      </div>
      <div class="quest-card main">
        <div class="quest-badge">MAIN</div>
        <div class="quest-content">
          <div class="quest-title">{{ mainQuest.名称 }}</div>
          <div class="quest-desc">{{ mainQuest.描述 || '暂无描述' }}</div>

          <div class="quest-meta">
            <div class="meta-item status" :class="getStatusClass(mainQuest.状态)">
              <i class="fas" :class="getStatusIcon(mainQuest.状态)"></i>
              {{ mainQuest.状态 || '进行中' }}
            </div>
            <div class="meta-item deadline" v-if="mainQuest.期限 && mainQuest.期限 !== '无'">
              <i class="fas fa-clock"></i>
              {{ mainQuest.期限 }}
            </div>
          </div>

          <div class="quest-reward" v-if="mainQuest.奖励">
            <i class="fas fa-gift"></i>
            <span>{{ mainQuest.奖励 }}</span>
          </div>

          <div class="quest-objectives" v-if="mainQuest.目标 && Object.keys(mainQuest.目标).length > 0">
            <div class="objectives-title">任务目标</div>
            <div class="objective-list">
              <div class="objective-item" v-for="(value, key) in mainQuest.目标" :key="key">
                <i class="fas" :class="getObjectiveIcon(value)"></i>
                <span class="obj-key">{{ key }}</span>
                <span class="obj-value">{{ formatObjectiveValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 支线任务 -->
    <div class="quest-section" v-if="sideQuestList.length > 0">
      <div class="section-header">
        <i class="fas fa-list-check"></i>
        <span>支线任务</span>
        <span class="quest-count">{{ sideQuestList.length }}</span>
      </div>
      <div class="quest-list">
        <div
          class="quest-card side"
          v-for="quest in sideQuestList"
          :key="quest.name"
          :class="{ completed: quest.状态 === '已完成' }"
        >
          <div class="quest-type-badge" :class="getTypeBadgeClass(quest.类型)">
            {{ quest.类型 || '日常' }}
          </div>
          <div class="quest-content">
            <div class="quest-title">{{ quest.name }}</div>
            <div class="quest-desc">{{ quest.描述 || '暂无描述' }}</div>

            <div class="quest-footer">
              <div class="meta-item status" :class="getStatusClass(quest.状态)">
                <i class="fas" :class="getStatusIcon(quest.状态)"></i>
                {{ quest.状态 || '进行中' }}
              </div>
              <div class="quest-reward small" v-if="quest.奖励">
                <i class="fas fa-gift"></i>
                {{ quest.奖励 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 已完成任务记录 -->
    <div class="quest-section" v-if="completedQuests.length > 0">
      <div class="section-header collapsible" @click="showCompleted = !showCompleted">
        <i class="fas fa-check-double"></i>
        <span>已完成</span>
        <span class="quest-count">{{ completedQuests.length }}</span>
        <i class="fas fa-chevron-down toggle-icon" :class="{ rotated: showCompleted }"></i>
      </div>
      <div class="completed-list" v-if="showCompleted">
        <div class="completed-item" v-for="(quest, index) in completedQuests" :key="index">
          <i class="fas fa-check-circle"></i>
          <span>{{ quest }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!hasQuests">
      <div class="empty-icon">
        <i class="fas fa-scroll"></i>
      </div>
      <p class="empty-title">暂无任务</p>
      <p class="empty-desc">探索学园获取新任务</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  characterData: any;
}>();

const showCompleted = ref(false);

const mainQuest = computed(() => {
  return props.characterData.任务系统?.主线任务 || {};
});

const sideQuestList = computed(() => {
  const quests = props.characterData.任务系统?.支线任务 || {};
  return Object.entries(quests).map(([name, data]: [string, any]) => ({
    name,
    ...data,
  }));
});

const completedQuests = computed(() => {
  return props.characterData.任务系统?.已完成记录 || [];
});

const hasQuests = computed(() => {
  return (mainQuest.value && mainQuest.value.名称) || sideQuestList.value.length > 0;
});

function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    进行中: 'active',
    已完成: 'completed',
    已失败: 'failed',
    已放弃: 'abandoned',
  };
  return map[status] || 'active';
}

function getStatusIcon(status: string): string {
  const map: Record<string, string> = {
    进行中: 'fa-spinner fa-pulse',
    已完成: 'fa-check',
    已失败: 'fa-times',
    已放弃: 'fa-ban',
  };
  return map[status] || 'fa-spinner fa-pulse';
}

function getTypeBadgeClass(type: string): string {
  const map: Record<string, string> = {
    日常: 'type-daily',
    特殊: 'type-special',
    限时: 'type-timed',
    隐藏: 'type-hidden',
  };
  return map[type] || 'type-daily';
}

function getObjectiveIcon(value: any): string {
  if (typeof value === 'boolean') {
    return value ? 'fa-check-circle completed' : 'fa-circle pending';
  }
  if (typeof value === 'string' && value.includes('/')) {
    const [current, total] = value.split('/').map(Number);
    return current >= total ? 'fa-check-circle completed' : 'fa-circle pending';
  }
  return 'fa-circle pending';
}

function formatObjectiveValue(value: any): string {
  if (typeof value === 'boolean') {
    return value ? '✓' : '○';
  }
  return String(value);
}
</script>

<style scoped lang="scss">
.quest-page {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.quest-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;

  i:first-child {
    color: #667eea;
  }

  .quest-count {
    margin-left: auto;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
  }

  &.collapsible {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: white;
    }
  }

  .toggle-icon {
    transition: transform 0.2s;
    color: rgba(255, 255, 255, 0.4);

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.quest-card {
  position: relative;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 12px;
  overflow: hidden;

  &.main {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.1));
    border-color: rgba(102, 126, 234, 0.3);
  }

  &.side {
    background: rgba(255, 255, 255, 0.03);

    &.completed {
      opacity: 0.6;
    }
  }
}

.quest-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 3px 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 6px;
  font-size: 9px;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
}

.quest-type-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;

  &.type-daily {
    background: rgba(96, 165, 250, 0.2);
    color: #93c5fd;
  }

  &.type-special {
    background: rgba(167, 139, 250, 0.2);
    color: #c4b5fd;
  }

  &.type-timed {
    background: rgba(251, 191, 36, 0.2);
    color: #fcd34d;
  }

  &.type-hidden {
    background: rgba(248, 113, 113, 0.2);
    color: #fca5a5;
  }
}

.quest-content {
  padding-right: 60px;
}

.quest-title {
  font-size: 15px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.quest-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  margin-bottom: 12px;
}

.quest-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;

  &.status {
    &.active {
      background: rgba(52, 211, 153, 0.15);
      color: #6ee7b7;
    }

    &.completed {
      background: rgba(96, 165, 250, 0.15);
      color: #93c5fd;
    }

    &.failed {
      background: rgba(248, 113, 113, 0.15);
      color: #fca5a5;
    }

    &.abandoned {
      background: rgba(156, 163, 175, 0.15);
      color: #d1d5db;
    }
  }

  &.deadline {
    background: rgba(251, 191, 36, 0.15);
    color: #fcd34d;
  }
}

.quest-reward {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 10px;
  font-size: 12px;
  color: #fcd34d;
  margin-bottom: 12px;

  i {
    color: #fbbf24;
  }

  &.small {
    padding: 4px 10px;
    font-size: 11px;
    background: transparent;
    margin-bottom: 0;
  }
}

.quest-objectives {
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.objectives-title {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.objective-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.objective-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;

  i {
    font-size: 12px;

    &.completed {
      color: #34d399;
    }

    &.pending {
      color: rgba(255, 255, 255, 0.3);
    }
  }

  .obj-key {
    color: rgba(255, 255, 255, 0.8);
  }

  .obj-value {
    margin-left: auto;
    color: rgba(255, 255, 255, 0.5);
    font-family: 'JetBrains Mono', monospace;
  }
}

.quest-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.completed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.completed-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);

  i {
    color: #34d399;
    font-size: 14px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .empty-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.03);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;

    i {
      font-size: 32px;
      color: rgba(255, 255, 255, 0.15);
    }
  }

  .empty-title {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 6px;
  }

  .empty-desc {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.3);
  }
}
</style>
