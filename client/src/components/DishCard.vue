<script setup>
defineProps({ dish: { type: Object, required: true } });

const displayPrice = (d) => {
  if (d.estimated_price != null) return { text: `¥${d.estimated_price.toFixed(2)}`, label: '手填价' };
  return { text: `¥${d.computed_cost.toFixed(2)}`, label: '计算成本' };
};
</script>

<template>
  <div class="card bg-base-100 shadow cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all">
    <figure class="h-36 bg-base-300 overflow-hidden">
      <img v-if="dish.image_url" :src="dish.image_url" class="h-full w-full object-cover" loading="lazy" />
      <span v-else class="text-5xl">🍳</span>
    </figure>
    <div class="card-body p-4 gap-1">
      <div class="flex items-center justify-between gap-2">
        <h2 class="card-title text-base">{{ dish.name }}</h2>
        <span v-if="dish.category_name" class="badge badge-sm badge-warning badge-outline">{{ dish.category_name }}</span>
      </div>
      <p class="text-sm opacity-60 line-clamp-2">{{ dish.description || '　' }}</p>
      <div class="text-primary font-bold">
        {{ displayPrice(dish).text }}
        <span class="text-xs font-normal opacity-50 ml-1">{{ displayPrice(dish).label }}</span>
      </div>
    </div>
  </div>
</template>
