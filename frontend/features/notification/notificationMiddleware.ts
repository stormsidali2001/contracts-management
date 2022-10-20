import { Middleware } from "redux";
import { Socket ,io} from "socket.io-client";
import { refresh_token, setCredentials } from "../auth/authSlice";
import { UserRole } from "../auth/models/user-role.enum";
import authService from "../auth/services/auth.service";
import { VendorStats } from "../statistics/models/VendorStats.interface";
import { newCreatedUserEvent, newVendorStats } from "../statistics/StatisticsSlice";
import { Entity } from "./models/Entity.enum";
import { Notification } from "./models/Notification.interface";
import { NotificationEvents } from "./models/NotificationEvents";
import { Operation } from "./models/Operation.enum";
import { StatsEvents } from "./models/StatsEvents.interface";
import { UserEvent } from "./models/UserEvent.interface";
import { UserEventsTypes } from "./models/UserEventTypes.enum";
import { connectionEstablished, recieveNotification, recieveNotifications, recieveUserEvent, recieveUserEvents, startConnecting } from "./notificationSlice";


const format = (d:Date)=>{
    const newD = new Date(d);
    return newD.toISOString().replace(/T[0-9:.Z]*/g,"");

}

const notificationMiddleware:Middleware = store=>{
    class SocketConnection{
        private static socket:Socket| null = null;
        private constructor(){
    
        }
    
    
        public static  getInstance(jwt:string){
            if(!this.socket){
                this.socket = io("http://localhost:8080/notifications",{
                    auth: {
                        token: jwt
                    }, 
                    transports:['websocket']
                    
                })
            }
            return this.socket;
        }
    }
   
    let socket:Socket;
    let then = Date.now();
    let dt = 0;
    return next =>action=>{
        const auth = store.getState().auth;
        const notificationState = store.getState().notification;
        const isConnected =  notificationState.isConnected;
        
        if(startConnecting.match(action) ){
            console.log("t10",notificationState)
            socket = SocketConnection.getInstance(auth.jwt)

            socket.on('connect',()=>{
                store.dispatch(connectionEstablished())
                socket.emit(NotificationEvents.RequestAllNotifications)
                socket.emit(UserEventsTypes.REQUEST_ALL_EVENTS);
            })
            socket.on("connect_error",  (err) => {
                socket.close()
               alert("connection error")
                console.log("t11",{k:err?.message})
                if(err?.message.includes('unauthorized')  ){
                     dt = Date.now() - then;
                    then = Date.now()
                
                    setTimeout(async ()=>{
                        const data = await authService.refresh()
                        console.log("tt20",data)
                        setCredentials(data)
                        socket.auth = {
                            token:data.jwt
                        };
                         socket.connect()
                    },2000)
                  

                 
             
                }
            });

            socket.on(NotificationEvents.SendAllNotifications,(notifications:Notification[])=>{
                store.dispatch(recieveNotifications({notifications}))
            })
            socket.on(NotificationEvents.sendNotification,(notification:Notification)=>{
                store.dispatch(recieveNotification({notification}))
            })
            socket.on(UserEventsTypes.SEND_EVENTS,(events:UserEvent[])=>{
                store.dispatch(recieveUserEvents({events}))
            })
            socket.on(UserEventsTypes.SEND_EVENT,(event:UserEvent)=>{
                store.dispatch(recieveUserEvent({event}))
                
                const options = [Entity.JURIDICAL , Entity.EMPLOYEE , Entity.ADMIN];
                if(options.includes(event.entity)){

                     store.dispatch(newCreatedUserEvent({type:event.entity,operation:event.operation}))
                }
                

              
            })
          
        }
        
        next(action);
    }
}

export default notificationMiddleware;