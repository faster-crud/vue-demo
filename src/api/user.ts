import axios from 'axios';
import type { PageQuery, PageResult } from '@faster-crud/core';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
});

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

// Note: password is excluded from API responses (backend @Hidden)
export type CreateUserDto = Pick<User, 'username' | 'email'> & { password: string };
export type UpdateUserDto = Partial<Pick<User, 'username' | 'email' | 'role'>>;

export const userApi = {
  list: (query?: PageQuery<User>) =>
    http
      .get<PageResult<User>>('/users', {
        params: {
          page: query?.page?.current,
          size: query?.page?.size,
          ...query?.filters,
        },
      })
      .then((r) => r.data),
  get: (id: number) => http.get<User>(`/users/${id}`).then((r) => r.data),
  create: (dto: CreateUserDto) => http.post<User>('/users', dto).then((r) => r.data),
  update: (id: number, dto: UpdateUserDto) =>
    http.patch<User>(`/users/${id}`, dto).then((r) => r.data),
  remove: (id: number) => http.delete(`/users/${id}`).then((r) => r.data),
};
