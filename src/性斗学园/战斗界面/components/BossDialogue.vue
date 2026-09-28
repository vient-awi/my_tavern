<template>
  <Transition name="dialogue-fade">
    <div v-if="isVisible && dialogue" class="boss-dialogue-overlay" @click="handleSkip">
      <div class="dialogue-container" :class="`emotion-${dialogue.emotion}`">
        <div class="dialogue-speaker">{{ dialogue.speaker }}</div>
        <div class="dialogue-text">{{ dialogue.text }}</div>
        <div class="dialogue-hint">点击任意处继续</div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { BossDialogue } from '../bossSystem';

const props = defineProps<{
  dialogue: BossDialogue | null;
  isVisible: boolean;
}>();

const emit = defineEmits<{
  skip: [];
}>();

const handleSkip = () => {
  emit('skip');
};
</script>

<style lang="scss" scoped>
.boss-dialogue-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  cursor: pointer;
  padding: 1rem;
}

.dialogue-container {
  max-width: 800px;
  width: 100%;
  padding: 2rem;
  border-radius: 1rem;
  border: 2px solid;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: dialogue-enter 0.3s ease-out;

  @media (max-width: 640px) {
    padding: 1.5rem;
    max-width: 90%;
  }
}

// 不同情绪的样式
.emotion-arrogant {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.2));
  border-color: #ec4899;

  .dialogue-speaker {
    color: #f9a8d4;
  }

  .dialogue-text {
    color: #fce7f3;
  }
}

.emotion-angry {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.2));
  border-color: #ef4444;

  .dialogue-speaker {
    color: #fca5a5;
  }

  .dialogue-text {
    color: #fee2e2;
  }
}

.emotion-weak {
  background: linear-gradient(135deg, rgba(147, 197, 253, 0.2), rgba(96, 165, 250, 0.2));
  border-color: #60a5fa;

  .dialogue-speaker {
    color: #bfdbfe;
  }

  .dialogue-text {
    color: #dbeafe;
  }
}

.emotion-tsundere {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(249, 115, 22, 0.2));
  border-color: #fb923c;

  .dialogue-speaker {
    color: #fed7aa;
  }

  .dialogue-text {
    color: #ffedd5;
  }
}

.dialogue-speaker {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);

  @media (max-width: 640px) {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
}

.dialogue-text {
  font-size: 1.125rem;
  line-height: 1.75;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  min-height: 3rem;

  @media (max-width: 640px) {
    font-size: 1rem;
    line-height: 1.6;
    min-height: 2.5rem;
  }
}

.dialogue-hint {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  animation: pulse 2s ease-in-out infinite;

  @media (max-width: 640px) {
    margin-top: 1rem;
    font-size: 0.75rem;
  }
}

@keyframes dialogue-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.dialogue-fade-enter-active,
.dialogue-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialogue-fade-enter-from,
.dialogue-fade-leave-to {
  opacity: 0;
}
</style>
