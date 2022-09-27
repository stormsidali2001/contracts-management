import { Middleware } from "redux";
import { Socket ,io} from "socket.io-client";
import { Notification } from "./models/Notification.interface";
import { connectionEstablished, NotificationEvents, recieveNotification, recieveNotifications, startConnecting } from "./notificationSlice";




const notificationMiddleware:Middleware = store=>{
    
    let socket:Socket;
    
    return next =>action=>{
        const notificationState = store.getState().notification;
        const isConnected =  notificationState.isConnected;
        if(startConnecting.match(action) && !socket){
            socket = io("http://localhost:8080/notifications",{
                extraHeaders:{
                    'Authorization':`Bearer ${notificationState.jwt}`
                }
                
            })

            socket.on('connect',()=>{
                store.dispatch(connectionEstablished())
                socket.emit(NotificationEvents.RequestAllNotifications)
            })

            socket.on(NotificationEvents.RequestAllNotifications,(notifications:Notification[])=>{
                store.dispatch(recieveNotifications({notifications}))
            })
            socket.on(NotificationEvents.RecieveNotification,(notification:Notification)=>{
                store.dispatch(recieveNotification({notification}))
            })
        }
        
        next(action);
    }
}

export default notificationMiddleware;