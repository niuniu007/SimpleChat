import { defineStore } from 'pinia'
import { ref } from 'vue'

const useForumMemoryStore = defineStore('forumMemory', () => {

  const userInnerRooms = ref<Forum.RoomMember[]>([])
  const userLoginState = ref<boolean>(false);   //用户登录状态
  const socketConnectState = ref<boolean>(false);  //socket链接装填

  //当前用户加入到房间状态
  const joinRoom = (room: Forum.ForumRoom) => {
    if (userInnerRooms.value.findIndex(x => x.id === room.id) === -1) {
      userInnerRooms.value.push({
        id: room.id,
        members: []
      })
    }
  }

  //用户进入房间后业务处理
  const intoRoom = (uuid: string, member: Forum.Member) => {
    const room = userInnerRooms.value.find(x => x.id == uuid)
    if (room) {
      //验证是否重复
      if(room.members.findIndex(x=>x.id==member.id)>-1){
        return;
      }

      room.members.push(member);
    }
  }

  const  laveaRoom=(roomid:string, uid:string)=>{

    const room = userInnerRooms.value.find(x => x.id == roomid)
    if (room) {
      //验证是否重复
      const  index=room.members.findIndex(x=>x.id==uid);
      if(index==-1){
        return;
      }

      room.members.splice(index,1);
    }
  }


  //获取聊天房间内的用户
  const getRoomTargetUser = (uuid: string, roomid: string) => {
    const room = userInnerRooms.value.find(x => x.id == roomid)
    if (!room) {
      return
    }
    const user = room.members.find(x => x.id == uuid)
    return user;
  }

  return {
    userInnerRooms,
    userLoginState,
    socketConnectState,
    joinRoom,
    intoRoom,
    laveaRoom,
    getRoomTargetUser
  }
})

export default useForumMemoryStore