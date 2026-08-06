<template>
  <img
    ref="imgElement"
    :src="src"
    :alt="alt"
    :class="{ loaded: isLoaded, error: error }"
    class="lazy-image"
  />
</template>

<script setup lang="ts">
import { useLazyImage } from '@/composables/useLazyImage'

const props = defineProps<{
  src: string
  alt: string
  placeholder?: string
}>()

// @ts-expect-error imgElement is used via template ref
const { src, isLoaded, error, imgElement } = useLazyImage(props.src, props.placeholder)
</script>

<style scoped lang="scss">
.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.3s ease;
  opacity: 0;

  &.loaded {
    opacity: 1;
  }

  &.error {
    opacity: 0.5;
  }
}
</style>
