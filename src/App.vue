<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import { NaiveProvider } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'

const { theme, themeOverrides } = useTheme()
const { language } = useLanguage()


</script>

<template>
  <div class="absolute  flex  h-full  w-full" style="background-color:#dbd8d8;">
    <NConfigProvider class="h-full" :theme="theme" :theme-overrides="themeOverrides" :locale="language">
      <NaiveProvider>
        <RouterView />
      </NaiveProvider>
    </NConfigProvider>
  </div>
</template>
