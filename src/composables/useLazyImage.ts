import { ref, onMounted, onUnmounted } from 'vue'

export function useLazyImage(imageSrc: string, placeholder = '') {
  const src = ref(placeholder)
  const isLoaded = ref(false)
  const error = ref(false)
  const imgElement = ref<HTMLImageElement | null>(null)

  let observer: IntersectionObserver | null = null

  const loadImage = () => {
    const img = new Image()

    img.onload = () => {
      src.value = imageSrc
      isLoaded.value = true
    }

    img.onerror = () => {
      error.value = true
      src.value = placeholder || '/icons/placeholder.webp'
    }

    img.src = imageSrc
  }

  onMounted(() => {
    if (!imgElement.value) return

    // 检查浏览器是否支持 IntersectionObserver
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage()
              if (observer && imgElement.value) {
                observer.unobserve(imgElement.value)
              }
            }
          })
        },
        {
          rootMargin: '50px' // 提前50px开始加载
        }
      )

      observer.observe(imgElement.value)
    } else {
      // 不支持则直接加载
      loadImage()
    }
  })

  onUnmounted(() => {
    if (observer && imgElement.value) {
      observer.unobserve(imgElement.value)
    }
  })

  return {
    src,
    isLoaded,
    error,
    imgElement
  }
}
