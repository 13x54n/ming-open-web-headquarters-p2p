"use client";

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Wallet, User, Mail, Hash, Scan, SearchIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTokenBalance } from '@/contexts/TokenBalanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { transferApi, TransferRequest } from '@/lib/api';
import Link from 'next/link';
import jsQR from 'jsqr';
import toast from 'react-hot-toast';

interface TransferData {
  recipient: string;
  recipientType: 'internal' | 'external';
  amount: string;
  token: string;
  memo: string;
  securityCode: string;
}



export default function TransferPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [transferData, setTransferData] = useState<TransferData>({
    recipient: '',
    recipientType: 'internal',
    amount: '',
    token: '',
    memo: '',
    securityCode: ''
  });
  const [transferId, setTransferId] = useState<string>('');
  const [securityCodeSent, setSecurityCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transferStatus, setTransferStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(-1);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanningError, setScanningError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const securityCodeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();
  const { tokenBalances, isLoading: balancesLoading, refreshBalances } = useTokenBalance();
  const { currentUser } = useAuth();

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



  // Refresh balances when component mounts
  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  const handleBack = () => {
    // Allow going back from step 3 to step 2, and from step 2 to step 1
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
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

  const validateRecipient = () => {
    const { recipient, recipientType } = transferData;

    if (!recipient.trim()) {
      return 'Recipient is required';
    }

    if (recipientType === 'internal') {
      // For internal users, accept email, UID, or wallet address
      const isValidInternal =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient) || // Email format
        /^[a-zA-Z0-9_-]{3,}$/.test(recipient) || // UID format
        /^0x[a-fA-F0-9]{40}$/.test(recipient) || // Ethereum wallet address
        /^[a-zA-Z0-9]{26,35}$/.test(recipient) || // Bitcoin-style addresses
        /^[a-zA-Z0-9]{32,44}$/.test(recipient); // Other crypto addresses

      if (!isValidInternal) {
        return 'Invalid format for internal user. Use email, UID, or wallet address.';
      }
    } else {
      // For external wallets, ONLY accept valid wallet addresses - no emails or UIDs
      const isValidEthereum = /^0x[a-fA-F0-9]{40}$/.test(recipient); // Ethereum wallet address
      const isValidBitcoin = /^[a-zA-Z0-9]{26,35}$/.test(recipient); // Bitcoin-style addresses
      const isValidOther = /^[a-zA-Z0-9]{32,44}$/.test(recipient); // Other crypto addresses

      if (!isValidEthereum && !isValidBitcoin && !isValidOther) {
        return 'External transfers require a valid wallet address. Emails and UIDs are not accepted for external wallets.';
      }

      // Additional validation for external wallets
      if (recipient.includes('@') || recipient.includes('_') || recipient.includes('-')) {
        return 'External wallet addresses cannot contain @, _, or - characters. Please enter a valid cryptocurrency wallet address.';
      }
    }

    return null;
  };

  const handleSecurityCodeChange = (value: string) => {
    // Only allow 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setTransferData(prev => ({ ...prev, securityCode: numericValue }));
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
    setScanningError('');
  };

  const handleQRScanResult = (result: string) => {
    try {
      // Try to parse the QR code result
      // It could be a direct address, email, or UID
      setTransferData(prev => ({ ...prev, recipient: result }));
      setShowQRScanner(false);
      setScanningError('');
    } catch (error) {
      setScanningError('Invalid QR code format');
    }
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
    setScanningError('');
    stopCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      setScanningError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start camera when QR scanner opens
  useEffect(() => {
    if (showQRScanner) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [showQRScanner]);

  // QR Code detection loop
  useEffect(() => {
    if (!showQRScanner || !videoRef.current || !canvasRef.current) return;

    const detectQR = () => {
      if (videoRef.current && videoRef.current.videoWidth > 0) {
        const canvas = canvasRef.current!;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        if (context && video.videoWidth > 0) {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw current video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Get image data for QR detection
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

          // Use jsQR to detect QR code
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            // QR code detected!
            console.log('QR Code detected:', code.data);
            handleQRScanResult(code.data);
          }
        }
      }
    };

    const interval = setInterval(detectQR, 100); // Check every 100ms
    return () => clearInterval(interval);
  }, [showQRScanner]);

  const requestSecurityCode = async () => {
    if (!currentUser?.uid) {
      console.error('User not logged in');
      return;
    }

    const validationError = validateRecipient();
    if (validationError) {
      console.error('Validation error:', validationError);
      return;
    }

    if (!transferData.amount || !transferData.token) {
      return;
    }

    setIsLoading(true);
    try {
      const requestData = {
        recipient: transferData.recipient,
        recipientType: transferData.recipientType,
        amount: parseFloat(transferData.amount),
        token: transferData.token,
        memo: transferData.memo,
        senderId: currentUser.uid // Add senderId to the request
      };

      console.log('Requesting security code with data:', requestData);

      const response = await transferApi.requestSecurityCode(requestData);

      console.log('API response received:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);

      if (response.success && response.data) {
        setTransferId(response.data.transferId);
        setSecurityCodeSent(true);
        
        console.log('Security code requested successfully, moving to step 2');
        console.log('Current step before change:', currentStep);
        
        // Immediately move to security code page - don't wait for email
        setCurrentStep(2);
        
        console.log('Step change initiated. New step should be 2');
        
        // Fallback: force step change after a short delay if needed
        setTimeout(() => {
          if (currentStep !== 2) {
            console.log('Step change failed, forcing to step 2');
            setCurrentStep(2);
          }
        }, 100);
      } else {
        console.error('Failed to request security code:', response.message);
        // Show error message to user
        toast.error(`Failed to request security code: ${response.message}`);
      }
    } catch (error) {
      console.error('Error requesting security code:', error);
      // Show error message to user
      toast.error('Failed to request security code. Please try again.');
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

          {/* Transfer Type Toggle */}
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={transferData.recipientType === 'internal' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                // Clear recipient if switching to internal and current recipient is a wallet address
                if (transferData.recipientType === 'external' && transferData.recipient) {
                  const isWalletAddress = /^0x[a-fA-F0-9]{40}$/.test(transferData.recipient) || 
                                        /^[a-zA-Z0-9]{26,35}$/.test(transferData.recipient) || 
                                        /^[a-zA-Z0-9]{32,44}$/.test(transferData.recipient);
                  if (!isWalletAddress) {
                    setTransferData(prev => ({ ...prev, recipient: '' }));
                  }
                }
                setTransferData(prev => ({ ...prev, recipientType: 'internal' }));
              }}
              className="flex-1"
            >
              <User className="w-4 h-4 mr-2" />
              Internal User
            </Button>
            <Button
              variant={transferData.recipientType === 'external' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                // Clear recipient if switching to external and current recipient is not a wallet address
                if (transferData.recipientType === 'internal' && transferData.recipient) {
                  const isWalletAddress = /^0x[a-fA-F0-9]{40}$/.test(transferData.recipient) || 
                                        /^[a-zA-Z0-9]{26,35}$/.test(transferData.recipient) || 
                                        /^[a-zA-Z0-9]{32,44}$/.test(transferData.recipient);
                  if (!isWalletAddress) {
                    setTransferData(prev => ({ ...prev, recipient: '' }));
                    toast.success('Recipient cleared - external wallets only accept wallet addresses');
                  }
                }
                setTransferData(prev => ({ ...prev, recipientType: 'external' }));
              }}
              className="flex-1"
            >
              <Wallet className="w-4 h-4 mr-2" />
              External Wallet
            </Button>
          </div>

          <div className="flex items-center gap-2 border border-accent rounded-md p-1 px-3">
            <input
              placeholder={
                transferData.recipientType === 'internal'
                  ? "Email, UID, or wallet address"
                  : "Wallet address only (0x... or similar)"
              }
              value={transferData.recipient}
              onChange={(e) => setTransferData(prev => ({ ...prev, recipient: e.target.value }))}
              className="flex-1 border-0 bg-transparent p-0 h-10 md:h-11 focus:border-0 focus:outline-0 text-sm md:text-base"
            />
            <Button
              variant="ghost"
              className="p-0 h-10 md:h-11 cursor-pointer"
              onClick={handleQRScan}
            >
              <Scan className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Validation Error */}
          {transferData.recipient && validateRecipient() && (
            <div className="text-sm text-red-600 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {validateRecipient()}
            </div>
          )}

          {/* Real-time validation hint for external wallets */}
          {transferData.recipientType === 'external' && transferData.recipient && !validateRecipient() && (
            <div className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Valid wallet address format
            </div>
          )}

          {/* Transfer Type Info */}
          <div className="text-sm text-muted-foreground">
            {transferData.recipientType === 'internal' ? (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Send to registered users by email, UID, or wallet address</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span>Send to external wallet addresses only (no emails or UIDs)</span>
              </div>
            )}
          </div>
        </div>

        {/* Token Selection Section */}
        <div className="space-y-3">
          <Label className="text-lg font-medium">Select asset to send</Label>

          <div className="space-y-2">
            {availableTokens.map((token, index) => (
              <div
                key={token.symbol}
                onClick={() => handleTokenSelect(index)}
                className={`flex items-center justify-between gap-1 h-auto py-3 md:py-4 px-4 rounded-md cursor-pointer transition-all duration-200 ${selectedTokenIndex === index ? 'bg-accent border border-green-400' : 'hover:bg-accent/50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <img src={token.icon} alt={token.symbol} className="w-6 h-6 rounded-full" />
                  <div>
                    <p className="text-sm font-medium">{token.name}</p>
                    <p className="text-sm text-muted-foreground font-medium">{token.symbol}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">${token.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{token.balance}</span>
                    <span className="text-xs text-muted-foreground">{token.symbol}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amount and Memo Section */}
        {selectedTokenIndex >= 0 && (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm md:text-base">Amount to Transfer</Label>
              <div className="flex items-center gap-2 border-2 border-accent rounded-md p-1 px-3 focus-within:border-green-400">
                <input
                  ref={(el) => {
                    if (el && selectedTokenIndex >= 0) {
                      setTimeout(() => el.focus(), 100);
                    }
                  }}
                  type="number"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                  placeholder="0.00"
                  value={transferData.amount}
                  onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
                  onWheel={(e) => e.currentTarget.blur()}
                  step="0.000001"
                  className="h-10 md:h-11 text-xl bg-transparent p-0 focus:outline-none flex-1 rounded-md px-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                />
                <Button variant="ghost" className="h-10 md:h-11 text-sm md:text-base" onClick={handleMaxAmount}>
                  Max
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
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

        {!securityCodeSent ? (
          <Button
            onClick={requestSecurityCode}
            disabled={
              !transferData.recipient ||
              selectedTokenIndex === -1 ||
              !transferData.amount ||
              parseFloat(transferData.amount) <= 0 ||
              isLoading ||
              !!validateRecipient()
            }
            className="w-full h-10 md:h-11 text-sm md:text-base bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Sending...' : 'Request Security Code'}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="p-3 text-center">
              <p className="text-sm text-green-600">
                ✅ Security code requested successfully
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Redirecting to security code page...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );



  const renderStep2 = () => {
    const selectedToken = availableTokens.find(t => t.symbol === transferData.token);
    const amountValue = parseFloat(transferData.amount) * (selectedToken?.price || 0);

    return (
      <div className="w-full mx-auto mx-4 md:mx-auto">
        <div className="space-y-6">
          {/* Back button */}
          <div className="p-0 h-10 md:h-11 cursor-pointer flex items-center gap-2" onClick={() => setCurrentStep(1)}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </div>

          <div className="text-center px-4 md:px-6 py-4 md:px-6">
            <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            </div>
            <p className="text-blue-600 text-lg md:text-xl">Enter Security Code</p>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              We're sending a 6-digit security code to your email address. You can enter it below as soon as you receive it.
            </p>
          </div>

          {/* Transfer Summary */}
          <div className="bg-muted/20 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-sm">Transfer Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transfer Type:</span>
                <div className="flex items-center gap-2">
                  {transferData.recipientType === 'internal' ? (
                    <>
                      <User className="w-3 h-3 text-blue-600" />
                      <span className="text-blue-600">Internal User</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-3 h-3 text-orange-600" />
                      <span className="text-orange-600">External Wallet</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="font-medium max-w-[60%] break-words">{transferData.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">{transferData.amount} {transferData.token}</span>
              </div>
              {transferData.memo && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Memo:</span>
                  <span className="font-medium max-w-[60%] break-words">{transferData.memo}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="font-medium">${amountValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm md:text-base">Security Code</Label>
            <div className="flex gap-2 justify-center">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={transferData.securityCode[index] || ''}
                  onClick={(e) => {
                    // Select all text when input is clicked
                    (e.target as HTMLInputElement).select();
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && /^\d$/.test(value)) {
                      const newCode = transferData.securityCode.split('');
                      newCode[index] = value;
                      setTransferData(prev => ({ ...prev, securityCode: newCode.join('') }));

                      // Auto-focus to next input
                      if (index < 5 && securityCodeRefs.current[index + 1]) {
                        securityCodeRefs.current[index + 1]?.focus();
                      }
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text');
                    const numbers = pastedData.replace(/\D/g, '').slice(0, 6);

                    if (numbers.length > 0) {
                      const newCode = transferData.securityCode.split('');
                      for (let i = 0; i < numbers.length && (index + i) < 6; i++) {
                        newCode[index + i] = numbers[i];
                      }
                      setTransferData(prev => ({ ...prev, securityCode: newCode.join('') }));

                      // Focus the next empty input or the last input
                      const nextIndex = Math.min(index + numbers.length, 5);
                      if (securityCodeRefs.current[nextIndex]) {
                        securityCodeRefs.current[nextIndex]?.focus();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      if (!transferData.securityCode[index] && index > 0) {
                        // Move to previous input on backspace if current is empty
                        const prevInput = securityCodeRefs.current[index - 1];
                        if (prevInput) {
                          prevInput.focus();
                          prevInput.select();
                        }
                      } else if (transferData.securityCode[index]) {
                        // Clear current input and stay focused
                        const newCode = transferData.securityCode.split('');
                        newCode[index] = '';
                        setTransferData(prev => ({ ...prev, securityCode: newCode.join('') }));
                      }
                    }
                  }}
                  ref={(el) => {
                    securityCodeRefs.current[index] = el;
                  }}
                  className="w-12 h-12 text-center text-lg border-2 border-accent rounded-md focus:border-green-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                />
              ))}
            </div>
          </div>

          <Button
            onClick={handleTransfer}
            disabled={transferData.securityCode.length !== 6 || isLoading}
            className="w-full h-10 md:h-11 text-sm md:text-base bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Processing...' : 'Confirm Transfer'}
          </Button>
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
        <div className="mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${transferData.recipientType === 'internal'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-orange-100 text-orange-700'
            }`}>
            {transferData.recipientType === 'internal' ? (
              <>
                <User className="w-3 h-3" />
                Internal Transfer
              </>
            ) : (
              <>
                <Wallet className="w-3 h-3" />
                External Wallet
              </>
            )}
          </div>
        </div>
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

  // Debug logging to help troubleshoot
  console.log('Current step:', currentStep, 'Transfer status:', transferStatus, 'Security code sent:', securityCodeSent);

  // Monitor step changes
  useEffect(() => {
    console.log('Step changed to:', currentStep);
  }, [currentStep]);

  const renderCurrentStep = () => {
    console.log('renderCurrentStep called with step:', currentStep);
    switch (currentStep) {
      case 1: 
        console.log('Rendering step 1');
        return renderStep1(); // Transfer details + request security code
      case 2: 
        console.log('Rendering step 2');
        return renderStep2(); // Security code input
      case 3:
        console.log('Rendering step 3');
        // Success or failure
        return transferStatus === 'success' ? renderStep5() : renderStep6();
      default: 
        console.log('Rendering default step 1');
        return renderStep1();
    }
  };

  // Simplified step progression - go directly from step 1 to step 3
  const handleTransfer = async () => {
    if (!currentUser?.uid) {
      console.error('User not logged in');
      return;
    }

    if (!transferId || !transferData.securityCode) {
      console.error('Missing transfer ID or security code');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare transfer data for API
      const transferRequest: TransferRequest = {
        recipient: transferData.recipient,
        recipientType: transferData.recipientType,
        amount: parseFloat(transferData.amount),
        token: transferData.token,
        memo: transferData.memo,
        securityCode: transferData.securityCode,
        transferId: transferId,
        senderId: currentUser.uid // Add senderId to the request
      };

      // Call the backend API
      const response = await transferApi.createTransfer(transferRequest);

      if (response.success && response.data) {
        setTransferStatus('success');
        // Refresh balances after successful transfer
        refreshBalances();
        // Go directly to step 3 (success/failure)
        setCurrentStep(3);
      } else {
        setTransferStatus('failed');
        console.error('Transfer failed:', response.message);
        // Go directly to step 3 (success/failure)
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Transfer error:', error);
      setTransferStatus('failed');
      // Go directly to step 3 (success/failure)
      setCurrentStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  const renderQRScanner = () => {
    if (!showQRScanner) return null;

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Scan QR Code</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeQRScanner}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Point your camera at a QR code
              </p>
              <div className="w-64 h-64 mx-auto bg-background border-2 border-dashed border-accent rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                <div className="absolute inset-0 border-2 border-green-400 border-dashed pointer-events-none" />
              </div>
            </div>

            {scanningError && (
              <div className="text-sm text-red-500 text-center">
                {scanningError}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={closeQRScanner}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
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
        {renderQRScanner()}
      </div>
    </ProtectedRoute>
  );
}