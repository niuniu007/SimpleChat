<script setup lang='ts'>
import { computed, ref, nextTick } from 'vue'
import { NScrollbar, NBadge, NDropdown } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useAppStore, forumChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import AvatarComponent from '@/views/forum/components/Chat/Message/Avatar.vue'

const { isMobile } = useBasicLayout()

const appStore = useAppStore()
const chatStore = forumChatStore()
const dataSources = computed(() => chatStore.history)

async function handleSelect({ uuid, type }: Forum.ForumHistory) {

  if (isActive(uuid)) {
    chatStore.updateHistory(uuid, { unread: 0 })
    return;
  }

  chatStore.updateHistory(uuid, { unread: 0 })

  await chatStore.setActive(uuid)

  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

//右键菜单项
const options = [
  {
    label: '修改修改名称',
    key: 'set this chat a name'
  },
  {
    label: '不显示聊天',
    key: 'hidden this chat'
  },
  {
    label: '删除聊天',
    key: 'deletechat'
  }];

const showDropdownRef = ref({
  x: 0,
  y: 0,
  isVisible: false,
  checkChat: ''
})

function showContextMenu(chatid: string, event: MouseEvent) {
  // 阻止默认的右键菜单
  event.preventDefault();
  // 显示自定义的菜单
  nextTick().then(() => {
    showDropdownRef.value.isVisible = true
    showDropdownRef.value.x = event.clientX
    showDropdownRef.value.y = event.clientY
    showDropdownRef.value.checkChat = chatid
  })
}

//切换右键菜单项
function onContextMenuClickoutside() {
  window.$message?.info('菜单消失')
  showDropdownRef.value.isVisible = false
}

//右键菜单选中项
function onContentMenuSelect(key: string | number) {
  showDropdownRef.value.isVisible = false
  switch (key) {
    case "deletechat":
      let historyIndex = chatStore.history.findIndex(x => x.uuid == showDropdownRef.value.checkChat)
      chatStore.deleteHistory(historyIndex);
      break;
    default:
      window.$message?.info("选中了菜单：" + String(key))
  }


}

function isActive(uuid: string) {
  return chatStore.active === uuid
}
</script>

<template>
  <NScrollbar class="">
    <div class="flex flex-col  text-sm">
      <template v-if="!dataSources || !dataSources.length">
        <div class="flex flex-col items-center mt-4 text-center text-neutral-300">
          <!--没有聊天的时候-->
          <SvgIcon icon="ri:inbox-line" class="mb-2 text-3xl" />
          <span>{{ $t('common.noData') }}</span>
        </div>
      </template>
      <template v-else>
        <!--存在聊天则显示聊天-->
        <div v-for="(item, index) of dataSources" :key="index">
          <a class="relative flex items-center gap-3  px-3  h-16 break-all   cursor-pointer hover:bg-neutral-100 group dark:border-neutral-800 dark:hover:bg-[#24272e]"
            :class="isActive(item.uuid) && ['bg-[#c4c5c6]', 'dark:bg-[#24272e]']" @click="handleSelect(item)"
            @contextmenu="showContextMenu(item.uuid, $event)">
            <n-badge :value="item.unread" :max="15">
              <AvatarComponent :user-id="item.uuid" :size="40" :user-name="item.title" />
            </n-badge>
            <div class="flex  flex-col overflow-hidden break-all text-ellipsis whitespace-nowrap mr-3 ">
              <span class="text-sm mb-1" style=" ">{{ item.title }}</span>
              <span class="text-[#70745F]/70 text-xs   overflow-hidden text-ellipsis">{{ item.description ?? "没有任何描述"
              }}</span>
            </div>
          </a>
        </div>
      </template>
    </div>
  </NScrollbar>

  <n-dropdown placement="bottom-start" trigger="manual" :x="showDropdownRef.x" :y="showDropdownRef.y" :options="options"
    :show="showDropdownRef.isVisible" :on-clickoutside="onContextMenuClickoutside" @select="onContentMenuSelect" />
</template>
