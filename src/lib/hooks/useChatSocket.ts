import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import Cookies from 'js-cookie';
import { getWebSocketUrl, getWebSocketOptions, WEBSOCKET_CONFIG } from '../config/websocket';

interface ChatMessage {
  messageID: string;
  imageID: string;
  content: string;
  timestamp: string;
  sender: {
    utilisateurID: string;
    nom: string;
    prenom: string;
    email: string;
  };
}

interface UseChatSocketProps {
  imageID: string;
  onNewMessage?: (message: ChatMessage) => void;
  onUserTyping?: (userId: string, isTyping: boolean) => void;
  onUserJoined?: (userId: string) => void;
  onUserLeft?: (userId: string) => void;
  onOnlineUsers?: (users: string[]) => void;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  enabled?: boolean;
}

export const useChatSocket = ({
  imageID,
  onNewMessage,
  onUserTyping,
  onUserJoined,
  onUserLeft,
  onOnlineUsers,
  onError,
  onConnected,
  onDisconnected,
  enabled = true,
}: UseChatSocketProps) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  // Get token from cookies
  const token = Cookies.get('token');

  // Stabilize callback functions to prevent infinite loops
  const stableOnNewMessage = useCallback(onNewMessage || (() => {}), []);
  const stableOnUserTyping = useCallback(onUserTyping || (() => {}), []);
  const stableOnUserJoined = useCallback(onUserJoined || (() => {}), []);
  const stableOnUserLeft = useCallback(onUserLeft || (() => {}), []);
  const stableOnOnlineUsers = useCallback(onOnlineUsers || (() => {}), []);
  const stableOnError = useCallback(onError || (() => {}), []);
  const stableOnConnected = useCallback(onConnected || (() => {}), []);
  const stableOnDisconnected = useCallback(onDisconnected || (() => {}), []);

  // Initialize socket connection
  useEffect(() => {
    // Don't establish connection if disabled
    if (!enabled) {
      console.log('WebSocket connection disabled');
      return;
    }

    if (!token || isConnectingRef.current) return;

    isConnectingRef.current = true;

    // Create socket connection
    const socket = io(getWebSocketUrl(WEBSOCKET_CONFIG.NAMESPACES.CHAT), getWebSocketOptions(token));

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      isConnectingRef.current = false;
      stableOnConnected();
      
      // Start ping interval to keep connection alive
      pingIntervalRef.current = setInterval(() => {
        if (socket.connected) {
          socket.emit('ping');
        }
      }, WEBSOCKET_CONFIG.CONNECTION.PING_INTERVAL);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
      isConnectingRef.current = false;
      stableOnDisconnected();
      
      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Chat connection error:', error);
      isConnectingRef.current = false;
      stableOnError(error.message);
    });

    socket.on('connected', (data) => {
      console.log('Connection confirmed:', data);
    });

    // Chat events
    socket.on('newMessage', (message: ChatMessage) => {
      console.log('New message received:', message);
      stableOnNewMessage(message);
    });

    socket.on('messageSent', (data) => {
      console.log('Message sent successfully:', data);
    });

    socket.on('userTyping', ({ userId, isTyping }) => {
      console.log('User typing:', userId, isTyping);
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
      stableOnUserTyping(userId, isTyping);
    });

    socket.on('userJoinedRoom', ({ userId }) => {
      console.log('User joined room:', userId);
      stableOnUserJoined(userId);
    });

    socket.on('userLeftRoom', ({ userId }) => {
      console.log('User left room:', userId);
      stableOnUserLeft(userId);
    });

    socket.on('onlineUsers', ({ users }) => {
      console.log('Online users:', users);
      setOnlineUsers(users);
      stableOnOnlineUsers(users);
    });

    socket.on('joinedImageRoom', ({ imageID: joinedImageID }) => {
      console.log('Joined image room:', joinedImageID);
      setIsJoining(false);
      
      // Request online users for this room
      socket.emit('getOnlineUsers', { imageID: joinedImageID });
    });

    socket.on('leftImageRoom', ({ imageID: leftImageID }) => {
      console.log('Left image room:', leftImageID);
    });

    socket.on('pong', (data) => {
      console.log('Pong received:', data);
    });

    socket.on('error', (error) => {
      console.error('Chat error:', error);
      stableOnError(error.message);
    });

    return () => {
      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      isConnectingRef.current = false;
      socket.disconnect();
    };
  }, [token, enabled, stableOnNewMessage, stableOnUserTyping, stableOnUserJoined, stableOnUserLeft, stableOnOnlineUsers, stableOnError, stableOnConnected, stableOnDisconnected]);

  // Join image room
  const joinImageRoom = useCallback(async () => {
    if (!enabled || !socketRef.current || !isConnected) return;

    try {
      setIsJoining(true);
      socketRef.current.emit('joinImageRoom', { imageID });
    } catch (error) {
      console.error('Error joining image room:', error);
      stableOnError('Failed to join image room');
      setIsJoining(false);
    }
  }, [imageID, isConnected, enabled, stableOnError]);

  // Leave image room
  const leaveImageRoom = useCallback(async () => {
    if (!enabled || !socketRef.current) return;

    try {
      socketRef.current.emit('leaveImageRoom', { imageID });
    } catch (error) {
      console.error('Error leaving image room:', error);
    }
  }, [imageID, enabled]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!enabled || !socketRef.current || !isConnected) {
      throw new Error('Not connected to chat server');
    }

    return new Promise<void>((resolve, reject) => {
      // Set up a timeout to reject if no response
      const timeout = setTimeout(() => {
        reject(new Error('Message send timeout'));
      }, 10000); // 10 second timeout

      // Set up one-time listener for messageSent acknowledgment
      const handleMessageSent = (data: any) => {
        clearTimeout(timeout);
        socketRef.current!.off('messageSent', handleMessageSent);
        resolve();
      };

      // Set up one-time listener for error
      const handleError = (error: any) => {
        clearTimeout(timeout);
        socketRef.current!.off('error', handleError);
        reject(new Error(error.message || 'Failed to send message'));
      };

      // Listen for acknowledgment or error
      socketRef.current!.once('messageSent', handleMessageSent);
      socketRef.current!.once('error', handleError);

      // Send the message
      socketRef.current!.emit('sendMessage', { imageID, content });
    });
  }, [imageID, isConnected, enabled]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!enabled || !socketRef.current || !isConnected) return;

    socketRef.current.emit('typing', { imageID, isTyping });
  }, [imageID, isConnected, enabled]);

  // Get online users
  const getOnlineUsers = useCallback(() => {
    if (!enabled || !socketRef.current || !isConnected) return;

    socketRef.current.emit('getOnlineUsers', { imageID });
  }, [imageID, isConnected, enabled]);

  // Auto-join room when connected and imageID changes
  useEffect(() => {
    if (enabled && isConnected && imageID) {
      joinImageRoom();
    }
  }, [isConnected, imageID, joinImageRoom, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enabled && socketRef.current) {
        leaveImageRoom();
      }
    };
  }, [leaveImageRoom, enabled]);

  return {
    isConnected,
    isJoining,
    typingUsers,
    onlineUsers,
    sendMessage,
    sendTypingIndicator,
    joinImageRoom,
    leaveImageRoom,
    getOnlineUsers,
  };
}; 