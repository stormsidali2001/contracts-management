import { Middleware } from "redux";
import { Socket ,io} from "socket.io-client";
import { refresh_token, setCredentials } from "../auth/authSlice";
import authService from "../auth/services/auth.service";
import { Notification } from "./models/Notification.interface";
import { NotificationEvents } from "./models/NotificationEvents";
import { connectionEstablished, recieveNotification, recieveNotifications, startConnecting } from "./notificationSlice";



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
            })
            socket.on("connect_error", async (err) => {
               
                console.log("t11",err?.message)
                if(err?.message === 'unauthorized' && dt > 2000){
                     dt = Date.now() - then;
                    then = Date.now()
                  try{
                    const data = await authService.refresh()
                    setCredentials(data)
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
        }
        
        next(action);
    }
}

export default notificationMiddleware;