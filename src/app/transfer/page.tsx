"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRightLeft, Copy, Check } from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBackendUser } from '@/hooks/useBackendUser';
import { useToast } from '@/hooks/use-toast';
import { useTokenBalance } from '@/contexts/TokenBalanceContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function TransferPage() {
  const [copied, setCopied] = useState(false);
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [transferMethod, setTransferMethod] = useState<'ming' | 'crypto'>('ming');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const { userData, loading } = useBackendUser();
  const { toast } = useToast();
  const { tokenBalances } = useTokenBalance();
  const router = useRouter();

  // Helper function to format numbers without unnecessary decimal zeros
  const formatNumber = (num: number, decimals: number = 2) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    const fixed = num.toFixed(decimals);
    return fixed.replace(/\.?0+$/, '');
  };

  const formatTokenSymbol = (symbol: string) => {
    return symbol.replace(/-SEPOLIA$/i, '').replace(/-AMOY$/i, '').replace(/SEPOLIA$/i, '').replace(/AMOY$/i, '');
  };

  // Use real token balances from context
  const tokens = tokenBalances || [];

  // Validate token structure and filter out invalid tokens
  const validTokens = tokens.filter(token =>
    token &&
    typeof token === 'object' &&
    token.symbol &&
    token.name &&
    typeof token.balance === 'number' &&
    typeof token.value === 'number'
  );

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
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Header */}
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
                <h1 className="text-2xl font-bold text-white">Transfer Funds</h1>
                <p className="text-muted-foreground">Send funds to other users or wallets</p>
              </div>
            </div>

            {/* Transfer Tabs */}
            <Tabs defaultValue="setup" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger 
                  value="details" 
                  disabled={!selectedToken || (transferMethod === 'crypto' && !selectedChain)}
                >
                  Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="space-y-6 mt-6">
                <>
                  {/* Transfer Method Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium">Transfer Method</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setTransferMethod('ming');
                          setSelectedChain('');
                        }}
                        className={`p-6 border rounded-lg text-left transition-colors ${transferMethod === 'ming'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                          : 'border-border hover:border-purple-500/50'
                          }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">👥</span>
                          <div>
                            <div className="font-semibold">To Ming Users</div>
                            <div className="text-sm text-muted-foreground">Instant transfers</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Transfer funds to other Ming users using their User ID
                        </p>
                      </button>
                      <button
                        onClick={() => {
                          setTransferMethod('crypto');
                          setSelectedChain('');
                        }}
                        className={`p-6 border rounded-lg text-left transition-colors ${transferMethod === 'crypto'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                          : 'border-border hover:border-purple-500/50'
                          }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">🔗</span>
                          <div>
                            <div className="font-semibold">To Crypto Wallet</div>
                            <div className="text-sm text-muted-foreground">External transfers</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Transfer funds to external crypto wallets
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Token Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium">Select Token</Label>
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Token</option>
                      {validTokens.map((token) => (
                        <option key={token.id} value={token.id}>
                          {formatTokenSymbol(token.symbol)} - Balance: {formatNumber(token.balance)} (${formatNumber(token.value)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chain Selection for Crypto Transfers */}
                  {transferMethod === 'crypto' && (
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">Select Blockchain</Label>
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
                        <option value="">Select Chain</option>
                        {chainOptions.map((chain) => (
                          <option
                            key={chain.id}
                            value={chain.id}
                            disabled={!chain.hasWallet}
                            className={!chain.hasWallet ? 'text-muted-foreground' : ''}
                          >
                            {chain.icon} {chain.name} ({chain.symbol}) - {chain.description}
                          </option>
                        ))}
                      </select>

                      {/* Create Wallet Option */}
                      {selectedChain && !chainOptions.find(c => c.id === selectedChain)?.hasWallet && (
                        <div className="space-y-4">
                          <div className="p-4 border border-orange-500/20 bg-orange-500/10 rounded-lg">
                            <div className="flex items-center gap-2 text-orange-500">
                              <span className="font-medium">Wallet Required</span>
                            </div>
                            <p className="text-muted-foreground mt-1">
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
                    </div>
                  )}

                  {/* Next Button */}
                  {selectedToken && (transferMethod === 'ming' || (transferMethod === 'crypto' && selectedChain)) && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        // Programmatically switch to details tab
                        const detailsTab = document.querySelector('[data-state="inactive"][value="details"]') as HTMLButtonElement;
                        if (detailsTab) detailsTab.click();
                      }}
                    >
                      Next: Enter Details
                    </Button>
                  )}
                </>
              </TabsContent>

              <TabsContent value="details" className="space-y-6 mt-6">
                <>
                  {/* Amount Input */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium">Amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className={`w-full ${(() => {
                        if (!transferAmount || !selectedToken) return '';
                        const selectedTokenData = validTokens.find(t => t.id === selectedToken);
                        const transferAmountNum = parseFloat(transferAmount);
                        if (selectedTokenData && !isNaN(transferAmountNum) && transferAmountNum > selectedTokenData.balance) {
                          return 'border-red-500 focus:border-red-500';
                        }
                        return '';
                      })()}`}
                    />
                    {selectedToken && (
                      <div className="text-xs text-muted-foreground">
                        Available: {formatNumber(validTokens.find(t => t.id === selectedToken)?.balance || 0)} {formatTokenSymbol(validTokens.find(t => t.id === selectedToken)?.symbol || '')}
                      </div>
                    )}
                    {/* Real-time validation message */}
                    {transferAmount && selectedToken && (() => {
                      const selectedTokenData = validTokens.find(t => t.id === selectedToken);
                      const transferAmountNum = parseFloat(transferAmount);
                      
                      if (!selectedTokenData) return null;
                      
                      if (isNaN(transferAmountNum)) {
                        return (
                          <div className="text-xs text-red-500">
                            Please enter a valid number
                          </div>
                        );
                      }
                      
                      if (transferAmountNum <= 0) {
                        return (
                          <div className="text-xs text-red-500">
                            Amount must be greater than 0
                          </div>
                        );
                      }
                      
                      if (transferAmountNum > selectedTokenData.balance) {
                        return (
                          <div className="text-xs text-red-500">
                            Insufficient balance. You only have {formatNumber(selectedTokenData.balance)} {formatTokenSymbol(selectedTokenData.symbol)} available
                          </div>
                        );
                      }
                      
                      return (
                        <div className="text-xs text-green-500">
                          ✓ Valid amount
                        </div>
                      );
                    })()}
                  </div>

                  {/* Ming User Transfer Option */}
                  {transferMethod === 'ming' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-lg font-medium">Recipient User ID</Label>
                        <Input
                          placeholder="Enter recipient's User ID"
                          value={transferRecipient}
                          onChange={(e) => setTransferRecipient(e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                      
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-500 mb-2">
                          <span className="font-medium">Transfer to Ming User</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Funds will be transferred instantly to the recipient's Ming account
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Crypto Wallet Transfer Option */}
                  {transferMethod === 'crypto' && selectedChain && chainOptions.find(c => c.id === selectedChain)?.hasWallet && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-lg font-medium">
                          Recipient {chainOptions.find(c => c.id === selectedChain)?.name} Address
                        </Label>
                        <Input
                          placeholder={`Enter ${chainOptions.find(c => c.id === selectedChain)?.name} wallet address`}
                          value={transferRecipient}
                          onChange={(e) => setTransferRecipient(e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>

                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-orange-500 mb-2">
                          <span className="font-medium">External Transfer</span>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• This will transfer funds to an external wallet</li>
                          <li>• Network fees may apply</li>
                          <li>• Transfer time depends on network congestion</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        // Programmatically switch to setup tab
                        const setupTab = document.querySelector('[data-state="inactive"][value="setup"]') as HTMLButtonElement;
                        if (setupTab) setupTab.click();
                      }}
                    >
                      Back
                    </Button>
                    
                    {/* Transfer Button */}
                    {((transferMethod === 'ming' && transferRecipient && transferAmount) ||
                      (transferMethod === 'crypto' && transferRecipient && transferAmount)) && (
                      <Button
                        className="flex-1"
                        onClick={async () => {
                          try {
                            // Validate amount
                            const selectedTokenData = validTokens.find(t => t.id === selectedToken);
                            const transferAmountNum = parseFloat(transferAmount);
                            
                            if (!selectedTokenData) {
                              toast({
                                title: "Error",
                                description: "Selected token not found",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            if (isNaN(transferAmountNum) || transferAmountNum <= 0) {
                              toast({
                                title: "Invalid Amount",
                                description: "Please enter a valid amount greater than 0",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            if (transferAmountNum > selectedTokenData.balance) {
                              toast({
                                title: "Insufficient Balance",
                                description: `You only have ${formatNumber(selectedTokenData.balance)} ${formatTokenSymbol(selectedTokenData.symbol)} available`,
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            // TODO: Implement actual transfer logic
                            toast({
                              title: "Transfer Initiated",
                              description: `Transferring ${transferAmount} ${formatTokenSymbol(selectedTokenData.symbol)} to ${transferRecipient}`,
                            });
                            router.push('/wallet');
                          } catch (err) {
                            toast({
                              title: "Error",
                              description: "Failed to initiate transfer",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Confirm Transfer
                      </Button>
                    )}
                  </div>
                </>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
