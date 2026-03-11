import type { ResourceMeta } from '@faster-crud/core';

export const userMeta: ResourceMeta = {
  name: 'users',
  operations: ['create', 'list', 'get', 'update', 'remove'],
  pagination: { max: 50 },
  fields: {
    id:        { key: 'id',        type: 'Number', label: 'ID',         readonly: true },
    username:  { key: 'username',  type: 'String', label: 'Username',   searchable: true, list: { sortable: true } },
    email:     { key: 'email',     type: 'String', label: 'Email',      ui: { widget: 'email' } },
    role:      { key: 'role',      type: 'String', label: 'Role',       ui: { widget: 'select', options: [{ label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }] as any }, deny: ['create'] },
    createdAt: { key: 'createdAt', type: 'Date',   label: 'Created At', readonly: true },
  },
};
