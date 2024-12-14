<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

const SECONDS_IN_ONE_DAY = 24 * 60 * 60
const MARKER_SIZE = '2rem'
const position = ref(0)

const clocks = reactive<Record<string, Temporal.ZonedDateTime>>({
  'Europe/Madrid':
    Temporal.Now.zonedDateTimeISO().withTimeZone('Europe/Madrid'),
  'America/New_York':
    Temporal.Now.zonedDateTimeISO().withTimeZone('America/New_York'),
})

const newClockTimezone = ref('')

const updateClocks = () => {
  Object.keys(clocks).forEach((e) => {
    clocks[e] = Temporal.Now.zonedDateTimeISO().withTimeZone(e)
  })
}

const onNewClock = () => {
  const clock = Temporal.Now.zonedDateTimeISO().withTimeZone(
    newClockTimezone.value,
  )
  clocks[newClockTimezone.value] = clock
}

onMounted(() => {
  setInterval(updateClocks, 5000)

  // let delta = 1
  // setInterval(() => {
  //   if (position.value >= 100) {
  //     delta = -1
  //   } else if (position.value <= 0) {
  //     delta = 1
  //   }

  //   position.value = Math.max(0, Math.min(position.value + delta * 6, 100))
  // }, 100)
})
</script>

<template>
  <div class="m-10">
    <div>
      <form @submit.prevent="onNewClock">
        <input type="text" v-model="newClockTimezone" />
      </form>
      <div class="flex flex-col">
        <span v-for="(clock, timezone) in clocks" :key="clock.toString()"
          >{{ clock.toString() }} -
          {{ clock.since(clock.startOfDay()).total('seconds') }}</span
        >
      </div>
    </div>
    <div class="flex flex-col *:flex-1">
      <div class="flex *:flex-1 *:border bg-blue-400 text-center">
        <span v-for="i in Array.from({ length: 24 }).map((_, i) => i)">{{
          i.toString().padStart(2, '0')
        }}</span>
      </div>
      <div
        class="bg-red-800 w-full flex items-center"
        :style="`//padding-right: ${MARKER_SIZE}`"
        v-for="(clock, timezone) in clocks"
        :key="timezone"
      >
        <div
          class="h-8 bg-amber-300 flex items-center justify-center transition-all relative before:absolute before:border-4 before:bottom-full before:left-0 before:border-amber-300 before:border-t-transparent before:border-r-transparent"
          :title="clock.toLocaleString()"
          :style="`
          margin-left: ${(clock.since(clock.startOfDay()).total('seconds') / SECONDS_IN_ONE_DAY) * 100}%;
          min-width: ${MARKER_SIZE};
        `"
        >
          {{ timezone === 'Europe/Madrid' ? '🇪🇸' : '🇺🇸' }}
        </div>
      </div>
    </div>
  </div>
</template>
