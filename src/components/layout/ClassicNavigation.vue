<template>
  <div class="classic-nav">
    <div class="nav-container">
      <!-- 黑魂1 -->
      <div class="submenu">
        <p><span class="desktop">黑暗之</span><span>魂1</span></p>
        <router-link to="/ds1/weapon"
          ><span>武器</span><span class="desktop"> / Weapons</span></router-link
        >
        <router-link to="/ds1/armor"
          ><span>防具</span><span class="desktop"> / Armor</span></router-link
        >
        <router-link to="/ds1/ring"
          ><span>戒指</span><span class="desktop"> / Rings</span></router-link
        >
        <router-link to="/ds1/item"
          ><span>物品</span><span class="desktop"> / Items</span></router-link
        >
        <router-link to="/ds1/magic"
          ><span>法术</span><span class="desktop"> / Magic</span></router-link
        >
        <router-link to="/ds1/dialogue"
          ><span>对话</span><span class="desktop"> / Dialogue</span></router-link
        >
      </div>

      <!-- 黑魂2 -->
      <div class="submenu">
        <p><span class="desktop">黑暗之</span><span>魂2</span></p>
        <router-link to="/ds2/weapon"
          ><span>武器</span><span class="desktop"> / Weapons</span></router-link
        >
        <router-link to="/ds2/armor"
          ><span>防具</span><span class="desktop"> / Armor</span></router-link
        >
        <router-link to="/ds2/ring"
          ><span>戒指</span><span class="desktop"> / Rings</span></router-link
        >
        <router-link to="/ds2/item"
          ><span>物品</span><span class="desktop"> / Items</span></router-link
        >
        <router-link to="/ds2/magic"
          ><span>法术</span><span class="desktop"> / Magic</span></router-link
        >
        <router-link to="/ds2/dialogue"
          ><span>对话</span><span class="desktop"> / Dialogue</span></router-link
        >
      </div>

      <!-- 黑魂3 -->
      <div class="submenu">
        <p><span class="desktop">黑暗之</span><span>魂3</span></p>
        <router-link to="/ds3/weapon"
          ><span>武器</span><span class="desktop"> / Weapons</span></router-link
        >
        <router-link to="/ds3/armor"
          ><span>防具</span><span class="desktop"> / Armor</span></router-link
        >
        <router-link to="/ds3/ring"
          ><span>戒指</span><span class="desktop"> / Rings</span></router-link
        >
        <router-link to="/ds3/item"
          ><span>物品</span><span class="desktop"> / Items</span></router-link
        >
        <router-link to="/ds3/magic"
          ><span>法术</span><span class="desktop"> / Magic</span></router-link
        >
        <router-link to="/ds3/dialogue"
          ><span>对话</span><span class="desktop"> / Dialogue</span></router-link
        >
      </div>

      <!-- 其他链接 -->
      <div class="submenu">
        <router-link to="/" class="mainitm"
          ><span>首页</span><span class="desktop"> / Home</span></router-link
        >
        <router-link to="/favorites"
          ><span>收藏</span><span class="desktop"> / Favorites</span></router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 无需额外逻辑
</script>

<style scoped lang="scss">
.classic-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 999;
}

.nav-container {
  width: 1800px;
  margin: 0 auto;
  padding: 0.5em 0;

  @media (max-width: 1800px) {
    width: 100%;
    padding: 0.5em 1em;
  }
}

.submenu {
  overflow: hidden;
  border-bottom: 1px solid #430;

  &:last-child {
    border: 0;
  }

  a,
  p {
    display: block;
    float: left;
    width: 8%;
    margin: 0 0 0 5%;
    padding: 0 2% 0 0;
    text-align: right;
    font:
      16px/2 微软雅黑,
      sans-serif;
    color: #aaa;
    transition: 0.3s;

    &:hover {
      color: #960;
    }
  }

  p {
    width: 8%;
    margin: 0;
    padding: 0 0 0 2%;
    text-align: left;
  }

  a.mainitm {
    color: #960;
  }

  @media (max-width: 1000px) {
    a,
    p {
      font:
        8px/2.5 微软雅黑,
        sans-serif;
    }
  }
}

.desktop {
  @media (max-width: 1000px) {
    display: none;
  }
}
</style>
