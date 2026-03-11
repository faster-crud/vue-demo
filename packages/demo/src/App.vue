<script setup lang="ts">
import { darkTheme } from 'naive-ui';
import {
  NConfigProvider,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NSpace,
  NText,
  NTag,
  NButton,
} from 'naive-ui';
import { UserCrud } from './user.crud';
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <NLayout style="min-height: 100vh; background: #0d1117">
      <NLayoutHeader
        style="padding: 16px 24px; border-bottom: 1px solid #21262d; background: #161b22"
      >
        <NSpace justify="space-between" align="center">
          <NText strong style="font-size: 18px; color: #e6edf3">
            @faster-crud / vue-demo
          </NText>
          <NSpace>
            <NTag type="info">@faster-crud/vue v0.1.0</NTag>
            <NButton
              text
              tag="a"
              href="https://github.com/faster-crud/vue-demo"
              target="_blank"
            >
              GitHub ↗
            </NButton>
          </NSpace>
        </NSpace>
      </NLayoutHeader>
      <NLayoutContent style="padding: 24px">
        <UserCrud.Page />
      </NLayoutContent>
    </NLayout>
  </NConfigProvider>
</template>
