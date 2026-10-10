<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api, errMsg } from '../api';
import { auth } from '../stores/auth';

const router = useRouter();
const password = ref('');
const loading = ref(false);
const error = ref('');

const submit = async () => {
  if (!password.value) return;
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.post('/auth/login', { password: password.value });
    auth.login(data.token);
    router.push('/');
  } catch (err) {
    error.value = errMsg(err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-200 via-base-300 to-base-200">
    <div class="card bg-base-100 shadow-xl w-full max-w-sm">
      <div class="card-body gap-4">
        <h1 class="text-2xl font-bold text-center">🍳 我的菜单</h1>
        <p class="text-sm text-center opacity-60">请输入密码登录</p>
        <form @submit.prevent="submit" class="flex flex-col gap-3">
          <input
            v-model="password"
            type="password"
            class="input input-bordered w-full"
            placeholder="密码"
            autofocus
          />
          <div v-if="error" class="alert alert-error py-2 text-sm">{{ error }}</div>
          <button class="btn btn-primary" :class="{ loading }" :disabled="loading || !password">
            登录
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
