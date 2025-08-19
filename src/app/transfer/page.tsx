"use client";

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Wallet, User, Mail, Hash, Scan, SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTokenBalance } from '@/contexts/TokenBalanceContext';
import Link from 'next/link';

interface TransferData {
  recipient: string;
  recipientType: 'email' | 'uid' | 'wallet' | 'contact';
  amount: string;
  token: string;
  memo: string;
  securityCode: string;
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  uid?: string;
  walletAddress?: string;
}

export default function TransferPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [transferData, setTransferData] = useState<TransferData>({
    recipient: '',
    recipientType: 'email',
    amount: '',
    token: '',
    memo: '',
    securityCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transferStatus, setTransferStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(-1);

  const router = useRouter();
  const { tokenBalances, isLoading: balancesLoading, refreshBalances } = useTokenBalance();

  // Get available tokens from TokenBalanceContext
  const availableTokens = tokenBalances.map((token, index) => ({
    symbol: token.symbol,
    name: token.name,
    balance: token.balance.toString(),
    icon: token.url,
    price: token.price,
    value: token.value,
    blockchain: token.blockchain
  }));

  const contacts: Contact[] = [
    { id: '1', name: 'Babe', email: 'mingmashrp444@gmail.com' },
    { id: '2', name: 'Sagar Dai', uid: 'umk9wR7HQpbhQI39JJ2c0gcRYvg2' },
    { id: '3', name: 'EthGlobal Wallet', walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' }
  ];

  // Refresh balances when component mounts
  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRecipientSelect = (contact: Contact) => {
    let recipientType: 'email' | 'uid' | 'wallet' = 'email';
    let recipient = '';

    if (contact.email) {
      recipientType = 'email';
      recipient = contact.email;
    } else if (contact.uid) {
      recipientType = 'uid';
      recipient = contact.uid;
    } else if (contact.walletAddress) {
      recipientType = 'wallet';
      recipient = contact.walletAddress;
    }

    setTransferData(prev => ({
      ...prev,
      recipient,
      recipientType
    }));
  };

  const handleTokenSelect = (index: number) => {
    setSelectedTokenIndex(index);
    setTransferData(prev => ({ ...prev, token: availableTokens[index].symbol }));
  };

  const handleMaxAmount = () => {
    if (selectedTokenIndex >= 0) {
      const selectedToken = availableTokens[selectedTokenIndex];
      setTransferData(prev => ({ ...prev, amount: selectedToken.balance }));
    }
  };

  const handleSecurityCodeChange = (value: string) => {
    // Only allow 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setTransferData(prev => ({ ...prev, securityCode: numericValue }));
  };

  const handleTransfer = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Random success/failure for demo
      const success = Math.random() > 0.3;
      setTransferStatus(success ? 'success' : 'failed');
      handleNext();
    } catch (error) {
      setTransferStatus('failed');
      handleNext();
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="w-full mx-auto mx-4 md:mx-auto">
      <div className="space-y-6">
        {/* Back button */}
        <div className="p-0 h-10 md:h-11 cursor-pointer flex items-center gap-2" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </div>

        {/* Recipient Section */}
        <div className="space-y-3">
          <Label className="text-lg font-medium">Send crypto to</Label>
          <div className="flex items-center gap-2 border border-accent rounded-md p-1 px-3">
            <input
              placeholder="Email, address, uid of recipient..."
              value={transferData.recipient}
              onChange={(e) => setTransferData(prev => ({ ...prev, recipient: e.target.value }))}
              className="flex-1 border-0 bg-transparent p-0 h-10 md:h-11 focus:border-0 focus:outline-0 text-sm md:text-base"
            />
            <Button variant="ghost" className="p-0 h-10 md:h-11 cursor-pointer">
              <Scan className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Quick Contacts */}
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleRecipientSelect(contact)}
                className="w-full flex items-center gap-4 justify-start text-sm md:text-base py-2.5 cursor-pointer hover:bg-accent rounded-md transition-all duration-300 px-4"
              >
                <Wallet className="w-4 h-4 mr-2" />
                <div className="flex flex-col">
                  <p className="text-base">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.email || contact.uid || contact.walletAddress?.slice(0, 8) + '...'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Token Selection Section */}
        <div className="space-y-3">
          <Label className="text-lg font-medium">Select asset to send</Label>
          <div className="flex items-center gap-2 border border-accent rounded-md p-1 px-3 mb-3">
            <SearchIcon className='h-4 w-4' />
            <input type="text" placeholder="Search tokens" className="w-full h-10 md:h-11 text-sm md:text-base border-0 bg-transparent p-0 focus:border-0 focus:outline-0" />
          </div>

          <div className="space-y-2">
            {availableTokens.map((token, index) => (
              <div
                key={token.symbol}
                onClick={() => handleTokenSelect(index)}
                className={`flex items-center justify-between gap-1 h-auto py-3 md:py-4 px-3 rounded-md cursor-pointer transition-all duration-200 ${selectedTokenIndex === index ? 'bg-accent border border-primary' : 'hover:bg-accent/50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <img src={token.icon} alt={token.symbol} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="text-sm md:text-base font-medium">{token.name}</p>
                    <p className="text-sm md:text-base text-muted-foreground font-medium">{token.symbol}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs md:text-sm text-foreground">${token.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs md:text-sm text-muted-foreground">{token.balance}</span>
                    <span className="text-xs md:text-sm text-muted-foreground">{token.symbol}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amount and Memo Section */}
        {selectedTokenIndex >= 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm md:text-base">Amount to Transfer</Label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*\.?[0-9]*"// pattern can have decimals
                  placeholder="0.00"
                  value={transferData.amount}
                  onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
                  step="0.000001"
                  className="h-10 md:h-11 text-sm md:text-base border-0 bg-transparent p-0 focus:border-0 focus:outline-0 flex-1 border border-accent rounded-md px-3"
                />
                <Button variant="outline" className="h-10 md:h-11 text-sm md:text-base" onClick={handleMaxAmount}>
                  Max
                </Button>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                Available: {availableTokens.find(t => t.symbol === transferData.token)?.balance || '0'} {transferData.token}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base">Add a note (optional)</Label>
              <Textarea
                placeholder="Enter a message"
                value={transferData.memo}
                onChange={(e) => setTransferData(prev => ({ ...prev, memo: e.target.value }))}
                rows={3}
                className="text-sm md:text-base resize-none"
              />
            </div>
          </div>
        )}

        <Button
          onClick={handleNext}
          disabled={!transferData.recipient || selectedTokenIndex === -1 || !transferData.amount || parseFloat(transferData.amount) <= 0}
          className="w-full h-10 md:h-11 text-sm md:text-base"
        >
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );



  const renderStep2 = () => {
    const selectedToken = availableTokens.find(t => t.symbol === transferData.token);
    const amountValue = parseFloat(transferData.amount) * (selectedToken?.price || 0);

    return (
      <div className="w-full bg-transparent mx-auto mx-4 md:mx-auto">
        <div className="px-4 md:px-6 ">
          <p className="text-xl font-medium">Transfer Summary</p>
          <p className="text-base text-muted-foreground">Review your transfer details before confirming</p>
        </div>
        <div className="space-y-4 mt-8 px-4 md:px-6 pb-4 md:pb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm md:text-base text-muted-foreground">Recipient:</span>
              <span className="font-medium text-sm md:text-base text-right max-w-[60%] break-words">{transferData.recipient}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm md:text-base text-muted-foreground">Token:</span>
              <span className="font-medium text-sm md:text-base">{transferData.amount} {transferData.token}</span>
            </div>
            {transferData.memo && (
              <div className="flex justify-between items-start">
                <span className="text-sm md:text-base text-muted-foreground">Memo:</span>
                <span className="font-medium text-sm md:text-base text-right max-w-[60%] break-words">{transferData.memo}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm md:text-base text-muted-foreground">Total</p>
            <p className="text-sm md:text-base font-medium">${amountValue.toFixed(2)}</p>
          </div>

          <Separator />

          <div className="space-y-3 mt-4">
            <p className="text-base font-medium text-foreground">Security Code</p>
            <div className="flex gap-2 justify-center mb-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="w-12 h-12 md:w-14 md:h-14 border-2 border-accent rounded-lg flex items-center justify-center bg-background"
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={transferData.securityCode[index] || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (newValue && /^\d$/.test(newValue)) {
                        const newCode = transferData.securityCode.split('');
                        newCode[index] = newValue;
                        handleSecurityCodeChange(newCode.join(''));

                        // Auto-focus next input
                        if (index < 5) {
                          const nextInput = (e.target as HTMLInputElement).parentElement?.nextElementSibling?.querySelector('input');
                          if (nextInput) nextInput.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !transferData.securityCode[index] && index > 0) {
                        // Move to previous input on backspace if current is empty
                        const prevInput = (e.target as HTMLInputElement).parentElement?.previousElementSibling?.querySelector('input');
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    className="w-full h-full text-center text-lg md:text-xl font-bold border-0 bg-transparent focus:outline-none focus:ring-0"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">Enter your 6-digit security code</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack} className="flex-1 h-10 md:h-11 text-sm md:text-base">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={isLoading || transferData.securityCode.length !== 6}
              className="flex-1 h-10 md:h-11 text-sm md:text-base"
            >
              {isLoading ? 'Processing...' : 'Confirm Transfer'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="w-full mx-auto mx-4 md:mx-auto">
      <div className="text-center px-4 md:px-6 py-4 md:py-6">
        <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
        </div>
        <p className="text-green-600 text-lg md:text-xl">Transfer Successful!</p>
        <p className="text-sm md:text-base text-muted-foreground mb-4 break-words mb-4">
          {transferData.amount} {transferData.token} has been sent to {transferData.recipient}
        </p>
        <div>
          <div onClick={() => router.push('/wallet')} className="cursor-pointer w-full h-10 md:h-11 text-sm md:text-base bg-accent text-accent-foreground p-3  rounded-md">
            Return to wallet
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="w-full max-w-md mx-auto mx-4 md:mx-auto">
      <CardHeader className="text-center px-4 md:px-6 py-4 md:py-6">
        <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
        </div>
        <CardTitle className="text-red-600 text-lg md:text-xl">Transfer Failed</CardTitle>
        <CardDescription className="text-sm md:text-base">Your transfer could not be completed</CardDescription>
      </CardHeader>
      <CardContent className="text-center px-4 md:px-6 pb-4 md:pb-6">
        <p className="text-sm md:text-base text-muted-foreground mb-4">
          There was an error processing your transfer. Please try again or contact support.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1 h-10 md:h-11 text-sm md:text-base">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/dashboard'} className="flex-1 h-10 md:h-11 text-sm md:text-base">
            Return to Dashboard
          </Button>
        </div>
      </CardContent>
    </div>
  );



  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2(); // Transfer summary with security code
      case 3: return transferStatus === 'success' ? renderStep5() : renderStep6(); // Success or failure
      default: return renderStep1();
    }
  };

  if (balancesLoading) {
    return (
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
          <div className="text-center">
            <p>Loading token balances...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {renderCurrentStep()}
      </div>
    </ProtectedRoute>
  );
}