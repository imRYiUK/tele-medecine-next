import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import Cookies from 'js-cookie';
import { getWebSocketUrl, getWebSocketOptions } from '../config/websocket';

interface Notification {
  notificationID: string;
  titre: string;
  message: string;
  type?: string;
  lien?: string;
  dateCreation: string;
  estLu: boolean;
  utilisateurID: string;
  createdByID?: string;
  createdBy?: {
    utilisateurID: string;
    nom: string;
    prenom: string;
    email: string;
  };
}

interface UseNotificationSocketProps {
  onNewNotification?: (notification: Notification) => void;
  onNotificationRead?: (notificationId: string) => void;
  onAllNotificationsRead?: () => void;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export const useNotificationSocket = ({
  onNewNotification,
  onNotificationRead,
  onAllNotificationsRead,
  onError,
  onConnected,
  onDisconnected,
}: UseNotificationSocketProps = {}) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isConnectingRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get token from cookies
  const token = Cookies.get('token');

  // Stabilize callback functions to prevent infinite loops
  const stableOnNewNotification = useCallback(onNewNotification || (() => {}), []);
  const stableOnNotificationRead = useCallback(onNotificationRead || (() => {}), []);
  const stableOnAllNotificationsRead = useCallback(onAllNotificationsRead || (() => {}), []);
  const stableOnError = useCallback(onError || (() => {}), []);
  const stableOnConnected = useCallback(onConnected || (() => {}), []);
  const stableOnDisconnected = useCallback(onDisconnected || (() => {}), []);

  // Initialize socket connection
  useEffect(() => {
    if (!token || isConnectingRef.current) return;

    isConnectingRef.current = true;

    // Create socket connection to notifications namespace
    const socket = io(getWebSocketUrl(), getWebSocketOptions(token));

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to notification server');
      setIsConnected(true);
      isConnectingRef.current = false;
      
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      stableOnConnected();
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from notification server:', reason);
      setIsConnected(false);
      isConnectingRef.current = false;
      stableOnDisconnected();

      // Attempt to reconnect if not manually disconnected
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Server or client initiated disconnect, don't auto-reconnect
        console.log('Manual disconnect, not reconnecting');
      } else {
        // Network or other issues, attempt to reconnect
        console.log('Attempting to reconnect...');
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (socketRef.current) {
              socketRef.current.connect();
            }
          }, 2000);
        }
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Notification connection error:', error);
      isConnectingRef.current = false;
      stableOnError(error.message);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected to notification server after ${attemptNumber} attempts`);
      setIsConnected(true);
      stableOnConnected();
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
      stableOnError(`Reconnection failed: ${error.message}`);
    });

    socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to notification server');
      stableOnError('Failed to reconnect to notification server');
    });

    // Notification events
    socket.on('notification', (notification: Notification) => {
      console.log('New notification received:', notification);
      stableOnNewNotification(notification);
    });

    socket.on('notification_read', (data: { notificationId: string }) => {
      console.log('WebSocket: Notification status updated to read:', data.notificationId);
      stableOnNotificationRead(data.notificationId);
    });

    socket.on('all_notifications_read', () => {
      console.log('All notifications marked as read');
      stableOnAllNotificationsRead();
    });

    socket.on('error', (error) => {
      console.error('Notification error:', error);
      stableOnError(error.message);
    });

    return () => {
      isConnectingRef.current = false;
      
      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, stableOnNewNotification, stableOnNotificationRead, stableOnAllNotificationsRead, stableOnError, stableOnConnected, stableOnDisconnected]);

  return {
    isConnected,
  };
}; 