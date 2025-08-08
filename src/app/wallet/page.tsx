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
  Copy,
  Check,
  X,
} from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useBackendUser } from '@/hooks/useBackendUser';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('assets');
  const [copied, setCopied] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const { userData, loading} = useBackendUser();
  const { toast } = useToast();

  // Helper function to format numbers without unnecessary decimal zeros
  const formatNumber = (num: number, decimals: number = 2) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    const fixed = num.toFixed(decimals);
    return fixed.replace(/\.?0+$/, '');
  };

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

  ];

  const totalValue = 6.08;
  const dailyChange = 0.10;
  const dailyChangePercent = 1.69;

  // Helper function to copy wallet address to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      toast({
        title: "Error",
        description: "Failed to copy wallet address",
        variant: "destructive",
      });
    }
  };

  const tabs = [
    { id: 'assets', label: 'Assets' },
    { id: 'orders', label: 'Orders' },
  ];

  const chainOptions = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: '🔷',
      description: 'Ethereum Sepolia Testnet',
      walletAddress: userData?.wallets?.ethereum?.walletAddress || '',
      hasWallet: !!userData?.wallets?.ethereum?.walletAddress,
    },
    {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'MATIC',
      icon: '🟣',
      description: 'Polygon Amoy Testnet',
      walletAddress: userData?.wallets?.polygon?.walletAddress || '',
      hasWallet: !!userData?.wallets?.polygon?.walletAddress,
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      symbol: 'ARB',
      icon: '🔵',
      description: 'Arbitrum Sepolia Testnet',
      walletAddress: userData?.wallets?.arbitrum?.walletAddress || '',
      hasWallet: !!userData?.wallets?.arbitrum?.walletAddress,
    },
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
                <span className="text-3xl sm:text-4xl font-bold text-white">${formatNumber(totalValue)}</span>
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>+{formatNumber(dailyChange)} (+{formatNumber(dailyChangePercent)}%)</span>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                onClick={() => setDepositDialogOpen(true)}
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
                        <div className="w-6 h-6 rounded-full overflow-hidden">
                          <Image src={token.url} alt={token.symbol} width={26} height={26} className="w-full h-full object-cover" />
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
                        <span className="text-sm">{formatNumber(token.portfolioPercent)}%</span>
                      </div>

                      {/* Price Column */}
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm">{token.price.toLocaleString()}</div>
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
                      <div className="text-sm font-medium">{formatNumber(token.value)}</div>
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
        )}

        {/* Deposit Dialog */}
        <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Deposit Funds
              </DialogTitle>
              <DialogDescription>
                Select a blockchain and copy your wallet address to receive deposits.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* User UID Section */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">User ID</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={userData?.uid || ''}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(userData?.uid || '')}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">Or</p>

              {/* Chain Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Blockchain</Label>
                <select
                  value={selectedChain}
                  onChange={(e) => {
                    const chainId = e.target.value;
                    if (chainId) {
                      const chain = chainOptions.find(c => c.id === chainId);
                      if (chain?.hasWallet) {
                        setSelectedChain(chainId);
                      } else {
                        toast({
                          title: "Wallet Required",
                          description: `You need to create a ${chain?.name} wallet first`,
                          variant: "destructive",
                        });
                        setSelectedChain('');
                      }
                    } else {
                      setSelectedChain('');
                    }
                  }}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a blockchain</option>
                  {chainOptions.map((chain) => (
                    <option 
                      key={chain.id} 
                      value={chain.id}
                      disabled={!chain.hasWallet}
                      className={!chain.hasWallet ? 'text-muted-foreground' : ''}
                    >
                      {chain.icon} {chain.name} ({chain.symbol}) 
                    </option>
                  ))}
                </select>
              
              </div>

              {/* Selected Chain Wallet Address */}
              {selectedChain && chainOptions.find(c => c.id === selectedChain)?.hasWallet && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">
                      {chainOptions.find(c => c.id === selectedChain)?.name} Wallet Address
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {chainOptions.find(c => c.id === selectedChain)?.symbol}
                    </Badge>
                  </div>
                  
                  <div className="p-4 bg-muted/20 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        value={chainOptions.find(c => c.id === selectedChain)?.walletAddress || ''}
                        readOnly
                        className="font-mono text-sm bg-background"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(chainOptions.find(c => c.id === selectedChain)?.walletAddress || '')}
                        className="shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Send {chainOptions.find(c => c.id === selectedChain)?.symbol} tokens to this address</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Create Wallet Option */}
              {selectedChain && !chainOptions.find(c => c.id === selectedChain)?.hasWallet && (
                <div className="space-y-3">
                  <div className="p-4 border border-orange-500/20 bg-orange-500/10 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-500">
                      <span className="text-sm font-medium">Wallet Required</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      You need to create a {chainOptions.find(c => c.id === selectedChain)?.name} wallet first
                    </p>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={async () => {
                      try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/users/uid/${userData?.uid}/create-wallet/${selectedChain}`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        });
                        
                        if (response.ok) {
                          toast({
                            title: "Success!",
                            description: `${chainOptions.find(c => c.id === selectedChain)?.name} wallet created successfully`,
                          });
                          setDepositDialogOpen(false);
                          // Refresh user data
                          window.location.reload();
                        } else {
                          throw new Error('Failed to create wallet');
                        }
                      } catch (err) {
                        toast({
                          title: "Error",
                          description: "Failed to create wallet",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Create {chainOptions.find(c => c.id === selectedChain)?.name} Wallet
                  </Button>
                </div>
              )}

              {/* Instructions */}
              {selectedChain && chainOptions.find(c => c.id === selectedChain)?.hasWallet && (
                <div className="p-4 border border-blue-500/20 bg-blue-500/10 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-500">
                    <span className="text-sm font-medium">Deposit Instructions</span>
                  </div>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Copy the wallet address above</li>
                    <li>• Send funds from your external wallet</li>
                    <li>• Funds will appear in your account after confirmation</li>
                    <li>• Only send {chainOptions.find(c => c.id === selectedChain)?.symbol} tokens to this address</li>
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
} 