<template>
  <div class="h-screen">
    <el-container class="h-screen">
      <el-aside
        class="aside"
        :style="{ width: setting.sidebar.opened ? setting.sidebar.maxWidth : setting.sidebar.minWidth }"
      >
        <sidebar />
      </el-aside>
      <el-container>
        <el-header class="h-20 p-0">
          <navbar />
          <tags />
        </el-header>
        <el-main>
          <router-view :key="route.name" v-slot="{ Component }">
            <z-view :com="Component" />
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useSetting } from '@/store'
import Sidebar from './sidebar/index.vue'
import Navbar from './navbar/index.vue'
import Tags from './tags/index.vue'

const route = useRoute()
const setting = useSetting()
</script>

<script lang="ts">
export default {
  name: 'Layout',
}
</script>
