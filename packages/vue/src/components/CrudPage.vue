<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NButton, NSpace, NModal, NCard, NPagination } from 'naive-ui';
import { useCrud } from '../composables/useCrud';
import CrudTable from './CrudTable.vue';
import CrudForm from './CrudForm.vue';
import type { ResourceMeta } from '@faster-crud/core';
import type { CrudApi } from '../types';

const props = defineProps<{
  meta: ResourceMeta;
  api: CrudApi;
}>();

const { records, total, loading, page, load, create, update, remove } = useCrud(
  props.api,
  props.meta,
);

const showModal  = ref(false);
const editTarget = ref<any>(null);
const modalMode  = ref<'create' | 'update'>('create');

function openCreate() {
  editTarget.value = null;
  modalMode.value = 'create';
  showModal.value = true;
}

function openEdit(row: any) {
  editTarget.value = row;
  modalMode.value = 'update';
  showModal.value = true;
}

async function handleSubmit(values: any) {
  if (modalMode.value === 'create') {
    await create(values);
  } else {
    await update(editTarget.value.id, values);
  }
  showModal.value = false;
}

async function handleDelete(row: any) {
  await remove(row.id);
}

onMounted(load);
</script>

<template>
  <NSpace vertical size="large">
    <NSpace justify="end">
      <NButton type="primary" @click="openCreate">
        + New {{ meta.name.replace(/s$/, '') }}
      </NButton>
    </NSpace>
    <CrudTable
      :meta="meta"
      :data="records"
      :loading="loading"
      :on-edit="openEdit"
      :on-delete="handleDelete"
    />
    <NPagination
      v-model:page="page.current"
      v-model:page-size="page.size"
      :item-count="total"
      show-size-picker
      :page-sizes="[10, 20, 50]"
      @update:page="load"
      @update:page-size="load"
    />
    <NModal v-model:show="showModal" :mask-closable="false">
      <NCard
        :title="modalMode === 'create' ? 'Create' : 'Edit'"
        style="width: 480px"
      >
        <CrudForm
          :meta="meta"
          :mode="modalMode"
          :initial-values="editTarget"
          @submit="handleSubmit"
          @cancel="showModal = false"
        />
      </NCard>
    </NModal>
  </NSpace>
</template>
