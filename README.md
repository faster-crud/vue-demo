# faster-crud/vue-demo

Vue 3 + Naive UI component library and demo for [@faster-crud](https://github.com/bkmashiro/nest-faster-crud).

## Packages

| Package | Description |
|---------|-------------|
| [`@faster-crud/vue`](packages/vue) | Component library: `CrudPage`, `CrudTable`, `CrudForm`, `useCrud` |
| [`demo`](packages/demo) | Live demo using mock data — no backend required |

## Component Library Usage

```bash
pnpm add @faster-crud/vue naive-ui
```

```vue
<script setup>
import { CrudPage } from '@faster-crud/vue';
</script>

<template>
  <CrudPage :meta="userMeta" :api="userApi" />
</template>
```

## Running the Demo

```bash
pnpm install
cd packages/demo
pnpm dev
# No backend needed — uses mock data
```
