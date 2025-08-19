"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Copy, Check, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useBackendUser } from '@/hooks/useBackendUser';
import { useToast } from '@/hooks/use-toast';
import { shortenAddress } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';


export default function DepositPage() {
  const [copied, setCopied] = useState(false);
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [depositMethod, setDepositMethod] = useState<'ming' | 'crypto'>('ming');
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const { userData, loading } = useBackendUser();
  const { toast } = useToast();
  const router = useRouter();



  // Helper function to copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive",
      });
    }
  };

  const chainOptions = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      description: 'Ethereum Sepolia Testnet',
      walletAddress: userData?.wallets?.ethereum?.walletAddress || '',
      hasWallet: !!userData?.wallets?.ethereum?.walletAddress,
    },
    {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'MATIC',
      description: 'Polygon Amoy Testnet',
      walletAddress: userData?.wallets?.polygon?.walletAddress || '',
      hasWallet: !!userData?.wallets?.polygon?.walletAddress,
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      symbol: 'ARB',
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
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">Deposit Funds</h1>
              <p className="text-muted-foreground">Add funds to your wallet</p>
            </div>

            {/* Deposit Method Selection */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setDepositMethod('ming');
                    setSelectedChain('');
                  }}
                  className={`p-2 px-4 border rounded-lg text-left transition-colors ${depositMethod === 'ming'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                    : 'border-border hover:border-purple-500/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-semibold">App Users</div>
                      <div className="text-sm text-muted-foreground">Instant transfers</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setDepositMethod('crypto');
                    setSelectedChain('');
                  }}
                  className={`p-2 px-4 border rounded-lg text-left transition-colors ${depositMethod === 'crypto'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                    : 'border-border hover:border-purple-500/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-semibold">External Wallet</div>
                      <div className="text-sm text-muted-foreground">External deposits</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Ming User Deposit Option */}
            {depositMethod === 'ming' && (
              <div className="space-y-4">
                <div className="p-2 px-4 pb-3 bg-accent-background border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="h-5 w-5" />
                    <span className="text-md font-semibold">Share Your User ID</span>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Your User ID</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={userData?.uid || ''}
                        readOnly
                        className="font-mono text-sm bg-background"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(userData?.uid || '')}
                        className="shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQrCodeOpen(true)}
                        className="shrink-0"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/20 border border-border rounded-lg">
                  <h3 className="font-medium mb-2">How it works:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Share your User ID or email with friends</li>
                    <li>• They can send you funds instantly from their Ming wallet</li>
                    <li>• No network fees or waiting times</li>
                    <li>• Funds appear immediately in your account</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Crypto Wallet Deposit Option */}
            {depositMethod === 'crypto' && (
              <div className="space-y-6">
                {/* Chain Selection */}
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
                        {chain.name} ({chain.symbol}) - {chain.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Chain Wallet Address */}
                {selectedChain && chainOptions.find(c => c.id === selectedChain)?.hasWallet && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-lg font-medium">
                        {chainOptions.find(c => c.id === selectedChain)?.name} Wallet Address
                      </Label>
                      <Badge variant="outline">
                        {chainOptions.find(c => c.id === selectedChain)?.symbol}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Input
                        value={shortenAddress(chainOptions.find(c => c.id === selectedChain)?.walletAddress || '')}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQrCodeOpen(true)}
                        className="shrink-0"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h3 className="font-medium mb-2">Deposit Instructions:</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Copy the wallet address above</li>
                        <li>• Funds will appear in your account after network confirmation</li>
                        <li>• Make sure you're sending to the correct network</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Create Wallet Option */}
                {selectedChain && !chainOptions.find(c => c.id === selectedChain)?.hasWallet && (
                  <div className="space-y-4">
                    <div className="p-4 border border-orange-500/20 bg-orange-500/10 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-500 mb-2">
                        <span className="font-medium">Wallet Required</span>
                      </div>
                      <p className="text-muted-foreground">
                        You need to create a {chainOptions.find(c => c.id === selectedChain)?.name} wallet first to receive deposits.
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
          </div>
        )}
      </div>

            {/* QR Code Modal */}
      <Dialog open={qrCodeOpen} onOpenChange={setQrCodeOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {depositMethod === 'ming' ? 'User ID QR Code' : 'Wallet Address QR Code'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {depositMethod === 'ming' ? (
              // User ID QR Code
              <>
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white rounded-lg">
                    <QRCodeSVG
                      value={userData?.uid || ''}
                      size={200}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Scan this QR code to get your User ID
                    </p>
                    <div className="text-xs text-muted-foreground font-mono">
                      User ID: {userData?.uid || ''}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => copyToClipboard(userData?.uid || '')}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copy User ID
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setQrCodeOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </>
            ) : (
              // Wallet Address QR Code
              selectedChain && chainOptions.find(c => c.id === selectedChain)?.hasWallet && (
                <>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white rounded-lg">
                      <QRCodeSVG
                        value={chainOptions.find(c => c.id === selectedChain)?.walletAddress || ''}
                        size={200}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Scan this QR code with your wallet app to get the address
                      </p>
                      <div className="text-xs text-muted-foreground font-mono">
                        {chainOptions.find(c => c.id === selectedChain)?.name} ({chainOptions.find(c => c.id === selectedChain)?.symbol})
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => copyToClipboard(chainOptions.find(c => c.id === selectedChain)?.walletAddress || '')}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      Copy Address
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setQrCodeOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
