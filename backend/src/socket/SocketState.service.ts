import { Injectable, Logger } from "@nestjs/common";
import { Namespace, Server, Socket } from "socket.io";

@Injectable()
export class SocketStateService{
    private socketState = new Map<string,Socket[]>();
    public notificationServer:Namespace = null;
    constructor(){
      Logger.debug(`initialized`,'SocketStateService')
    }
    add(userId:string, socket:Socket){
        const sockets:Socket[] = this.socketState.get(userId) || [];
        this.socketState.set(userId,[...sockets,socket]);
        Logger.debug( `socket :${socket.id} was added to user: ${userId} total sockets:${this.get(userId).length}`,'SocketStateService/add')
        return true;
    }
     remove(userId: string, socket: Socket): boolean {
        const sockets = this.socketState.get(userId)

        if (!sockets) {
          return true
        }
     
        const newSockets = sockets.filter(s => s.id !== socket.id)
     
        if (!newSockets.length) {
          this.socketState.delete(userId)
        } else {
          this.socketState.set(userId, newSockets)
        }

        Logger.debug( `socket :${socket.id} was removed from  user: ${userId}`,'SocketStateService/remove')
     
        return true
    }
    get(userId:string){
        return this.socketState.get(userId) ||[];
    }
    public getAll(): Socket[] {
        let all = []
        this.socketState.forEach(sockets => {
          all = [...all,...sockets]
        
        })
        return all;
      }
    
     emitIfConnected(userData:{userId:string,data:any}[],eventName:string){
      Logger.warn(JSON.stringify(userData),eventName)
      userData.forEach(({data,userId})=>{
        const sockets = this.get(userId)
              Logger.debug(`user: ${userId} sockets ${sockets.length} `,eventName)

       
          sockets.forEach((socket,index)=>{
            Logger.debug(`socket ${index+1} of ${userId} revieved ${data}`,eventName)
            this.notificationServer.to(socket.id).emit(eventName,data);
          })
          
        
      })
        
       
     }
     emitConnected(data:any,eventName:string){
       this.getAll().forEach(socket=>{
          socket.emit(eventName,data)
          Logger.debug(`${socket.id} recieved ${JSON.stringify(data)}`,eventName)
       })
        
       
     }

}