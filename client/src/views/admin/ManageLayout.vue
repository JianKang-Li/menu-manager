<script setup>
import { ref } from 'vue';
import ChangePasswordModal from '../../components/ChangePasswordModal.vue';

const showPwd = ref(false);
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-5">
    <!-- 手机端分类切换用横向滚动 -->
    <div class="flex items-center gap-1 mb-4 overflow-x-auto">
      <router-link to="/manage/dishes" class="btn btn-sm shrink-0" active-class="btn-primary">菜品</router-link>
      <router-link to="/manage/materials" class="btn btn-sm shrink-0" active-class="btn-primary">材料</router-link>
      <router-link to="/manage/categories" class="btn btn-sm shrink-0" active-class="btn-primary">分类</router-link>
      <router-link to="/manage/settings" class="btn btn-sm shrink-0" active-class="btn-primary">设置</router-link>
      <button class="btn btn-ghost btn-sm shrink-0 ml-auto" @click="showPwd = true">改密码</button>
    </div>
    <router-view />
    <ChangePasswordModal v-model="showPwd" />
  </div>
</template>
