"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  ArrowRightLeft,
  Copy,
  Check,
  Loader2,
  RefreshCcw,
} from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useBackendUser } from '@/hooks/useBackendUser';
import { useToast } from '@/hooks/use-toast';
import { shortenAddress } from '@/lib/utils';
import { useTokenBalance } from '@/contexts/TokenBalanceContext';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('assets');
  const [copied, setCopied] = useState(false);
  const { userData, loading } = useBackendUser();
  const { toast } = useToast();
  const { tokenBalances, totalPortfolioValue, refreshBalances, isLoading: balancesLoading, totalPercentageChange } = useTokenBalance();
  const router = useRouter();

  // Listen for global refresh events
  useEffect(() => {
    const handleRefresh = () => {
      refreshBalances();
    };

    window.addEventListener('app:refresh', handleRefresh);
    return () => window.removeEventListener('app:refresh', handleRefresh);
  }, [refreshBalances]);

  // Helper function to format numbers without unnecessary decimal zeros
  const formatNumber = (num: number, decimals: number = 2) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    const fixed = num.toFixed(decimals);
    return fixed.replace(/\.?0+$/, '');
  };

  const formatTokenSymbol = (symbol: string) => {
    // Remove -SEPOLIA and -AMOY suffixes first, then any remaining SEPOLIA or AMOY
    return symbol.replace(/-SEPOLIA$/i, '').replace(/-AMOY$/i, '').replace(/SEPOLIA$/i, '').replace(/AMOY$/i, '');
  };

  const formatTokenName = (name: string) => {
    // Remove -SEPOLIA and -AMOY suffixes first, then any remaining SEPOLIA or AMOY, then testnet references
    return name.replace(/-SEPOLIA$/i, '').replace(/-AMOY$/i, '').replace(/SEPOLIA$/i, '').replace(/AMOY$/i, '').replace(/Sepolia Testnet/i, '').replace(/Amoy Testnet/i, '').trim();
  };

  // Use real token balances from context instead of hardcoded data
  const tokens = tokenBalances || [];

  // Use real total portfolio value from context with fallback
  const totalValue = totalPortfolioValue || 0;
  const dailyChange = 0.10; // TODO: Calculate from price changes
  const dailyChangePercent = totalPercentageChange || 0; // Use real percentage change from context

  // Calculate total value from tokens if context doesn't provide it
  const calculatedTotalValue = totalValue > 0 ? totalValue : tokens.reduce((sum, token) => sum + (token.value || 0), 0);

  // Validate token structure and filter out invalid tokens
  const validTokens = tokens.filter(token =>
    token &&
    typeof token === 'object' &&
    token.symbol &&
    token.name &&
    typeof token.balance === 'number' &&
    typeof token.value === 'number'
  );

  if (tokens.length > 0 && validTokens.length === 0) {
    console.warn('Token validation failed. Sample token structure:', tokens[0]);
  }

  const tabs = [
    { id: 'assets', label: 'Assets' },
    { id: 'orders', label: 'Orders' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-muted-foreground">Loading wallet...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-lg sm:text-xl font-semibold text-white">Estimated Balance</h1>
                <div className="flex items-center gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-white">${formatNumber(calculatedTotalValue)}</span>
                </div>
                <div className={`flex items-center gap-1 text-sm ${dailyChangePercent > 0 ? 'text-green-500' : dailyChangePercent < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {dailyChangePercent > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : dailyChangePercent < 0 ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                  <span>
                    {dailyChangePercent > 0 ? '+' : ''}{formatNumber(dailyChangePercent)}%
                  </span>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm outline-green-400 hover:bg-green-600 hover:text-green-100 text-green-400"
                  onClick={() => router.push('/deposit')}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Deposit</span>
                  <span className="sm:hidden">Deposit</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm outline-red-400 hover:bg-red-600 hover:text-red-100 text-red-400"
                  onClick={() => router.push('/transfer')}
                >
                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Transfer</span>
                  <span className="sm:hidden">Transfer</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm outline-blue-400 hover:bg-blue-600 hover:text-blue-100 text-blue-400"
                  onClick={refreshBalances}
                  disabled={balancesLoading}
                >
                  {balancesLoading ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4" />}
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Refresh</span>
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                    ? 'text-white border-b-2 border-purple-500'
                    : 'text-muted-foreground hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => router.push('/transactions')}
                className="px-4 sm:px-6 py-3 text-sm font-medium transition-colors text-muted-foreground hover:text-white ml-auto"
              >
                View All
              </button>
            </div>


            {activeTab === 'assets' && (
              <>
                {/* Desktop Token Table */}
                <div className="hidden sm:block overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-border bg-muted/20">
                    <div className="font-medium text-sm">Token</div>
                    <div className="font-medium text-sm flex items-center gap-1">
                      Portfolio %
                      <ChevronDown className="h-3 w-3" />
                    </div>
                    <div className="font-medium text-sm">Price (24hr)</div>
                    <div className="font-medium text-sm">Balance</div>
                  </div>

                  {/* Table Body */}
                  {balancesLoading ? (
                    <div className="divide-y divide-border">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="grid grid-cols-4 gap-4 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-muted animate-pulse"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                              <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                            </div>
                          </div>
                          <div className="h-4 w-12 bg-muted rounded animate-pulse"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                            <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                            <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : validTokens.length > 0 ? (
                    <div className="divide-y divide-border">
                      {validTokens.map((token) => (
                        <div key={token.id} className="grid grid-cols-4 gap-4 p-4 hover:bg-muted/20 transition-colors">
                          {/* Token Column */}
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full overflow-hidden">
                              <Image src={token.url} alt={token.symbol} width={26} height={26} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-medium">{formatTokenSymbol(token.symbol)}</div>
                                <div className="text-sm text-muted-foreground">{formatTokenName(token.name)}</div>
                              </div>
                            </div>
                          </div>

                          {/* Portfolio % Column */}
                          <div className="flex items-center">
                            <span className="text-sm">{formatNumber(token.portfolioPercent)}%</span>
                          </div>

                          {/* Price Column */}
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm">${formatNumber(token.price)}</div>
                              <div className={`flex items-center gap-1 text-xs ${token.isPositive ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {token.isPositive ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                <span>{formatNumber(Math.abs(token.priceChange))}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Balance Column */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm">${formatNumber(token.value)}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatNumber(token.balance)} {formatTokenSymbol(token.symbol)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <p>No tokens found</p>
                      <p className="text-sm mt-2">Your token balances will appear here</p>
                      {totalValue === 0 && (
                        <p className="text-xs mt-2 text-orange-500">
                          If you expect to see tokens, try refreshing or check your wallet connection
                        </p>
                      )}
                      {tokens.length > 0 && validTokens.length === 0 && (
                        <p className="text-xs mt-2 text-red-500">
                          Token data structure issue detected. Check console for details.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Mobile Token List */}
                <div className="sm:hidden space-y-3">
                  {balancesLoading ? (
                    [1, 2, 3].map((i) => (
                      <div key={`mobile-skeleton-${i}`} className={`flex items-center justify-between p-4 bg-card border border-border ${i === 3 ? 'rounded-lg' : 'border-b-0 rounded-t-lg'} ${i === 1 ? 'rounded-t-lg' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                            <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                          <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : validTokens.length > 0 ? (
                    validTokens.map((token, index) => (
                      <div key={`mobile-${token.id}`} className={`flex items-center justify-between px-4 border-t bottom-b py-2 border-border ${index === validTokens.length - 1 ? 'rounded-lg' : 'border-b-0 '}`}>
                        {/* Token Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <Image src={token.url} alt={token.symbol} width={32} height={32} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{formatTokenSymbol(token.symbol)}</div>
                            <div className="text-xs text-muted-foreground">{formatTokenName(token.name)}</div>

                          </div>
                        </div>

                        {/* Balance */}
                        <div className="text-right">
                          <div className="text-sm font-medium">${formatNumber(token.value)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatNumber(token.balance)} {formatTokenSymbol(token.symbol)}
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${token.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {token.isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span>{formatNumber(Math.abs(token.priceChange))}%</span>
                          </div>

                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <p>No tokens found</p>
                      <p className="text-sm mt-2">Your token balances will appear here</p>
                      {totalValue === 0 && (
                        <p className="text-xs mt-2 text-orange-500">
                          If you expect to see tokens, try refreshing or check your wallet connection
                        </p>
                      )}
                      {tokens.length > 0 && validTokens.length === 0 && (
                        <p className="text-xs mt-2 text-red-500">
                          Token data structure issue detected. Check console for details.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'orders' && (
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-center text-muted-foreground">
                  <p>No orders found</p>
                  <p className="text-sm mt-2">Your trading orders will appear here</p>
                </div>
              </div>
                        )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 