<template>
  <div class="wiki-page">
    <ImprovedNavigation />
    <div class="wiki-body">
      <div class="wiki-container">
        <slot />
      </div>
      <footer class="page-footer">
        Dark Souls Wiki DB · 黑暗之魂系列文本数据库 · 数据仅供学习交流使用
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import ImprovedNavigation from '@/components/layout/ImprovedNavigation.vue'
</script>

<style scoped lang="scss">
.wiki-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.wiki-body {
  padding-top: var(--nav-height, 64px);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: padding-top 0.3s ease;

  @media (max-width: 768px) {
    padding-top: var(--nav-height-mobile, 56px);
  }
}

.wiki-container {
  flex: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5em 1.5em 0;

  @media (max-width: 768px) {
    padding: 1em 1em 0;
  }
}
</style>
