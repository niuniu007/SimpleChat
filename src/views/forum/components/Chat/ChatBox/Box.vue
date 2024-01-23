<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'
import { forumChatStore, useFriendStore } from '@/store'
import useForumMemoryStore from '@/store/modules/forum/forumMemory'
import { AsyncFriendAttr } from '../Strategy/WsUpStrategy'

const chatStore = forumChatStore()
const firendStore = useFriendStore()
const forumGeneralState = useForumMemoryStore();

const roomGeneralData = computed(() => {
    return forumGeneralState.userInnerRooms.find(x => x.id == chatStore.active);
})

const firend = computed(() => {
    if (!chatStore.active || history.value?.type != 'private') return;
    return firendStore.getFriend(chatStore.active)
})

//当前被激活的聊天项
const history = computed(() => {
    return chatStore.getChatHistoryByUuid();
})

function handleJoinCurrentRoom() {
    if (!forumGeneralState.socketConnectState || !forumGeneralState.userLoginState) {
        return;
    }
    if (!history.value || !chatStore.active) {
        return;
    }
    if (history.value.type === 'room') {
        if (forumGeneralState.userInnerRooms.findIndex(x => x.id == chatStore.active) == -1) {
            //没有加入房间的执行加入房间
            const sginMsg: Forum.JoinRoom = {
                act: "joinroom",
                room: chatStore.active
            }
            window.$forumSocket.send(JSON.stringify(sginMsg))
        }
    }
}


function addFriend() {
    if (!history.value) return;
    let firendModel: Friend.friend = {
        id: history.value.uuid,
        name: history.value.title,
        description: "",
        avatar: "",
        async: false,
        origin: "来自于聊天"
    }
    firendStore.addFirend(firendModel);
    AsyncFriendAttr(firendModel.id); //向服务器请求：同步好友信息
}

</script>

<template>
    <div v-if="!forumGeneralState.socketConnectState || !forumGeneralState.userLoginState"
        class="absolute  w-full   bottom-0 left-0 flex justify-center bg-[#fff48e]" style="z-index:999;">
        <div style="font-weight: bold; color:#9e9e9e;">服务不可用或未登录</div>
    </div>
    <div v-else-if="history">
        <div v-if="history.type == 'room'" class="sticky bottom-0 left-0  flex   justify-center mb-4  ">
            <NButton v-if="!roomGeneralData" type="warning" @click="handleJoinCurrentRoom">
                <SvgIcon icon="ri:stop-circle-line" />
                进入房间
            </NButton>
        </div>

        <div v-else>
            <!--检测是否是好友-->
            <div v-if="!firend" class="flex justify-between px-4 y-2 bg-[#fff4b5] w-full top-0 absolute">
                <span>他/她还不是你的好友，保存为好友放丢失哦</span>
                <span>
                    <a href="javascript:;" title="加为好友" class="text-blue-600" @click="addFriend">加为好友</a>
                </span>
            </div>
        </div>
    </div>
</template>