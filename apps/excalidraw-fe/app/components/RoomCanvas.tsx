"use client";
import { useEffect, useRef } from "react";
import Canvas from "./Canvas";
import { useState } from "react";
import { WS_URL } from "../config";
export default function RoomCanvas({roomId}:{roomId:string}) {
    //  const canvasRef = useRef<HTMLCanvasElement>(null);
     const [socket , setSocket] = useState<WebSocket | null>(null);


     useEffect(() =>{

        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYmRjNzk1My02OGRlLTRiNjItYjdkYy01ZDk4Zjk2MWU2YjMiLCJ1c2VybmFtZSI6ImpvaG5kb2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTExNzk5NzV9.7vNw5hFQXkPM2LUeerknCFXwlVIF65SzTqMyAXF7r-w`);
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({ 
                type: 'join',
                 roomId: roomId 
                }));
        }
        
        
     },[roomId]);

     
    if(!socket){
        return <div> connecting to server</div>
    }

    return (
        <div>
            <Canvas roomId={roomId} socket={socket}></Canvas>
          
        </div>
    );
}
