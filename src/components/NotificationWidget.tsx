"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check, Trash2, ExternalLink, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotificationSocket } from '@/lib/hooks/useNotificationSocket';
import { notificationService, NotificationRecipient } from '@/lib/services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Helper function to safely parse dates
const parseDate = (dateString: string | Date | number): Date => {
  if (!dateString) {
    return new Date();
  }
  
  // If it's already a Date object, return it
  if (dateString instanceof Date) {
    return dateString;
  }
  
  // If it's a number (timestamp), convert to Date
  if (typeof dateString === 'number') {
    return new Date(dateString);
  }
  
  // Try parsing as ISO string first
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    // If not valid, try parsing as timestamp string
    const timestamp = parseInt(dateString, 10);
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }
    
    // Try parsing common date formats
    const commonFormats = [
      // MySQL datetime format
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      // ISO format without timezone
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
      // Date only
      /^\d{4}-\d{2}-\d{2}$/,
    ];
    
    for (const format of commonFormats) {
      if (format.test(dateString)) {
        const parsedDate = new Date(dateString);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    
    // If all else fails, return current date
    console.warn('Could not parse date string:', dateString);
    return new Date();
  }
  
  return date;
};

// Helper function to format date safely
const formatDateSafely = (dateString: string | Date | number): string => {
  try {
    const date = parseDate(dateString);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: fr,
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Récemment';
  }
};

export default function NotificationWidget() {
  const [notifications, setNotifications] = useState<NotificationRecipient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // WebSocket connection for real-time notifications
  const { isConnected } = useNotificationSocket({
    onNewNotification: (notification) => {
      // Ignore system/status events accidentally sent as notifications
      if (
        notification.titre === 'notification_read' ||
        notification.type === 'notification_read' ||
        notification.titre === 'all_notifications_read' ||
        notification.type === 'all_notifications_read'
      ) {
        return;
      }
      // Convert the notification to NotificationRecipient format
      const newNotificationRecipient: NotificationRecipient = {
        id: `${notification.notificationID}-${notification.utilisateurID}`,
        notificationID: notification.notificationID,
        utilisateurID: notification.utilisateurID,
        estLu: notification.estLu || false,
        notification: {
          notificationID: notification.notificationID,
          titre: notification.titre,
          message: notification.message,
          type: notification.type,
          lien: notification.lien,
          dateCreation: notification.dateCreation,
          createdByID: notification.createdByID || '',
          createdBy: notification.createdBy || {
            utilisateurID: '',
            nom: '',
            prenom: '',
            email: '',
          },
        },
      };
      
      setNotifications(prev => {
        const newNotifications = [newNotificationRecipient, ...prev];
        // Keep only the last 10 notifications
        return newNotifications.slice(0, 10);
      });
      if (!notification.estLu) {
        setUnreadCount(prev => prev + 1);
      }
    },
    onNotificationRead: (notificationId) => {
      // WebSocket event: Update notification status to read (not a new notification)
      setNotifications(prev => 
        prev.map(notif => 
          notif.notificationID === notificationId 
            ? { ...notif, estLu: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    },
    onAllNotificationsRead: () => {
      // WebSocket event: Update all notifications as read (not new notifications)
      setNotifications(prev => prev.map(notif => ({ ...notif, estLu: true })));
      setUnreadCount(0);
    },
    onError: (error) => {
      console.error('Notification WebSocket error:', error);
    },
  });

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const [lastNotifications, unreadNotifications] = await Promise.all([
        notificationService.getLastNotifications(10),
        notificationService.getUnreadNotifications(),
      ]);
      
      setNotifications(lastNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Note: State will be updated by the WebSocket 'notification_read' event
      // No need to update state here to avoid duplicate updates
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Optimistically update UI
      setNotifications(prev => prev.map(notif => ({ ...notif, estLu: true })));
      setUnreadCount(0);
      
      // Send API request in background
      await notificationService.markAllAsRead();
      // Note: State will be updated by the WebSocket 'all_notifications_read' event
      // No need to update state here to avoid duplicate updates
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert optimistic update on error
      loadNotifications();
      
      // Show error message to user
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du marquage des notifications';
      toast.error(errorMessage);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const notification = notifications.find(n => n.notificationID === notificationId);
      setNotifications(prev => prev.filter(n => n.notificationID !== notificationId));
      if (notification && !notification.estLu) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = async (notification: NotificationRecipient) => {
    if (!notification.estLu) {
      // Optimistically update UI
      setNotifications(prev =>
        prev.map(notif =>
          notif.notificationID === notification.notificationID
            ? { ...notif, estLu: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      // Send API request in background
      handleMarkAsRead(notification.notificationID);
    }
    if (notification.notification.lien) {
      if (notification.notification.lien.startsWith('/')) {
        router.push(notification.notification.lien);
      } else {
        window.location.href = notification.notification.lien;
      }
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'examen':
        return '🔬';
      case 'rendez-vous':
        return '📅';
      case 'urgence':
        return '🚨';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type?: string) => {
    switch (type) {
      case 'urgence':
        return 'text-red-600 bg-red-50';
      case 'examen':
        return 'text-blue-600 bg-blue-50';
      case 'rendez-vous':
        return 'text-green-600 bg-green-50';
      case 'system':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        {!isConnected && (
          <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-yellow-500 rounded-full" />
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 z-50">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Notifications
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={handleMarkAllAsRead}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Tout marquer comme lu
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-20 text-gray-500">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Aucune notification</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notificationRecipient, index) => (
                      <div key={notificationRecipient.id}>
                        <div
                          className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notificationRecipient.estLu ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notificationRecipient)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 text-lg">
                              {getNotificationIcon(notificationRecipient.notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${
                                  !notificationRecipient.estLu ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notificationRecipient.notification.titre}
                                </p>
                                <div className="flex items-center space-x-1">
                                  {!notificationRecipient.estLu && (
                                    <div className="h-2 w-2 bg-blue-600 rounded-full" />
                                  )}
                                  {notificationRecipient.notification.lien && (
                                    <ExternalLink className="h-3 w-3 text-gray-400" />
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notificationRecipient.notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatDateSafely(notificationRecipient.notification.dateCreation)}
                                </span>
                                <div className="flex items-center space-x-1">
                                  {notificationRecipient.notification.type && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getNotificationColor(notificationRecipient.notification.type)}`}
                                    >
                                      {notificationRecipient.notification.type}
                                    </Badge>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNotification(notificationRecipient.notificationID);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              {/* Creator information */}
                              {notificationRecipient.notification.createdBy && (
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                  <User className="h-3 w-3 mr-1" />
                                  <span>
                                    Par {notificationRecipient.notification.createdBy.prenom} {notificationRecipient.notification.createdBy.nom}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {index < notifications.length - 1 && (
                          <Separator className="mx-3" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 