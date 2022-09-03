<template>
  <el-menu
    :router="router"
    :collapse="collapse"
    :collapse-transition="true"
    :unique-opened="uniqueOpened"
    :default-active="defaultActive"
    :default-openeds="defaultOpeneds"
    :text-color="textColor"
    :active-text-color="activeTextColor"
    :background-color="backgroundColor"
    style="border-right: none"
  >
    <side-menu-item v-for="item in menus" :key="item.path" :item="item" :collapse="collapse" />
  </el-menu>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { MenuItemType } from '@/store'
import SideMenuItem from './item.vue'

defineProps({
  menus: {
    type: Array as PropType<MenuItemType[]>,
    required: true,
  },
  collapse: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  router: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  defaultActive: {
    type: String as PropType<string>,
    default: '',
  },
  defaultOpeneds: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  uniqueOpened: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  backgroundColor: {
    type: String as PropType<string>,
    default: '#304156',
  },
  textColor: {
    type: String as PropType<string>,
    default: '#bfcbd9',
  },
  activeTextColor: {
    type: String as PropType<string>,
    default: '#60a5fa',
  },
})
</script>

<script lang="ts">
export default {
  name: 'SideMenu',
}
</script>
