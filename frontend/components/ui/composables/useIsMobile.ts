import { ref, onMounted, onUnmounted } from 'vue'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const isMobile = ref<boolean | undefined>(undefined)

  onMounted(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
    }
    mql.addEventListener('change', onChange)
    isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
    onUnmounted(() => {
      mql.removeEventListener('change', onChange)
    })
  })

  return isMobile
}
