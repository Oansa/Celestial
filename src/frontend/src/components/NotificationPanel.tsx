import React from 'react';
import { Bell, X, Check, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useGetNotifications, useMarkNotificationAsRead, useClearNotifications } from '../hooks/useQueries';
import { Notification } from '../backend';
import { toast } from 'sonner';

interface NotificationPanelProps {
  onClose?: () => void;
  onViewSubmission?: (actionId: string) => void;
}

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onViewSubmission 
}: { 
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onViewSubmission?: (actionId: string) => void;
}) {
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${notification.read ? 'bg-background' : 'bg-muted/50'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <p className="text-sm">{notification.message}</p>
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(notification.timestamp)}
          </p>
        </div>
        
        <div className="flex items-center gap-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
              className="h-6 w-6 p-0"
            >
              <Check className="w-3 h-3" />
            </Button>
          )}
          
          {notification.relatedActionId && onViewSubmission && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewSubmission(notification.relatedActionId!)}
              className="h-6 w-6 p-0"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      {!notification.read && (
        <div className="w-2 h-2 bg-primary rounded-full absolute -left-1 top-3"></div>
      )}
    </div>
  );
}

export default function NotificationPanel({ onClose, onViewSubmission }: NotificationPanelProps) {
  const { data: notifications = [], isLoading } = useGetNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: clearAll, isPending: isClearing } = useClearNotifications();

  const unreadCount = notifications.filter(n => !n.read).length;
  const sortedNotifications = [...notifications].sort((a, b) => 
    Number(b.timestamp) - Number(a.timestamp)
  );

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId, {
      onError: (error) => {
        console.error('Failed to mark notification as read:', error);
        toast.error('Failed to mark notification as read');
      },
    });
  };

  const handleClearAll = () => {
    clearAll(undefined, {
      onSuccess: () => {
        toast.success('All notifications cleared');
      },
      onError: (error) => {
        console.error('Failed to clear notifications:', error);
        toast.error('Failed to clear notifications');
      },
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={isClearing}
              className="text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              {isClearing ? 'Clearing...' : 'Clear All'}
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              You'll see updates about climate actions here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-2 relative">
              {sortedNotifications.map((notification, index) => (
                <div key={notification.id} className="relative">
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onViewSubmission={onViewSubmission}
                  />
                  {index < sortedNotifications.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

