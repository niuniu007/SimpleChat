<script setup  lang="ts">
import { computed } from 'vue'
import { NGrid, NGridItem, NInput, NButton, NTooltip } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import AvatarComponent from '@/views/forum/components/Chat/Message/Avatar.vue'
import useForumMemoryStore from '@/store/modules/forum/forumMemory'
import { forumChatStore, useFriendStore } from '@/store'
import { defineEmits } from "vue";

const chatStore = forumChatStore()
const firendStore = useFriendStore()

const history = computed(() => {
    return chatStore.getChatHistoryByUuid();
})

const room = computed(() => {
    if (history.value?.type == "room") {
        let _room = chatStore.rooms.find(x => x.id == history.value?.uuid)
        return _room;
    }
    return undefined;
})

const forumMemoryStore = useForumMemoryStore();


const members = computed(() => {
    const roomMember = forumMemoryStore.userInnerRooms.find(x => x.id == history.value?.uuid)
    if (!roomMember) return
    return roomMember.members
})



const friendInfo = computed(() => {
    if (!history.value) return {};
    return firendStore.getFriend(history.value.uuid) ?? { name: history.value.title, id: history.value.uuid, avatar: "", description: history.value.description, origin: "" }
})


interface Props {
    chatId: string
}

const props = defineProps<Props>()

//删除聊天记录
function clearChats() {
    if (!props.chatId) return;
    window.$dialog?.warning({
        title: '系统消息',
        content: '确定要删除吗？',
        positiveText: '确定',
        negativeText: '不确定',
        onPositiveClick: () => {
            chatStore.clearChatByUuid(props.chatId);
            window.$message?.success('已删除记录')
        },
        onNegativeClick: () => {

        }
    })

}

//离开房间
function laveaRoom() {
    if (!props.chatId) return;
    window.$dialog?.warning({
        title: '系统消息',
        content: '确定要退出房间么？',
        positiveText: '确定',
        negativeText: '不确定',
        onPositiveClick: () => {
            let msg: any = {
                room: props.chatId,
                act: "lavearoom",
            }
            window.$forumSocket.send(JSON.stringify(msg));
            deleteHistory();
            //删除好友
            firendStore.deleteFriend(props.chatId);
        },
        onNegativeClick: () => {

        }
    })
}

//删除当前聊天
function deleteHistory() {
    if (!history) return
    chatStore.clearChatByUuid(props.chatId);
    const index = chatStore.history.findIndex(x => x.uuid == props.chatId);
    if (index > -1) {
        chatStore.deleteHistory(index);
    }
}

const emit = defineEmits(['showVisiting'])
function isVistaMP(uid: string, event: any) {
    //在鼠标处显示名片信息
    const x = event.clientX; // 鼠标点击的横坐标
    const y = event.clientY; // 鼠标点击的纵坐标
    emit('showVisiting', uid, x, y);

}

</script>
<template  v-if="history">
    <div class="  bg-[#f9f9f9] dark:bg-[#24272e] overflow-y-auto  shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]   top-16   bottom-0 absolute"
        style="z-index:9;  right: 0px; width:300px;  ">
        <div v-if="history?.type == 'private'">
            <div class="p-4  ">
                <div class="  ">
                    <AvatarComponent :user-id="friendInfo?.id" :user-name="friendInfo.name" :avatar="friendInfo.avatar"
                        :size="45"></AvatarComponent><br />
                    <span class="claer"> {{ friendInfo.name }}</span>

                </div>
            </div>
            <div class="p-4">
                <p style="font-size:1.3em; font-weight:600; ">签名</p>
                <p style="font-size:1.1em; color:#a7a7a7;">{{ friendInfo.description }}</p>
                <p style="font-size:1.3em; font-weight:600; ">来源</p>
                <p style="font-size:1.1em; color:#a7a7a7;">{{ friendInfo.origin }}</p>
            </div>

            <div class="flex justify-center   m-4 " style="flex-direction:column;">
                <NButton quaternary type="error" class="w-full" :on-click="clearChats">
                    删除聊天记录
                </NButton>
                <hr />
                <NButton quaternary type="error" class="w-full" :on-click="deleteHistory">
                    删除聊天
                </NButton>
            </div>
        </div>
        <div v-else class="flex-1  absolute h-full  bottom-0 w-full" style="   ">
            <!-- 群组聊天设置 -->
            <div class="flex items-left   p-4">
                <n-input placeholder="搜索">
                    <template #prefix>
                        <SvgIcon icon="ic:baseline-search"></SvgIcon>
                    </template>
                </n-input>
            </div>
            <div class="p-4">
                <div v-if="members && members.length > 0">
                    <NGrid x-gap="8" cols="2 s:4 m:5 l:5 " responsive="screen">
                        <NGridItem v-for=" (item, index) of  members " :key="index">
                            <div @click="isVistaMP(item.id, $event)">
                                <AvatarComponent :image="true" :user-id="item.id" :user-name="item.name"
                                    :avatar="item.avatar" :size="45"></AvatarComponent>
                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <div style="white-space:nowrap;overflow: hidden; text-overflow:ellipsis;">{{
                                            item.name
                                        }}
                                        </div>
                                    </template>
                                    {{ item.name }}
                                </n-tooltip>
                            </div>
                        </NGridItem>
                    </NGrid>
                </div>
                <div v-else>
                    <!--虚位以待-->
                    <div class="flex flex-col items-center mt-4 text-center text-neutral-300">
                        <!--没有聊天的时候-->
                        <SvgIcon icon="ri:inbox-line" class="mb-2 text-3xl" />
                        <span>虚位以待</span>
                    </div>
                </div>

                <div class="flex justify-center p-5" v-if="members && members?.length > 8">
                    <NButton text color="#6e6e6e">
                        查看更多
                    </NButton>
                </div>
            </div>
            <div style="" class="p-4">
                <p style="font-size:1.3em; font-weight:600; ">房间名字</p>
                <p style="font-size:1.1em; color:#a7a7a7;">{{ room?.name }}</p>
                <p style="font-size:1.2em; font-weight:500;  -webkit-text-stroke: 0.5px; ">房间描述</p>
                <p style="font-size:1.1em; color:#a7a7a7;">{{ room?.description }}</p>
                <p style="font-size:1.2em; font-weight:500; -webkit-text-stroke: 0.5px;">房间公告</p>
                <p style="font-size:1.1em; color:#a7a7a7;">{{ room?.affiche }}</p>
            </div>

            <div class="flex justify-center   m-4 " style="flex-direction:column;">
                <NButton quaternary type="error" class="w-full" :on-click="clearChats">
                    删除聊天记录
                </NButton>
                <hr />
                <NButton quaternary type="error" class="w-full" :on-click="laveaRoom">
                    删除聊天
                </NButton>
            </div>
        </div>
    </div>
</template>

<style scoped>
.light-green {
    padding: 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.green {
    padding: 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>