import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string) ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : window.location.origin);

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("✦ Connected to STHAVYA Real-Time WebSocket Server:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });
  }
  return socket;
}

// ─── COLLABORATIVE FLOOR PLAN HELPERS ─────────────────────────────────────────

export function joinFloorPlan(planId: string, user: any) {
  const s = getSocket();
  s.emit("plan:join", { planId, user });
}

export function leaveFloorPlan(planId: string) {
  const s = getSocket();
  s.emit("plan:leave", { planId });
}

export function broadcastRoomMove(planId: string, roomId: string, x: number, y: number, user: any) {
  const s = getSocket();
  s.emit("plan:room-move", { planId, roomId, x, y, user });
}

export function broadcastRoomUpdate(planId: string, room: any, user: any) {
  const s = getSocket();
  s.emit("plan:room-update", { planId, room, user });
}

export function broadcastRoomAdd(planId: string, room: any, user: any) {
  const s = getSocket();
  s.emit("plan:room-add", { planId, room, user });
}

export function broadcastRoomDelete(planId: string, roomId: string, user: any) {
  const s = getSocket();
  s.emit("plan:room-delete", { planId, roomId, user });
}

export function broadcastCursorMove(planId: string, x: number, y: number, user: any) {
  const s = getSocket();
  s.emit("plan:cursor-move", { planId, x, y, user });
}

// ─── BOOKING NOTIFICATIONS HELPERS ────────────────────────────────────────────

export function joinUserNotifications(userId: string) {
  const s = getSocket();
  s.emit("join:user", userId);
}

export default {
  getSocket,
  joinFloorPlan,
  leaveFloorPlan,
  broadcastRoomMove,
  broadcastRoomUpdate,
  broadcastRoomAdd,
  broadcastRoomDelete,
  broadcastCursorMove,
  joinUserNotifications,
};
