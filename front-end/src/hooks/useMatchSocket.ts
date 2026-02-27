import { useEffect } from "react";

const WS_BASE = import.meta.env.VITE_API_BASE.replace(/^http/, "ws");

export function useMatchSocket(onEvent: (data: any) => void) {
  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE}/ws/matches/`);

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      onEvent(data);
    };

    return () => ws.close();
  }, []);
}