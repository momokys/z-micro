<template>
  <div class="h-8 shadow">
    <el-scrollbar class="scroll-container">
      <tag
        v-for="view in VisitedViews"
        :key="view.fullPath"
        :view="view"
        :is-active="isActive(view)"
        :cancelable="!isAffix(view)"
        @click="openView(view)"
        @refresh="refreshView"
        @cancel="closeView(view)"
      >
        {{ view.title }}
      </tag>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useVisitedViews } from '@/store'
import Tag from './tag.vue'

const router = useRouter()
const route = useRoute()

const visitedViews = useVisitedViews()
const VisitedViews = computed(() => visitedViews.views)

onMounted(() => {
  addView(route)
})

watch([route], () => {
  addView(route)
})

function openView(view: any) {
  router.push(view)
}

function closeView(view: any) {
  const views = visitedViews.views
  const lastView = views[views.length - 1]
  let nextView = {} as { path: string }
  if (isActive(view)) {
    nextView = lastView.fullPath === view.fullPath ? views[views.length - 2] : lastView
    router.push(nextView)
  }
  visitedViews.del(view)
}

function addView(route: any) {
  if (route.meta && route.meta.title) {
    visitedViews.add({
      fullPath: route.fullPath,
      path: route.path,
      title: route.meta.title,
      query: route.query,
      params: route.params,
    })
  }
}

function refreshView() {
  router.replace('/refresh')
}

function isActive(view: any) {
  return view.fullPath === route.fullPath
}

function isAffix(view: any) {
  return view.path === '/home'
}
</script>

<style scoped lang="scss">
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
}
</style>
