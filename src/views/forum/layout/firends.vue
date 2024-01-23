<script setup lang='ts'>
import { computed, ref, nextTick, CSSProperties, watch } from 'vue'
import { NDropdown } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useFriendStore } from '@/store'
import AvatarComponent from '@/views/forum/components/Chat/Message/Avatar.vue'
import { useAppStore,forumChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { NLayoutSider } from 'naive-ui';

const appStore = useAppStore()
const  forumStore=forumChatStore()

const { isMobile } = useBasicLayout()
const collapsed = computed(() => appStore.siderCollapsed)
const firendStore = useFriendStore()

const dataSources = computed(() => firendStore.$state)
async function handleSelect({ id }: Friend.friend) {
    selectFirend.value = id
}


function handleUpdateCollapsed() {
    appStore.setSiderCollapsed(!collapsed.value)
}

const getMobileClass = computed<CSSProperties>(() => {
    if (isMobile.value) {
        return {
            position: 'fixed',
            zIndex: 50

        }
    }
    return {

    }
})




watch(
    isMobile,
    (val) => {
        appStore.setSiderCollapsed(val)
    },
    {
        immediate: true,
        flush: 'post',
    },
)

const selectFirend = ref<string>()

//右键菜单项
const options = [
    {
        label: '发送消息',
        key: 'sendmsg'
    },
    {
        label: '删除好友',
        key: 'deletefirend'
    }];

const showDropdownRef = ref({
    x: 0,
    y: 0,
    isVisible: false,
    checkFirend: ''
})

function showContextMenu(uid: string, event: MouseEvent) {
    // 阻止默认的右键菜单
    event.preventDefault();
    // 显示自定义的菜单
    nextTick().then(() => {
        showDropdownRef.value.isVisible = true
        showDropdownRef.value.x = event.clientX
        showDropdownRef.value.y = event.clientY
        showDropdownRef.value.checkFirend = uid
    })
}

//切换右键菜单项
function onContextMenuClickoutside() {

    showDropdownRef.value.isVisible = false
}
const emit = defineEmits(['switchPanel'])

//右键菜单选中项
function onContentMenuSelect(key: string | number) {
    showDropdownRef.value.isVisible = false
    switch (key) {
        case "deletefirend":

            firendStore.deleteFriend(showDropdownRef.value.checkFirend);
            break
        case "sendmsg":
            //添加或者激活 history
            let  firend=firendStore.getFriend(showDropdownRef.value.checkFirend)
            if(!firend) return
            forumStore.addHistory({
                uuid:firend.id,
                title:firend.name,
                description:firend.description,
                type:"private",
                isEdit:false,
                unread:0
            })
            forumStore.setActive(showDropdownRef.value.checkFirend)
            //切换面板
            emit('switchPanel', "chat");
            break;
        default:
            window.$message?.info("选中了菜单：" + String(key))
    }
}


</script>

<template>
    <NLayoutSider :collapsed="collapsed" :collapsed-width="10" :width="220"
        :show-trigger="isMobile ? false : 'arrow-circle'" collapse-mode="transform" bordered :style="getMobileClass"
        @show-collapsed-content="false" @update-collapsed="handleUpdateCollapsed">
        <div class="flex flex-col  text-sm">
            <template v-if="!dataSources || !dataSources.length">
                <div class="flex flex-col items-center mt-4 text-center text-neutral-300">
                    <!--没有聊天的时候-->
                    <SvgIcon icon="ri:inbox-line" class="mb-2 text-3xl" />
                    <span>还没有好友<br />快去认识有趣的人吧</span>
                </div>
            </template>
            <template v-else>
                <div class="py-3">
                    <!--好友-->
                    <div v-for="(item, index) of dataSources" :key="index">
                        <a class="relative flex items-center gap-3  px-3  h-14 break-all   cursor-pointer hover:bg-neutral-100 group dark:border-neutral-800 dark:hover:bg-[#24272e]"
                            :class="selectFirend == item.id && ['bg-[#c4c5c6]', 'dark:bg-[#24272e]']"
                            @click="handleSelect(item)" @contextmenu="showContextMenu(item.id, $event)">
                            <AvatarComponent :user-id="item.id" :size="40" :user-name="item.name" :avatar="item.avatar" />
                            <div class="flex  flex-col overflow-hidden break-all text-ellipsis whitespace-nowrap mr-3 ">
                                <span class="text-sm mb-1" style=" ">{{ item.name }}</span>
                            </div>
                        </a>
                    </div>
                </div>
            </template>
        </div>
    </NLayoutSider>

    <n-dropdown placement="bottom-start" trigger="manual" :x="showDropdownRef.x" :y="showDropdownRef.y" :options="options"
        :show="showDropdownRef.isVisible" :on-clickoutside="onContextMenuClickoutside" @select="onContentMenuSelect" />
</template>
