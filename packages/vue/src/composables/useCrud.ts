import { ref, reactive } from 'vue';
import type { ResourceMeta, PageQuery } from '@faster-crud/core';
import type { CrudApi } from '../types';

export function useCrud<T extends { id: number }>(api: CrudApi<T>, _meta: ResourceMeta) {
  const records = ref<T[]>([]);
  const total   = ref(0);
  const loading = ref(false);
  const page    = reactive({ current: 1, size: 10 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = reactive({ page }) as any as PageQuery<T>;

  async function load() {
    loading.value = true;
    try {
      const res = await api.list(query);
      records.value = res.data as T[];
      total.value = res.total;
    } finally {
      loading.value = false;
    }
  }

  async function create(dto: Partial<T>) {
    await api.create(dto);
    await load();
  }

  async function update(id: number, dto: Partial<T>) {
    await api.update(id, dto);
    await load();
  }

  async function remove(id: number) {
    await api.remove(id);
    await load();
  }

  return { records, total, loading, page, query, load, create, update, remove };
}
