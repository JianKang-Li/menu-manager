<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '../api';
import CategoryTabs from '../components/CategoryTabs.vue';
import DishCard from '../components/DishCard.vue';
import DishDetailModal from '../components/DishDetailModal.vue';

const dishes = ref([]);
const categories = ref([]);
const activeCat = ref(0); // 0 = 全部
const search = ref('');
const loading = ref(true);
const selected = ref(null);
const showDetail = ref(false);

const filtered = computed(() =>
  dishes.value.filter(
    (d) =>
      (activeCat.value === 0 || d.category_id === activeCat.value) &&
      (!search.value || d.name.toLowerCase().includes(search.value.toLowerCase()))
  )
);

const openDetail = (dish) => {
  selected.value = dish;
  showDetail.value = true;
};

onMounted(async () => {
  try {
    const [d, c] = await Promise.all([api.get('/dishes'), api.get('/categories')]);
    dishes.value = d.data;
    categories.value = c.data;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-5">
    <CategoryTabs :categories="categories" v-model="activeCat" />

    <div class="flex justify-end mb-4">
      <input v-model="search" class="input input-bordered input-sm w-full sm:w-56" placeholder="🔍 搜索菜名…" />
    </div>

    <div v-if="loading" class="flex justify-center py-16"><span class="loading loading-spinner loading-lg text-primary"></span></div>

    <div v-else-if="filtered.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <DishCard v-for="d in filtered" :key="d.id" :dish="d" @click="openDetail(d)" />
    </div>

    <div v-else class="text-center py-20 opacity-50">
      <div class="text-5xl mb-3">🍽️</div>
      还没有菜品，去「管理」里添加吧
    </div>

    <DishDetailModal v-model="showDetail" :dish-id="selected?.id" />
  </div>
</template>
