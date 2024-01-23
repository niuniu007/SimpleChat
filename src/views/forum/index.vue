<script setup lang='ts'>
import { ref } from 'vue'
import Layout from './layout/layout.vue'
import { ChatSocket } from '@/views/Socket'
import { StrategyWarn, StrategyRoomMsg, StrategyJoinRoom, StrategyLeaveRoom, StrategyPriveMsg, StrategyRoomList, StrategyRoomUserList } from './components/Chat/Strategy/WsDownStrategy'
import  {StrategyAsyncFriendAttr}  from   './components/Chat/Strategy/WsDownStrategy'
import useForumMemoryStore from '@/store/modules/forum/forumMemory'
import  { MsgType} from  '@/typings/msgType'
import { useUserStore } from '@/store'
 
const userStore = useUserStore()
const forumGeneralState = useForumMemoryStore();

const _socketConnectState = true;
const socketConnectState = ref<boolean>(_socketConnectState);

const socket = new ChatSocket(import.meta.env.VITE_FORUM_WSURI);
socket.addStrategy(-1, new StrategyWarn());
socket.addStrategy(0, new StrategyRoomList());
socket.addStrategy(1, new StrategyRoomUserList());
socket.addStrategy(2, new StrategyJoinRoom());
socket.addStrategy(3, new StrategyLeaveRoom());
socket.addStrategy(7, new StrategyPriveMsg());
socket.addStrategy(5, new StrategyRoomMsg());
//socket.addStrategy(6, new Strategy());  //撤回消息
//socket.addStrategy(7, new StrategyTwo()); //改名
socket.addStrategy(MsgType.AsyncFriend,new  StrategyAsyncFriendAttr())
socket.open();
socket.openCallbck = function () {
    //获取用户数据，如果用户在则登录用户
    forumGeneralState.socketConnectState = true;
    if (forumGeneralState.userLoginState == false) {
        const userInfo = userStore.userInfo;
        const sginMsg: Forum.Sign = {
            id: userInfo.id,
            act: "sign",
            name: userInfo.name,
            avatar: userInfo.avatar,
            msg: "hello, Every one"
        }
        socket.send(JSON.stringify(sginMsg))
        forumGeneralState.userLoginState = true;
    }
}

socket.closeCallback = function (event: CloseEvent) {
    socketConnectState.value = false;
    forumGeneralState.socketConnectState = false;
}
window.$forumSocket = socket;
</script>
<template>
    <div v-if="!socketConnectState" style=" z-index:9999; "
        class="w-full absolute text-sm p-1  text-center bg-[#a2a2a2] text-[#fff]">
        与服务器链接断开，刷新页面重试
    </div>
    <Layout />
</template>@/typings/msgType