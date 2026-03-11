import { defineComponent, h, ref, reactive, onMounted } from 'vue';
import type { Component, VNodeChild } from 'vue';
import {
  NDataTable, NButton, NSpace, NModal, NCard, NPagination,
  NForm, NFormItem, NInput, NSelect,
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import type { ResourceMeta } from '@faster-crud/core';
import type { CrudApi } from './types';
import { useCrud } from './composables/useCrud';

// ── Public types ─────────────────────────────────────────────────────────────

/** Per-field column display overrides for the generated table. */
export interface ColumnOverride {
  /** Custom cell renderer — receives the field value and the full row. */
  render?: (value: unknown, row: Record<string, unknown>) => VNodeChild;
  /** Override the column header title. */
  title?: string;
  /** Override the column width in pixels. */
  width?: number;
}

/** Lifecycle hooks fired around CRUD mutations. */
export interface CrudHooks<T> {
  onBeforeCreate?: (dto: Partial<T>) => Partial<T> | Promise<Partial<T>>;
  onAfterCreate?: (record: T) => void | Promise<void>;
  onBeforeUpdate?: (id: number, dto: Partial<T>) => Partial<T> | Promise<Partial<T>>;
  onAfterUpdate?: (record: T) => void | Promise<void>;
  /** Return `false` to cancel the delete. */
  onBeforeRemove?: (id: number) => boolean | void | Promise<boolean | void>;
  onAfterRemove?: (id: number) => void | Promise<void>;
}

export interface DefineCrudOptions<T = Record<string, unknown>> extends CrudHooks<T> {
  meta: ResourceMeta;
  api: CrudApi<T>;
  /** Per-field column overrides (render, title, width). */
  columns?: Record<string, ColumnOverride>;
  /**
   * Replace the default Edit/Delete action buttons.
   * Called once per row — return an array of VNodes.
   */
  rowActions?: (row: T) => VNodeChild[];
}

export interface CrudInstance {
  /** Full CRUD page: toolbar + table + pagination + modal form. */
  Page: Component;
  /** Standalone data table (use inside your own layout). */
  Table: Component;
  /** Standalone form (use inside your own modal/drawer). */
  Form: Component;
  /**
   * Composable — **must be called inside `setup()`**.
   * Returns the same state object as `useCrud()` but with lifecycle hooks applied.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  use: () => any;
}

// ── defineCrud ───────────────────────────────────────────────────────────────

/**
 * Declarative CRUD factory.
 *
 * @example
 * export const UserCrud = defineCrud({
 *   meta: userSchema,
 *   api:  mockUserApi,
 *   columns: {
 *     role: { render: (v) => h(NTag, { type: v === 'admin' ? 'error' : 'info' }, () => v) },
 *   },
 * });
 *
 * // In a Vue SFC:
 * // <UserCrud.Page />
 */
export function defineCrud<T extends { id: number } = Record<string, unknown> & { id: number }>(
  options: DefineCrudOptions<T>,
): CrudInstance {
  const {
    meta, api,
    columns: colOverrides = {},
    rowActions,
    onBeforeCreate, onAfterCreate,
    onBeforeUpdate, onAfterUpdate,
    onBeforeRemove, onAfterRemove,
  } = options;

  // ── Wrapped API (with hooks) ───────────────────────────────────────────────
  const wrappedApi: CrudApi<T> = {
    list: (q) => api.list(q),
    ...(api.get && { get: (id) => api.get!(id) }),
    create: async (dto) => {
      const processed = onBeforeCreate ? await onBeforeCreate(dto) : dto;
      const result = await api.create(processed);
      if (onAfterCreate) await onAfterCreate(result);
      return result;
    },
    update: async (id, dto) => {
      const processed = onBeforeUpdate ? await onBeforeUpdate(id, dto) : dto;
      const result = await api.update(id, processed);
      if (onAfterUpdate) await onAfterUpdate(result);
      return result;
    },
    remove: async (id) => {
      if (onBeforeRemove) {
        const cancel = await onBeforeRemove(id);
        if (cancel === false) return;
      }
      await api.remove(id);
      if (onAfterRemove) await onAfterRemove(id);
    },
  };

  // ── Column builder ─────────────────────────────────────────────────────────
  function buildDataColumns(): DataTableColumns {
    const cols: DataTableColumns = [];
    for (const [key, fieldMeta] of Object.entries(meta.fields)) {
      if (fieldMeta.ignore || fieldMeta.hidden?.includes('list')) continue;
      const over = colOverrides[key];
      cols.push({
        key,
        title: over?.title ?? fieldMeta.label ?? key,
        width: over?.width ?? fieldMeta.list?.width,
        sorter: fieldMeta.list?.sortable ? true : undefined,
        render: over?.render
          ? (row: Record<string, unknown>) => over.render!(row[key], row)
          : (row: Record<string, unknown>) => (row[key] as string) ?? '—',
      });
    }
    return cols;
  }

  // ── Form field filter (mirrors CrudForm.vue logic) ─────────────────────────
  function visibleFields(mode: 'create' | 'update') {
    return Object.entries(meta.fields).filter(([, f]) => {
      if (f.ignore) return false;
      if (f.readonly) return false;
      const op = mode === 'create' ? 'create' : 'update';
      if (f.deny?.includes(op)) return false;
      return true;
    });
  }

  // ── Table component ────────────────────────────────────────────────────────
  const Table = defineComponent({
    name: `${meta.name}CrudTable`,
    props: {
      data:     { type: Array,    default: () => [] },
      loading:  { type: Boolean,  default: false },
      onEdit:   { type: Function, default: null },
      onDelete: { type: Function, default: null },
    },
    setup(props) {
      return () => {
        const dataCols = buildDataColumns();
        const actionCol: DataTableColumns[number] = {
          key: '__actions',
          title: 'Actions',
          width: rowActions ? undefined : 140,
          render: (row: Record<string, unknown>) => {
            const nodes = rowActions
              ? rowActions(row as T)
              : [
                  props.onEdit   && h(NButton, { size: 'small',              onClick: () => props.onEdit!(row)   }, { default: () => 'Edit'   }),
                  props.onDelete && h(NButton, { size: 'small', type: 'error', onClick: () => props.onDelete!(row) }, { default: () => 'Delete' }),
                ];
            return h(NSpace, null, { default: () => nodes });
          },
        };
        return h(NDataTable, {
          columns: [...dataCols, actionCol],
          data: props.data as Record<string, unknown>[],
          loading: props.loading,
          bordered: false,
        });
      };
    },
  });

  // ── Form component ─────────────────────────────────────────────────────────
  const Form = defineComponent({
    name: `${meta.name}CrudForm`,
    props: {
      mode:          { type: String as () => 'create' | 'update', default: 'create' },
      initialValues: { type: Object as () => Record<string, unknown> | null, default: null },
    },
    emits: ['submit', 'cancel'],
    setup(props, { emit }) {
      const form = reactive<Record<string, unknown>>({});

      // Sync initial values when they change
      const stopWatch = (() => {
        let prev: unknown = null;
        return () => {
          if (props.initialValues !== prev) {
            prev = props.initialValues;
            if (props.initialValues) Object.assign(form, props.initialValues);
          }
        };
      })();

      return () => {
        stopWatch();
        const fields = visibleFields(props.mode);
        return h(NForm, { model: form, labelPlacement: 'left', labelWidth: '120px' }, {
          default: () => [
            ...fields.map(([key, f]) =>
              h(NFormItem, { key, label: f.label ?? key }, {
                default: () => {
                  if (f.ui?.widget === 'select') {
                    return h(NSelect, {
                      value: form[key] as string | null,
                      // ColOptions.ui.options is Record<string,any> in core; cast to what NSelect wants
                      options: (f.ui.options as unknown as any[]) ?? [],
                      clearable: true,
                      'onUpdate:value': (v: unknown) => { form[key] = v; },
                    });
                  }
                  if (f.ui?.widget === 'password') {
                    return h(NInput, {
                      value: form[key] as string,
                      type: 'password',
                      showPasswordOn: 'click',
                      placeholder: f.ui?.placeholder,
                      'onUpdate:value': (v: string) => { form[key] = v; },
                    });
                  }
                  return h(NInput, {
                    value: form[key] as string,
                    type: f.ui?.widget === 'textarea' ? 'textarea' : 'text',
                    placeholder: f.ui?.placeholder,
                    'onUpdate:value': (v: string) => { form[key] = v; },
                  });
                },
              }),
            ),
            h(NFormItem, null, {
              default: () => h(NSpace, null, {
                default: () => [
                  h(NButton, { type: 'primary', onClick: () => emit('submit', { ...form }) }, { default: () => 'Submit' }),
                  h(NButton, { onClick: () => emit('cancel') }, { default: () => 'Cancel' }),
                ],
              }),
            }),
          ],
        });
      };
    },
  });

  // ── Page component ─────────────────────────────────────────────────────────
  const Page = defineComponent({
    name: `${meta.name}CrudPage`,
    setup() {
      const { records, total, loading, page, load, create, update, remove } =
        useCrud(wrappedApi, meta);

      const showModal  = ref(false);
      const editTarget = ref<Record<string, unknown> | null>(null);
      const modalMode  = ref<'create' | 'update'>('create');

      function openCreate() {
        editTarget.value = null;
        modalMode.value  = 'create';
        showModal.value  = true;
      }
      function openEdit(row: Record<string, unknown>) {
        editTarget.value = row;
        modalMode.value  = 'update';
        showModal.value  = true;
      }
      async function handleSubmit(values: Record<string, unknown>) {
        if (modalMode.value === 'create') {
          await create(values as Partial<T>);
        } else {
          await update((editTarget.value as { id: number }).id, values as Partial<T>);
        }
        showModal.value = false;
      }

      onMounted(load);

      return () =>
        h(NSpace, { vertical: true, size: 'large' }, {
          default: () => [
            // Toolbar
            h(NSpace, { justify: 'end' }, {
              default: () => [
                h(NButton, { type: 'primary', onClick: openCreate }, {
                  default: () => `+ New ${meta.name.replace(/s$/, '')}`,
                }),
              ],
            }),
            // Table
            h(Table, {
              data:     records.value,
              loading:  loading.value,
              onEdit:   openEdit,
              onDelete: async (row: Record<string, unknown>) => { await remove((row as { id: number }).id); },
            }),
            // Pagination
            h(NPagination, {
              page:          page.current,
              pageSize:      page.size,
              itemCount:     total.value,
              showSizePicker: true,
              pageSizes:     [10, 20, 50],
              'onUpdate:page':     (p: number) => { page.current = p; load(); },
              'onUpdate:pageSize': (s: number) => { page.size = s;    load(); },
            }),
            // Modal
            h(NModal, {
              show:          showModal.value,
              maskClosable:  false,
              'onUpdate:show': (v: boolean) => { showModal.value = v; },
            }, {
              default: () =>
                h(NCard, {
                  title: modalMode.value === 'create' ? 'Create' : 'Edit',
                  style: 'width: 480px',
                }, {
                  default: () =>
                    h(Form, {
                      mode:          modalMode.value,
                      initialValues: editTarget.value,
                      onSubmit:      handleSubmit,
                      onCancel:      () => { showModal.value = false; },
                    }),
                }),
            }),
          ],
        });
    },
  });

  // ── use() composable ───────────────────────────────────────────────────────
  function use() {
    return useCrud(wrappedApi, meta);
  }

  return { Page, Table, Form, use };
}
