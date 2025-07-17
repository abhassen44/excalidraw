import axios from "axios";
import { BACKEND_URL } from "../config";
import { ChatRoomClient } from "./ChatRoomClient";

async function getChats(roomId: string) {
   const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
   console.log(response.data.messages)
   return response.data.messages;

}



export async function ChatRoom({id}: {id: string}) {
    const messages = await getChats(id);
    return (
        <div>
            {/* <h1>these are the messages :</h1> */}
            <ChatRoomClient messages={messages} id={id}></ChatRoomClient>
        </div>
    );
}