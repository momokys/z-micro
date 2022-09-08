<template>
  <div class="h-full flex ml-5">
    <span
      v-for="(app, index) in appStore.appList"
      :key="app.name"
      :class="{
        'text-gray-500': index !== appStore.activeindex,
        'border-transparent': index !== appStore.activeindex,
        'text-blue-400': index === appStore.activeindex,
        'border-blue-400': index === appStore.activeindex,
      }"
      class="h-full flex items-center mr-5 border-b-2 text-sm cursor-pointer duration-300 hover:text-blue-400"
      @click="onClick(index)"
    >
      <z-icon :icon="app.icon" />
      <span class="ml-1">{{ app.title }}</span>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { useApp } from '@/store'

const router = useRouter()
const route = useRoute()
const appStore = useApp()

const onClick = (index: number) => {
  appStore.setActiveApp(index)
  if (route.name !== 'Micro') {
    router.push({
      name: 'Micro'
    })
  }
}
</script>

<script lang="ts">
export default {
  name: 'NavMenu',
}
</script>
