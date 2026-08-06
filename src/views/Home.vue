<template>
  <div class="classic-home">
    <ImprovedNavigation />
    <hr />
    <ClassicContainer>
      <div class="splash-container desktop">
        <img src="/splash.webp" alt="黑暗之魂系列文本数据库" />
      </div>
      <div class="splash-container mobile">
        <img src="/splash2.webp" alt="黑魂数据库" />
      </div>
    </ClassicContainer>
  </div>
</template>

<script setup lang="ts">
import ImprovedNavigation from '@/components/layout/ImprovedNavigation.vue'
import ClassicContainer from '@/components/layout/ClassicContainer.vue'
</script>

<style scoped lang="scss">
.classic-home {
  min-height: 100vh;
  background: #000;
}

hr {
  border: 0;
  height: 120px;

  @media (max-width: 1000px) {
    height: 100px;
  }
}

.splash-container {
  width: 100%;
  margin: 2em auto;
  text-align: center;

  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
}

.desktop {
  @media (max-width: 1000px) {
    display: none;
  }
}

.mobile {
  display: none;

  @media (max-width: 1000px) {
    display: block;
  }
}
</style>
