import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import Cookies from 'js-cookie';

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
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export const useNotificationSocket = ({
  onNewNotification,
  onNotificationRead,
  onError,
  onConnected,
  onDisconnected,
}: UseNotificationSocketProps = {}) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isConnectingRef = useRef(false);

  // Get token from cookies
  const token = Cookies.get('token');

  // Stabilize callback functions to prevent infinite loops
  const stableOnNewNotification = useCallback(onNewNotification || (() => {}), []);
  const stableOnNotificationRead = useCallback(onNotificationRead || (() => {}), []);
  const stableOnError = useCallback(onError || (() => {}), []);
  const stableOnConnected = useCallback(onConnected || (() => {}), []);
  const stableOnDisconnected = useCallback(onDisconnected || (() => {}), []);

  // Initialize socket connection
  useEffect(() => {
    if (!token || isConnectingRef.current) return;

    isConnectingRef.current = true;

    // Create socket connection to notifications namespace
    const socket = io('http://localhost:3001', {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to notification server');
      setIsConnected(true);
      isConnectingRef.current = false;
      stableOnConnected();
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from notification server');
      setIsConnected(false);
      isConnectingRef.current = false;
      stableOnDisconnected();
    });

    socket.on('connect_error', (error) => {
      console.error('Notification connection error:', error);
      isConnectingRef.current = false;
      stableOnError(error.message);
    });

    // Notification events
    socket.on('notification', (notification: Notification) => {
      console.log('New notification received:', notification);
      stableOnNewNotification(notification);
    });

    socket.on('notification_read', (data: { notificationId: string }) => {
      console.log('Notification marked as read:', data.notificationId);
      stableOnNotificationRead(data.notificationId);
    });

    socket.on('error', (error) => {
      console.error('Notification error:', error);
      stableOnError(error.message);
    });

    return () => {
      isConnectingRef.current = false;
      socket.disconnect();
    };
  }, [token, stableOnNewNotification, stableOnNotificationRead, stableOnError, stableOnConnected, stableOnDisconnected]);

  return {
    isConnected,
  };
}; 