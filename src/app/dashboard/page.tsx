"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, Plus, RefreshCw } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PAYMENT_METHODS, CURRENCIES, CRYPTOCURRENCIES } from '@/lib/constants';
import { createOrder, fetchOrders, fetchUserData } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  

  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('All payment methods');
  const [sortBy, setSortBy] = useState('Sort By Price');
  const [selectedCurrency, setSelectedCurrency] = useState('NPR');

  // Create Order Modal State
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderCrypto, setOrderCrypto] = useState('USDT');
  const [orderAmount, setOrderAmount] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderMinLimit, setOrderMinLimit] = useState('');
  const [orderMaxLimit, setOrderMaxLimit] = useState('');
  const [showLimits, setShowLimits] = useState(false);
  const [orderPaymentMethods, setOrderPaymentMethods] = useState<string[]>([]);
  const [orderAdditionalInfo, setOrderAdditionalInfo] = useState('');

  // Orders data state
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [userDataMap, setUserDataMap] = useState<Record<string, any>>({});

  // Calculate average price from current orders
  const averagePrice = orders.length > 0
    ? orders.reduce((sum, order) => sum + (order.price || 0), 0) / orders.length
    : 0;

  // Filter orders based on selected payment method, amount, and starting number
  const filteredOrders = orders.filter(order => {
    // Filter by payment method
    const paymentMethodMatch = paymentMethod === 'All payment methods' ||
      order.paymentMethods?.includes(paymentMethod);

    // Filter by amount if transaction amount is entered
    let amountMatch = true;
    if (transactionAmount && !isNaN(parseFloat(transactionAmount))) {
      const userAmount = parseFloat(transactionAmount);
      const orderPrice = order.price || 0;

      // Check if user's amount is within reasonable range of order's price per token
      // Allow ±20% tolerance for price matching
      const tolerance = 0.2; // 20%
      const minPrice = orderPrice * (1 - tolerance);
      const maxPrice = orderPrice * (1 + tolerance);

      amountMatch = userAmount >= minPrice && userAmount <= maxPrice;
    }

    return paymentMethodMatch && amountMatch;
  });

  const handleTabSwitch = (checked: boolean) => {
    setActiveTab(checked ? 'sell' : 'buy');
  };

  const handleCreateOrder = () => {
    setShowCreateOrder(true);
    setOrderType(activeTab);
    setOrderCrypto(selectedCrypto);
  };

  const handleSubmitOrder = async () => {
    try {
      // Check if user is authenticated
      if (!currentUser?.uid) {
        toast.error("You must be logged in to create an order.");
        return;
      }

      // Validate required fields
      if (!orderAmount || !orderPrice || orderPaymentMethods.length === 0) {
        toast.error("Please fill in all required fields and select at least one payment method.");
        return;
      }

      // Validate limits if enabled
      if (showLimits) {
        if (!orderMinLimit || !orderMaxLimit) {
          toast.error("Please fill in both min and max limits when limits are enabled.");
          return;
        }

        const minLimit = parseFloat(orderMinLimit);
        const maxLimit = parseFloat(orderMaxLimit);

        if (isNaN(minLimit) || isNaN(maxLimit) || minLimit <= 0 || maxLimit <= 0) {
          toast.error("Min and max limits must be positive numbers.");
          return;
        }

        if (minLimit >= maxLimit) {
          toast.error("Max limit must be greater than min limit.");
          return;
        }
      }

      // Validate and format data before sending
      const orderData = {
        uid: currentUser?.uid,
        type: orderType,
        cryptocurrency: orderCrypto,
        amount: parseFloat(orderAmount), // Send as number, not string
        price: parseFloat(orderPrice), // Send as number, not string
        paymentMethods: orderPaymentMethods,
        additionalInfo: orderAdditionalInfo || '',
        ...(showLimits && orderMinLimit && orderMaxLimit && {
          minLimit: parseFloat(orderMinLimit),
          maxLimit: parseFloat(orderMaxLimit),
        }),
      };

      // Additional validation to match backend expectations
      if (isNaN(orderData.amount) || orderData.amount <= 0) {
        toast.error("Amount must be a positive number.");
        return;
      }

      if (isNaN(orderData.price) || orderData.price <= 0) {
        toast.error("Price must be a positive number.");
        return;
      }



      // Create order via API
      const result = await createOrder(orderData);

      // Show success message
      toast.success(`Order created successfully! Order ID: ${result.data?.order._id}`);

      // Reset form and close modal
      setOrderAmount('');
      setOrderPrice('');
      setOrderMinLimit('');
      setOrderMaxLimit('');
      setShowLimits(false);
      setOrderPaymentMethods([]);
      setOrderAdditionalInfo('');
      setShowCreateOrder(false);
      handleOrderCreated(); // Refresh orders after creation
    } catch (error) {

      toast.error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const togglePaymentMethod = (method: string) => {
    setOrderPaymentMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  // Fetch orders from backend
  const loadOrders = async () => {
    try {
      setLoading(true);
      setOrdersError(null);

      // Determine sort parameter based on sortBy state
      let sortParam = '';
      if (sortBy === 'Sort By Price') sortParam = 'price';
      else if (sortBy === 'Sort By Time') sortParam = 'createdAt';
      else if (sortBy === 'Sort By Volume') sortParam = 'amount';

      const result = await fetchOrders({
        page: currentPage,
        limit: 10,
        type: activeTab,
        cryptocurrency: selectedCrypto,
        status: 'active',
        sort: sortParam
      });

      if (result.success) {
        const ordersData = result.data.orders || [];
        setOrders(ordersData);
        setTotalPages(result.data.pagination?.pages || 1);
        setTotalOrders(result.data.pagination?.total || 0);

        // Fetch user data for each order
        const userDataPromises = ordersData.map(async (order) => {
          if (order.uid && !userDataMap[order.uid]) {
            try {
              const userData = await fetchUserData(order.uid);

              return { uid: order.uid, userData };
            } catch (error) {
              return { uid: order.uid, userData: null };
            }
          }
          return null;
        });

        const userDataResults = await Promise.all(userDataPromises);
        const newUserDataMap = { ...userDataMap };

        userDataResults.forEach((result) => {
          if (result && result.userData) {
            newUserDataMap[result.uid] = result.userData;
          }
        });

        setUserDataMap(newUserDataMap);
      } else {
        setOrdersError('Failed to load orders');
      }
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : 'Failed to load orders');
      toast.error("Failed to load orders from server.");
    } finally {
      setLoading(false);
    }
  };

  // Load orders when component mounts or filters change
  useEffect(() => {
    loadOrders();
  }, [activeTab, selectedCrypto, currentPage, sortBy]);

  // Refresh orders after creating a new order
  const handleOrderCreated = () => {
    loadOrders();
  };



  return (
    <ProtectedRoute>
      <div className="min-h-screen text-foreground p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Main Trading Interface */}
          <CardContent className="py-2 px-3 sm:px-6">
            {/* Buy/Sell Switch and Cryptocurrency Tickers */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6">
              {/* Buy/Sell Switch */}
              <div className="flex items-center gap-4">
                <span className={`text-sm font-medium ${activeTab === 'buy' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Buy
                </span>
                <Switch
                  checked={activeTab === 'sell'}
                  onCheckedChange={handleTabSwitch}
                />
                <span className={`text-sm font-medium ${activeTab === 'sell' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Sell
                </span>
              </div>

              {/* Cryptocurrency Tickers */}
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                {CRYPTOCURRENCIES.map((crypto) => (
                  <Badge
                    key={crypto.symbol}
                    variant={selectedCrypto === crypto.symbol ? 'default' : 'outline'}
                    className={`cursor-pointer whitespace-nowrap ${selectedCrypto === crypto.symbol
                      ? 'bg-white text-gray-900 hover:bg-gray-200'
                      : 'bg-transparent border-border text-muted-foreground hover:bg-accent'
                      }`}
                    onClick={() => setSelectedCrypto(crypto.symbol)}
                  >
                    {crypto.symbol}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {/* Transaction Amount */}
              <div className="relative">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Transaction amount
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={averagePrice > 0 ? `Avg: ${averagePrice.toFixed(2)} per token` : "Enter price per token"}
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    className={`bg-background border-border text-foreground placeholder-muted-foreground pr-20 ${transactionAmount && !isNaN(parseFloat(transactionAmount)) ? 'border-green-500' : ''
                      }`}
                  />
                  {transactionAmount && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTransactionAmount('')}
                      className="absolute right-16 top-1/2 transform -translate-y-1/2 h-8 px-2 hover:bg-accent text-muted-foreground"
                    >
                      ✕
                    </Button>
                  )}
                  {/* Currency Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2 hover:bg-accent"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center bg-background">
                            <span className="text-sm">{CURRENCIES.find(c => c.code === selectedCurrency)?.flag}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{selectedCurrency}</span>
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {CURRENCIES.map((currency) => (
                        <DropdownMenuItem
                          key={currency.code}
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => setSelectedCurrency(currency.code)}
                        >
                          <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center bg-background">
                            <span className="text-base">{currency.flag}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{currency.code}</span>
                            <span className="text-xs text-muted-foreground">{currency.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Payment method
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-background border-border text-foreground hover:bg-accent"
                    >
                      {paymentMethod}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className="text-foreground hover:bg-accent"
                      onClick={() => setPaymentMethod('All payment methods')}
                    >
                      All payment methods
                    </DropdownMenuItem>
                    {PAYMENT_METHODS.map((method) => (
                      <DropdownMenuItem
                        key={method.id}
                        className="text-foreground hover:bg-accent"
                        onClick={() => setPaymentMethod(method.name)}
                      >
                        {method.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>



              {/* Sort and Refresh */}
              <div className="flex gap-2 items-end sm:col-span-2 lg:col-span-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-between bg-background border-border text-foreground hover:bg-accent"
                    >
                      {sortBy}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className="text-foreground hover:bg-accent"
                      onClick={() => setSortBy('Sort By Price')}
                    >
                      Sort By Price
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-foreground hover:bg-accent"
                      onClick={() => setSortBy('Sort By Time')}
                    >
                      Sort By Time
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-foreground hover:bg-accent"
                      onClick={() => setSortBy('Sort By Volume')}
                    >
                      Sort By Volume
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={loadOrders}
                  disabled={loading}
                  className="bg-background border-border text-foreground hover:bg-accent"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>




            {/* Trading Pairs List */}
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Showing {filteredOrders.length} {activeTab === 'buy' ? 'buy' : 'sell'} offers for {selectedCrypto}
                {paymentMethod !== 'All payment methods' && ` with ${paymentMethod}`}
                {transactionAmount && !isNaN(parseFloat(transactionAmount)) && ` around ${parseFloat(transactionAmount).toFixed(2)} per token`}

                {averagePrice > 0 && ` • Avg Price: ${averagePrice.toFixed(2)}`}
              </div>

              {/* Column Headers */}
              <div className="hidden sm:grid grid-cols-5 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
                <div>Advertisers</div>
                <div>Price</div>
                <div>Available</div>
                <div>Payment</div>
                <div>Trade</div>
              </div>

              {/* Loading State with Skeletons */}
              {loading && (
                <>
                  {/* Desktop Skeletons */}
                  <div className="hidden sm:space-y-4">
                    {Array.from({ length: 5 }, (_, index) => (
                      <div key={`skeleton-${index}`} className="grid grid-cols-5 gap-4 px-4 pb-4 border-b border-border">
                        {/* Advertiser Skeleton */}
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-muted rounded-full animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                            <div className="h-3 bg-muted rounded animate-pulse w-16"></div>
                            <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
                          </div>
                        </div>
                        {/* Price Skeleton */}
                        <div className="flex items-center">
                          <div className="h-5 bg-muted rounded animate-pulse w-16"></div>
                        </div>
                        {/* Available Skeleton */}
                        <div className="flex flex-col justify-center space-y-1">
                          <div className="h-5 bg-muted rounded animate-pulse w-20"></div>
                          <div className="h-3 bg-muted rounded animate-pulse w-24"></div>
                        </div>
                        {/* Payment Skeleton */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-3 bg-muted rounded-sm animate-pulse"></div>
                            <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-3 bg-muted rounded-sm animate-pulse"></div>
                            <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                          </div>
                        </div>
                        {/* Trade Button Skeleton */}
                        <div className="flex items-center">
                          <div className="h-9 bg-muted rounded animate-pulse w-24"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile Skeletons */}
                  <div className="sm:hidden space-y-4">
                    {Array.from({ length: 3 }, (_, index) => (
                      <div key={`mobile-skeleton-${index}`} className="border border-border rounded-lg p-4 space-y-3">
                        {/* Trader Info Skeleton */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                            <div className="h-3 bg-muted rounded animate-pulse w-40"></div>
                            <div className="h-3 bg-muted rounded animate-pulse w-24"></div>
                          </div>
                        </div>
                        {/* Price and Available Skeleton */}
                        <div className="flex justify-between items-center">
                          <div className="h-6 bg-muted rounded animate-pulse w-20"></div>
                          <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                        </div>
                        {/* Order Info Skeleton */}
                        <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                        {/* Payment and Action Skeleton */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-3 bg-muted rounded-sm animate-pulse"></div>
                              <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-3 bg-muted rounded-sm animate-pulse"></div>
                              <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                            </div>
                          </div>
                          <div className="h-10 bg-muted rounded animate-pulse w-24"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Error State */}
              {ordersError && !loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-red-500">{ordersError}</div>
                </div>
              )}

              {/* Real Trading Pairs from Backend */}
              {!loading && !ordersError && filteredOrders.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">
                    {orders.length === 0
                      ? `No ${activeTab} orders found for ${selectedCrypto}`
                      : `No ${activeTab} orders found for ${selectedCrypto}${paymentMethod !== 'All payment methods' ? ` with ${paymentMethod}` : ''}${transactionAmount && !isNaN(parseFloat(transactionAmount)) ? ` around ${parseFloat(transactionAmount).toFixed(2)} per token` : ''}`
                    }
                  </div>
                </div>
              )}

              {!loading && !ordersError && filteredOrders.map((order) => (
                <div key={order._id} className="hidden sm:grid grid-cols-5 gap-4 px-4 pb-4 border-b">
                  {/* Advertisers Column */}
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-7 h-7">
                        <AvatarImage
                          src={userDataMap[order.uid]?.photoURL || `https://i.pravatar.cc/150?img=${order.uid?.slice(-2) || '1'}`}
                          alt={userDataMap[order.uid]?.displayName || `User ${order.uid?.slice(-4) || 'user'}`}
                        />
                        <AvatarFallback className="bg-muted text-foreground">
                          {userDataMap[order.uid]?.displayName?.slice(0, 2)?.toUpperCase() || order.uid?.slice(-4) || 'user'}
                        </AvatarFallback>
                        {!userDataMap[order.uid] && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-full">
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${userDataMap[order.uid]?.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        title={userDataMap[order.uid]?.isActive ? 'User is active' : 'User is inactive'}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          {userDataMap[order.uid]?.displayName || `User ${order.uid?.slice(-4) || 'user'}`}
                        </span>
                        {currentUser?.uid === order.uid && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Your Order
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {/* {order.status} • {userDataMap[order.uid]?.totalOrders || 0} orders */}
                        {userDataMap[order.uid]?.totalOrders || 0} orders
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ⏱️ {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Price Column */}
                  <div className="flex items-center">
                    <div className="font-medium text-foreground">
                      {order.price?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  {/* Available/Order Limit Column */}
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-foreground">
                      {order.amount?.toFixed(2) || '0.00'} {order.cryptocurrency || selectedCrypto}
                    </div>
                                         <div className="text-xs text-muted-foreground mt-1">
                       {order.minOrderLimit && order.maxOrderLimit 
                         ? `${order.minOrderLimit} • ${order.maxOrderLimit} ${order.cryptocurrency || selectedCrypto}`
                         : `No limits set`
                       }
                     </div>
                  </div>

                  {/* Payment Column */}
                  <div className="flex flex-col gap-1">
                    {order.paymentMethods?.map((method: string, index: number) => {
                      const paymentMethod = PAYMENT_METHODS.find(pm => pm.name === method);
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-1 h-3 ${paymentMethod?.color || 'bg-gray-500'} rounded-sm`}></div>
                          <span className="text-sm text-foreground">{method}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Trade Column */}
                  <div className="flex items-center">
                    {currentUser?.uid === order.uid ? (
                      <Button
                        variant="outline"
                        disabled
                        className="bg-gray-100 text-gray-500 cursor-not-allowed"
                        title="You cannot trade on your own order"
                      >
                        Your Order
                      </Button>
                    ) : (
                      <Button
                        variant={activeTab === 'buy' ? 'default' : 'outline'}
                        className={`${activeTab === 'buy'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        onClick={() => router.push(`/order/${order._id}`)}
                      >
                        {activeTab === 'buy' ? `Buy ${selectedCrypto}` : `Sell ${selectedCrypto}`}
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Mobile Trading Pairs */}
              <div className="sm:hidden space-y-4">
                {!loading && !ordersError && filteredOrders.map((order) => (
                  <div key={`mobile-${order._id}`} className="border border-border rounded-lg p-4 space-y-3">
                    {/* Trader Info */}
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={userDataMap[order.uid]?.photoURL || `https://i.pravatar.cc/150?img=${order.uid?.slice(-2) || '1'}`}
                            alt={userDataMap[order.uid]?.displayName || `User ${order.uid?.slice(-4) || 'user'}`}
                          />
                          <AvatarFallback className="bg-muted text-foreground">
                            {userDataMap[order.uid]?.displayName?.slice(0, 2)?.toUpperCase() || order.uid?.slice(-4) || 'user'}
                          </AvatarFallback>
                          {!userDataMap[order.uid] && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-full">
                              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${userDataMap[order.uid]?.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          title={userDataMap[order.uid]?.isActive ? 'User is active' : 'User is inactive'}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">
                            {userDataMap[order.uid]?.displayName || `User ${order.uid?.slice(-4) || 'user'}`}
                          </span>
                          {currentUser?.uid === order.uid && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Your Order
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {order.status} • {userDataMap[order.uid]?.totalOrders || 0} orders • {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ⏱️ {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {/* Price and Available */}
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-foreground">
                        {order.price?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.amount?.toFixed(4) || '0.0000'} {order.cryptocurrency || selectedCrypto}
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="text-sm text-muted-foreground">
                      Total Value: {order.totalValue?.toFixed(2) || '0.00'}
                    </div>

                    {/* Payment Methods and Action */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex flex-col gap-1">
                        {order.paymentMethods?.map((method: string, index: number) => {
                          const paymentMethod = PAYMENT_METHODS.find(pm => pm.name === method);
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <div className={`w-1 h-3 ${paymentMethod?.color || 'bg-gray-500'} rounded-sm`}></div>
                              <span className="text-sm text-foreground">{method}</span>
                            </div>
                          );
                        })}
                      </div>

                      {currentUser?.uid === order.uid ? (
                        <Button
                          variant="outline"
                          disabled
                          className="bg-gray-100 text-gray-500 cursor-not-allowed"
                          title="You cannot trade on your own order"
                        >
                          Your Order
                        </Button>
                      ) : (
                        <Button
                          variant={activeTab === 'buy' ? 'default' : 'outline'}
                          className={`${activeTab === 'buy'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          onClick={() => router.push(`/order/${order._id}`)}
                        >
                          {activeTab === 'buy' ? `Buy ${order.cryptocurrency || selectedCrypto}` : `Sell ${order.cryptocurrency || selectedCrypto}`}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {!loading && !ordersError && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalOrders)} of {totalOrders} orders
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="bg-background border-border text-foreground hover:bg-accent"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum
                              ? "bg-primary text-primary-foreground"
                              : "bg-background border-border text-foreground hover:bg-accent"
                            }
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-background border-border text-foreground hover:bg-accent"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          {/* Floating Create Order Button */}
          <Button
            onClick={handleCreateOrder}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-green-500 cursor-pointer hover:bg-green-600 text-white z-50"
            size="icon"
          >
            <Plus className="w-6 h-6" />
          </Button>

          {/* Create Order Modal */}
          <Dialog open={showCreateOrder} onOpenChange={setShowCreateOrder}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create {orderType === 'buy' ? 'Buy' : 'Sell'} Order</DialogTitle>
                <DialogDescription>
                  Create a new {orderType} order for {orderCrypto}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Order Type Toggle */}
                <div className="flex items-center gap-4">
                  <Label>Order Type</Label>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${orderType === 'buy' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Buy
                    </span>
                    <Switch
                      checked={orderType === 'sell'}
                      onCheckedChange={(checked) => setOrderType(checked ? 'sell' : 'buy')}
                    />
                    <span className={`text-sm font-medium ${orderType === 'sell' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Sell
                    </span>
                  </div>
                </div>

                {/* Cryptocurrency Selection */}
                <div className="grid gap-2">
                  <Label htmlFor="crypto">Cryptocurrency</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="justify-between">
                        {orderCrypto}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {CRYPTOCURRENCIES.map((crypto) => (
                        <DropdownMenuItem
                          key={crypto.symbol}
                          onClick={() => setOrderCrypto(crypto.symbol)}
                        >
                          {crypto.symbol}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Amount and Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount ({orderCrypto})</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (NPR)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Limits Toggle */}
                <div className="flex items-center gap-4">
                  <Label>Set Trading Limits</Label>
                  <Switch
                    checked={showLimits}
                    onCheckedChange={setShowLimits}
                  />
                </div>

                {/* Min and Max Limits */}
                {showLimits && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="minLimit">Min Limit ({orderCrypto})</Label>
                      <Input
                        id="minLimit"
                        type="number"
                        placeholder="0.00"
                        value={orderMinLimit}
                        onChange={(e) => setOrderMinLimit(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="maxLimit">Max Limit ({orderCrypto})</Label>
                      <Input
                        id="maxLimit"
                        type="number"
                        placeholder="0.00"
                        value={orderMaxLimit}
                        onChange={(e) => setOrderMaxLimit(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                <div className="grid gap-2">
                  <Label>Payment Methods</Label>
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_METHODS.map((method) => (
                      <Button
                        key={method.id}
                        variant={orderPaymentMethods.includes(method.name) ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePaymentMethod(method.name)}
                        className="flex items-center gap-2"
                      >
                        <div className={`w-2 h-2 ${method.color} rounded-full`}></div>
                        {method.name}
                      </Button>
                    ))}
                  </div>
                  {orderPaymentMethods.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Selected: {orderPaymentMethods.join(', ')}
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="grid gap-2">
                  <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Add any additional information about your order..."
                    value={orderAdditionalInfo}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrderAdditionalInfo(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateOrder(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitOrder}>
                  Create Order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  );
} 