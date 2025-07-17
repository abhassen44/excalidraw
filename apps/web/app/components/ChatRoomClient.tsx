"use client"

import { useSocket } from "../hooks/useSocket"
import { useState, useEffect } from "react";

type Message = {
  id: number;
  message: string;
  userId: string;
  roomId: number;
}

export function ChatRoomClient({ messages, id }: { messages: Message[], id: string }) {
  const { socket, loading, error } = useSocket();
  const [currentMessage, setCurrentMessage] = useState("");
  const [chats, setChats] = useState<Message[]>(messages);
  const [connectionStatus, setConnectionStatus] = useState<string>("Connecting...");

  useEffect(() => {
    if (socket && !loading) {
      socket.send(JSON.stringify({ type: "join", roomId: Number(id) }));

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "chat") {
          setChats((prev) => [
            ...prev,
            {
              id: Date.now(), // Temporary ID
              message: data.message,
              userId: data.userId ?? "unknown",
              roomId: Number(id)
            }
          ]);
        }
      };
    }
  }, [socket, loading, id]);

  const sendMessage = () => {
    if (socket && currentMessage.trim()) {
      socket.send(JSON.stringify({
        type: "chat",
        roomId: Number(id),
        message: currentMessage
      }));
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    if (error) {
      setConnectionStatus(error);
    } else if (loading) {
      setConnectionStatus("Connecting...");
    } else if (socket) {
      setConnectionStatus("Connected");
    }
  }, [socket, loading, error]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Room Chat</h1>
        <div className={`px-3 py-1 rounded text-sm ${error ? 'bg-red-100 text-red-700' : loading ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
          {connectionStatus}
        </div>
      </div>

      <div className="border rounded-lg p-4 mb-4 h-[400px] overflow-y-auto">
        {chats.map((m, index) => (
          <div key={index} className="mb-2 p-2 bg-gray-100 rounded">
            {m.message}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
