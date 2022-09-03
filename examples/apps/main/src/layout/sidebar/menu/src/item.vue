<template>
  <template v-if="hasChild(item)">
    <el-sub-menu :index="item.path" class="nest-menu">
      <template #title>
        <z-icon :icon="item.icon" />
        <span>{{ item.menuName }}</span>
      </template>
      <side-menu-item v-for="child in item.children" :key="child.path" :item="child" :is-nest="true" />
    </el-sub-menu>
  </template>
  <template v-else>
    <el-menu-item :index="item.path" :class="{ 'nest-menu': isNest }">
      <template v-if="collapse">
        <el-tooltip :content="item.menuName" :offset="32" placement="right">
          <z-icon :icon="item.icon" />
          <span>{{ item.menuName }}</span>
        </el-tooltip>
      </template>
      <template v-else>
        <z-icon :icon="item.icon" />
        <span>{{ item.menuName }}</span>
      </template>
    </el-menu-item>
  </template>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { isEmpty } from 'lodash'
import { MenuItemType } from '@/store'

defineProps({
  item: {
    type: Object as PropType<MenuItemType>,
    required: true,
  },
  isNest: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  collapse: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
})

function hasChild(item: MenuItemType) {
  return !isEmpty(item.children)
}
</script>

<script lang="ts">
export default {
  name: 'SideMenuItem',
}
</script>
