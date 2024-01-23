import { ss } from '@/utils/storage'

const LOCAL_NAME = 'friendStorage'
//获取好友
export function getLocalFriends(): Friend.friend[] {
    let localSetting: Friend.friend[] | undefined = ss.get(LOCAL_NAME)
    if (!localSetting) {
        localSetting=[];
    }
    return localSetting;
}

export function setLocalFriends(setting: Friend.friend[]): void {
    ss.set(LOCAL_NAME, setting)
}

