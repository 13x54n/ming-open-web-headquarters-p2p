'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, AlertCircle, CheckCircle, Info, MessageCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PAYMENT_METHODS } from '@/lib/constants';
import { fetchUserData } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

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

interface UserData {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  isActive?: boolean;
  totalOrders?: number;
}

interface PaymentMethodInfo {
  name: string;
  description: string;
  acceptedFormats: string[];
  processingTime: string;
  fees: string;
  instructions: string[];
}

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



export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  
  // Helper function to format numbers without unnecessary decimal zeros
  const formatNumber = (num: number, decimals: number = 2) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    const fixed = num.toFixed(decimals);
    return fixed.replace(/\.?0+$/, '');
  };
  
  const [order, setOrder] = useState<Order | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Trading form state
  const [tradeAmount, setTradeAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaymentInfo, setSelectedPaymentInfo] = useState<PaymentMethodInfo | null>(null);
  
  // Trade management state
  const [currentTrade, setCurrentTrade] = useState<Trade | null>(null);
  const [showTradeActions, setShowTradeActions] = useState(false);
  const [supportReason, setSupportReason] = useState('');
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  


  // Payment method information
  const paymentMethodInfo: Record<string, PaymentMethodInfo> = {
    'eSewa': {
      name: 'eSewa',
      description: 'Sample: 9841234567 or user@example.com',
      acceptedFormats: ['Mobile Number', 'Email Address', 'eSewa ID'],
      processingTime: 'Instant',
      fees: 'Free for wallet transfers',
      instructions: [
        'Enter the recipient\'s mobile number or email',
        'Ensure the number/email is registered with eSewa',
        'Payment will be processed instantly',
        'Keep transaction ID for verification'
      ]
    },
    'Khalti': {
      name: 'Khalti',
      description: 'Sample: 9841234567 or khalti123',
      acceptedFormats: ['Mobile Number', 'Khalti ID'],
      processingTime: 'Instant',
      fees: 'Free for wallet transfers',
      instructions: [
        'Enter the recipient\'s mobile number',
        'Number must be registered with Khalti',
        'Payment will be processed instantly',
        'Save transaction reference number'
      ]
    },
    'Bank Transfer': {
      name: 'Bank Transfer',
      description: 'Sample: 1234567890, IFSC: NABL0001234',
      acceptedFormats: ['Bank Account Number', 'IFSC Code'],
      processingTime: '1-2 business days',
      fees: 'Varies by bank (usually ₹10-50)',
      instructions: [
        'Provide your bank account number',
        'Include IFSC code for the bank branch',
        'Transfer may take 1-2 business days',
        'Keep bank transaction receipt'
      ]
    },
    'UPI': {
      name: 'UPI',
      description: 'Sample: user@upi or 9841234567@okicici',
      acceptedFormats: ['UPI ID', 'Phone Number', 'QR Code'],
      processingTime: 'Instant',
      fees: 'Free',
      instructions: [
        'Share your UPI ID or phone number',
        'Payment will be instant',
        'No additional fees charged',
        'Keep UPI transaction reference'
      ]
    },
    'PayPal': {
      name: 'PayPal',
      description: 'Sample: user@paypal.com or paypal.me/username',
      acceptedFormats: ['Email Address', 'PayPal.me Link'],
      processingTime: 'Instant to 24 hours',
      fees: '2.9% + fixed fee',
      instructions: [
        'Provide your PayPal email address',
        'International transfers may take longer',
        'Fees apply based on amount',
        'Keep PayPal transaction ID'
      ]
    }
  };

  const orderId = params.id as string;

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch order data from backend
      try {
        const response: Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/orders/${orderId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Order not found');
          } else {
            setError('Failed to load order details');
          }
          return;
        }

        const result = await response.json();
        
        if (!result.success) {
          setError(result.message || 'Failed to load order details');
          return;
        }

        const orderData = result.data.order;
        setOrder(orderData);

        // Fetch user data for the order creator
        if (orderData.uid) {
          const userData = await fetchUserData(orderData.uid);
          setUserData(userData);
        }
      } catch (fetchError) {
        // Fallback to mock data if backend is not available
        console.warn('Backend not available, using fallback data:', fetchError);
        
        const fallbackOrder: Order = {
          _id: orderId,
          uid: 'user123',
          type: 'sell',
          cryptocurrency: 'USDT',
          amount: 1000,
          price: 130.50,
          minLimit: 100,
          maxLimit: 500,
          paymentMethods: ['eSewa', 'Khalti'],
          status: 'active',
          createdAt: new Date().toISOString(),
          additionalInfo: 'Fast and secure trading. Contact me for quick deals.'
        };

        setOrder(fallbackOrder);

        // Fetch user data for the order creator
        if (fallbackOrder.uid) {
          const userData = await fetchUserData(fallbackOrder.uid);
          setUserData(userData);
        }
      }

    } catch (error) {
      console.error('Error loading order details:', error);
      setError('Failed to load order details');
      toast.error("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  const handleTradeAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue <= 0) {
      setTradeAmount(value);
      return;
    }

    // Check against available amount
    if (order && numValue > order.amount) {
      toast.error(`Maximum available: ${order.amount} ${order.cryptocurrency}`);
      return;
    }

    // Check against min/max limits (only if they exist)
    if (order?.minLimit && numValue < order.minLimit) {
      toast.error(`Minimum trade: ${order.minLimit} ${order.cryptocurrency}`);
      return;
    }

    if (order?.maxLimit && numValue > order.maxLimit) {
      toast.error(`Maximum trade: ${order.maxLimit} ${order.cryptocurrency}`);
      return;
    }

    setTradeAmount(value);
  };

  const calculateTotalValue = () => {
    if (!order || !tradeAmount) return 0;
    const amount = parseFloat(tradeAmount);
    return isNaN(amount) ? 0 : amount * order.price;
  };

  const handlePaymentMethodClick = (methodName: string) => {
    const info = paymentMethodInfo[methodName];
    if (info) {
      setSelectedPaymentInfo(info);
    }
  };

  const handleMarkComplete = async () => {
    if (!currentTrade) return;
    
    try {
      const response: Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/trades/${currentTrade._id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCurrentTrade({ ...currentTrade, status: 'completed', completedAt: new Date().toISOString() });
          toast.success('Trade marked as completed!');
        }
      }
    } catch (error) {
      console.warn('Backend not available, simulating completion:', error);
      setCurrentTrade({ ...currentTrade, status: 'completed', completedAt: new Date().toISOString() });
      toast.success('Trade marked as completed! (Demo Mode)');
    }
  };

  const handleRequestSupport = async () => {
    if (!currentTrade || !supportReason.trim()) return;
    
    try {
      const response: Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/trades/${currentTrade._id}/support`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: supportReason }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCurrentTrade({ ...currentTrade, status: 'support_needed', supportReason });
          setShowSupportDialog(false);
          setSupportReason('');
          toast.success('Support request submitted!');
        }
      }
    } catch (error) {
      console.warn('Backend not available, simulating support request:', error);
      setCurrentTrade({ ...currentTrade, status: 'support_needed', supportReason });
      setShowSupportDialog(false);
      setSupportReason('');
      toast.success('Support request submitted! (Demo Mode)');
    }
  };



  const handleTrade = async () => {
    if (!currentUser) {
      toast.error("Please log in to trade.");
      return;
    }

    // Prevent trading on own orders
    if (currentUser.uid === order?.uid) {
      toast.error("You cannot trade on your own order.");
      return;
    }

    if (!tradeAmount || !selectedPaymentMethod) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute trade via backend API
      const tradeRequestData = {
        orderId: order?._id,
        amount: parseFloat(tradeAmount),
        paymentMethod: selectedPaymentMethod,
        buyerUid: currentUser?.uid,
        sellerUid: order?.uid,
      };

      try {
        const response: Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/trades`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tradeRequestData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to execute trade');
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to execute trade');
        }

        const tradeData: Trade = {
          _id: result.data.trade._id,
          orderId: order?._id || '',
          buyerUid: currentUser?.uid || '',
          sellerUid: order?.uid || '',
          amount: parseFloat(tradeAmount),
          paymentMethod: selectedPaymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        
        setCurrentTrade(tradeData);
        setShowTradeActions(true);
        
        toast.success(`Trade initiated! Redirecting to chat...`);
        
        // Redirect to chat page
        router.push(`/chat/${tradeData._id}`);
      } catch (apiError) {
        // Fallback: simulate trade execution if backend is not available
        console.warn('Backend not available, simulating trade:', apiError);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const tradeData: Trade = {
          _id: Date.now().toString(),
          orderId: order?._id || '',
          buyerUid: currentUser?.uid || '',
          sellerUid: order?.uid || '',
          amount: parseFloat(tradeAmount),
          paymentMethod: selectedPaymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        
        setCurrentTrade(tradeData);
        setShowTradeActions(true);
        
        toast.success(`Trade initiated! Redirecting to chat... (Demo Mode)`);
        
        // Redirect to chat page
        router.push(`/chat/${tradeData._id}`);
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to execute trade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen text-foreground p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-9 w-16 bg-muted rounded animate-pulse"></div>
              <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Information Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                    <div className="h-6 w-12 bg-muted rounded animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Trader Info Skeleton */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 w-40 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>

                  <div className="border-t border-border my-4"></div>

                  {/* Order Details Skeleton */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="h-3 w-12 bg-muted rounded animate-pulse mb-2"></div>
                      <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-3 w-16 bg-muted rounded animate-pulse mb-2"></div>
                      <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Trading Limits Skeleton */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="h-3 w-16 bg-muted rounded animate-pulse mb-2"></div>
                      <div className="h-5 w-20 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-3 w-16 bg-muted rounded animate-pulse mb-2"></div>
                      <div className="h-5 w-20 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Payment Methods Skeleton */}
                  <div>
                    <div className="h-3 w-24 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                      <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                      <div className="h-6 w-18 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Form Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-muted rounded animate-pulse"></div>
                    <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Amount Input Skeleton */}
                  <div>
                    <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-muted rounded animate-pulse mt-1"></div>
                  </div>

                  {/* Total Value Skeleton */}
                  <div className="bg-muted p-3 rounded-md">
                    <div className="h-3 w-24 bg-background rounded animate-pulse mb-2"></div>
                    <div className="h-8 w-32 bg-background rounded animate-pulse"></div>
                  </div>

                  {/* Payment Method Selection Skeleton */}
                  <div>
                    <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                      <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Trade Button Skeleton */}
                  <div className="h-12 w-full bg-muted rounded animate-pulse"></div>

                  {/* Warning Skeleton */}
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                    <div className="w-4 h-4 bg-muted rounded animate-pulse mt-0.5"></div>
                    <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !order) {
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
              <h1 className="text-2xl font-bold">Order Details</h1>
            </div>

            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-red-500 text-lg font-semibold mb-2">
                    {error || 'Order not found'}
                  </div>
                  <div className="text-muted-foreground mb-4">
                    {error === 'This order does not have trading limits set and cannot be traded.' 
                      ? 'This order cannot be traded because it does not have minimum and maximum trading limits configured.'
                      : 'The order you are looking for could not be found or is no longer available.'
                    }
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
            <h1 className="text-2xl font-bold">Order Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant={order.type === 'buy' ? 'default' : 'secondary'}>
                    {order.type.toUpperCase()}
                  </Badge>
                  {order.cryptocurrency}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trader Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={userData?.photoURL || `https://i.pravatar.cc/150?img=${order.uid?.slice(-2) || '1'}`}
                      alt={userData?.displayName || `User ${order.uid?.slice(-4) || 'user'}`}
                    />
                    <AvatarFallback className="bg-muted text-foreground">
                      {userData?.displayName?.slice(0, 2)?.toUpperCase() || order.uid?.slice(-4) || 'user'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {userData?.displayName || `User ${order.uid?.slice(-4) || 'user'}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {userData?.totalOrders || 0} orders • {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border my-4"></div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Price</Label>
                    <div className="text-lg font-semibold">
                      NPR {formatNumber(order.price)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Available</Label>
                    <div className="text-lg font-semibold">
                      {formatNumber(order.amount)} {order.cryptocurrency}
                    </div>
                  </div>
                </div>

                {order.minLimit && order.maxLimit ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Min Trade</Label>
                      <div className="font-medium">
                        {order.minLimit} {order.cryptocurrency}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Max Trade</Label>
                      <div className="font-medium">
                        {order.maxLimit} {order.cryptocurrency}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm text-muted-foreground">Trading Limits</Label>
                    <div className="font-medium text-muted-foreground">
                      No limits set
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                <div>
                  <Label className="text-sm text-muted-foreground">Payment Methods</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {order.paymentMethods.map((method) => {
                      const paymentMethod = PAYMENT_METHODS.find(pm => pm.name === method);
                      const hasInfo = paymentMethodInfo[method];
                      return (
                        <div key={method} className="flex items-center gap-1">
                          <Badge variant="outline" className="flex items-center gap-2">
                            <div className={`w-2 h-2 ${paymentMethod?.color || 'bg-gray-500'} rounded-full`}></div>
                            {method}
                          </Badge>
                          {hasInfo && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-muted"
                                  onClick={() => handlePaymentMethodClick(method)}
                                >
                                  <Info className="w-3 h-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <div className={`w-3 h-3 ${paymentMethod?.color || 'bg-gray-500'} rounded-full`}></div>
                                    {selectedPaymentInfo?.name}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium">Description</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedPaymentInfo?.description}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Accepted Formats</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {selectedPaymentInfo?.acceptedFormats.map((format, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {format}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Processing Time</Label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {selectedPaymentInfo?.processingTime}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Fees</Label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {selectedPaymentInfo?.fees}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Instructions</Label>
                                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                      {selectedPaymentInfo?.instructions.map((instruction, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                          {instruction}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {order.additionalInfo && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Additional Info</Label>
                    <div className="mt-2 text-sm bg-muted p-3 rounded-md">
                      {order.additionalInfo}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trading Form - Hidden when trade is pending */}
            {!showTradeActions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Trade {order.type === 'sell' ? 'Buy' : 'Sell'} {order.cryptocurrency}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Check if user is trying to trade on their own order */}
                  {currentUser?.uid === order.uid ? (
                    <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        <div className="font-medium">Cannot Trade on Your Own Order</div>
                        <div className="mt-1">You cannot trade on orders that you have created. This prevents self-trading and ensures fair marketplace operations.</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Amount Input */}
                      <div>
                        <Label htmlFor="tradeAmount">Amount ({order.cryptocurrency})</Label>
                        <Input
                          id="tradeAmount"
                          type="number"
                          placeholder="0.00"
                          value={tradeAmount}
                          onChange={(e) => handleTradeAmountChange(e.target.value)}
                          className="mt-1"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Available: {formatNumber(order.amount)} {order.cryptocurrency}
                          {order.minLimit && order.maxLimit && (
                            <span> • Min: {formatNumber(order.minLimit)} • Max: {formatNumber(order.maxLimit)}</span>
                          )}
                          {(!order.minLimit || !order.maxLimit) && (
                            <span> • No trading limits</span>
                          )}
                        </div>
                      </div>

                      {/* Total Value */}
                      <div className="bg-muted p-3 rounded-md">
                        <Label className="text-sm text-muted-foreground">Total Value (NPR)</Label>
                        <div className="text-xl font-bold">
                          NPR {formatNumber(calculateTotalValue())}
                        </div>
                      </div>

                      {/* Payment Method Selection */}
                      <div>
                        <Label>Payment Method</Label>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          {order.paymentMethods.map((method) => (
                            <Button
                              key={method}
                              variant={selectedPaymentMethod === method ? "default" : "outline"}
                              onClick={() => setSelectedPaymentMethod(method)}
                              className="justify-start"
                            >
                              <div className={`w-3 h-3 ${PAYMENT_METHODS.find(pm => pm.name === method)?.color || 'bg-gray-500'} rounded-full mr-3`}></div>
                              {method}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Trade Button */}
                      <Button
                        onClick={handleTrade}
                        disabled={isSubmitting || !tradeAmount || !selectedPaymentMethod}
                        className="w-full"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </div>
                        ) : (
                          `${order.type === 'sell' ? 'Buy' : 'Sell'} ${order.cryptocurrency}`
                        )}
                      </Button>

                      {/* Warning */}
                      <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                        <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-700 dark:text-yellow-300">
                          Make sure to complete the payment and confirm with the trader before marking the trade as complete.
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Trade Actions */}
            {showTradeActions && currentTrade && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      currentTrade.status === 'completed' ? 'bg-green-500' :
                      currentTrade.status === 'support_needed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    Trade Status: {currentTrade.status.replace('_', ' ').toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Amount</Label>
                      <div className="font-medium">{currentTrade.amount} {order.cryptocurrency}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Payment Method</Label>
                      <div className="font-medium">{currentTrade.paymentMethod}</div>
                    </div>
                  </div>

                  {currentTrade.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button onClick={handleMarkComplete} className="flex-1">
                        Mark as Complete
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => router.push(`/chat/${currentTrade._id}`)}
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </Button>
                      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1">
                            Request Support
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

                  {currentTrade.status === 'completed' && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-700 dark:text-green-300">
                        Trade completed on {new Date(currentTrade.completedAt || '').toLocaleString()}
                      </span>
                    </div>
                  )}

                  {currentTrade.status === 'support_needed' && (
                    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <div className="font-medium">Support Requested</div>
                        <div className="mt-1">{currentTrade.supportReason}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}


          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 