let socket;

export function initWebSocket(onMessage, onOpen, onClose, onError) {
  // Choose backend URL based on environment
  const backendUrl =
    process.env.NODE_ENV === "production"
      ? "wss://ai-voice-backend-production-ce85.up.railway.app"
      : "ws://localhost:3001";

  socket = new WebSocket(backendUrl);

  // Event listeners
  socket.onopen = () => {
    console.log("[WebSocket] Connected to", backendUrl);
    if (onOpen) onOpen();
  };

  socket.onmessage = (event) => {
    console.log("[WebSocket] Message received:", event.data);
    if (onMessage) onMessage(event);
  };

  socket.onclose = () => {
    console.log("[WebSocket] Connection closed");
    if (onClose) onClose();
  };

  socket.onerror = (error) => {
    console.error("[WebSocket] Error:", error);
    if (onError) onError(error);
  };

  return socket;
}

// Send data
export function sendMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.warn("[WebSocket] Cannot send, socket not open.");
  }
}

// Close connection
export function closeWebSocket() {
  if (socket) {
    socket.close();
  }
}
