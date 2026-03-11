<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <n-layout style="min-height: 100vh">
        <n-layout-header style="padding: 16px 24px; border-bottom: 1px solid #333">
          <n-space justify="space-between" align="center">
            <n-text strong style="font-size: 18px">@faster-crud / vue-demo</n-text>
            <n-space>
              <n-tag type="info">@faster-crud/core v0.1.0</n-tag>
              <n-button
                text
                tag="a"
                href="https://github.com/faster-crud/vue-demo"
                target="_blank"
              >
                GitHub ↗
              </n-button>
            </n-space>
          </n-space>
        </n-layout-header>
        <n-layout-content style="padding: 24px">
          <UserPage />
        </n-layout-content>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme } from 'naive-ui';
import {
  NConfigProvider,
  NMessageProvider,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NSpace,
  NText,
  NTag,
  NButton,
} from 'naive-ui';
import UserPage from './components/UserPage.vue';
</script>
