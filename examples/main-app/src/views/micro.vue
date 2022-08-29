<template>
  <div class="micro">
    <micro-container active="vue3">
      <micro-app name="vue3" host="http://localhost:7500" uri="" keepAlive="true" />
    </micro-container>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .micro {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
