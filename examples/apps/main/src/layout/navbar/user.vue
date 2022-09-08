<template>
  <el-dropdown @command="handleCommand">
    <span class="flex items-center hover:text-blue-400 cursor-pointer">
      <el-avatar :size="24" :src="avatarUrl" />
      <span class="ml-3">{{ user.info.userName }}</span>
      <el-icon><caret-bottom /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="user"> 个人中心 </el-dropdown-item>
        <el-dropdown-item command="logout"> 退出登录 </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useUser } from '@/store'
import routeConfig from '@/config/route'
import avatarUrl from '@/assets/image/avatar.gif'

const router = useRouter()
const user = useUser()

function handleCommand(command: string) {
  switch (command) {
    case 'logout':
      user.logout().finally(() => {
        router.push({
          name: routeConfig.loginName,
        })
      })
      break
  }
}
</script>
