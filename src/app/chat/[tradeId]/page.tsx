'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, AlertCircle, CheckCircle, MessageCircle, Send } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchUserData } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Trade {
  _id: string;
  orderId: string;
  buyerUid: string;
  sellerUid: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'support_needed';
  createdAt: string;
  completedAt?: string;
  supportReason?: string;
}

interface Order {
  _id: string;
  uid: string;
  type: 'buy' | 'sell';
  cryptocurrency: string;
  amount: number;
  price: number;
  minLimit?: number;
  maxLimit?: number;
  paymentMethods: string[];
  status: string;
  createdAt: string;
  additionalInfo?: string;
}

interface ChatMessage {
  _id: string;
  tradeId: string;
  senderUid: string;
  message: string;
  timestamp: string;
}

interface UserData {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  isActive?: boolean;
  totalOrders?: number;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  
  const [trade, setTrade] = useState<Trade | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supportReason, setSupportReason] = useState('');
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  
  // User data for both parties
  const [buyerData, setBuyerData] = useState<UserData | null>(null);
  const [sellerData, setSellerData] = useState<UserData | null>(null);

  const tradeId = params.tradeId as string;

  useEffect(() => {
    loadTradeAndChat();
  }, [tradeId]);

  const loadTradeAndChat = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load trade data
      try {
        const tradeResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/trades/${tradeId}`);
        
        if (!tradeResponse.ok) {
          if (tradeResponse.status === 404) {
            setError('Trade not found');
            return;
          }
          throw new Error('Failed to load trade');
        }

        const tradeResult = await tradeResponse.json();
        if (!tradeResult.success) {
          throw new Error(tradeResult.message || 'Failed to load trade');
        }

        const tradeData = tradeResult.data.trade;
        setTrade(tradeData);

        // Load order data
        const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/orders/${tradeData.orderId}`);
        if (orderResponse.ok) {
          const orderResult = await orderResponse.json();
          if (orderResult.success) {
            setOrder(orderResult.data.order);
          }
        }

        // Load user data for both parties
        const [buyerUserData, sellerUserData] = await Promise.all([
          fetchUserData(tradeData.buyerUid),
          fetchUserData(tradeData.sellerUid)
        ]);
        
        setBuyerData(buyerUserData);
        setSellerData(sellerUserData);

        // Load chat messages
        await loadChatMessages(tradeId);

      } catch (fetchError) {
        // Fallback to mock data if backend is not available
        console.warn('Backend not available, using fallback data:', fetchError);
        
        const mockTrade: Trade = {
          _id: tradeId,
          orderId: 'order123',
          buyerUid: currentUser?.uid || 'buyer123',
          sellerUid: 'seller123',
          amount: 100,
          paymentMethod: 'eSewa',
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        const mockOrder: Order = {
          _id: 'order123',
          uid: 'seller123',
          type: 'sell',
          cryptocurrency: 'USDT',
          amount: 1000,
          price: 130.50,
          minLimit: 50,
          maxLimit: 500,
          paymentMethods: ['eSewa', 'Khalti'],
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        setTrade(mockTrade);
        setOrder(mockOrder);

        // Mock user data
        const mockBuyerData: UserData = {
          uid: currentUser?.uid || 'buyer123',
          displayName: currentUser?.displayName || 'Buyer User',
          photoURL: currentUser?.photoURL || null,
          isActive: true,
          totalOrders: 5,
        };

        const mockSellerData: UserData = {
          uid: 'seller123',
          displayName: 'Seller User',
          photoURL: null,
          isActive: true,
          totalOrders: 12,
        };

        setBuyerData(mockBuyerData);
        setSellerData(mockSellerData);

        // Load mock chat messages
        await loadChatMessages(tradeId);
      }

    } catch (error) {
      console.error('Error loading trade and chat:', error);
      setError('Failed to load trade and chat data');
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async (tradeId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/chat/${tradeId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setChatMessages(result.data.messages);
        }
      }
    } catch (error) {
      console.warn('Backend not available, using mock chat:', error);
      // Mock chat messages for demo
      const mockMessages: ChatMessage[] = [
        {
          _id: '1',
          tradeId,
          senderUid: currentUser?.uid || 'buyer123',
          message: 'Hi! I\'ve initiated the trade. Please confirm when you\'re ready.',
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
        {
          _id: '2',
          tradeId,
          senderUid: order?.uid || 'seller123',
          message: 'Hello! I\'ve received your payment. Sending the crypto now.',
          timestamp: new Date(Date.now() - 180000).toISOString(),
        },
        {
          _id: '3',
          tradeId,
          senderUid: currentUser?.uid || 'buyer123',
          message: 'Perfect! I\'ve received the crypto. Thank you!',
          timestamp: new Date(Date.now() - 60000).toISOString(),
        },
      ];
      setChatMessages(mockMessages);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !trade) return;
    
    const messageData = {
      tradeId: trade._id,
      senderUid: currentUser?.uid,
      message: newMessage.trim(),
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const newChatMessage: ChatMessage = {
            _id: result.data.message._id,
            tradeId: trade._id,
            senderUid: currentUser?.uid || '',
            message: newMessage.trim(),
            timestamp: new Date().toISOString(),
          };
          setChatMessages([...chatMessages, newChatMessage]);
          setNewMessage('');
        }
      }
    } catch (error) {
      console.warn('Backend not available, simulating message:', error);
      const newChatMessage: ChatMessage = {
        _id: Date.now().toString(),
        tradeId: trade._id,
        senderUid: currentUser?.uid || '',
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };
      setChatMessages([...chatMessages, newChatMessage]);
      setNewMessage('');
    }
  };

  const handleMarkComplete = async () => {
    if (!trade) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/trades/${trade._id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTrade({ ...trade, status: 'completed', completedAt: new Date().toISOString() });
          toast.success('Trade marked as completed!');
        }
      }
    } catch (error) {
      console.warn('Backend not available, simulating completion:', error);
      setTrade({ ...trade, status: 'completed', completedAt: new Date().toISOString() });
      toast.success('Trade marked as completed! (Demo Mode)');
    }
  };

  const handleRequestSupport = async () => {
    if (!trade || !supportReason.trim()) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/trades/${trade._id}/support`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: supportReason }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTrade({ ...trade, status: 'support_needed', supportReason });
          setShowSupportDialog(false);
          setSupportReason('');
          toast.success('Support request submitted!');
        }
      }
    } catch (error) {
      console.warn('Backend not available, simulating support request:', error);
      setTrade({ ...trade, status: 'support_needed', supportReason });
      setShowSupportDialog(false);
      setSupportReason('');
      toast.success('Support request submitted! (Demo Mode)');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen text-foreground p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading chat...</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !trade) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen text-foreground p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Trade Chat</h1>
            </div>

            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-red-500 text-lg font-semibold mb-2">
                    {error || 'Trade not found'}
                  </div>
                  <div className="text-muted-foreground mb-4">
                    The trade you are looking for could not be found or is no longer available.
                  </div>
                  <Button onClick={() => router.push('/dashboard')}>
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isCurrentUserBuyer = currentUser?.uid === trade.buyerUid;
  const otherPartyData = isCurrentUserBuyer ? sellerData : buyerData;
  const currentUserData = isCurrentUserBuyer ? buyerData : sellerData;

  return (
    <ProtectedRoute>
      <div className="min-h-screen text-foreground p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Trade Chat</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trade Info Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Trade Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      trade.status === 'completed' ? 'bg-green-500' :
                      trade.status === 'support_needed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    Trade Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Amount</Label>
                      <div className="font-medium">{trade.amount} {order?.cryptocurrency}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Payment</Label>
                      <div className="font-medium">{trade.paymentMethod}</div>
                    </div>
                  </div>

                  {trade.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button onClick={handleMarkComplete} className="flex-1">
                        Mark Complete
                      </Button>
                      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1">
                            Support
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Support</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="supportReason">Reason for Support</Label>
                              <Input
                                id="supportReason"
                                placeholder="Describe the issue..."
                                value={supportReason}
                                onChange={(e) => setSupportReason(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleRequestSupport} className="flex-1">
                                Submit Request
                              </Button>
                              <Button variant="outline" onClick={() => setShowSupportDialog(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  {trade.status === 'completed' && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-700 dark:text-green-300">
                        Completed on {new Date(trade.completedAt || '').toLocaleString()}
                      </span>
                    </div>
                  )}

                  {trade.status === 'support_needed' && (
                    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <div className="font-medium">Support Requested</div>
                        <div className="mt-1">{trade.supportReason}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Other Party Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Trader Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={otherPartyData?.photoURL || `https://i.pravatar.cc/150?img=${otherPartyData?.uid?.slice(-2) || '1'}`}
                        alt={otherPartyData?.displayName || `User ${otherPartyData?.uid?.slice(-4) || 'user'}`}
                      />
                      <AvatarFallback className="bg-muted text-foreground">
                        {otherPartyData?.displayName?.slice(0, 2)?.toUpperCase() || otherPartyData?.uid?.slice(-4) || 'user'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {otherPartyData?.displayName || `User ${otherPartyData?.uid?.slice(-4) || 'user'}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {otherPartyData?.totalOrders || 0} orders
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Chat with {otherPartyData?.displayName || `User ${otherPartyData?.uid?.slice(-4) || 'user'}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      chatMessages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.senderUid === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs p-3 rounded-lg ${
                              message.senderUid === currentUser?.uid
                                ? 'bg-blue-500 text-white'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <div className="text-sm">{message.message}</div>
                            <div className={`text-xs mt-1 ${
                              message.senderUid === currentUser?.uid ? 'text-blue-100' : 'text-muted-foreground'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 