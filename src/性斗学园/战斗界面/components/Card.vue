<template>
  <div class="card" :class="{ 'card-hover': hover }" @click="$emit('click')">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    hover?: boolean;
  }>(),
  {
    hover: false,
  },
);

defineEmits<{
  click: [];
}>();
</script>

<style lang="scss" scoped>
.card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.card-hover {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(15, 23, 42, 0.8);
    border-color: rgba(56, 189, 248, 0.3);
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);
  }
}
</style>
