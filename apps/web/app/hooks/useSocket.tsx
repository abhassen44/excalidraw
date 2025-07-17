import { useEffect,useState } from "react";
import { WS_URL } from "../config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("No authentication token found");
            setLoading(false);
            return;
        }

        const connect = () => {
            const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYmRjNzk1My02OGRlLTRiNjItYjdkYy01ZDk4Zjk2MWU2YjMiLCJ1c2VybmFtZSI6ImpvaG5kb2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTExMDM0NDd9.Bmc9Avimzxn6WNNTsbDkqKeZzn3sOs98W1dM3KZJl3E`);

            ws.onopen = () => {
                setLoading(false);
                setSocket(ws);
                setError(null);
            };

            ws.onclose = () => {
                setSocket(null);
                setLoading(true);
                // Attempt to reconnect after 3 seconds
                setTimeout(connect, 3000);
            };

            ws.onerror = (event) => {
                setError("Connection error occurred");
                ws.close();
            };
        };

        connect();

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    return { socket, loading, error };
}