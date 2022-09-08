<template>
  <el-scrollbar>
    <micro-container ref="elRef" :active="appStore.activeApp.name">
      <micro-app v-for="app in appStore.appList" :key="app.name" :name="app.name" :host="app.host" />
    </micro-container>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { useApp } from '@/store'
import { MicroContainer } from '@zan-micro/core'

const appStore = useApp()

const elRef = ref<MicroContainer>()

onMounted(() => {
  console.log(elRef.value)
})
</script>

<script lang="ts">
export default {
  name: 'Micro',
}
</script>
