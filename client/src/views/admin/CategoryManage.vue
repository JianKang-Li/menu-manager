<script setup>
import { ref, onMounted } from 'vue';
import { api, errMsg } from '../../api';

const categories = ref([]);
const loading = ref(true);
const error = ref('');
const newName = ref('');
const editId = ref(null);
const editName = ref('');

const load = async () => {
  loading.value = true;
  try {
    categories.value = (await api.get('/categories')).data;
  } catch (err) {
    error.value = errMsg(err);
  } finally {
    loading.value = false;
  }
};

const add = async () => {
  if (!newName.value.trim()) return;
  try {
    await api.post('/categories', { name: newName.value.trim() });
    newName.value = '';
    load();
  } catch (err) {
    error.value = errMsg(err);
  }
};

const startEdit = (c) => {
  editId.value = c.id;
  editName.value = c.name;
};
const saveEdit = async () => {
  if (!editName.value.trim()) return;
  await api.put(`/categories/${editId.value}`, { name: editName.value.trim() });
  editId.value = null;
  load();
};

const remove = async (c) => {
  if (!confirm(`删除分类「${c.name}」？（其下 ${c.dish_count} 个菜品将变为未分类）`)) return;
  await api.delete(`/categories/${c.id}`);
  load();
};

onMounted(load);
</script>

<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body p-4 sm:p-6">
      <h2 class="font-bold mb-3">分类管理</h2>
      <div v-if="error" class="alert alert-error text-sm py-2">{{ error }}</div>

      <div class="flex gap-2 mb-4">
        <input v-model="newName" class="input input-bordered input-sm flex-1" placeholder="新分类名" @keyup.enter="add" />
        <button class="btn btn-primary btn-sm" @click="add">＋ 添加</button>
      </div>

      <div v-if="loading" class="flex justify-center py-10"><span class="loading loading-spinner text-primary"></span></div>

      <table v-else class="table table-sm">
        <thead><tr><th>分类名</th><th class="text-right">菜品数</th><th class="text-right">操作</th></tr></thead>
        <tbody>
          <tr v-for="c in categories" :key="c.id" class="hover:bg-base-200/50">
            <td>
              <template v-if="editId === c.id">
                <input v-model="editName" class="input input-bordered input-xs w-32" @keyup.enter="saveEdit" />
              </template>
              <template v-else><span class="font-medium">{{ c.name }}</span></template>
            </td>
            <td class="text-right">{{ c.dish_count }}</td>
            <td class="text-right whitespace-nowrap">
              <template v-if="editId === c.id">
                <button class="btn btn-ghost btn-xs" @click="saveEdit">保存</button>
                <button class="btn btn-ghost btn-xs" @click="editId = null">取消</button>
              </template>
              <template v-else>
                <button class="btn btn-ghost btn-xs" @click="startEdit(c)">编辑</button>
                <button class="btn btn-ghost btn-xs text-error" @click="remove(c)">删除</button>
              </template>
            </td>
          </tr>
          <tr v-if="!categories.length"><td colspan="3" class="text-center opacity-50 py-8">还没有分类</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
