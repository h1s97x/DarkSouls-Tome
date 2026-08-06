<template>
  <div class="classic-item-card" :class="langClass">
    <!-- 图标 -->
    <div class="icon">
      <LazyImage :src="iconPath" :alt="item.name.chn" />
    </div>

    <!-- 中文 -->
    <div class="chn">
      <div class="name">{{ item.name.chn }}</div>
      <div class="desc">
        <div class="desfrm">
          <p
            v-for="(line, index) in formatDescription(item.description.chn)"
            :key="index"
            v-html="line"
          ></p>
        </div>
      </div>
      <div v-if="item.remark?.chn" class="remk">
        <p v-html="formatText(item.remark.chn)"></p>
      </div>
    </div>

    <!-- 日文 -->
    <div class="jap">
      <div class="name">{{ item.name.jap }}</div>
      <div class="desc">
        <div class="desfrm">
          <p
            v-for="(line, index) in formatDescription(item.description.jap)"
            :key="index"
            v-html="line"
          ></p>
        </div>
      </div>
      <div v-if="item.remark?.jap" class="remk">
        <p v-html="formatText(item.remark.jap)"></p>
      </div>
    </div>

    <!-- 英文 -->
    <div class="eng">
      <div class="name">{{ item.name.eng }}</div>
      <div class="desc">
        <div class="desfrm">
          <p
            v-for="(line, index) in formatDescription(item.description.eng)"
            :key="index"
            v-html="line"
          ></p>
        </div>
      </div>
      <div v-if="item.remark?.eng" class="remk">
        <p v-html="formatText(item.remark.eng)"></p>
      </div>
    </div>

    <!-- 移动端语言切换 -->
    <div class="tab-switcher mobile">
      <div class="tab" @click="currentLang = 'c'">中文</div>
      <div class="tab" @click="currentLang = 'j'">日本語</div>
      <div class="tab" @click="currentLang = 'e'">English</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatGameText } from '@/utils/formatter'
import LazyImage from '@/components/common/LazyImage.vue'
import type { Item } from '@/types/item'

const props = defineProps<{
  item: Item
}>()

const currentLang = ref('c') // c=中文, j=日文, e=英文

const langClass = computed(() => `frame ${currentLang.value}`)

const iconPath = computed(() => `/icons/${props.item.icon}`)

const formatText = (text: string) => {
  return formatGameText(text || '')
}

const formatDescription = (text: string) => {
  if (!text) return ['']
  const formatted = formatGameText(text)
  return formatted.split('<br>').filter((line) => line.trim())
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/classic.scss';

.classic-item-card {
  @include classic-frame;
}

.icon {
  float: left;
  width: 10%;
  height: 1px;

  img {
    transform: translateY(-50%);
    margin: 14em 0 0;
    max-width: 120%;
  }
}

.chn,
.jap,
.eng {
  float: left;
  width: 28%;
  padding: 1%;
}

.eng {
  font-family: 'Palatino Linotype', serif;
}

.name {
  border-bottom: 1px solid #430;
  height: 2em;
  line-height: 2em;
  font-weight: 700;
  padding: 0;
}

.desc {
  border-bottom: 1px solid #430;
  height: 24em;
  padding: 0.25em 0;
}

.remk {
  border-bottom: 1px solid #430;
  height: 3em;
  padding: 0.25em 0;

  p {
    transform: translateY(-50%);
    margin: 1.5em 0;
  }
}

.desfrm {
  transform: translateY(-50%);
  margin: 12em 0;

  p {
    border-bottom: 1px solid #321;
    box-sizing: border-box;
    min-height: 1.5em;

    &:last-child {
      border-bottom: 0;
    }
  }
}

.tab-switcher {
  display: none;
}

// 移动端适配
@media screen and (max-width: 1000px) {
  .classic-item-card {
    font:
      8px/1.5 仿宋,
      SimSun,
      serif;
    margin: 0 0 10em;
  }

  .icon {
    float: none;
    width: 33%;
    height: auto;
    margin: auto;

    img {
      transform: translateY(0);
      margin: 0;
    }
  }

  .chn,
  .jap,
  .eng {
    width: 33% !important;
    padding: 5% 0;
    z-index: 1;
  }

  .desc {
    height: 38em;
  }

  .desfrm {
    margin: 19em 0;

    p {
      min-height: 2.5em;
      font-size: 1em;
    }
  }

  .remk p {
    transform: translateY(0);
    margin: 0;
  }

  .name,
  .desc,
  .remk,
  .desfrm {
    width: 300%;
    opacity: 0;
    transition: 0.3s;
  }

  .frame.c .chn,
  .frame.j .jap,
  .frame.e .eng {
    z-index: 2;
    position: relative;

    div {
      opacity: 1 !important;
    }
  }

  .jap > div {
    margin-left: -100% !important;
  }

  .eng > div {
    margin-left: -200% !important;
  }

  .tab-switcher {
    display: block;
    margin: 2em;
    line-height: 2;
    border: 1px solid #430;
    transition: 0.3s;
    overflow: hidden;

    .tab {
      float: left;
      width: 33.33%;
      cursor: pointer;
      transition: 0.3s;

      &:hover {
        background: rgba(153, 102, 0, 0.3);
      }
    }
  }

  .frame.c .chn .tab,
  .frame.j .jap .tab,
  .frame.e .eng .tab {
    background: #531;
  }
}

.mobile {
  @media (min-width: 1001px) {
    display: none;
  }
}
</style>
