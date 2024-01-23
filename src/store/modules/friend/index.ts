import { getLocalFriends, setLocalFriends } from './helper'
import { defineStore } from 'pinia'


export const useFriendStore = defineStore('friend-store', {

    state: (): Friend.friend[] => getLocalFriends(),
    actions: {
        updateFriend(uid: string, friend: Partial<Friend.friend>) {
            const index = this.$state.findIndex(x => x.id === uid);
            if (index === -1) {
                return;
            }
            const updatedFriend = { ...this.$state[index], ...friend };
            this.$state[index] = updatedFriend;
            this.recordState()
        },

        addFirend(friend: Friend.friend) {
            let _friend = this.$state.find(x => x.id == friend.id)
            if (_friend != null) {
                this.updateFriend(friend.id, friend);
                return;
            }
            else {
                this.$state.push(friend);
                this.recordState()
            }

        },

        deleteFriend(uid: string) {
            const chatIndex = this.$state.findIndex(item => item.id === uid)
            if (chatIndex != -1) {
                this.$state.splice(chatIndex, 1)
                this.recordState()
            }
        },

        //获取一个朋友
        getFriend(uid: string) {
            const chatIndex = this.$state.findIndex(item => item.id === uid)
            if (chatIndex != -1) {
                return this[chatIndex];
            }
            return undefined;
        },
        recordState() {
            setLocalFriends(this.$state)
        },
    },
})
