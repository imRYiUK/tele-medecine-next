/**
 * WebSocket Configuration
 * Centralized configuration for WebSocket connections
 */

export const WEBSOCKET_CONFIG = {
  // Base WebSocket URL - can be overridden by environment variable
  BASE_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001',
  
  // Namespaces
  NAMESPACES: {
    NOTIFICATIONS: '/', // Default namespace for notifications
    CHAT: '/chat',      // Chat namespace
  },
  
  // Connection settings
  CONNECTION: {
    TIMEOUT: 20000,           // 20 seconds
    RECONNECTION_ATTEMPTS: 5,
    RECONNECTION_DELAY: 1000,
    PING_INTERVAL: 30000,     // 30 seconds for chat
  },
  
  // Transport options
  TRANSPORTS: ['websocket', 'polling'],
};

/**
 * Get the full WebSocket URL for a specific namespace
 */
export const getWebSocketUrl = (namespace: string = WEBSOCKET_CONFIG.NAMESPACES.NOTIFICATIONS): string => {
  const baseUrl = WEBSOCKET_CONFIG.BASE_URL;
  const cleanNamespace = namespace.startsWith('/') ? namespace : `/${namespace}`;
  return `${baseUrl}${cleanNamespace}`;
};

/**
 * Get WebSocket connection options
 */
export const getWebSocketOptions = (token: string) => ({
  auth: { token },
  transports: WEBSOCKET_CONFIG.TRANSPORTS,
  reconnection: true,
  reconnectionAttempts: WEBSOCKET_CONFIG.CONNECTION.RECONNECTION_ATTEMPTS,
  reconnectionDelay: WEBSOCKET_CONFIG.CONNECTION.RECONNECTION_DELAY,
  timeout: WEBSOCKET_CONFIG.CONNECTION.TIMEOUT,
  forceNew: true,
}); 