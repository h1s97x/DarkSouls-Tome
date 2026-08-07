<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
// Wiki 风格不需要额外逻辑
</script>

<style lang="scss">
@import '@/assets/styles/classic.scss';

#app {
  min-height: 100vh;
  background: var(--color-bg);
}

/* 简单的淡入淡出过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
