<script setup>
import { ref } from 'vue';
import { api, errMsg } from '../../api';

const importing = ref(false);
const importMsg = ref('');
const importError = ref('');
const fileInput = ref(null);

// 导出备份：带 token 下载
const backup = async () => {
  try {
    const res = await api.get('/backup', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `menu-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert(errMsg(err));
  }
};

const pickFile = () => fileInput.value?.click();

const importFile = async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  if (!confirm('导入会用备份文件替换当前全部数据，确定继续？')) return;
  importing.value = true;
  importMsg.value = importError.value = '';
  try {
    const text = await file.text();
    const { data } = await api.post('/backup', JSON.parse(text));
    importMsg.value = `导入成功：菜品 ${data.dishes} 个、材料 ${data.materials} 个`;
  } catch (err) {
    importError.value = err instanceof SyntaxError ? '文件不是有效的 JSON 备份' : errMsg(err);
  } finally {
    importing.value = false;
  }
};
</script>

<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body p-4 sm:p-6 gap-4">
      <h2 class="font-bold">备份与导入</h2>

      <div class="bg-base-200 rounded-xl p-4">
        <h3 class="font-semibold text-sm mb-1">导出备份</h3>
        <p class="text-xs opacity-60 mb-3">下载一个 JSON 文件，包含全部菜品、材料、分类及图片，可用于换机或恢复。</p>
        <button class="btn btn-primary btn-sm" @click="backup">⬇ 下载备份文件</button>
      </div>

      <div class="bg-base-200 rounded-xl p-4">
        <h3 class="font-semibold text-sm mb-1">导入恢复</h3>
        <p class="text-xs opacity-60 mb-3 text-warning">注意：导入会<b>替换</b>当前全部数据。</p>
        <button class="btn btn-outline btn-sm" :class="{ loading: importing }" :disabled="importing" @click="pickFile">⬆ 选择备份文件导入</button>
        <input ref="fileInput" type="file" accept=".json,application/json" class="hidden" @change="importFile" />
        <div v-if="importMsg" class="alert alert-success py-2 text-sm mt-3">{{ importMsg }}</div>
        <div v-if="importError" class="alert alert-error py-2 text-sm mt-3">{{ importError }}</div>
      </div>

      <div class="bg-base-200 rounded-xl p-4">
        <h3 class="font-semibold text-sm mb-1">提示</h3>
        <p class="text-xs opacity-60">除应用内备份外，服务器上所有数据都在 <code>data/</code> 目录（数据库 + 上传图片），直接备份该目录亦可。</p>
      </div>
    </div>
  </div>
</template>
