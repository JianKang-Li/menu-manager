<script setup>
import { ref, reactive, onMounted } from 'vue';
import { api, errMsg } from '../../api';

const materials = ref([]);
const loading = ref(true);
const error = ref('');
const showForm = ref(false);
const editing = ref(null);
const form = reactive({ name: '', unit: 'g', unit_price: '', remark: '' });

const load = async () => {
  loading.value = true;
  try {
    materials.value = (await api.get('/materials')).data;
  } catch (err) {
    error.value = errMsg(err);
  } finally {
    loading.value = false;
  }
};

const openNew = () => {
  editing.value = null;
  Object.assign(form, { name: '', unit: 'g', unit_price: '', remark: '' });
  showForm.value = true;
};
const openEdit = (m) => {
  editing.value = m;
  Object.assign(form, { name: m.name, unit: m.unit, unit_price: m.unit_price, remark: m.remark });
  showForm.value = true;
};

const save = async () => {
  error.value = '';
  if (!form.name.trim()) return (error.value = '材料名不能为空');
  try {
    if (editing.value) await api.put(`/materials/${editing.value.id}`, form);
    else await api.post('/materials', form);
    showForm.value = false;
    load();
  } catch (err) {
    error.value = errMsg(err);
  }
};

const remove = async (m) => {
  if (!confirm(`确定删除材料「${m.name}」？`)) return;
  try {
    await api.delete(`/materials/${m.id}`);
    load();
  } catch (err) {
    alert(errMsg(err));
  }
};

onMounted(load);
</script>

<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body p-4 sm:p-6">
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-bold">材料管理</h2>
        <button class="btn btn-primary btn-sm" @click="openNew">＋ 新增材料</button>
      </div>
      <div v-if="error" class="alert alert-error text-sm py-2">{{ error }}</div>

      <div v-if="loading" class="flex justify-center py-10"><span class="loading loading-spinner text-primary"></span></div>

      <div v-else class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr><th>材料名</th><th>单位</th><th class="text-right">单价 (元)</th><th class="hidden sm:table-cell">备注</th><th class="text-right">操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="m in materials" :key="m.id" class="hover:bg-base-200/50">
              <td class="font-medium">{{ m.name }}</td>
              <td>{{ m.unit }}</td>
              <td class="text-right">¥{{ m.unit_price }}</td>
              <td class="hidden sm:table-cell opacity-60">{{ m.remark }}</td>
              <td class="text-right whitespace-nowrap">
                <button class="btn btn-ghost btn-xs" @click="openEdit(m)">编辑</button>
                <button class="btn btn-ghost btn-xs text-error" @click="remove(m)">删除</button>
              </td>
            </tr>
            <tr v-if="!materials.length"><td colspan="5" class="text-center opacity-50 py-8">材料库为空，先录入常用材料</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showForm }">
    <div class="modal-box max-w-sm">
      <h3 class="font-bold text-lg mb-3">{{ editing ? '编辑材料' : '新增材料' }}</h3>
      <div class="flex flex-col gap-3">
        <input v-model="form.name" class="input input-bordered input-sm" placeholder="材料名，如：鸡蛋" />
        <div class="grid grid-cols-2 gap-3">
          <input v-model="form.unit" class="input input-bordered input-sm" placeholder="单位：g / 个 / ml" />
          <input v-model="form.unit_price" type="number" min="0" step="0.01" class="input input-bordered input-sm" placeholder="单价 (元)" />
        </div>
        <input v-model="form.remark" class="input input-bordered input-sm" placeholder="备注（可选）" />
        <div v-if="error" class="alert alert-error py-2 text-sm">{{ error }}</div>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showForm = false">取消</button>
          <button class="btn btn-primary" @click="save">保存</button>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click.prevent="showForm = false"><button type="button">close</button></form>
  </dialog>
</template>
