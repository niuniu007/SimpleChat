import { defineStore } from 'pinia'
import { getLocalState, setLocalState } from './helper'


export const forumChatStore = defineStore('forum-store', {
  state: (): Forum.ForumChat => getLocalState(),

  getters: {

    getChatHistoryByCurrentActive(state: Forum.ForumChat) {
      const index = state.history.findIndex(item => item.uuid === state.active)
      if (index !== -1)
        return state.history[index]
      return null
    },

    getChatHistoryByUuid(state: Forum.ForumChat) {
      return (uuid?: string) => {
        if (uuid && uuid != null)
          return state.history.find((x) => x.uuid === uuid)
        return state.history.find(item => item.uuid === state.active);
      }
    },

    getChatByUuid(state: Forum.ForumChat) {
      return (uuid?: String) => {
        if (uuid)
          return state.chat.find(item => item.uuid === uuid)?.data ?? []
        return state.chat.find(item => item.uuid === state.active)?.data ?? []
      }
    },



    getRoom(state) {
      return (uuid: string) => {
        return state.rooms.find((x) => x.id === uuid)
      }
    }
  },

  actions: {

    addHistory(history: Forum.ForumHistory, chatData: Forum.ChatMsg[] = []) {
      const index = this.history.findIndex(item => item.uuid === history.uuid)
      if (index == -1) {
        this.history.unshift(history)
        this.chat.unshift({ uuid: history.uuid, data: chatData })
        this.reloadRoute(history.uuid)
      }
      else {
        //激活
        if (chatData) {
          const chat = this.chat.find(x => x.uuid == history.uuid);
          chat?.data.push.apply(chat.data, chatData)
        }

      }
    },

    updateHistory(uuid: string, edit: Partial<Forum.ForumHistory>) {
      const index = this.history.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.history[index] = { ...this.history[index], ...edit }
        this.recordState()
      }
    },

    historyUnreadIncrement(uuid: string) {
      const history = this.history.find(item => item.uuid === uuid)
      if (history) {
        history.unread += 1;
        this.recordState()
      }
    },

    async deleteHistory(index: number) {
      this.history.splice(index, 1)
      this.chat.splice(index, 1)

      if (this.history.length === 0) {
        this.active = null
        this.reloadRoute()
        return
      }

      if (index > 0 && index <= this.history.length) {
        const uuid = this.history[index - 1].uuid
        this.active = uuid
        this.reloadRoute(uuid)
        return
      }

      if (index === 0) {
        if (this.history.length > 0) {
          const uuid = this.history[0].uuid
          this.active = uuid
          this.reloadRoute(uuid)
        }
      }

      if (index > this.history.length) {
        const uuid = this.history[this.history.length - 1].uuid
        this.active = uuid
        this.reloadRoute(uuid)
      }
    },

    async setActive(uuid: string) {
      this.active = uuid
      return await this.reloadRoute(uuid)
    },

    async setRooms(rooms: Forum.ForumRoom[]) {
      this.rooms = rooms;
      this.recordState()
    },

    getChatByUuidAndIndex(uuid: string, index: number) {
      if (!uuid || uuid === '') {
        if (this.chat.length)
          return this.chat[0].data[index]
        return null
      }
      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1)
        return this.chat[chatIndex].data[index]
      return null
    },


    //添加聊天消息
    addChatByUuid(uuid: string, chat: Forum.ChatMsg) {
      if (!uuid || uuid == '') {
        return;
      }

      const index = this.chat.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.chat[index].data.push(chat)
        this.recordState()
      }
    },


    updateChatByUuid(uuid: string, index: number, chat: Forum.ChatMsg) {
      if (!uuid || uuid === '') {
        if (this.chat.length) {
          this.chat[0].data[index] = chat
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data[index] = chat
        this.recordState()
      }
    },

    updateChatSomeByUuid(uuid: String, index: number, chat: Partial<Forum.ChatMsg>) {
      if (!uuid || uuid === '') {
        if (this.chat.length) {
          this.chat[0].data[index] = { ...this.chat[0].data[index], ...chat }
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data[index] = { ...this.chat[chatIndex].data[index], ...chat }
        this.recordState()
      }
    },

    //更新聊天记录里的某条消息
    updateChatMsgByUuid(uuid: string, msgid: string, chat: Partial<Forum.ChatMsg>) {
      if (!uuid || uuid === '') {
        return
      }

      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1) {
        let msgIndex = this.chat[chatIndex].data.findIndex(x => x.uuid == msgid)

        this.chat[chatIndex].data[msgIndex] = { ...this.chat[chatIndex].data[msgIndex], ...chat }
        this.recordState()
      }
    },

    deleteChatByUuid(uuid: string, index: number) {
      if (!uuid || uuid === '') {
        if (this.chat.length) {
          this.chat[0].data.splice(index, 1)
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data.splice(index, 1)
        this.recordState()
      }
    },

    clearChatByUuid(uuid: string) {
      if (!uuid || uuid === '') {
        throw "没有id";
        return
      }

      const index = this.chat.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.chat[index].data = []
        this.recordState()
      }
    },

    async reloadRoute(uuid?: string) {
      this.recordState()
      //await router.push({ name: 'Chat', params: { uuid } })
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
