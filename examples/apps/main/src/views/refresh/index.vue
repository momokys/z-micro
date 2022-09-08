<template>
  <div />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  beforeRouteEnter (to, form, next) {
    next(vm => {
      vm.$router.replace(form)
    })
  }
})
</script>
