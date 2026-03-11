import { h } from 'vue';
import { NTag } from 'naive-ui';
import { defineCrud, field, defineSchema } from '@faster-crud/vue';
import { userApi } from './mock/userApi';

// ── Schema ────────────────────────────────────────────────────────────────────

const userSchema = defineSchema('users', {
  id:        field('ID').readonly(),
  username:  field('Username').required().length(3, 20).searchable().sortable(),
  email:     field('Email').required().email(),
  role:      field('Role')
               .deny('create')
               .select([
                 { label: 'Admin', value: 'admin' },
                 { label: 'User',  value: 'user'  },
               ]),
  password:  field('Password').required().hidden('list', 'get').password(),
  createdAt: field('Created At').readonly(),
});

// ── CRUD instance ─────────────────────────────────────────────────────────────

const roleTypeMap: Record<string, 'error' | 'info' | 'warning' | 'default'> = {
  admin: 'error',
  user:  'info',
};

export const UserCrud = defineCrud({
  meta: userSchema,
  api:  userApi,
  columns: {
    role: {
      render: (value) =>
        h(
          NTag,
          { type: roleTypeMap[value as string] ?? 'default', size: 'small' },
          { default: () => value as string },
        ),
    },
    createdAt: {
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
  },
});
