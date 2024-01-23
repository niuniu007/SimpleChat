//创建websocket 链接，
//建立链接，断开链接，重试链接，消息处理
//使用策略模式处理响应消息
import type { WebSocketStrategy, MsgFace } from './forum/components/Chat/Strategy/WsDownStrategy.js'
 
export class ChatSocket {
    socket: WebSocket;
    strategies: Map<number, WebSocketStrategy> = new Map<number, WebSocketStrategy>(); // 策略集合
    readyState:number;
    constructor(url: string) {
        this.readyState=0;
        this.socket = new WebSocket(url);
        this.socket.onclose = this.close.bind(this);
        this.socket.onerror = this.error.bind(this);
        this.socket.onmessage = this.message.bind(this);
    }





    // 添加策略
    addStrategy(code: number, strategy: WebSocketStrategy) {
        this.strategies.set(code, strategy);
    }

    // 删除策略
    removeStrategy(code: number) {
        this.strategies.delete(code);
    }

    open() {
        const that=this;
        this.readyState=WebSocket.CONNECTING;
        this.socket.onopen = function (e) {
            console.log("[open] Connection established"+e);
            that.readyState=WebSocket.OPEN;
            that.openCallbck();
        };

    }

    openCallbck() {
       
    }


    send(message: string) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        }
        else {
            console.log("socket 链接未打开");
        }
    }


    message(event: MessageEvent) {
        const message = event.data as string;
        // 根据消息的 code 值获取对应的策略
        const res: MsgFace = JSON.parse(message);
       
        const strategy = this.strategies.get(res.code);
        if (strategy) {
            strategy.handleMessage(message); 
        } else {
            console.log("No strategy found for code", res.code);
        }
    }

    close(event: CloseEvent) {
        this.readyState=WebSocket.CLOSING;
        if (event.wasClean) {
            this.readyState=WebSocket.CLOSED;
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            console.log('[close] Connection died');
        }

        this.closeCallback(event);//
    }

    closeCallback(event: CloseEvent) {
       
    }


    error(event: Event): any {
        console.log(`[error] ${event}`);
    }


    connectState() {
        if (this.socket &&  this.socket.readyState === WebSocket.OPEN) {
            return true;
        }
        return false;
    }


}