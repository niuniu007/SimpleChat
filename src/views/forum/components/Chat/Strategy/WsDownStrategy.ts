import { forumChatStore, useUserStore, useFriendStore } from '@/store'
import useForumMemoryStore from '@/store/modules/forum/forumMemory'
import { v4 as uuidv4 } from 'uuid';


const chatStore = forumChatStore();
const forumMemory = useForumMemoryStore()
const firendStore = useFriendStore()
const userStore = useUserStore();


export interface WebSocketStrategy {
  handleMessage(message: string): void;
}



export interface MsgFace {
  code: number,
  content: string,
  time: number
}

//用户警告策略
export class StrategyWarn implements WebSocketStrategy {

  handleMessage(message: string): void {
    console.log("Strategy One:", message.toUpperCase());
    const res: MsgFace = JSON.parse(message);
    window.$dialog?.warning({
      title: '系统消息',
      content: res.content,
      positiveText: '确定',
      maskClosable: false,
      onPositiveClick: () => {

      },
      onMaskClick: () => {
        //点击遮罩层
      },
    })
  }
}

//下发房间列表

export class StrategyRoomList implements WebSocketStrategy {

  handleMessage(message: string): void {
    console.log("room list:", message.toLowerCase());
    let res = JSON.parse(message);
    if (res.user_list) {
      chatStore.setRooms(res.user_list as Forum.ForumRoom[]);
    }
  }
}


export class StrategyRoomMsg implements WebSocketStrategy {
  //房间消息

  handleMessage(message: string): void {

    console.log("Strategy To  Room:", message.toLowerCase());
    window.$forumTip("新消息")
    let res = JSON.parse(message)
    if (res) {
      //获取用户
      if (res.uid == userStore.userInfo.id) {  //自己发出的消息（因为消息发出后前端添加到了聊天窗口所以这里不在添加，可以设置消息发送成功）
        chatStore.updateChatMsgByUuid(res.room, res.msgid, {
          loading: false
        });
        return
      }

      const chatUser = forumMemory.getRoomTargetUser(res.uid, res.room);
      if (!chatUser) return;

      chatStore.addChatByUuid(res.room, {
        uuid: res.msgid ?? uuidv4(),
        userId: res.uid,
        userName: res.nickname ?? '',
        content: res.content,
        time: res.time,
        error: false,
        loading: false
      });
      chatStore.historyUnreadIncrement(res.room)  //未读消息+1
      chatStore.updateHistory(res.room, { description: res.content })
    }
  }
}

//房间用户列表
export class StrategyRoomUserList implements WebSocketStrategy {

  handleMessage(message: string): void {
    console.log("room  user list:", message.toLowerCase());
    let res = JSON.parse(message);
    if (res) {
      const roomGetter = chatStore.getRoom  // 获取 getRoom getter
      const room = roomGetter(res.room) as Forum.ForumRoom
      if (room) {

        res.user_list.forEach((element: any) => {
          forumMemory.intoRoom(res.room, {
            id: element.id,
            name: element.nickName,
            avatar: element.picture,
            description: element.description
          });
        });
      }
    }
  }
}


//用户加入房间消息
export class StrategyJoinRoom implements WebSocketStrategy {
  handleMessage(message: string): void {
    console.log("join room:", message.toLowerCase());
    let res = JSON.parse(message);
    if (res) {
      const roomGetter = chatStore.getRoom  // 获取 getRoom getter
      const room = roomGetter(res.room) as Forum.ForumRoom

      //用户加入房间状态通知
      //如果加入房间的用户是当前用户，则要创建聊天窗口然后创建加入聊天的消息，否则直接创建加入聊天的消息
      if (res.user.id === userStore.userInfo.id) {
        //创建聊天窗口,如果窗口已经建立则不会冲i性能建立

        chatStore.addHistory({
          uuid: room.id,
          type: 'room',
          title: room.name,
          isEdit: false,
          unread: 0
        }, undefined);

        forumMemory.joinRoom(room);  //记录用户加入的房间
      }
      else {
        //其他用户加入到房间，保存到房间用户列表里
        forumMemory.intoRoom(res.room, {
          id: res.user.id,
          name: res.user.nickName,
          avatar: res.user.picture,
          description: res.user.description

        })
      }

      if (room) { //保存消息记录
        if (forumMemory.userInnerRooms.findIndex(x => x.id == res.room) != -1) {
          chatStore.addChatByUuid(res.room, {
            uuid: res.msgid ?? uuidv4(),
            content: `用户${res.user.nickName}加入房间`,
            time: res.time,
            error: false,
            loading: false
          });
        }
      }
    }
  }
}

//用户离开房间消息
export class StrategyLeaveRoom implements WebSocketStrategy {
  handleMessage(message: string): void {
    console.log("Strategy lavea room:", message.toLowerCase());
    let res = JSON.parse(message);
    if (res) {
      const room = res.room;
      const uid = res.uid;
      forumMemory.laveaRoom(room, uid);
    }
  }
}

//用户私聊消息
export class StrategyPriveMsg implements WebSocketStrategy {

  handleMessage(message: string): void {
    console.log("Strategy private chat:", message.toLowerCase());
    let res = JSON.parse(message);
    if (res) {
      if (res.msgModel == 'success') {
        chatStore.updateChatMsgByUuid(res.toUser, res.msgid, { loading: false });  //消息发送成功的处理
      }
      else if (res.msgModel == "istip") {     //提示消息

        chatStore.addChatByUuid(res.toUser, {
          userId: "",
          uuid: res.msgid,
          content: res.content,
          time: res.time
        });

        chatStore.updateChatMsgByUuid(res.toUser, res.msgid, {
          loading: false
        });
      }
      else if (res.msgModel == "newmsg") {
        chatStore.addHistory({
          uuid: res.fromUser,  //来自fromUser的聊天
          title: res.fromUserName,
          type: 'private',
          isEdit: false,
          unread: 0
        }, [{
          uuid: res.msgid,
          userId: res.fromUser,
          content: res.content,
          time: res.time
        }]);

        chatStore.historyUnreadIncrement(res.fromUser)  //未读消息+1
        chatStore.updateHistory(res.room, { description: res.content })
      }
    }

  }
}


//同步好友信息
export class StrategyAsyncFriendAttr implements WebSocketStrategy {

  handleMessage(message: string): void {
    console.log("async  user attr: ", message.toLowerCase());
    let res = JSON.parse(message);
    if (res) {
      firendStore.updateFriend(res.user.id, {
        id: res.user.id,
        name: res.user.nickName,
        avatar: res.user.picture,
        description: res.user.description,
        async: true
      });
    }
  }
}