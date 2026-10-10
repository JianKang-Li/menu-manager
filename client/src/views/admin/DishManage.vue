<script setup>
import { ref, onMounted } from 'vue';
import { api, errMsg } from '../../api';
import DishForm from '../../components/DishForm.vue';

const dishes = ref([]);
const categories = ref([]);
const materials = ref([]);
const loading = ref(true);
const showForm = ref(false);
const editing = ref(null);
const error = ref('');

const load = async () => {
  loading.value = true;
  try {
    const [d, c, m] = await Promise.all([
      api.get('/dishes'),
      api.get('/categories'),
      api.get('/materials'),
    ]);
    dishes.value = d.data;
    categories.value = c.data;
    materials.value = m.data;
  } catch (err) {
    error.value = errMsg(err);
  } finally {
    loading.value = false;
  }
};

const openNew = () => {
  editing.value = null;
  showForm.value = true;
};
const openEdit = async (dish) => {
  const { data } = await api.get(`/dishes/${dish.id}`);
  editing.value = data;
  showForm.value = true;
};

const remove = async (dish) => {
  if (!confirm(`确定删除「${dish.name}」？`)) return;
  await api.delete(`/dishes/${dish.id}`);
  load();
};

const price = (d) =>
  d.estimated_price != null ? `¥${d.estimated_price.toFixed(2)}` : `¥${d.computed_cost.toFixed(2)}`;

onMounted(load);
</script>

<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body p-4 sm:p-6">
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-bold">菜品管理</h2>
        <button class="btn btn-primary btn-sm" @click="openNew">＋ 新增菜品</button>
      </div>
      <div v-if="error" class="alert alert-error text-sm py-2">{{ error }}</div>

      <div v-if="loading" class="flex justify-center py-10"><span class="loading loading-spinner text-primary"></span></div>

      <div v-else class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr><th>菜品</th><th class="hidden sm:table-cell">分类</th><th class="text-right">价格</th><th class="text-right">操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="d in dishes" :key="d.id" class="hover:bg-base-200/50">
              <td>
                <div class="flex items-center gap-3">
                  <img v-if="d.image_url" :src="d.image_url" class="h-9 w-12 rounded object-cover" />
                  <span v-else class="h-9 w-12 rounded bg-base-300 grid place-items-center text-lg">🍳</span>
                  <span class="font-medium">{{ d.name }}</span>
                </div>
              </td>
              <td class="hidden sm:table-cell">
                <span v-if="d.category_name" class="badge badge-sm badge-warning badge-outline">{{ d.category_name }}</span>
              </td>
              <td class="text-right text-primary font-semibold">{{ price(d) }}</td>
              <td class="text-right whitespace-nowrap">
                <button class="btn btn-ghost btn-xs" @click="openEdit(d)">编辑</button>
                <button class="btn btn-ghost btn-xs text-error" @click="remove(d)">删除</button>
              </td>
            </tr>
            <tr v-if="!dishes.length"><td colspan="4" class="text-center opacity-50 py-8">还没有菜品，点右上角新增</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <DishForm v-model="showForm" :dish="editing" :categories="categories" :materials="materials" @saved="load" />
</template>
