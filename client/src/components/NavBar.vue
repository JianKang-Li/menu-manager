<script setup>
import { useRouter, useRoute } from 'vue-router';
import { auth } from '../stores/auth';

const router = useRouter();
const route = useRoute();

const isManage = () => route.path.startsWith('/manage');

const logout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<template>
  <!-- 桌面端顶部导航 -->
  <div class="navbar bg-primary text-primary-content px-4 hidden md:flex">
    <span class="text-xl font-bold">🍳 我的菜单</span>
    <nav class="ml-6 flex gap-1">
      <router-link to="/" class="btn btn-ghost btn-sm" :class="{ 'bg-white/25': !isManage() }">菜单</router-link>
      <router-link to="/manage/dishes" class="btn btn-ghost btn-sm" :class="{ 'bg-white/25': isManage() }">管理</router-link>
    </nav>
    <div class="ml-auto flex items-center gap-2">
      <span class="text-sm opacity-90">{{ auth.username }}</span>
      <button class="btn btn-ghost btn-sm" @click="logout">退出</button>
    </div>
  </div>

  <!-- 手机端顶部简化条 -->
  <div class="navbar bg-primary text-primary-content px-4 md:hidden">
    <span class="text-lg font-bold">🍳 我的菜单</span>
    <button class="btn btn-ghost btn-sm ml-auto" @click="logout">退出</button>
  </div>

  <!-- 手机端底部标签栏 -->
  <div class="btm-nav btm-nav-md bg-base-100 border-t border-base-300 md:hidden">
    <router-link to="/" class="text-primary" :class="{ active: !isManage() }">
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h10"/></svg>
      <span class="text-xs">菜单</span>
    </router-link>
    <router-link to="/manage/dishes" class="text-primary" :class="{ active: isManage() }">
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      <span class="text-xs">管理</span>
    </router-link>
  </div>
</template>
