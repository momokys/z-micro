<template>
  <micro-container :active="app.activeApp" style="width: 100%">
    <micro-app name="vue3" host="http://localhost:7500" />
    <micro-app name="preview" host="http://127.0.0.1:4173" />
    <micro-app name="repl" host="http://127.0.0.1:5174" />
  </micro-container>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores'
const app = useAppStore()
</script>
