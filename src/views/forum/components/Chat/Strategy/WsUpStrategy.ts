 
//请求服务器同步好资料
export function AsyncFriendAttr(uid: string) {
    let msg = {
        uid: uid,
        act: "asyncfriend"
    }
    window.$forumSocket.send(JSON.stringify(msg));
}

//上传用户
export function UpTheUserAttr(user: Forum.Member) {
    let msgModel = {
        act: "chgname"
    }
    let msg = Object.assign({}, msgModel, user)
    //const mergedObj = { ...obj1, ...obj2 }
    window.$forumSocket.send(JSON.stringify(msg));
}