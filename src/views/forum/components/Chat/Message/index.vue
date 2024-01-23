<script setup lang='ts'>
import { ref } from 'vue'
import { NDropdown, NSpin } from 'naive-ui'
import AvatarComponent from './Avatar.vue'
import TextComponent from './Text.vue'
import { SvgIcon } from '@/components/common'
import { copyText } from '@/utils/format'
import { useIconRender } from '@/hooks/useIconRender'
import { t } from '@/locales'

interface Props {
  user?: Forum.Member
  dateTime?: string
  text?: string
  inversion?: boolean
  error?: boolean
  loading?: boolean
}

interface Emit {
  (ev: 'regenerate'): void
  (ev: 'delete'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const { iconRender } = useIconRender()

const textRef = ref<HTMLElement>()

const options = [
  {
    label: t('chat.copy'),
    key: 'copyText',
    icon: iconRender({ icon: 'ri:file-copy-2-line' }),
  },
  {
    label: t('common.delete'),
    key: 'delete',
    icon: iconRender({ icon: 'ri:delete-bin-line' }),
  },
]

function handleSelect(key: 'copyRaw' | 'copyText' | 'delete') {
  switch (key) {
    case 'copyText':
      copyText({ text: props.text ?? '' })
      return
    case 'delete':
      emit('delete')
  }
}

</script>

<template>
  <template v-if="user">
    <div class="flex w-full mb-6 overflow-hidden" :class="[{ 'flex-row-reverse': inversion }]">
      <div class="flex items-center justify-center flex-shrink-0 h-8 overflow-hidden rounded-full basis-8"
        :class="[inversion ? 'ml-2' : 'mr-2']">
        <AvatarComponent :image="true" :avatar="user.avatar" />
      </div>
      <div class="overflow-hidden text-sm " :class="[inversion ? 'items-end' : 'items-start']">
        <p class="text-xs text-[#b4bbc4]" :class="[inversion ? 'text-right' : 'text-left']">
          {{ user.name }} &nbsp; {{ dateTime }}
        </p>
        <div class="flex items-end gap-1 mt-2" :class="[inversion ? 'flex-row-reverse' : 'flex-row']">
          <TextComponent ref="textRef" :inversion="inversion" :error="error" :text="text" :loading="loading" />
          <NSpin :size="12" v-if="loading" />
          <div class="flex flex-col">
            <NDropdown :placement="!inversion ? 'right' : 'left'" :options="options" @select="handleSelect">
              <button class="transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200">
                <SvgIcon icon="ri:more-2-fill" />
              </button>
            </NDropdown>
          </div>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex w-full mb-6 overflow-hidden " style="justify-content:space-around;text-align:center;"
      :class="[{ 'flex-row-reverse': inversion }]">
      <div class=" bg-[#eee]/80  dark:bg-[#1e1e1e]  pl-20 pr-20 text-xs" style="width:100%;">
        {{ dateTime }}<br />
        {{ text }}
      </div>
    </div>
  </template>
</template>
