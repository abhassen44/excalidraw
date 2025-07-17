import { WebSocketServer , WebSocket } from "ws";
import jwt, { decode, JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const socket = new WebSocketServer({port:8081});


function checkUser(token : string) : string | null{
 try {
    const decoded = jwt.verify(token || '', JWT_SECRET); 
    if(typeof decoded == "string"){
        return null;
    }
    if(!decoded || !decoded.userId){
        return null;
    }
    return decoded.userId;
 } catch (err) {
    console.error(err);
    return null;
 }
}

// const rooms = new Map<string, WebSocket[]>(); // Map to hold rooms and their associated WebSocket clients
interface User {
    ws : WebSocket;
    userId : string;
    rooms : string[];
}

const user : User[] = [];


socket.on("connection", (ws: WebSocket , req ) => {
    console.log('New client connected');
    const url = req.url;
    if (!url) {
        return 
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || ''; 
    const userId = checkUser(token);

    if (!userId) {
        ws.close(1008, 'Unauthorized'); // Close with code 1008 (policy violation)
        return;
    }


    user.push({
        ws: ws,
        userId: userId,
        rooms: []
    });

    


    ws.on('message', async(message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === 'join') {
                const room = data.room;
                // Check if the user is already in the room
                const existingUser = user.find(u => u.ws === ws);
                if (existingUser && !existingUser.rooms.includes(room)) {
                    existingUser.rooms.push(room);
                }
                ws.send(JSON.stringify({ type: 'joined', room }));
            } else if (data.type === 'chat') {
                const room = data.room;
                const clients = user.filter(u => u.rooms.includes(room));

                await prismaClient.chat.create({
                    data: {
                        userId: userId,
                        roomId: data.roomId,
                        message: data.message
                    }
                });
                
               clients.forEach(client => {
                       client.ws.send(JSON.stringify({ type: 'chat', message: data.message, room }));
                 });
            }else if (data.type === 'leave') {
                const room = data.room;
                const existingUser = user.find(u => u.ws === ws);
                if (existingUser) {
                    existingUser.rooms = existingUser.rooms.filter(r => r !== room);
                }
                ws.send(JSON.stringify({ type: 'left', room }));  
            }
        } catch (err) {
            console.error(err);
        }
    });

   
    
    // ws.on('message', (message) => {
    // const data = JSON.parse(message.toString());
    // if (data.type === 'join') {
    //     const room = data.room;
    //     if (!rooms.has(room)) {
    //         rooms.set(room, []);
    //     }
    //     rooms.get(room)?.push(ws);
    //     ws.send(JSON.stringify({ type: 'joined', room }));
    // } else if (data.type === 'message') {
    //     const room = data.room;
    //     const clients = rooms.get(room);
    //     if (clients) {
    //         clients.forEach(client => {
    //             if (client !== ws) {
    //                 client.send(JSON.stringify({ type: 'message', message: data.message }));
    //             }
    //         });
    //     }
    // }
    // });

    

});

