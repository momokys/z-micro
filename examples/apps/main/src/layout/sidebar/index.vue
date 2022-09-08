<template>
  <el-scrollbar>
    <z-menu
      :router="true"
      :menus="menuTrees"
      :default-active="route.path"
      :default-openeds="openedList"
      :collapse="!Sidebar.opened"
    />
  </el-scrollbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSetting, useApp } from '@/store'
import { ZMenu } from './menu'

const route = useRoute()
const openedList = computed(() => route.matched.map((item) => item.path))

const setting = useSetting()
const Sidebar = computed(() => setting.sidebar)

const appStore = useApp()
const menuTrees = computed(() => appStore.activeApp.menus ?? [])
</script>
