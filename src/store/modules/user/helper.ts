import { ss } from '@/utils/storage'
import randomName  from  '@/components/nickname/random-name.js'
import { v4 as uuidv4 } from 'uuid';
 
const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  id:string
  avatar: string
  name: string
  description: string
}

export interface UserState {
  userInfo: UserInfo
}


export function defaultSetting(): UserState {
  return {
    userInfo: {
      id:uuidv4(),
      avatar: 'https://raw.githubusercontent.com/Chanzhaoyu/chatgpt-web/main/src/assets/avatar.jpg',
      name: randomName.getName() ,
      description: '本人很懒 ',
    },
  }
}

//获取用户配置，如果不存在则生成默认的
export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
  if(!localSetting){
      //如果用户信息不存在，则默认随机生成一个
      const  userState=defaultSetting();
      setLocalState(userState);
      return  userState;
  }
  return localSetting;
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}
