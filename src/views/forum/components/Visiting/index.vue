<script setup lang="ts">
import { NButton } from 'naive-ui'
import AvatarComponent from '@/views/forum/components/Chat/Message/Avatar.vue'
import { forumChatStore, useFriendStore } from '@/store'
import useForumMemoryStore from '@/store/modules/forum/forumMemory'
import { computed } from 'vue';

const forumMemory = useForumMemoryStore();
const forumStore = forumChatStore();
const firendStore = useFriendStore()

interface Props {
  roomid?: string
  uid: string
}
const props = defineProps<Props>()
const userInfo = computed(() => {
  if (props.roomid) {
    //查找房间下的用户
    return forumMemory.getRoomTargetUser(props.uid, props.roomid);
  }
  else {
    //查找用户列表
    return firendStore.getFriend(props.uid)
  }
})

function privateChat() {
  if (!userInfo.value) {
    window.$message?.warning("未找到用户信息");
    return;
  }

  //检测是否好友
  let friend = firendStore.getFriend(props.uid)
  if (props.roomid && !friend) {
    let room = forumStore.getRoom(props.roomid)
    if (!room) {
      window.$message?.warning("未找到聊天所在房间");
      return;
    }

    let firend: Friend.friend = {
      id: userInfo.value.id ?? "",
      name: userInfo.value.name,
      avatar: userInfo.value.avatar,
      description: userInfo.value.description,
      async: false,
      origin: "来自于" + room.name
    }
    firendStore.addFirend(firend)
  }
  else if (!friend) {
    let firend: Friend.friend = {
      id: userInfo.value.id ?? "",
      name: userInfo.value.name,
      avatar: userInfo.value.avatar,
      description: userInfo.value.description,
      async: false,
      origin: ""
    }
    firendStore.addFirend(firend)
  }

  //创建history(会自动检查是否已经存在聊天)
  let history: Forum.ForumHistory = {
    title: userInfo.value.name,
    isEdit: false,
    uuid: userInfo.value.id,
    type: "private",
    unread: 0
  }
  forumStore.addHistory(history, []);
  forumStore.setActive(props.uid);
}

</script>
<template>
  <div class="bg-[#fff] w-72 shadow-lg">
    <div class="flex py-1">
      <div class="p-3">
        <AvatarComponent :user-id="userInfo?.id" :size="62" :user-name="userInfo?.name" :avatar="userInfo?.avatar" />
      </div>
      <div class="py-3">
        <span class="text-base">{{ userInfo?.name }}</span>
        <p class="text-zinc-400 text-sm">{{ userInfo?.description }}</p>
      </div>
    </div>
    <hr>
    <div class="flex justify-center py-3 mt-2">
      <NButton type="info" @click="privateChat">发送消息</NButton>
    </div>
  </div>
</template>