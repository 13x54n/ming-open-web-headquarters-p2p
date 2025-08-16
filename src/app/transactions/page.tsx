"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
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

export default function TransactionsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [copied, setCopied] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: "1",
        abiFunctionSignature: "transfer(address,uint256)",
        abiParameters: ["0x123...", "20000000"],
        amounts: ["20 USDC"],
        amountsInUSD: "20.00",
        blockHash: "0x123...",
        blockHeight: 12345678,
        blockchain: "MATIC-AMOY",
        contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        createDate: "2025-08-15T15:04:16Z",
        custodyType: "DEVELOPER",
        destinationAddress: "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
        errorReason: "",
        errorDetails: "",
        estimatedFee: {
          gasLimit: "21000",
          gasPrice: "20",
          maxFee: "5.935224468",
          priorityFee: "1.022783914",
          baseFee: "1.022783914",
          networkFee: "0.0001246397138",
          networkFeeRaw: "0.0001246397138"
        },
        feeLevel: "MEDIUM",
        firstConfirmDate: "2025-08-15T15:04:16Z",
        networkFee: "0.0001246397138",
        networkFeeInUSD: "0.25",
        nfts: [],
        operation: "Transfer Inbound",
        refId: "tx123",
        sourceAddress: "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
        state: "PENDING",
        tokenId: "1",
        transactionType: "INBOUND",
        txHash: "0x0a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890c9c",
        updateDate: "2025-08-15T15:04:16Z",
        userId: "user1",
        walletId: "wallet1"
      },
      {
        id: "2",
        abiFunctionSignature: "transfer(address,uint256)",
        abiParameters: ["0x123...", "200000000000000000"],
        amounts: ["0.2 POL-AMOY"],
        amountsInUSD: "0.40",
        blockHash: "0x456...",
        blockHeight: 12345679,
        blockchain: "MATIC-AMOY",
        contractAddress: "0x0000000000000000000000000000000000001010",
        createDate: "2025-08-15T15:04:16Z",
        custodyType: "DEVELOPER",
        destinationAddress: "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
        errorReason: "",
        errorDetails: "",
        estimatedFee: {
          gasLimit: "21000",
          gasPrice: "20",
          maxFee: "5.935224468",
          priorityFee: "1.022783914",
          baseFee: "1.022783914",
          networkFee: "0.0001246397138",
          networkFeeRaw: "0.0001246397138"
        },
        feeLevel: "MEDIUM",
        firstConfirmDate: "2025-08-15T15:04:16Z",
        networkFee: "0.0001246397138",
        networkFeeInUSD: "0.25",
        nfts: [],
        operation: "Transfer Inbound",
        refId: "tx124",
        sourceAddress: "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
        state: "COMPLETED",
        tokenId: "2",
        transactionType: "INBOUND",
        txHash: "0x61a2b3c4d5e6f789012345678901234567890123456789012345678901234567890123456789402f",
        updateDate: "2025-08-15T15:04:16Z",
        userId: "user1",
        walletId: "wallet1"
      },
      {
        id: "3",
        abiFunctionSignature: "transfer(address,uint256)",
        abiParameters: ["0x123...", "20000000"],
        amounts: ["20 USDC"],
        amountsInUSD: "20.00",
        blockHash: "0x789...",
        blockHeight: 12345680,
        blockchain: "ARBITRUM-SEPOLIA",
        contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        createDate: "2025-08-15T14:46:06Z",
        custodyType: "DEVELOPER",
        destinationAddress: "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
        errorReason: "",
        errorDetails: "",
        estimatedFee: {
          gasLimit: "21000",
          gasPrice: "20",
          maxFee: "5.935224468",
          priorityFee: "1.022783914",
          baseFee: "1.022783914",
          networkFee: "0.0001246397138",
          networkFeeRaw: "0.0001246397138"
        },
        feeLevel: "MEDIUM",
        firstConfirmDate: "2025-08-15T14:46:06Z",
        networkFee: "0.0001246397138",
        networkFeeInUSD: "0.25",
        nfts: [],
        operation: "Transfer Inbound",
        refId: "tx125",
        sourceAddress: "0xca9142d0b9804ef5e239d3bc1c7aa0d1c74e7350",
        state: "COMPLETED",
        tokenId: "3",
        transactionType: "OUTBOUND",
        txHash: "0xc1d2e3f4a5b67890123456789012345678901234567890123456789012345678901234567890afc3",
        updateDate: "2025-08-15T14:46:06Z",
        userId: "user1",
        walletId: "wallet1"
      }
    ];

    setTransactions(mockTransactions);
    setLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.blockchain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.operation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || tx.state.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background text-foreground">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-lg sm:text-xl font-semibold text-white">Transaction History</h1>
              <p className="text-sm text-muted-foreground">View all your blockchain transactions</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by hash, blockchain, or operation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
                className="text-xs sm:text-sm"
              >
                All
              </Button>
              <Button
                variant={filterType === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('completed')}
                className="text-xs sm:text-sm"
              >
                Completed
              </Button>
              <Button
                variant={filterType === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('pending')}
                className="text-xs sm:text-sm"
              >
                Pending
              </Button>
              <Button
                variant={filterType === 'cancelled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('cancelled')}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Cancelled</span>
                <span className="sm:hidden">Cancel</span>
              </Button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/20 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"></th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-medium text-muted-foreground">TX Hash</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">State</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-muted/10 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/transactions/${tx.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {getTransactionTypeIcon(tx.transactionType)}
                          </div>
                        </td>

                        <td className="hidden sm:table-cell px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{formatAddress(tx.txHash)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(tx.txHash)}
                              className="h-4 w-4 p-0 hover:bg-muted/20"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">

                            <span className="text-sm font-medium">
                              {tx.amounts.join(', ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {getStateIcon(tx.state)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="font-medium">{new Date(tx.createDate).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground sm:col-span-7">
                        <p>No transactions found</p>
                        <p className="text-sm mt-2">Your transaction history will appear here</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
