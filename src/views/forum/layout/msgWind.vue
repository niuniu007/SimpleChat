<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, ref } from 'vue'
import { NAutoComplete, NButton, NInput } from 'naive-ui'
import { v4 as uuidv4 } from 'uuid';
import { useScroll } from '@/views/chat/hooks/useScroll'
import Message from '../components/Chat/Message/index.vue'
import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { forumChatStore, useUserStore, useAppStore } from '@/store'
import { t } from '@/locales'
import useForumMemoryStore from '@/store/modules/forum/forumMemory'
import chatSeting from './ChatSeting.vue'
import EmojiPicker from 'vue3-emoji-picker'
import Visting from '../components/Visiting/index.vue'
import 'vue3-emoji-picker/css'
import box from '../components/Chat/ChatBox/Box.vue'

const chatStore = forumChatStore()
const userStore = useUserStore();
const appStore = useAppStore();
const forumGeneralState = useForumMemoryStore();
const { isMobile } = useBasicLayout()
const { scrollRef, scrollToBottom } = useScroll()


//当前被激活的聊天项
const history = computed(() => {
    return chatStore.getChatHistoryByUuid();
})

//当前房间的内存数据（房间的一些临时信息/房间用户等）
const roomGeneralData = computed(() => {
    return forumGeneralState.userInnerRooms.find(x => x.id == chatStore.active);
})

//客户端用户数据
const curUser = userStore.userInfo;

//激活的聊天数据
const dataSources = computed(() => {
    return chatStore.getChatByUuid(history.value?.uuid)
})

watch(chatStore.$state, (newData, oldData) => {
    scrollToBottom();
});

//房间数据
const dataRooms = computed(() => {
    return chatStore.rooms ?? [];
});

const prompt = ref<string>('')  //聊天文本框


//发送消息
async function handleSubmit() {

    //发送消息
    const message = prompt.value
    if (!message || message.trim() === '')
        return

    if (!history || history.value == null) {
        return;
    }
    if (!forumGeneralState.socketConnectState) {
        window.$message?.warning("未链接服务器");
        return;
    }

    //判断当前会话是否房间会话，如果是房间会话则发送房间消息。否则发送私人消息
    if (history.value.type === 'room') {
        //未加入房间也不允许发送
        if (forumGeneralState.userInnerRooms.findIndex(x => x.id == chatStore.active) == -1) {
            return;
        }

        const chatMsg: Forum.Toall = {
            room: history.value.uuid,
            msgid: uuidv4(),
            act: "toall",
            at: {
                atuser: [],
                isall: false
            },
            msg: message
        }
        window.$forumSocket.send(JSON.stringify(chatMsg))
        //创建消息记录，需要解决消息id的问题
        chatStore.addChatByUuid(history.value.uuid,
            {
                uuid: chatMsg.msgid,
                time: new Date().toLocaleString(),
                content: message,
                error: false,
                userId: curUser.id,
                userName: curUser.name,
                loading: true
            })
    }
    else {

        const chatMsg: Forum.privateMsg = {  //消息
            msgid: uuidv4(),
            touser: history.value.uuid,
            act: "privatechat",
            msg: message
        };
        window.$forumSocket.send(JSON.stringify(chatMsg))
        let setloading = true
        if (chatMsg.touser == curUser.id) {
            setloading = false   //自己发给自己不用加载（根据业务自行设定）
        }

        chatStore.addChatByUuid(history.value.uuid,
            {
                uuid: chatMsg.msgid,
                time: new Date().toLocaleString(),
                content: message,
                error: false,
                userId: curUser.id,
                userName: curUser.name,
                loading: setloading
            })
    }
    chatStore.updateHistory(history.value.uuid, { description: prompt.value })
    prompt.value = "";  //清空
    scrollToBottom()
}



function handleEnter(event: KeyboardEvent) {
    if (!isMobile.value) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            handleSubmit()
        }
    }
    else {
        if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault()
            handleSubmit()
        }
    }
}




function handleJoinRoom(room: Forum.ForumRoom) {

    if (forumGeneralState.userInnerRooms.findIndex(x => x.id == room.id) == -1) {
        console.log("加入房间，新建群组会话");
        //发送加入房间的命令
        const joinroom = {
            act: "joinroom",
            room: "default"
        };
        window.$forumSocket.send(JSON.stringify(joinroom))
    }
}


function handleDelete(index: number) {
    window.$dialog?.warning({
        title: t('chat.deleteMessage'),
        content: t('chat.deleteMessageConfirm'),
        positiveText: t('common.yes'),
        negativeText: t('common.no'),
        onPositiveClick: () => {
            if (!history || history.value == null) {
                return;
            }
            chatStore.deleteChatByUuid(history.value.uuid, index)
        },
    })
}


const isVisibleChatSeting = ref<boolean>(false)

const placeholder = computed(() => {
    if (isMobile.value)
        return t('chat.placeholderMobile')
    return t('chat.placeholder')
})


const buttonDisabled = computed(() => {
    return !prompt.value || prompt.value.trim() === ''
})

const footerClass = computed(() => {
    let classes = ['p-4', "pt-1"]
    if (isMobile.value)
        classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
    return classes
})

onMounted(() => {
    scrollToBottom()
})

onUnmounted(() => {
    //卸载模块
})



const isPickerVisible = ref<boolean>(false);
function onSelectEmoji(emoji: any) {
    console.log(emoji)
    prompt.value += emoji.i;
}


function showPicker() {
    isPickerVisible.value = !isPickerVisible.value;
}



function getTargetUserInfo(uid?: string) {
    if (!uid || !roomGeneralData) {
        return undefined
    }

    if (uid == curUser.id) {
        return curUser;
    }

    const user = roomGeneralData.value?.members.find(x => x.id == uid)
    if (!user) {
        const u: Forum.Member = {
            id: uid,
            name: "已离开用户"
        }
        return u;
    }
    return user;
}


const chatSetMain = ref(null)
const emojiPickerMain = ref(null)
const documentClickHander = function (e: any) {

    if (chatSetMain.value && isVisibleChatSeting) {
        let element = chatSetMain.value as Element;
        let isSelf = element.contains(e.target)
        if (!isSelf) {
            isVisibleChatSeting.value = false;
            isVisibleVisiting.value = false;
            return;
        }

    }
    if (emojiPickerMain.value && isPickerVisible) {
        let element = emojiPickerMain.value as Element;
        let isSelf = element.contains(e.target)
        if (!isSelf) {
            isPickerVisible.value = false;
            return;
        }
    }

}


onMounted(() => {
    document.addEventListener('click', documentClickHander)
})

onUnmounted(() => {
    document.removeEventListener("click", documentClickHander);
})

//名片
const chatMain = ref(null)
const vistingUid = ref<string>();
const isVisibleVisiting = ref<boolean>()
const visitingPosition = {
    x: 0,
    y: 0
}
function showVisiting(uid: string, x: number, y: number) {
    vistingUid.value = uid;
    isVisibleVisiting.value = true
    if (!chatMain.value) return;
    let element = chatMain.value as Element;
    let boundingRect = element.getBoundingClientRect();
    let scrollTop = window.scrollY || window.pageYOffset;
    let scrollLeft = window.scrollX || window.pageXOffset;
    let top = boundingRect.top + scrollTop;
    let left = boundingRect.left + scrollLeft;
    visitingPosition.x = x - left - 288;
    visitingPosition.y = y - top;
}   
</script>
<template>
    <div class="flex flex-col w-full h-fill relative " ref="chatMain" @click=" history && (history.unread = 0)">
        <Visting v-if="isVisibleVisiting" :uid="vistingUid ?? ''" :roomid="history?.uuid" @click.stop
            :style="{ left: visitingPosition.x + 'px', top: visitingPosition.y + 'px' }"
            style="position: absolute;z-index:999;">
        </Visting>

        <head v-if="history" class="flex   h-15 pr-2 border-b border-solid  border-b-gray-400/[0.2]  "
            style="justify-content: space-between; ">
            <div class="flex item-center  p-5   h-15">
                {{ history?.title }}
            </div>
            <div>
                <div>
                    &nbsp;
                </div>
                <div>
                    <NButton circle text class="" style="" @click.stop @click="isVisibleChatSeting = !isVisibleChatSeting">
                        <SvgIcon icon="basil:other-1-outline" style="font-size:36px;" />
                    </NButton>
                </div>
            </div>
        </head>
        <div ref="chatSetMain" v-if="isVisibleChatSeting">
            <chatSeting :chat-id="history?.uuid ?? ''" @showVisiting="showVisiting"></chatSeting>
        </div>
        <main class="flex-1 overflow-hidden" style="position: relative;">
            <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto scrollbar ">
                <div id="image-wrapper" class="w-full m-auto dark:bg-[#101014]" :class="[isMobile ? 'pt-2 px-2' : 'pt-2 px-3']">
                    <template v-if="!dataSources.length">
                        <div class="flex items-center flex-col justify-center mt-4 text-center ">
                            <SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl" />
                            <div v-if="!history">
                                <div>选择一个房间开始群聊开始会话</div>
                                <NButton type="warning" @click="handleJoinRoom(item)" v-for="(item, index) of dataRooms"
                                    :key="index">
                                    <template #icon>
                                        <SvgIcon icon="ic:twotone-home" />
                                    </template>
                                    {{ item.name }}
                                </NButton>
                            </div>
                            <div v-else>
                                <div>开始和他/她聊天</div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <Message v-for="(item, index) of dataSources" :key="index" :date-time="item.time"
                            :user="getTargetUserInfo(item.userId)" :text="item.content"
                            :inversion="curUser.id == item.userId" :error="item.error" :loading="item.loading"
                            @delete="handleDelete(index)" />
                    </template>
                </div>
                <box></box>
            </div>

            <div ref="emojiPickerMain" @click.top :class="{ hidden: !isPickerVisible }"
                style="position: absolute;left:15px; bottom:10px; z-index:9; ">
                <EmojiPicker :theme="appStore.theme" :native="true" @select="onSelectEmoji" />
            </div>
        </main>

        <footer :class="footerClass" class="border-t border-solid  border-t-gray-400/[0.2] ">
            <div class="flex">
                <NButton v-if="!isMobile" quaternary circle @click="showPicker" @click.stop>
                    <span class="text-xl  text-[#edcc31]">
                        <SvgIcon icon="mdi:emoji" />
                    </span>
                </NButton>
            </div>
            <div class="items-center justify-between space-x-2">
                <div style="position: relative;">
                    <NAutoComplete v-model:value="prompt">
                        <template #default="{ handleInput, handleBlur, handleFocus }">
                            <NInput v-model:value="prompt" type="textarea" :placeholder="placeholder"
                                :autosize="{ minRows: (isMobile ? 1 : 2), maxRows: (isMobile ? 2 : 4) }"
                                @input="handleInput" @focus="handleFocus" @blur="handleBlur" @keypress="handleEnter" />
                        </template>
                    </NAutoComplete>

                    <NButton type="primary" :disabled="buttonDisabled"
                        :style="(!isMobile) ? (' position:absolute; bottom:10px; right:1em; ') : ''" @click="handleSubmit">
                        <template #icon>
                            <span class="dark:text-black">
                                <SvgIcon icon="ri:send-plane-fill" />
                            </span>
                        </template>
                    </NButton>
                </div>
            </div>
        </footer>

    </div>
</template>
  