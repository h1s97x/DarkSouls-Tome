<template>
  <div class="wiki-inner-page">
    <ImprovedNavigation />
    <div class="wiki-inner-body">
      <SidebarNav />
      <main class="wiki-inner-main">
        <div class="wiki-inner-container">
          <slot />
        </div>
        <footer class="page-footer">
          Dark Souls Wiki DB · 黑暗之魂系列文本数据库 · 数据仅供学习交流使用
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import ImprovedNavigation from '@/components/layout/ImprovedNavigation.vue'
import SidebarNav from '@/components/layout/SidebarNav.vue'
</script>

<style scoped lang="scss">
.wiki-inner-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.wiki-inner-body {
  display: flex;
  padding-top: var(--nav-height, 64px);
  min-height: 100vh;
  transition: padding-top 0.3s ease;

  @media (max-width: 900px) {
    padding-top: var(--nav-height-mobile, 56px);
  }
}

.wiki-inner-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.wiki-inner-container {
  flex: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5em 2em 0;

  @media (max-width: 900px) {
    padding: 1em 1.25em 0;
  }
}
</style>
