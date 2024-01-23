declare namespace Forum {

	//聊天室
	interface  ForumRoom{
		id:string,
		name:string,
        description?:string,
        affiche?:string
	}

    interface  ChatMsg{
        userId?:string,
        userName?:string,
        uuid:string,
        content:string,
        time:string,
        error?: boolean,
        loading?: boolean,
        sequence?:number

    }


	interface ForumHistory {
		title: string
		isEdit: boolean
		uuid: string 
		type:string
        description?:string,
        unread:number,  //未读消息
	}

	interface ForumChat {
		active: string | null
		rooms:ForumRoom[]
		history: ForumHistory[]
		chat: { uuid: string; data: ChatMsg[] }[]
        friends:Member[]
	}


    interface UploadBasice {
        id?: string,
        name?: string,
        act: string
    }

    interface JoinRoom extends UploadBasice {
        room: string,
        act: "joinroom"
    }

    interface Sign extends UploadBasice {

        act: "sign",
        avatar:string,
        msg: string
    }

    interface LeveaRoom extends UploadBasice {
        act: "levearoom",
        room: string
    }

    interface at {
        atuser: string[],
        isall: boolean
    }

    interface Toall extends UploadBasice {
        msg: string,
        msgid:string,
        act:"toall",
        at: at,
        room: string
    }

    interface ChangeName  extends UploadBasice{
        act:"chgname"
    }

    interface MsgRevoke  extends  UploadBasice{
        act:"msgrevoke",
        msgid:string,
        room:string
    }

    interface  privateMsg  extends  UploadBasice{
        msgid:string,
        act:"privatechat",
        msg:string,
        touser:string,
        syncinfo?:Member
    }

    interface  Member{
        id:string,
        name:string,
        avatar?:string,
        description?:string
    }

    interface  RoomMember{
        id:string,
        members:Member[]
    }

}