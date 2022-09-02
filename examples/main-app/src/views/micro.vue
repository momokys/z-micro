<template>
  <div class="micro">
    <micro-container :active="app.activeApp">
      <micro-app name="vue3" host="http://localhost:7500" uri="" keepAlive="true" />
      <micro-app name="preview" host="http://127.0.0.1:4173" uri="" keepAlive="true" />
    </micro-container>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores'
const app = useAppStore()
</script>

<style>
@media (min-width: 1024px) {
  .micro {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
