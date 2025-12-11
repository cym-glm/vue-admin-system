<template>
  <div class="relative overflow-hidden">
    <img
      :src="placeholder"
      :alt="alt"
      class="w-full h-auto blur-md scale-105 transition-opacity duration-300"
      :class="{ 'opacity-0': loaded }"
    />
    <img
      ref="imgRef"
      :src="src"
      :srcset="srcset"
      :sizes="sizes"
      :alt="alt"
      loading="lazy"
      class="w-full h-auto transition-opacity duration-500"
      :class="{ 'opacity-0': !loaded }"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  srcset: { type: String, default: '' },
  sizes: { type: String, default: '' }
})

const loaded = ref(false)
const imgRef = ref(null)
let observer = null

const onLoad = () => { loaded.value = true }

onMounted(() => {
  const el = imgRef.value
  if (!('IntersectionObserver' in window) || !el) {
    el && el.addEventListener('load', onLoad, { once: true })
    return
  }
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        el.addEventListener('load', onLoad, { once: true })
        observer.disconnect()
      }
    })
  }, { threshold: 0.1 })
  observer.observe(el)
})

onBeforeUnmount(() => {
  observer && observer.disconnect()
})
</script>