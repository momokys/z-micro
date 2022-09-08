<template>
  <el-icon :size="size" :color="color" @click="handleClick">
    <component v-if="name" :is="name" />
  </el-icon>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: '',
  },
  size: {
    type: Number,
    default: 18,
  },
  color: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits(['click'])

const reg1 = /^(\w+?-icon)-(.+$)/
const reg2 = /-(\w)/g

const prefix = computed(() => props.icon.trim().replace(reg1, '$1'))
const name = computed(() => {
  let _name = props.icon.replace(reg1, '$2')
  if (prefix.value === 'el' && prefix.value.length > 0) {
    _name = _name.trim().replace(reg2, function (all: string, letter: string) {
      return letter.toUpperCase()
    })
  }
  return _name
})

function handleClick(ev: MouseEvent) {
  emit('click', ev)
}
</script>

<script lang="ts">
export default {
  name: 'ZIcon',
}
</script>
