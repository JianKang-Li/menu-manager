<script setup>
import { ref } from 'vue';
import { api, errMsg } from '../api';

const show = defineModel({ type: Boolean, default: false });

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const ok = ref(false);
const saving = ref(false);

const submit = async () => {
  error.value = '';
  ok.value = false;
  if (newPassword.value !== confirmPassword.value) return (error.value = '两次输入的新密码不一致');
  if (newPassword.value.length < 6) return (error.value = '新密码至少 6 位');
  saving.value = true;
  try {
    await api.post('/auth/change-password', { oldPassword: oldPassword.value, newPassword: newPassword.value });
    ok.value = true;
    oldPassword.value = newPassword.value = confirmPassword.value = '';
  } catch (err) {
    error.value = errMsg(err);
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': show }">
    <div class="modal-box max-w-sm">
      <h3 class="font-bold text-lg mb-3">修改密码</h3>
      <form @submit.prevent="submit" class="flex flex-col gap-3">
        <input v-model="oldPassword" type="password" class="input input-bordered input-sm" placeholder="旧密码" />
        <input v-model="newPassword" type="password" class="input input-bordered input-sm" placeholder="新密码（至少 6 位）" />
        <input v-model="confirmPassword" type="password" class="input input-bordered input-sm" placeholder="确认新密码" />
        <div v-if="error" class="alert alert-error py-2 text-sm">{{ error }}</div>
        <div v-if="ok" class="alert alert-success py-2 text-sm">密码已修改</div>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="show = false">关闭</button>
          <button class="btn btn-primary" :class="{ loading: saving }" :disabled="saving">保存</button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop" @click.prevent="show = false"><button type="button">close</button></form>
  </dialog>
</template>
