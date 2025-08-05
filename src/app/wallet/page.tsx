"use client";

import { useState } from 'react';
import Image from 'next/image';

import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  ArrowRightLeft,
} from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('assets');

  const tokens = [
    {
      id: 1,
      symbol: 'ETH',
      name: 'Ethereum',
      url: 'https://ik.imagekit.io/lexy/Ming/tokens/ethereum-eth.webp?updatedAt=1754373033878',
      portfolioPercent: 93.26,
      price: 3657.29,
      priceChange: 2.86,
      balance: 0.0016,
      value: 5.67,
      isPositive: true
    },
    {
      id: 2,
      symbol: 'USDT',
      name: 'Tether',
      url: 'https://ik.imagekit.io/lexy/Ming/tokens/Tether-USDT-icon.webp?updatedAt=1754373237083',
      portfolioPercent: 4.77,
      price: 0.00000752,
      priceChange: -16.74,
      balance: 38300,
      value: 0.29,
      isPositive: false
    },
    {
      id: 3,
      symbol: 'BTC',
      name: 'Bitcoin',
      url: 'https://ik.imagekit.io/lexy/Ming/tokens/bitcoin_PNG38.webp?updatedAt=1754373429532',
      portfolioPercent: 1.97,
      price: 3657.29,
      priceChange: 2.86,
      balance: 0,
      value: 0.12,
      isPositive: true
    },
    {
      id: 4,
      symbol: 'STRK',
      name: 'Starknet',
      url: 'https://ik.imagekit.io/lexy/Ming/tokens/Starknet_STRK_Logo-3000x3000.webp',
      portfolioPercent: 0.00,
      price: 0.00000752,
      priceChange: -16.74,
      balance: 0,
      value: 0.12,
      isPositive: true
    },
    {
      id: 5,
      symbol: 'SOL',
      name: 'Solana',
      url: 'https://ik.imagekit.io/lexy/Ming/tokens/solana-sol-logo-png_seeklogo-423095.webp',
      portfolioPercent: 0.00,
      price: 0.00000752,
      priceChange: -16.74,
      balance: 0,
      value: 0.12,
      isPositive: true
    }
  ];

  const totalValue = 6.08;
  const dailyChange = 0.10;
  const dailyChangePercent = 1.69;

  const tabs = [
    { id: 'assets', label: 'Assets' },
    { id: 'orders', label: 'Orders' },

  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-lg sm:text-xl font-semibold text-white">Estimated Balance</h1>
              <div className="flex items-center gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-white">${totalValue.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>+${dailyChange.toFixed(2)} (+{dailyChangePercent.toFixed(2)}%)</span>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <Button 
                variant="outline"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                onClick={() => {
                  // TODO: Implement deposit functionality
                  console.log('Deposit clicked');
                }}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Deposit</span>
                <span className="sm:hidden">Deposit</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                onClick={() => {
                  // TODO: Implement withdraw functionality
                  console.log('Withdraw clicked');
                }}
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Withdraw</span>
                <span className="sm:hidden">Withdraw</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                onClick={() => {
                  // TODO: Implement transfer functionality
                  console.log('Transfer clicked');
                }}
              >
                <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Transfer</span>
                <span className="sm:hidden">Transfer</span>
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
                <div className="divide-y divide-border">
                  {tokens.map((token) => (
                    <div key={token.id} className="grid grid-cols-4 gap-4 p-4 hover:bg-muted/20 transition-colors">
                      {/* Token Column */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <Image src={token.url} alt={token.symbol} width={32} height={32} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-sm text-muted-foreground">{token.name}</div>
                          </div>
                        </div>
                      </div>

                      {/* Portfolio % Column */}
                      <div className="flex items-center">
                        <span className="text-sm">{token.portfolioPercent.toFixed(2)}%</span>
                      </div>

                      {/* Price Column */}
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm">${token.price.toLocaleString()}</div>
                          <div className={`flex items-center gap-1 text-xs ${token.isPositive ? 'text-green-500' : 'text-red-500'
                            }`}>
                            {token.isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span>{Math.abs(token.priceChange).toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Balance Column */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm">${token.value.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            {token.balance.toLocaleString()} {token.symbol}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Token List */}
              <div className="sm:hidden space-y-3">
                {tokens.map((token) => (
                  <div key={`mobile-${token.id}`} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                    {/* Token Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image src={token.url} alt={token.symbol} width={40} height={40} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{token.symbol}</div>
                        <div className="text-xs text-muted-foreground">{token.name}</div>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="text-right">
                      <div className="text-sm font-medium">${token.value.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {token.balance.toLocaleString()} {token.symbol}
                      </div>
                    </div>
                  </div>
                ))}
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
      </div>
    </ProtectedRoute>
  );
} 