<template>
  <div class="bg-ambience">
    <!-- 基础渐变 -->
    <div class="bg-gradient"></div>

    <!-- 纹理叠加 -->
    <div class="bg-texture"></div>

    <!-- 光晕效果 -->
    <div class="glow glow-top"></div>
    <div class="glow glow-bottom"></div>

    <!-- 漂浮尘埃 -->
    <div
      v-for="particle in dustParticles"
      :key="particle.id"
      class="dust-particle"
      :style="{
        left: `${particle.left}%`,
        animationDelay: `${particle.delay}s`,
        animationDuration: `${particle.duration}s`,
      }"
    ></div>

    <!-- 飘落花瓣 -->
    <div
      v-for="petal in petals"
      :key="petal.id"
      class="petal"
      :style="{
        left: `${petal.left}%`,
        transform: `scale(${petal.scale})`,
        animationDelay: `${petal.delay}s`,
        animationDuration: `${petal.duration}s`,
      }"
    ></div>

    <!-- 闪烁阴影 -->
    <div class="flicker-overlay"></div>

    <!-- 暗角 -->
    <div class="vignette"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

interface Petal extends Particle {
  scale: number;
}

const dustParticles = ref<Particle[]>([]);
const petals = ref<Petal[]>([]);

onMounted(() => {
  // 生成漂浮尘埃
  dustParticles.value = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * -20,
    duration: 15 + Math.random() * 20,
  }));

  // 生成花瓣
  petals.value = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 100,
    left: Math.random() * 100,
    delay: Math.random() * -20,
    duration: 10 + Math.random() * 15,
    scale: 0.5 + Math.random() * 0.5,
  }));
});
</script>

<style lang="scss" scoped>
.bg-ambience {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  background: #020617;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, #0f172a, #050510, #000);
  opacity: 0.9;
}

.bg-texture {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.05;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  animation: pulseSlow 8s ease-in-out infinite;
}

.glow-top {
  top: -20%;
  left: -10%;
  width: 60vw;
  height: 60vw;
  background: rgba(67, 56, 202, 0.2);
}

.glow-bottom {
  bottom: -10%;
  right: -10%;
  width: 50vw;
  height: 50vw;
  background: rgba(159, 18, 57, 0.1);
  animation-delay: 2s;
}

.dust-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  filter: blur(1px);
  animation: floatUp 20s linear infinite;
}

.petal {
  position: absolute;
  width: 12px;
  height: 12px;
  background: rgba(127, 29, 29, 0.4);
  border-radius: 80% 0 55% 50% / 55% 0 80% 50%;
  animation: fallRotate 15s linear infinite;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.flicker-overlay {
  position: absolute;
  inset: 0;
  background: black;
  animation: flicker 5s ease-in-out infinite;
  mix-blend-mode: overlay;
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
}

@keyframes pulseSlow {
  0%,
  100% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.25;
    transform: scale(1.05);
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(20px);
    opacity: 0;
  }
}

@keyframes fallRotate {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

@keyframes flicker {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 0.02;
  }
  55% {
    opacity: 0.01;
  }
  60% {
    opacity: 0.03;
  }
}
</style>
