import type { PageQuery, PageResult } from '@faster-crud/core';

export interface CrudApi<T = any> {
  list:   (query: PageQuery<T>) => Promise<PageResult<T>>;
  create: (dto: Partial<T>) => Promise<T>;
  update: (id: number, dto: Partial<T>) => Promise<T>;
  remove: (id: number) => Promise<void>;
  get?:   (id: number) => Promise<T>;
}
