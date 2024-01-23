declare namespace Friend {
  export interface friend {
    id: string
    avatar?: string
    name: string
    description?: string,
    async: boolean,  //资料同步
    origin: string  //来自于
  }

}

