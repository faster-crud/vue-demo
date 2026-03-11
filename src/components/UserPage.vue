<template>
  <div>
    <!-- Toolbar -->
    <n-space justify="space-between" align="center" style="margin-bottom: 16px">
      <n-input
        v-model:value="searchUsername"
        placeholder="Search by username…"
        clearable
        style="width: 240px"
        @input="handleSearch"
      >
        <template #prefix>🔍</template>
      </n-input>
      <n-button type="primary" @click="openCreate">+ New User</n-button>
    </n-space>

    <!-- Table -->
    <n-data-table
      :columns="columns"
      :data="users"
      :loading="loading"
      :pagination="false"
      striped
    />

    <!-- Pagination -->
    <n-space justify="end" style="margin-top: 16px">
      <n-pagination
        v-model:page="page"
        :page-size="pageSize"
        :item-count="total"
        show-size-picker
        :page-sizes="[10, 20, 50]"
        @update:page="loadUsers"
        @update:page-size="handlePageSizeChange"
      />
    </n-space>

    <!-- Create / Edit Modal -->
    <n-modal
      v-model:show="modalVisible"
      :title="editingUser ? 'Edit User' : 'New User'"
      preset="card"
      style="width: 480px"
      :mask-closable="false"
    >
      <n-form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="Username" path="username">
          <n-input v-model:value="formModel.username" placeholder="Enter username" />
        </n-form-item>
        <n-form-item label="Email" path="email">
          <n-input v-model:value="formModel.email" placeholder="Enter email" />
        </n-form-item>
        <n-form-item v-if="!editingUser" label="Password" path="password">
          <n-input
            v-model:value="formModel.password"
            type="password"
            show-password-on="click"
            placeholder="Enter password"
          />
        </n-form-item>
        <n-form-item v-if="editingUser" label="Role" path="role">
          <n-select
            v-model:value="formModel.role"
            :options="roleOptions"
            placeholder="Select role"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="modalVisible = false">Cancel</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ editingUser ? 'Save' : 'Create' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { h, ref, onMounted } from 'vue';
import {
  NDataTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NPagination,
  NSpace,
  NTag,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import { userApi, type User, type CreateUserDto, type UpdateUserDto } from '../api/user';

const message = useMessage();

// ─── State ────────────────────────────────────────────────────────────────────
const users = ref<User[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchUsername = ref('');

// Modal state
const modalVisible = ref(false);
const editingUser = ref<User | null>(null);
const submitting = ref(false);
const formRef = ref<FormInst | null>(null);

interface FormModel {
  username: string;
  email: string;
  password: string;
  role: string;
}

const formModel = ref<FormModel>({ username: '', email: '', password: '', role: 'user' });

const roleOptions = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
  { label: 'Moderator', value: 'moderator' },
];

// ─── Validation Rules ─────────────────────────────────────────────────────────
const formRules = ref<FormRules>({
  username: [{ required: true, message: 'Username is required', trigger: 'blur' }],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' },
  ],
});

// ─── Table Columns ────────────────────────────────────────────────────────────
const columns: DataTableColumns<User> = [
  { title: 'Username', key: 'username', sorter: 'default' },
  { title: 'Email', key: 'email' },
  {
    title: 'Role',
    key: 'role',
    render(row) {
      const typeMap: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
        admin: 'error',
        moderator: 'warning',
        user: 'info',
      };
      return h(NTag, { type: typeMap[row.role] ?? 'default', size: 'small' }, () => row.role);
    },
  },
  {
    title: 'Created At',
    key: 'createdAt',
    render(row) {
      return new Date(row.createdAt).toLocaleDateString();
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    render(row) {
      return h(NSpace, null, () => [
        h(
          NButton,
          { size: 'small', onClick: () => openEdit(row) },
          () => 'Edit',
        ),
        h(
          NButton,
          { size: 'small', type: 'error', onClick: () => handleDelete(row) },
          () => 'Delete',
        ),
      ]);
    },
  },
];

// ─── Data Loading ─────────────────────────────────────────────────────────────
async function loadUsers() {
  loading.value = true;
  try {
    const result = await userApi.list({
      page: { current: page.value, size: pageSize.value },
      filters: searchUsername.value ? { username: searchUsername.value } : undefined,
    });
    users.value = result.data;
    total.value = result.total;
  } catch (e) {
    console.error(e);
    message.error('Failed to load users');
  } finally {
    loading.value = false;
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;
function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    loadUsers();
  }, 400);
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  page.value = 1;
  loadUsers();
}

// ─── Modal Actions ────────────────────────────────────────────────────────────
function openCreate() {
  editingUser.value = null;
  formModel.value = { username: '', email: '', password: '', role: 'user' };
  modalVisible.value = true;
}

function openEdit(user: User) {
  editingUser.value = user;
  formModel.value = { username: user.username, email: user.email, password: '', role: user.role };
  modalVisible.value = true;
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  submitting.value = true;
  try {
    if (editingUser.value) {
      const dto: UpdateUserDto = {
        username: formModel.value.username,
        email: formModel.value.email,
        role: formModel.value.role,
      };
      await userApi.update(editingUser.value.id, dto);
      message.success('User updated');
    } else {
      const dto: CreateUserDto = {
        username: formModel.value.username,
        email: formModel.value.email,
        password: formModel.value.password,
      };
      await userApi.create(dto);
      message.success('User created');
    }
    modalVisible.value = false;
    await loadUsers();
  } catch (e) {
    console.error(e);
    message.error('Operation failed');
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(user: User) {
  try {
    await userApi.remove(user.id);
    message.success(`Deleted ${user.username}`);
    await loadUsers();
  } catch (e) {
    console.error(e);
    message.error('Delete failed');
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(loadUsers);
</script>
