<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useUrl } from './composables/useUrl'
import {
  fromUrlSafe as timezoneFromUrlSafe,
  toUrlSafe as timezoneToUrlSafe,
} from './libs/timezones'
import { LIST } from './libs/timezones-list'

const url = useUrl()

const SECONDS_IN_ONE_DAY = 24 * 60 * 60

const MARKER_COLORS = [
  'bg-amber-300 before:border-amber-300',
  'bg-rose-300 before:border-rose-300',
]

const myTimezone = Temporal.Now.zonedDateTimeISO().timeZoneId

const clocks = reactive<Record<string, Temporal.ZonedDateTime>>({
  [myTimezone]: Temporal.Now.zonedDateTimeISO(),
  // 'Europe/Madrid':
  //   Temporal.Now.zonedDateTimeISO().withTimeZone('Europe/Madrid'),
  // 'America/New_York':
  //   Temporal.Now.zonedDateTimeISO().withTimeZone('America/New_York'),
})
const selectedHours = ref<boolean[]>(
  Array.from({ length: 24 }).fill(false) as boolean[],
)

const addClock = (tz: string) => {
  clocks[tz] = Temporal.Now.zonedDateTimeISO().withTimeZone(tz)
}

const newClockTimezone = ref('')

const updateClocks = () => {
  Object.keys(clocks).forEach((e) => {
    clocks[e] = Temporal.Now.zonedDateTimeISO().withTimeZone(e)
  })
}

const clearClocks = () => {
  Object.keys(clocks).forEach((k) => delete clocks[k])
}

onMounted(() => {
  setInterval(updateClocks, 5000)
})

watch(
  url,
  () => {
    const [tzPart, hoursPart] = url.value.pathname.replace(/^\//, '').split('/')
    if (tzPart) {
      const timezones = timezoneFromUrlSafe(tzPart)
      clearClocks()
      timezones.forEach((tz) => addClock(tz))
    }
    if (hoursPart) {
      hoursPart
        .split(',')
        .map((e) => Number.parseInt(e))
        .forEach((e) => {
          selectedHours.value[e] = true
        })
    }
  },
  { immediate: true, once: true },
)

console.log(selectedHours)
watch(
  [clocks, selectedHours.value],
  () => {
    const tzPart = timezoneToUrlSafe(Object.keys(clocks))
    const hoursPart = selectedHours.value
      .map((e, i) => (e ? i : null))
      .filter((e) => e !== null)
      .join(',')
    url.value.pathname = `${tzPart}/${hoursPart}`
  },
  { immediate: true },
)
</script>

<template>
  <div class="m-10 flex flex-col gap-5">
    <div>
      <form @submit.prevent="() => addClock(newClockTimezone)">
        <input
          class="border"
          type="text"
          list="timezone-list"
          v-model="newClockTimezone"
          :placeholder="myTimezone"
        />
        <datalist class="border" id="timezone-list">
          <option v-for="tz of LIST" :value="tz">{{ tz }}</option>
        </datalist>
      </form>
    </div>
    <div class="flex flex-col">
      <div class="flex *:flex-1 text-center">
        <label
          class="flex border not-first:border-l-0 border-blue-950 has-checked:bg-blue-800 has-checked:text-blue-100 bg-blue-300 text-blue-950"
          :class="{ 'rounded-tl-lg': i === 0, 'rounded-tr-lg': i === 23 }"
          v-for="i in Array.from({ length: 24 }).map((_, i) => i)"
        >
          <input
            v-model="selectedHours[i]"
            class="peer"
            hidden
            type="checkbox"
          />
          <span class="flex-1 select-none xl:hidden">
            {{ i.toString().padStart(2, '0') }}
          </span>
          <span class="flex-1 select-none hidden xl:block">
            {{ i.toString().padStart(2, '0') }}:00
          </span>
        </label>
      </div>
      <div class="bg-blue-100 rounded-b-lg">
        <div
          class="w-full flex items-center"
          v-for="(clock, timezone, index) in clocks"
          :key="timezone"
        >
          <div
            class="px-1 min-w-8 h-8 mt-2 rounded-lg rounded-tl-none text-nowrap text-left text-xs flex items-center justify-center transition-all relative before:absolute before:border-4 before:bottom-full before:left-0 before:border-t-transparent before:border-r-transparent"
            :class="MARKER_COLORS[index % MARKER_COLORS.length]"
            :title="clock.toLocaleString()"
            :style="`
            margin-left: ${(clock.since(clock.startOfDay()).total('seconds') / SECONDS_IN_ONE_DAY) * 100}%;
          `"
          >
            <span
              class="w-px h-2 absolute left-0 -top-2"
              :class="MARKER_COLORS[index % MARKER_COLORS.length]"
              :style="`height: calc(2px + calc(var(--spacing) * 10 * ${index})); transform: translateY(calc(-100% + 2px))`"
            ></span>
            {{ timezone }} -
            {{
              clock
                .toPlainTime()
                .toString()
                .replace(/:[0-9]{2}\.[0-9]*$/, '')
            }}
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col">
      <span v-for="(clock, timezone) in clocks" :key="timezone"
        >{{ clock.toString() }} -
        {{ clock.since(clock.startOfDay()).total('seconds') }}</span
      >
    </div>
  </div>
</template>
