<script setup lang="ts">
import { computed, h } from 'vue';
import { NDataTable, NButton, NSpace } from 'naive-ui';
import type { ResourceMeta } from '@faster-crud/core';
import type { DataTableColumns } from 'naive-ui';

const props = defineProps<{
  meta: ResourceMeta;
  data: any[];
  loading?: boolean;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}>();

const columns = computed<DataTableColumns>(() => {
  const cols: DataTableColumns = [];
  for (const [key, field] of Object.entries(props.meta.fields)) {
    if (field.ignore) continue;
    if (field.hidden?.includes('list')) continue;
    cols.push({
      key,
      title: field.label ?? key,
      sorter: field.list?.sortable ? true : undefined,
      width: field.list?.width,
      render: (row: any) => row[key] ?? '—',
    });
  }
  // Actions column
  cols.push({
    key: '__actions',
    title: 'Actions',
    width: 120,
    render: (row: any) =>
      h(NSpace, null, {
        default: () => [
          props.onEdit &&
            h(
              NButton,
              { size: 'small', onClick: () => props.onEdit?.(row) },
              { default: () => 'Edit' },
            ),
          props.onDelete &&
            h(
              NButton,
              { size: 'small', type: 'error', onClick: () => props.onDelete?.(row) },
              { default: () => 'Delete' },
            ),
        ],
      }),
  });
  return cols;
});
</script>

<template>
  <NDataTable :columns="columns" :data="data" :loading="loading" :bordered="false" />
</template>
