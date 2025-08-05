"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown,
  Plus,
  MoreHorizontal,
  Gift,
  Link,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('tokens');

  const tokens = [
    {
      id: 1,
      symbol: 'ETH',
      name: 'Ethereum',
      icon: '🔷',
      portfolioPercent: 93.26,
      price: 3657.29,
      priceChange: 2.86,
      balance: 0.0016,
      value: 5.67,
      isPositive: true
    },
    {
      id: 2,
      symbol: 'MBAG',
      name: 'MoonBag',
      icon: '🐒',
      portfolioPercent: 4.77,
      price: 0.00000752,
      priceChange: -16.74,
      balance: 38300,
      value: 0.29,
      isPositive: false
    },
    {
      id: 3,
      symbol: 'ETH',
      name: 'Ether',
      icon: '🔷',
      portfolioPercent: 1.97,
      price: 3657.29,
      priceChange: 2.86,
      balance: 0,
      value: 0.12,
      isPositive: true
    }
  ];

  const totalValue = 6.08;
  const dailyChange = 0.10;
  const dailyChangePercent = 1.69;

  const tabs = [
    { id: 'tokens', label: 'Tokens' },
    { id: 'nfts', label: 'NFTs' },
    { id: 'defi', label: 'DeFi' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'spending-caps', label: 'Spending Caps' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-white">Decentralized accounts</h1>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-white">${totalValue.toFixed(2)}</span>
            <Link className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-1 text-green-500 text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>+${dailyChange.toFixed(2)} (+{dailyChangePercent.toFixed(2)}%)</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter/Action Bar */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-400 via-blue-500 to-purple-600"></div>
                <span>notsolexy.eth</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Change Account</DropdownMenuItem>
              <DropdownMenuItem>Add Account</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border border-background"></div>
                  <div className="w-4 h-4 rounded-full bg-red-500 border border-background"></div>
                  <div className="w-4 h-4 rounded-full bg-green-500 border border-background"></div>
                  <div className="w-4 h-4 rounded-full bg-yellow-500 border border-background"></div>
                </div>
                <span>+4 7 Networks</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Ethereum</DropdownMenuItem>
              <DropdownMenuItem>Optimism</DropdownMenuItem>
              <DropdownMenuItem>Polygon</DropdownMenuItem>
              <DropdownMenuItem>Arbitrum</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <span>More</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span>No airdrops</span>
          </Button>
        </div>

        {/* Token Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
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
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                    {token.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-sm text-muted-foreground">{token.name}</div>
                    </div>
                    {token.symbol === 'ETH' && (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
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
                    <div className={`flex items-center gap-1 text-xs ${
                      token.isPositive ? 'text-green-500' : 'text-red-500'
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
                  {token.symbol === 'MBAG' && (
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 