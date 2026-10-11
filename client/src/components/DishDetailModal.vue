<script setup>
import { ref, watch } from 'vue';
import { api } from '../api';

const show = defineModel({ type: Boolean, default: false });
const props = defineProps({ dishId: { type: Number, default: null } });

const detail = ref(null);
const loading = ref(false);

watch([show, () => props.dishId], async ([s]) => {
  if (s && props.dishId) {
    loading.value = true;
    try {
      const { data } = await api.get(`/dishes/${props.dishId}`);
      detail.value = data;
    } finally {
      loading.value = false;
    }
  }
});

const steps = () => (detail.value?.steps || '').split('\n').filter(Boolean);
</script>

<template>
  <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': show }">
    <div class="modal-box max-w-lg">
      <div v-if="loading" class="flex justify-center py-10"><span class="loading loading-spinner loading-lg text-primary"></span></div>
      <template v-else-if="detail">
        <div class="flex justify-between items-start gap-3">
          <h3 class="font-bold text-xl">{{ detail.name }}
            <span v-if="detail.category_name" class="badge badge-warning badge-outline badge-sm ml-1 align-middle">{{ detail.category_name }}</span>
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="show = false">✕</button>
        </div>
        <p v-if="detail.description" class="text-sm opacity-60 mt-1">{{ detail.description }}</p>

        <img v-if="detail.image_url" :src="detail.image_url" class="rounded-xl mt-3 w-full max-h-60 object-cover" />

        <h4 class="font-bold text-primary mt-4 mb-2 pl-2 border-l-4 border-primary">所需材料</h4>
        <table class="table table-sm">
          <thead><tr><th>材料</th><th class="text-right">用量</th><th class="text-right">单价</th><th class="text-right">小计</th></tr></thead>
          <tbody>
            <tr v-for="m in detail.materials" :key="m.material_id">
              <td>{{ m.name }}</td>
              <td class="text-right">{{ m.quantity }} {{ m.unit }}</td>
              <td class="text-right opacity-60">¥{{ m.unit_price }}/{{ m.unit }}</td>
              <td class="text-right">¥{{ m.subtotal.toFixed(2) }}</td>
            </tr>
            <tr v-if="!detail.materials.length"><td colspan="4" class="text-center opacity-50">未录入材料</td></tr>
          </tbody>
        </table>

        <template v-if="steps().length">
          <h4 class="font-bold text-primary mt-4 mb-2 pl-2 border-l-4 border-primary">制作流程</h4>
          <ol class="list-none space-y-1 text-sm leading-relaxed">
            <li v-for="(s, i) in steps()" :key="i">{{ s }}</li>
          </ol>
        </template>

        <div class="mt-5 bg-base-200 rounded-xl px-4 py-3 flex justify-between items-center">
          <span class="text-sm">预估花销
            <span class="opacity-50 text-xs">{{ detail.estimated_price != null ? '（手填）' : '（按材料自动计算）' }}</span>
          </span>
          <b class="text-primary text-xl">¥ {{ (detail.estimated_price ?? detail.computed_cost).toFixed(2) }}</b>
        </div>
      </template>
    </div>
    <form method="dialog" class="modal-backdrop" @click.prevent="show = false"><button type="button">close</button></form>
  </dialog>
</template>
