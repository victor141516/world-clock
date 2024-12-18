import { onMounted, onUnmounted, Ref, ref, watch } from 'vue'

class ReactiveURL {
  hash: string
  host: string
  hostname: string
  href: string
  pathname: string
  port: string
  protocol: string
  searchParams: Record<string, { toString: () => string }>

  constructor(data: Location) {
    this.hash = data.hash
    this.host = data.host
    this.hostname = data.hostname
    this.href = data.href
    this.pathname = data.pathname
    this.port = data.port
    this.protocol = data.protocol
    this.searchParams = Object.fromEntries(
      new URLSearchParams(data.search).entries(),
    )
  }

  toString() {
    const url = new URL(window.location.toString())
    Object.entries(this).forEach(([k, v]) => {
      if (k === 'searchParams') return
      url[k as keyof Omit<ReactiveURL, 'searchParams'>] = v
    })
    url.search = new URLSearchParams(
      Object.entries(this.searchParams) as [string, string][],
    ).toString()

    return url.href.replace(url.origin, '')
  }
}

export const useUrl = ({ replace } = { replace: false }) => {
  const url = ref() as Ref<ReactiveURL>
  const onUrlChange = () => {
    url.value = new ReactiveURL(window.location as any)
  }
  onUrlChange()

  watch(
    () => Object.entries(url.value),
    () => {
      if (replace) {
        history.replaceState({}, '', url.value.toString())
      } else {
        history.pushState({}, '', url.value.toString())
      }
    },
  )

  onMounted(() => {
    window.addEventListener('popstate', onUrlChange)
    window.addEventListener('hashchange', onUrlChange)
  })

  onUnmounted(() => {
    window.removeEventListener('popstate', onUrlChange)
    window.removeEventListener('hashchange', onUrlChange)
  })

  return url
}
