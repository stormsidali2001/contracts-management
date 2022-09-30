import { Injectable, Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";

@Injectable()
export class SocketStateService{
    private socketState = new Map<string,Socket[]>();
    public notificationServer:Server;

    add(userId:string, socket:Socket){
        const sockets:Socket[] = this.socketState.get(userId) || [];
        Logger.debug( JSON.stringify([...sockets,socket]) ,'SocketStateService/add')
        this.socketState.set(userId,[...sockets,socket]);
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
     
        return true
    }
    get(userId:string){
        return this.socketState.get(userId) ||[];
    }
    public getAll(): Socket[] {
        const all = []
        this.socketState.forEach(sockets => all.push(sockets))
        return all;
      }
    
     emitConnected(userData:{userId:string,data:any}[],eventName:string){
      Logger.warn(JSON.stringify(userData),eventName)
      userData.forEach(({data,userId})=>{
        const sockets = this.get(userId)
              Logger.warn(`user: ${userId} sockets ${JSON.stringify(sockets)} `,eventName)

        if(sockets.length > 0){
          sockets.forEach(socket=>{
            Logger.warn(`socket ${socket.id} of ${userId} revieved ${data}`,eventName)
            this.notificationServer.to(socket.id).emit(eventName,data);
          })
          
        }
      })
        const keys = this.socketState.has;
       
     }

}