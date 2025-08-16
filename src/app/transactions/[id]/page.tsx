"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Home
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  abiFunctionSignature: string;
  abiParameters: string[];
  amounts: string[];
  amountsInUSD: string;
  blockHash: string;
  blockHeight: number;
  blockchain: string;
  contractAddress: string;
  createDate: string;
  custodyType: string;
  destinationAddress: string;
  errorReason: string;
  errorDetails: string;
  estimatedFee: {
    gasLimit: string;
    gasPrice: string;
    maxFee: string;
    priorityFee: string;
    baseFee: string;
    networkFee: string;
    networkFeeRaw: string;
  };
  feeLevel: string;
  firstConfirmDate: string;
  networkFee: string;
  networkFeeInUSD: string;
  nfts: string[];
  operation: string;
  refId: string;
  sourceAddress: string;
  state: string;
  tokenId: string;
  transactionType: string;
  txHash: string;
  updateDate: string;
  userId: string;
  walletId: string;
  transactionScreeningEvaluation?: {
    ruleName: string;
    actions: string[];
    screeningDate: string;
    reasons: {
      source: string;
      sourceValue: string;
      riskScore: string;
      riskCategories: string[];
      type: string;
    }[];
  };
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const transactionId = params.id as string;

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockTransaction: Transaction = {
      id: "b5e9d00a-66a9-5e97-85a9-dcdc09e3142b",
      abiFunctionSignature: "transfer(address,uint256)",
      abiParameters: ["0x172fc158dcb4f9a92a0058a76857fc609f86628b", "20000000"],
      amounts: ["20 USDC"],
      amountsInUSD: "20.00",
      blockHash: "0xea21b51f38921d61252b6975e4f35c89b45480c7d46a1bc1c5a98cf5b51bd082",
      blockHeight: 25200795,
      blockchain: "MATIC-AMOY",
      contractAddress: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
      createDate: "2025-08-15T15:04:16Z",
      custodyType: "DEVELOPER",
      destinationAddress: "0x172fc158dcb4f9a92a0058a76857fc609f86628b",
      errorReason: "",
      errorDetails: "",
      estimatedFee: {
        gasLimit: "21000",
        gasPrice: "20",
        maxFee: "5.935224468",
        priorityFee: "1.022783914",
        baseFee: "1.022783914",
        networkFee: "0.003600286280761607",
        networkFeeRaw: "0.003600286280761607"
      },
      feeLevel: "MEDIUM",
      firstConfirmDate: "2025-08-15T15:04:16Z",
      networkFee: "0.003600286280761607",
      networkFeeInUSD: "0.0072",
      nfts: [],
      operation: "Transfer Inbound",
      refId: "tx123",
      sourceAddress: "0x30cb94fe0fa56488bd1806e387e895bd8716ada9",
      state: "COMPLETED",
      tokenId: "1",
      transactionType: "INBOUND",
      txHash: "0x08c4f78a0df2bd4d48275a38db7aa0f0f137d37520d3ef3f7e16a5b12426ac9c",
      updateDate: "2025-08-15T15:04:16Z",
      userId: "user1",
      walletId: "dc6f22b3-c56d-518b-aa65-1ba245006d2e"
    };

    setTransaction(mockTransaction);
    setLoading(false);
  }, [transactionId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
    return `${dateStr} ${timeStr}`;
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStateColor = (state: string) => {
    switch (state.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-500 border-green-500/20';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-500 border-red-500/20';
      case 'FAILED':
        return 'bg-red-500/20 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/20';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'INBOUND':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'OUTBOUND':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNetworkIcon = (blockchain: string) => {
    if (blockchain.includes('MATIC') || blockchain.includes('POLYGON')) {
      return '🟣';
    } else if (blockchain.includes('ETH') || blockchain.includes('ETHEREUM')) {
      return '🔷';
    } else if (blockchain.includes('ARB') || blockchain.includes('ARBITRUM')) {
      return '🔵';
    }
    return '🔷';
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background text-foreground">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-muted-foreground">Loading transaction...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!transaction) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background text-foreground">
          <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Transaction not found</p>
              <Button onClick={() => router.back()} className="mt-4">
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <span>/</span>
            <Link href="/transactions" className="hover:text-foreground transition-colors">
              Transactions
            </Link>
            <span>/</span>
            <span className="text-foreground">{transaction.id.slice(0, 8)}...</span>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-lg sm:text-xl font-semibold text-white">
                Transaction: {transaction.id}
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>

          {/* Transaction Details */}
          <Card className="border-border">
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* State */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">State</span>
                </div>
                <Badge className={`${getStateColor(transaction.state)} border`}>
                  <div className="flex items-center gap-1">
                    {getStateIcon(transaction.state)}
                    {transaction.state}
                  </div>
                </Badge>
              </div>

              {/* Amount */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Amount</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs text-blue-500">$</span>
                  </div>
                  <span className="text-sm font-medium">
                    {transaction.amounts.join(', ')} {transaction.amountsInUSD && `($${transaction.amountsInUSD})`}
                  </span>
                </div>
              </div>

              {/* Transaction Fee */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Transaction Fee</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xs text-purple-500">P</span>
                  </div>
                  <span className="text-sm font-medium">
                    {transaction.networkFee} {transaction.blockchain}
                  </span>
                </div>
              </div>

              {/* Transaction Hash */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{formatAddress(transaction.txHash)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.txHash, 'Transaction Hash')}
                    className="h-6 w-6 p-0 hover:bg-muted/20"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* From Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">From</span>
                <span className="text-sm">-</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Wallet Address</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{formatAddress(transaction.sourceAddress)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.sourceAddress, 'Wallet Address')}
                    className="h-6 w-6 p-0 hover:bg-muted/20"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* To Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">To</span>
                <span className="text-sm">-</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Wallet ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{transaction.walletId}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.walletId, 'Wallet ID')}
                    className="h-6 w-6 p-0 hover:bg-muted/20"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Wallet Address</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{formatAddress(transaction.destinationAddress)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.destinationAddress, 'Wallet Address')}
                    className="h-6 w-6 p-0 hover:bg-muted/20"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Network */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Network</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs">{getNetworkIcon(transaction.blockchain)}</span>
                  </div>
                  <span className="text-sm font-medium">{transaction.blockchain}</span>
                </div>
              </div>

              {/* Operation */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Operation</span>
                <div className="flex items-center gap-2">
                  {getTransactionTypeIcon(transaction.transactionType)}
                  <div className="text-right">
                    <div className="text-sm font-medium">Transfer</div>
                    <div className="text-xs text-muted-foreground">Inbound</div>
                  </div>
                </div>
              </div>

              {/* Block Height */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Block Height</span>
                <span className="text-sm font-medium">{transaction.blockHeight}</span>
              </div>

              {/* Block Hash */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Block Hash</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{formatAddress(transaction.blockHash)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.blockHash, 'Block Hash')}
                    className="h-6 w-6 p-0 hover:bg-muted/20"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Token Type */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Token Type</span>
                <span className="text-sm font-medium">ERC20</span>
              </div>

              {/* Token Address */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Token Address</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{formatAddress(transaction.contractAddress)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.contractAddress, 'Token Address')}
                    className="h-6 w-6 p-0 hover:bg-muted/20"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Created */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Created</span>
                <span className="text-sm font-medium">{formatDate(transaction.createDate)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
