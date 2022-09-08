<template>
  <div class="h-screen w-screen flex justify-center" style="background-color: #2d3a4b">
    <div class="login-form w-96 pt-36">
      <h1 class="mb-10 text-white text-center text-2xl font-medium">MICRO APPS</h1>
      <el-form :model="loginForm" :rules="rules">
        <el-form-item prop="userName">
          <el-input v-model="loginForm.userName" prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="Lock" type="password" size="large" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="login">
            LOGIN
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import routeConfig from '@/config/route'
import { useUser } from '@/store'

const user = useUser()

const loading = ref<boolean>(false)

const loginForm = reactive({
  userName: 'momoky',
  password: '123456',
})

const rules = {
  userName: {
    required: true,
    message: '用户名不能为空',
    trigger: 'change',
  },
  password: {
    required: true,
    message: '密码不能为空',
    trigger: 'change',
  },
}

const router = useRouter()
async function login() {
  loading.value = true
  try {
    await user.login(loginForm)
    ElMessage.success('欢迎登录西裤')
    await router.push({
      name: routeConfig.homeName,
    })
  } finally {
    loading.value = false
  }
}
</script>

<script lang="ts">
export default {
  name: 'Login',
}
</script>

<style lang="scss">
.login-form {
  .el-input__wrapper {
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
    background-color: transparent !important;
    .el-input_inner {
      color: #fff !important;
      -webkit-appearance: none;
      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus,
      &:-webkit-autofill:active {
        background: none !important;
        -webkit-text-fill-color: #fff !important;
        transition: background-color 99999s ease-in-out 0s;
        -webkit-transition-delay: 99999s;
      }
    }
  }
}
</style>
