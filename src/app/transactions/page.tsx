"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Filter } from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBackendUser } from '@/hooks/useBackendUser';
import { useToast } from '@/hooks/use-toast';

export default function TransactionsPage() {
  const { userData, loading } = useBackendUser();
  const { toast } = useToast();
  const router = useRouter();

  // Listen for global refresh events
  useEffect(() => {
    const handleRefresh = () => {
      // Refresh transaction data - in real app, you'd call your data fetching function
      toast({
        title: "Transactions refreshed",
        description: "Transaction data has been updated",
      });
    };

    window.addEventListener('app:refresh', handleRefresh);
    return () => window.removeEventListener('app:refresh', handleRefresh);
  }, [toast]);

  // Mock transaction data - replace with real data from your backend
  const transactions = [
    {
      id: 1,
      type: 'reward',
      title: 'ETH reward',
      date: 'Aug 18, 2025',
      cadAmount: '+CA$0.02',
      cryptoAmount: '+0.00000388 ETH',
      isPositive: true,
      icon: '🔷',
      status: 'completed'
    },
    {
      id: 2,
      type: 'reward',
      title: 'SOL reward',
      date: 'Aug 17, 2025',
      cadAmount: '+CA$0.07',
      cryptoAmount: '+0.000261 SOL',
      isPositive: true,
      icon: '🟣',
      status: 'completed'
    },
    {
      id: 3,
      type: 'reward',
      title: 'ETH reward',
      date: 'Aug 15, 2025',
      cadAmount: '+CA$0.02',
      cryptoAmount: '+0.00000333 ETH',
      isPositive: true,
      icon: '🔷',
      status: 'completed'
    },
    {
      id: 4,
      type: 'convert',
      title: 'Converted to ZEC',
      date: 'Aug 15, 2025',
      cadAmount: '+CA$8.47',
      cryptoAmount: '+0.164 ZEC',
      isPositive: true,
      icon: '🟡',
      status: 'completed'
    },
    {
      id: 5,
      type: 'send',
      title: 'Sent USDC',
      date: 'Aug 14, 2025',
      cadAmount: '-CA$310.30',
      cryptoAmount: '-224.60 USDC',
      isPositive: false,
      icon: '🔵',
      status: 'completed'
    },
    {
      id: 6,
      type: 'buy',
      title: 'Bought USDC',
      date: 'Aug 14, 2025',
      cadAmount: '+CA$312.73',
      cryptoAmount: '+225.25 USDC',
      isPositive: true,
      icon: '🔵',
      status: 'completed'
    },
    {
      id: 7,
      type: 'sell',
      title: 'Sold XRP',
      date: 'Aug 14, 2025',
      cadAmount: '-CA$80.76',
      cryptoAmount: '-19.23 XRP',
      isPositive: false,
      icon: '⚫',
      status: 'completed'
    },
    {
      id: 8,
      type: 'sell',
      title: 'Sold SOL',
      date: 'Aug 14, 2025',
      cadAmount: '-CA$90.43',
      cryptoAmount: '-0.341 SOL',
      isPositive: false,
      icon: '🟣',
      status: 'completed'
    },
    {
      id: 9,
      type: 'unstaking',
      title: 'Unstaking ETH',
      date: '12 days left',
      cadAmount: 'CA$186.51',
      cryptoAmount: '0.0315 ETH',
      isPositive: false,
      icon: '🔷',
      status: 'pending'
    }
  ];

  const getFilteredTransactions = (filter: string) => {
    switch (filter) {
      case 'rewards':
        return transactions.filter(t => t.type === 'reward');
      case 'trades':
        return transactions.filter(t => ['buy', 'sell', 'convert'].includes(t.type));
      case 'transfers':
        return transactions.filter(t => ['send', 'receive'].includes(t.type));
      case 'pending':
        return transactions.filter(t => t.status === 'pending');
      default:
        return transactions;
    }
  };

  const getTransactionIcon = (transaction: any) => {
    // You can replace these with actual token icons from your assets
    const iconMap: { [key: string]: string } = {
      'ETH': '🔷',
      'SOL': '🟣',
      'USDC': '🔵',
      'ZEC': '🟡',
      'XRP': '⚫',
      'TOSHI': '🦊',
      'CAD': '💰'
    };

    if (transaction.icon) return transaction.icon;
    
    // Extract token from crypto amount
    const token = transaction.cryptoAmount.split(' ')[1];
    return iconMap[token] || '💎';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Transaction History</h1>
                  <p className="text-muted-foreground">View your wallet activity</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
                <TabsTrigger value="trades">Trades</TabsTrigger>
                <TabsTrigger value="transfers">Transfers</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>

                             <TabsContent value="all" className="space-y-2 mt-6">
                 {getFilteredTransactions('all').map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    {/* Transaction Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted/20 border border-border flex items-center justify-center text-lg">
                        {getTransactionIcon(transaction)}
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {transaction.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date}
                          </p>
                        </div>
                        
                        {/* Amounts */}
                        <div className="text-right ml-4">
                          <div className={`font-medium ${
                            transaction.isPositive ? 'text-green-500' : 'text-white'
                          }`}>
                            {transaction.cadAmount}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.cryptoAmount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
               </TabsContent>

               <TabsContent value="rewards" className="space-y-2 mt-6">
                 {getFilteredTransactions('rewards').map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    {/* Transaction Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted/20 border border-border flex items-center justify-center text-lg">
                        {getTransactionIcon(transaction)}
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {transaction.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date}
                          </p>
                        </div>
                        
                        {/* Amounts */}
                        <div className="text-right ml-4">
                          <div className={`font-medium ${
                            transaction.isPositive ? 'text-green-500' : 'text-white'
                          }`}>
                            {transaction.cadAmount}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.cryptoAmount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
               </TabsContent>

               <TabsContent value="trades" className="space-y-2 mt-6">
                 {getFilteredTransactions('trades').map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    {/* Transaction Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted/20 border border-border flex items-center justify-center text-lg">
                        {getTransactionIcon(transaction)}
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {transaction.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date}
                          </p>
                        </div>
                        
                        {/* Amounts */}
                        <div className="text-right ml-4">
                          <div className={`font-medium ${
                            transaction.isPositive ? 'text-green-500' : 'text-white'
                          }`}>
                            {transaction.cadAmount}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.cryptoAmount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
               </TabsContent>

               <TabsContent value="transfers" className="space-y-2 mt-6">
                 {getFilteredTransactions('transfers').map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    {/* Transaction Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted/20 border border-border flex items-center justify-center text-lg">
                        {getTransactionIcon(transaction)}
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {transaction.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date}
                          </p>
                        </div>
                        
                        {/* Amounts */}
                        <div className="text-right ml-4">
                          <div className={`font-medium ${
                            transaction.isPositive ? 'text-green-500' : 'text-white'
                          }`}>
                            {transaction.cadAmount}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.cryptoAmount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
               </TabsContent>

               <TabsContent value="pending" className="space-y-2 mt-6">
                 {getFilteredTransactions('pending').map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    {/* Transaction Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted/20 border border-border flex items-center justify-center text-lg">
                        {getTransactionIcon(transaction)}
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {transaction.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date}
                          </p>
                        </div>
                        
                        {/* Amounts */}
                        <div className="text-right ml-4">
                          <div className={`font-medium ${
                            transaction.isPositive ? 'text-green-500' : 'text-white'
                          }`}>
                            {transaction.cadAmount}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.cryptoAmount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
               </TabsContent>
             </Tabs>

            {/* Empty States for each tab */}
            <TabsContent value="all" className="mt-6">
              {getFilteredTransactions('all').length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-white mb-2">No transactions found</h3>
                  <p className="text-muted-foreground">Your transaction history will appear here</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rewards" className="mt-6">
              {getFilteredTransactions('rewards').length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🎁</div>
                  <h3 className="text-lg font-medium text-white mb-2">No rewards found</h3>
                  <p className="text-muted-foreground">Your reward transactions will appear here</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="trades" className="mt-6">
              {getFilteredTransactions('trades').length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📈</div>
                  <h3 className="text-lg font-medium text-white mb-2">No trades found</h3>
                  <p className="text-muted-foreground">Your trading activity will appear here</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transfers" className="mt-6">
              {getFilteredTransactions('transfers').length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">💸</div>
                  <h3 className="text-lg font-medium text-white mb-2">No transfers found</h3>
                  <p className="text-muted-foreground">Your transfer transactions will appear here</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              {getFilteredTransactions('pending').length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⏳</div>
                  <h3 className="text-lg font-medium text-white mb-2">No pending transactions</h3>
                  <p className="text-muted-foreground">Your pending transactions will appear here</p>
                </div>
              )}
            </TabsContent>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
