<script lang="ts" setup>
import { NAvatar } from 'naive-ui'
import { isString } from '@/utils/is'
import defaultAvatar from '@/assets/avatar.jpg'

interface Props {
  image?: boolean
  userId?: String
  userName?: String
  avatar?: String
  size?: number
  title?: String
}
defineProps<Props>()


</script>

<template>
  <NAvatar v-if="isString(avatar) && avatar.length > 0" :src="avatar" :size="size" :fallback-src="defaultAvatar" />
  <NAvatar v-else :src="defaultAvatar" :size="size" />
</template>
