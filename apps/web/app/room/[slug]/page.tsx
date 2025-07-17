import axios from "axios";
import { BACKEND_URL } from "../../config";
import { ChatRoom } from "../../components/ChatRoom";

async function getRoomId(slug: string) {
   const response = await axios.get(`${BACKEND_URL}/room/${slug}`);
   if (!response.data.room) {
       throw new Error("Room not found");
   }
   return response.data.room.id;
}

export default async function ChatRoom1({ params }: { params: { slug: string } }) {
    const slug1 = (await params).slug;
    let roomId: string;
    
    try {
        roomId = await getRoomId(slug1);
    } catch (error ) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center p-8 bg-red-50 rounded-lg">
                    <h1 className="text-2xl font-bold text-red-700 mb-4">Room Not Found</h1>
                    <p className="text-red-600 mb-4">The room `{slug1}` does not exist.</p>
                    
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Room: {slug1}</h1>
              
            </div>
            <ChatRoom id={roomId} />
        </div>
    );
}
