<script setup>
import { ref, computed, watch } from 'vue';
import { api, errMsg } from '../api';

const show = defineModel({ type: Boolean, default: false });
const props = defineProps({
  dish: { type: Object, default: null }, // null = 新增
  categories: { type: Array, default: () => [] },
  materials: { type: Array, default: () => [] },
});
const emit = defineEmits(['saved']);

const blank = () => ({
  name: '',
  category_id: null,
  description: '',
  steps: '',
  image_url: '',
  estimated_price: '',
  materials: [{ material_id: null, quantity: '' }],
});

const form = ref(blank());
const error = ref('');
const saving = ref(false);
const uploading = ref(false);
const fileInput = ref(null);

watch([show, () => props.dish], ([s]) => {
  if (!s) return;
  error.value = '';
  if (props.dish) {
    form.value = {
      ...props.dish,
      estimated_price: props.dish.estimated_price ?? '',
      materials: props.dish.materials?.length
        ? props.dish.materials.map((m) => ({ material_id: m.material_id, quantity: m.quantity }))
        : [{ material_id: null, quantity: '' }],
    };
  } else {
    form.value = blank();
  }
});

const matById = (id) => props.materials.find((m) => m.id === id);
const rowSubtotal = (row) => {
  const m = matById(row.material_id);
  return (Number(row.quantity) || 0) * (m?.unit_price || 0);
};
const computedCost = computed(() => form.value.materials.reduce((s, r) => s + rowSubtotal(r), 0));

const addRow = () => form.value.materials.push({ material_id: null, quantity: '' });
const removeRow = (i) => {
  form.value.materials.splice(i, 1);
  if (!form.value.materials.length) addRow();
};

const pickImage = () => fileInput.value?.click();

const uploadImage = async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  uploading.value = true;
  error.value = '';
  try {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post('/upload', fd);
    form.value.image_url = data.url;
  } catch (err) {
    error.value = errMsg(err);
  } finally {
    uploading.value = false;
  }
};

const removeImage = () => (form.value.image_url = '');

const save = async () => {
  error.value = '';
  if (!form.value.name.trim()) return (error.value = '菜品名不能为空');
  if (form.value.materials.some((m) => !m.material_id)) return (error.value = '有材料行未选择材料');
  saving.value = true;
  try {
    const payload = { ...form.value, estimated_price: form.value.estimated_price === '' ? null : form.value.estimated_price };
    if (props.dish) await api.put(`/dishes/${props.dish.id}`, payload);
    else await api.post('/dishes', payload);
    show.value = false;
    emit('saved');
  } catch (err) {
    error.value = errMsg(err);
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': show }">
    <div class="modal-box max-w-xl">
      <h3 class="font-bold text-lg">{{ dish ? '编辑菜品' : '新增菜品' }}</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mt-3">
        <label class="form-control">
          <span class="label-text mb-1 text-sm opacity-60">菜品名称 *</span>
          <input v-model="form.name" class="input input-bordered input-sm" placeholder="如：番茄炒蛋" />
        </label>
        <label class="form-control">
          <span class="label-text mb-1 text-sm opacity-60">分类</span>
          <select v-model="form.category_id" class="select select-bordered select-sm">
            <option :value="null">未分类</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </label>
      </div>

      <label class="form-control mt-3">
        <span class="label-text mb-1 text-sm opacity-60">简介</span>
        <input v-model="form.description" class="input input-bordered input-sm" placeholder="一句话介绍" />
      </label>

      <label class="form-control mt-3">
        <span class="label-text mb-1 text-sm opacity-60">制作流程（每行一步）</span>
        <textarea v-model="form.steps" class="textarea textarea-bordered" rows="4" placeholder="第一步…&#10;第二步…"></textarea>
      </label>

      <!-- 图片 -->
      <div class="mt-3">
        <span class="text-sm opacity-60">菜品图片</span>
        <div class="flex items-center gap-3 mt-1">
          <img v-if="form.image_url" :src="form.image_url" class="h-16 w-24 rounded-lg object-cover" />
          <div v-if="form.image_url" class="btn btn-sm btn-ghost text-error" @click="removeImage">移除</div>
          <button class="btn btn-sm btn-outline" :class="{ loading: uploading }" :disabled="uploading" @click="pickImage">
            {{ form.image_url ? '换一张' : '上传图片' }}
          </button>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="uploadImage" />
        </div>
      </div>

      <!-- 材料行 -->
      <h4 class="font-bold text-primary mt-4 mb-2 pl-2 border-l-4 border-primary text-sm">所需材料</h4>
      <div v-for="(row, i) in form.materials" :key="i" class="flex items-center gap-2 mb-2">
        <select v-model="row.material_id" class="select select-bordered select-sm flex-1 min-w-0">
          <option :value="null" disabled>选择材料</option>
          <option v-for="m in materials" :key="m.id" :value="m.id">
            {{ m.name }}（¥{{ m.unit_price }}/{{ m.unit }}）
          </option>
        </select>
        <input v-model="row.quantity" type="number" min="0" step="any" class="input input-bordered input-sm w-20" placeholder="用量" />
        <span class="text-xs opacity-50 w-14 text-right shrink-0">¥{{ rowSubtotal(row).toFixed(2) }}</span>
        <button class="btn btn-ghost btn-sm btn-circle text-error" @click="removeRow(i)">✕</button>
      </div>
      <button class="btn btn-xs btn-outline" @click="addRow">＋ 添加材料</button>

      <!-- 成本 -->
      <div class="mt-4 bg-base-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span class="text-sm opacity-60">计算成本</span>
        <b class="text-primary text-lg">¥ {{ computedCost.toFixed(2) }}</b>
        <span class="text-sm opacity-60 sm:ml-auto">手填预估价</span>
        <input v-model="form.estimated_price" type="number" min="0" step="0.5" class="input input-bordered input-sm w-28" placeholder="留空用计算值" />
      </div>

      <div v-if="error" class="alert alert-error text-sm py-2 mt-3">{{ error }}</div>

      <div class="modal-action">
        <button class="btn btn-ghost" @click="show = false">取消</button>
        <button class="btn btn-primary" :class="{ loading: saving }" :disabled="saving" @click="save">保存</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click.prevent="show = false"><button type="button">close</button></form>
  </dialog>
</template>
