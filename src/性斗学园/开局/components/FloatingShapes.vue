<template>
  <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <!-- Gradient Orbs -->
    <div
      class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] animate-blob mix-blend-screen"
    ></div>
    <div
      class="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen"
    ></div>
    <div
      class="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-screen"
    ></div>

    <!-- Grid Pattern Overlay -->
    <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f172a]/50 to-[#0f172a]"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped></style>
