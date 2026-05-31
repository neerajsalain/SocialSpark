// Returns the Socket.io server instance stored on global by server.js
export default function getIO() {
  return global._io || null;
}
