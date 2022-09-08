<template>
  <micro-container :active="appStore.activeApp.name">
    <micro-app v-for="app in appStore.appList" :key="app.name" :host="app.host" />
  </micro-container>
</template>

<script setup lang="ts">
import { useApp } from '@/store'

const appStore = useApp()
</script>

<script lang="ts">
export default {
  name: 'Micro',
}
</script>
