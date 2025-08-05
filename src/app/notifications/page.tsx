"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Clock,
  Trash2
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Trade Completed',
      message: 'Your USDT purchase of ₹1,500 has been completed successfully.',
      time: '2 minutes ago',
      read: false,
      icon: CheckCircle,
    },
    {
      id: 2,
      type: 'info',
      title: 'New Offer Available',
      message: 'A new ETH seller is available at ₹92.39 per ETH.',
      time: '15 minutes ago',
      read: false,
      icon: Info,
    },
    {
      id: 3,
      type: 'warning',
      title: 'Payment Pending',
      message: 'Please complete payment for your STRK order within 24 hours.',
      time: '1 hour ago',
      read: true,
      icon: AlertCircle,
    },
    {
      id: 4,
      type: 'success',
      title: 'Account Verified',
      message: 'Your account has been successfully verified.',
      time: '2 hours ago',
      read: true,
      icon: CheckCircle,
    },
    {
      id: 5,
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight at 2 AM UTC.',
      time: '1 day ago',
      read: true,
      icon: Info,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Notifications</h1>
              <p className="text-muted-foreground">Stay updated with your account activity</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Mark All Read
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Notification Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{notifications.length}</div>
                  <div className="text-sm text-muted-foreground">Total Notifications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{unreadCount}</div>
                  <div className="text-sm text-muted-foreground">Unread</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{notifications.length - unreadCount}</div>
                  <div className="text-sm text-muted-foreground">Read</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
              <CardDescription>
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/20 transition-colors ${
                      !notification.read ? 'bg-muted/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-foreground">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {notification.time}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            View Details
                          </Button>
                          {!notification.read && (
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {notifications.length === 0 && (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
                  <p className="text-muted-foreground">You're all caught up! Check back later for updates.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 