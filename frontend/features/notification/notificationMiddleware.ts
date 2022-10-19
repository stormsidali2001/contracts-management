import { Middleware } from "redux";
import { Socket ,io} from "socket.io-client";
import { refresh_token, setCredentials } from "../auth/authSlice";
import { UserRole } from "../auth/models/user-role.enum";
import authService from "../auth/services/auth.service";
import { newCreatedUserEvent, newCreatedVendorEvent } from "../statistics/StatisticsSlice";
import { Entity } from "./models/Entity.enum";
import { Notification } from "./models/Notification.interface";
import { NotificationEvents } from "./models/NotificationEvents";
import { Operation } from "./models/Operation.enum";
import { StatsEvents } from "./models/StatsEvents.interface";
import { UserEvent } from "./models/UserEvent.interface";
import { UserEventsTypes } from "./models/UserEventTypes.enum";
import { connectionEstablished, recieveNotification, recieveNotifications, recieveUserEvent, recieveUserEvents, startConnecting } from "./notificationSlice";



const notificationMiddleware:Middleware = store=>{
    
    let socket:Socket;
    let then = Date.now();
    let dt = 0;
    return next =>action=>{
        const auth = store.getState().auth;
        const notificationState = store.getState().notification;
        const isConnected =  notificationState.isConnected;
        
        if(startConnecting.match(action) && !socket){
            console.log("t10",notificationState)
            socket = io("http://localhost:8080/notifications",{
                auth: {
                    token: auth.jwt 
                }, 
                transports:['websocket']
                
            })

            socket.on('connect',()=>{
                store.dispatch(connectionEstablished())
                socket.emit(NotificationEvents.RequestAllNotifications)
                socket.emit(UserEventsTypes.REQUEST_ALL_EVENTS);
            })
            socket.on("connect_error", async (err) => {
               alert("connection error")
                console.log("t11",err?.message)
                if(err?.message === 'unauthorized' && dt > 2000){
                     dt = Date.now() - then;
                    then = Date.now()
                  try{
                    const data = await authService.refresh()
                    setCredentials(data)
                    socket.auth = {
                        token:data.jwt
                    };
                    socket.connect()

                  }catch(err){
                    console.error(err)
                  }
             
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
                // if(options.includes(event.entity)){

                //     store.dispatch(newCreatedUserEvent({type:event.entity,operation:event.operation}))
                // }
                // else
                 if(event.entity === Entity.VENDOR){
                    alert("")
                    store.dispatch(newCreatedVendorEvent({date:event.createdAt,operation:event.operation}))
                }
            })
          
        }
        
        next(action);
    }
}

export default notificationMiddleware;