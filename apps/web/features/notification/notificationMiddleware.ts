import { Middleware } from "redux";
import { Socket ,io} from "socket.io-client";
import { refresh_token, setCredentials } from "@/features/auth/authSlice";
import { UserRole } from "@/features/auth/models/user-role.enum";
import authService from "@/features/auth/services/auth.service";
import { VendorStats } from "@/features/statistics/models/VendorStats.interface";
import { newCreatedUserEvent, newVendorStats, StatisticsSlice ,newAgreement} from "@/features/statistics/StatisticsSlice";
import { queryClient } from "@/lib/query-client";
import { statisticsKeys } from "@/lib/query-keys";
import { SERVER_URL } from "@/api/axios";
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
                this.socket = io(`${SERVER_URL}/notifications`,{
                    auth: {
                        token: jwt
                    }, 
                    transports:['websocket']
                    
                })
            }
            return this.socket;
        }
    }
   
    let socket:Socket|null = null;
    let then = Date.now();
    let dt = 0;
    return next =>action=>{
        const auth = store.getState().auth;
        const notificationState = store.getState().notification;
        const isConnected =  notificationState.isConnected;
        
        if(startConnecting.match(action) && !socket){
            socket = SocketConnection.getInstance(auth.jwt)

            socket.on('connect',()=>{
                if(!socket) return;
                store.dispatch(connectionEstablished())
               
                socket.emit(NotificationEvents.RequestAllNotifications)
                socket.emit(UserEventsTypes.REQUEST_ALL_EVENTS);
            })
            socket.on("connect_error",  (err) => {
                if(!socket) return;
                socket.close()
                socket.removeAllListeners()
               alert("connection error")
                if(err?.message.includes('unauthorized')  ){
                     dt = Date.now() - then;
                    then = Date.now()
                
                    setTimeout(async ()=>{
                        if(!socket) return;
                        const data = await authService.refresh()
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
            socket.on(NotificationEvents.sendNotification,(notification:string)=>{
                store.dispatch(recieveNotification({notification:{id: Date.now().toString(),message:notification }}))
            })
            socket.on(UserEventsTypes.SEND_EVENTS,(events:UserEvent[])=>{
                store.dispatch(recieveUserEvents({events}))
            })
            socket.on(UserEventsTypes.SEND_EVENT,(event:UserEvent)=>{
                store.dispatch(recieveUserEvent({event}))
            })
            socket.on("INCR_USER",({ operation , type}:{type:Entity,operation:Operation})=>{
                const statsSlice = store.getState().StatisticsSlice as  StatisticsSlice;
                if(statsSlice.end_date || statsSlice.start_date) return;
                store.dispatch(newCreatedUserEvent({type,operation}))
                queryClient.invalidateQueries({ queryKey: statisticsKeys.all })
            })
            socket.on("INC_AGR",({ operation , type}:{type:Entity,operation:Operation})=>{
                const statsSlice = store.getState().StatisticsSlice as  StatisticsSlice;
                if(statsSlice.end_date || statsSlice.start_date) return;
                store.dispatch(newAgreement({operation,type}))
                queryClient.invalidateQueries({ queryKey: statisticsKeys.all })
            })
          
        }
        
        next(action);
    }
}

export default notificationMiddleware;