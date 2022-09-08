<template>
  <transition name="fade-transform" mode="out-in" appear>
    <keep-alive>
      <component :is="com" />
    </keep-alive>
    <!-- <component :is="com" /> -->
  </transition>
</template>

<script lang="ts">
import { defineComponent, PropType, onBeforeUpdate } from 'vue'
export default defineComponent({
  name: 'ZView',
  props: {
    com: {
      type: Object as PropType<any>,
      required: true,
    },
  },
  beforeRouteEnter() {
    // console.log(to)
  },
  setup() {
    onBeforeUpdate(() => {
      // console.log(props.com)
    })
  },
})
</script>
