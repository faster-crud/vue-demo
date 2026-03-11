import type { CrudApi } from '@faster-crud/vue';

const store: any[] = [
  { id: 1, username: 'alice', email: 'alice@example.com', role: 'admin',  createdAt: new Date().toISOString() },
  { id: 2, username: 'bob',   email: 'bob@example.com',   role: 'user',   createdAt: new Date().toISOString() },
];
let seq = 3;

export const userApi: CrudApi = {
  list: async ({ page }) => {
    const current = page?.current ?? 1;
    const size    = page?.size    ?? 10;
    return {
      data:  store.slice((current - 1) * size, current * size),
      total: store.length,
      page:  current,
      size,
    };
  },
  create: async (dto) => {
    const u = { ...dto, id: seq++, role: 'user', createdAt: new Date().toISOString() };
    store.push(u);
    return u;
  },
  update: async (id, dto) => {
    const idx = store.findIndex((x) => x.id === id);
    store[idx] = { ...store[idx], ...dto };
    return store[idx];
  },
  remove: async (id) => {
    store.splice(store.findIndex((x) => x.id === id), 1);
  },
};
