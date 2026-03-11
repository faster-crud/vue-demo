<script setup lang="ts">
import { reactive, watch } from 'vue';
import { NForm, NFormItem, NInput, NSelect, NButton, NSpace } from 'naive-ui';
import type { ResourceMeta } from '@faster-crud/core';

const props = defineProps<{
  meta: ResourceMeta;
  mode: 'create' | 'update';
  initialValues?: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'submit', values: Record<string, any>): void;
  (e: 'cancel'): void;
}>();

const form = reactive<Record<string, any>>({});

watch(
  () => props.initialValues,
  (vals) => {
    if (vals) Object.assign(form, vals);
  },
  { immediate: true },
);

function getFields() {
  return Object.entries(props.meta.fields).filter(([_key, field]) => {
    if (field.ignore) return false;
    const op = props.mode === 'create' ? 'create' : 'update';
    if (field.deny?.includes(op)) return false;
    if (field.readonly) return false;
    return true;
  });
}

function submit() {
  emit('submit', { ...form });
}
</script>

<template>
  <NForm :model="form" label-placement="left" label-width="120px">
    <template v-for="[key, field] in getFields()" :key="key">
      <NFormItem :label="field.label ?? key">
        <!-- select -->
        <NSelect
          v-if="field.ui?.widget === 'select'"
          v-model:value="form[key]"
          :options="(field.ui?.options as any) ?? []"
          clearable
        />
        <!-- password -->
        <NInput
          v-else-if="field.ui?.widget === 'password'"
          v-model:value="form[key]"
          type="password"
          show-password-on="click"
          :placeholder="field.ui?.placeholder"
        />
        <!-- default text -->
        <NInput
          v-else
          v-model:value="form[key]"
          :type="field.ui?.widget === 'textarea' ? 'textarea' : 'text'"
          :placeholder="field.ui?.placeholder"
        />
      </NFormItem>
    </template>
    <NFormItem>
      <NSpace>
        <NButton type="primary" @click="submit">Submit</NButton>
        <NButton @click="emit('cancel')">Cancel</NButton>
      </NSpace>
    </NFormItem>
  </NForm>
</template>
