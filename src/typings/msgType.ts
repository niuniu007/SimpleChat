 
     export   enum MsgType {
        RepeatSgin = -1,

        AdminRecall = 1001,
        UserRecall = 9,
        JoinRoom = 2,
        RoomUserList = 1,
        LeaveRoom = 3,
        BannerdUser = 14,  //封禁用户
        RoomChange = 10,
        RoomShut = 13,
        RoomNotice = 15,   //房间公告
        RoomList = 0,  //房间列表
        ToRoom = 5,  //房间消息
        ToPeople = 7, //私信消息
        User = 6, //用户实体
        AsyncFriend = 21,  //同步friend
    }
 