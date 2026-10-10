<script setup>
const props = defineProps({
  categories: { type: Array, default: () => [] },
  modelValue: { type: Number, default: 0 },
});
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="flex gap-2 flex-wrap mb-3">
    <button
      class="btn btn-sm rounded-full"
      :class="modelValue === 0 ? 'btn-primary' : 'btn-outline'"
      @click="emit('update:modelValue', 0)"
    >全部</button>
    <button
      v-for="c in categories"
      :key="c.id"
      class="btn btn-sm rounded-full"
      :class="modelValue === c.id ? 'btn-primary' : 'btn-outline'"
      @click="emit('update:modelValue', c.id)"
    >{{ c.name }}</button>
  </div>
</template>
