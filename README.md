# @faster-crud/vue-demo

[![MIT License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

> Vue 3 + Naive UI demo for [@faster-crud](https://github.com/bkmashiro/nest-faster-crud).
> Connects to the [nest-faster-crud-template](https://github.com/bkmashiro/nest-faster-crud-template) backend.

## Quick Start

```bash
git clone https://github.com/faster-crud/vue-demo
cd vue-demo
pnpm install
cp .env.example .env
pnpm dev
```

Make sure the backend is running on `http://localhost:3000` first:
[→ nest-faster-crud-template](https://github.com/bkmashiro/nest-faster-crud-template)

## What this demonstrates

- CRUD table with pagination and search
- Create / Edit / Delete modals
- Field-level access control (role field not shown on create)
- Password field excluded from table display (backend `@Hidden`)

> 📝 In Phase 3, this project will be **auto-generated** by `@faster-crud/gen` CLI from the backend entity definition.
