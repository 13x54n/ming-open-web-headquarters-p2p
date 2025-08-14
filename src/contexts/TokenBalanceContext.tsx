"use client";

import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { useBackendUser } from '@/hooks/useBackendUser';

// Token price constants (fallback values)
export const TOKEN_PRICES = {
  ETH: 3657.29,
  MATIC: 0.85,
  ARB: 1.25,
  USDT: 1.00,
  USDC: 1.00
} as const;

// Blockchain mapping to match backend
export const BLOCKCHAIN_MAPPING = {
  'ETH-SEPOLIA': { symbol: 'ETH', name: 'Ethereum', price: TOKEN_PRICES.ETH },
  'MATIC-AMOY': { symbol: 'MATIC', name: 'Polygon', price: TOKEN_PRICES.MATIC },
  'ARB-SEPOLIA': { symbol: 'ARB', name: 'Arbitrum', price: TOKEN_PRICES.ARB }
} as const;

// Helper functions
const getTokenIconUrl = (symbol: string): string => {
  const symbolLower = symbol.toLowerCase();
  
  // Map common token symbols to their icon URLs
  if (symbolLower.includes('eth')) {
    return 'https://ik.imagekit.io/lexy/Ming/tokens/ethereum-eth.webp?updatedAt=1754373033878';
  } else if (symbolLower.includes('matic') || symbolLower.includes('polygon')) {
    return 'https://ik.imagekit.io/lexy/Ming/tokens/Tether-USDT-icon.webp?updatedAt=1754373237083';
  } else if (symbolLower.includes('arb') || symbolLower.includes('arbitrum')) {
    return 'https://ik.imagekit.io/lexy/Ming/tokens/bitcoin_PNG38.webp?updatedAt=1754373429532';
  } else if (symbolLower.includes('usdc')) {
    return 'https://ik.imagekit.io/lexy/Ming/tokens/Tether-USDT-icon.webp?updatedAt=1754373237083';
  } else if (symbolLower.includes('usdt')) {
    return 'https://ik.imagekit.io/lexy/Ming/tokens/Tether-USDT-icon.webp?updatedAt=1754373237083';
  }
  
  // Default fallback
  return 'https://ik.imagekit.io/lexy/Ming/tokens/bitcoin_PNG38.webp?updatedAt=1754373429532';
};

const getTokenPrice = (symbol: string): number => {
  const symbolLower = symbol.toLowerCase();
  
  // Map token symbols to their prices
  if (symbolLower.includes('eth')) {
    return TOKEN_PRICES.ETH;
  } else if (symbolLower.includes('matic') || symbolLower.includes('polygon')) {
    return TOKEN_PRICES.MATIC;
  } else if (symbolLower.includes('arb') || symbolLower.includes('arbitrum')) {
    return TOKEN_PRICES.ARB;
  } else if (symbolLower.includes('usdc') || symbolLower.includes('usdt')) {
    return TOKEN_PRICES.USDC;
  }
  
  // Default fallback price
  return 1.00;
};

// Backend data interfaces
interface BackendToken {
  token: {
    id: string;
    blockchain: string;
    name: string;
    symbol: string;
    decimals: number;
    isNative: boolean;
    tokenAddress?: string;
    standard?: string;
    updateDate: string;
    createDate: string;
  };
  amount: string;
  updateDate: string;
}

interface BackendBalances {
  ethereum: BackendToken[];
  polygon: BackendToken[];
  arbitrum: BackendToken[];
}

// Processed token interface
interface ProcessedToken {
  id: string;
  symbol: string;
  name: string;
  url: string;
  portfolioPercent: number;
  price: number;
  priceChange: number;
  balance: number;
  value: number;
  isPositive: boolean;
  blockchain: string;
  isNative: boolean;
  tokenAddress?: string;
  standard?: string;
}

interface TokenBalanceContextType {
  // Real-time data
  totalPortfolioValue: number;
  tokenBalances: ProcessedToken[];
  
  // Raw balance data
  chainBalances: BackendBalances | null;
  
  // Calculated values
  ethereumBalance: number;
  polygonBalance: number;
  arbitrumBalance: number;
  
  // Status
  hasBalances: boolean;
  isLoading: boolean;
  pricesLoading: boolean;
  
  // Utility functions
  getTokenByBlockchain: (blockchain: string) => ProcessedToken | null;
  getBalanceBySymbol: (symbol: string) => number;
  refreshBalances: () => Promise<void>;
  refreshPrices: () => Promise<void>;
}

const TokenBalanceContext = createContext<TokenBalanceContextType | undefined>(undefined);

export function TokenBalanceProvider({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useBackendUser();
  const [chainBalances, setChainBalances] = useState<BackendBalances | null>(null);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [pricesLoading, setPricesLoading] = useState(false);

  // Fetch balance data from backend
  const fetchBalances = useCallback(async () => {
    if (!userData?.uid) return;
    
    try {
      setBalancesLoading(true);
      console.log('Fetching balances for user:', userData.uid);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/users/uid/${userData.uid}/balance`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend balance response:', data);
        
        if (data.success) {
          setChainBalances(data.data);
          console.log('Chain balances set:', data.data);
        }
      } else {
        console.error('Backend response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setBalancesLoading(false);
    }
  }, [userData?.uid]);

  // Fetch token prices (placeholder for now, can integrate with ccxt later)
  const fetchPrices = useCallback(async () => {
    setPricesLoading(true);
    // TODO: Integrate with ccxt for real-time prices
    // For now, using fallback prices
    setTimeout(() => setPricesLoading(false), 1000);
  }, []);

  // Process balance data into tokens
  const tokenBalanceData = useMemo(() => {
    console.log('Processing chain balances:', chainBalances);
    
    if (!chainBalances) {
      return {
        totalPortfolioValue: 0,
        tokenBalances: [],
        ethereumBalance: 0,
        polygonBalance: 0,
        arbitrumBalance: 0,
        hasBalances: false
      };
    }

    const tokens: ProcessedToken[] = [];
    let totalValue = 0;

    // Process Ethereum balances
    if (chainBalances.ethereum && chainBalances.ethereum.length > 0) {
      chainBalances.ethereum.forEach((backendToken) => {
        const token: ProcessedToken = {
          id: backendToken.token.id,
          symbol: backendToken.token.symbol,
          name: backendToken.token.name,
          url: getTokenIconUrl(backendToken.token.symbol),
          portfolioPercent: 0, // Will calculate after total
          price: getTokenPrice(backendToken.token.symbol),
          priceChange: 0, // TODO: Get from price API
          balance: parseFloat(backendToken.amount),
          value: 0, // Will calculate after balance
          isPositive: true,
          blockchain: 'ethereum',
          isNative: backendToken.token.isNative,
          tokenAddress: backendToken.token.tokenAddress,
          standard: backendToken.token.standard
        };
        tokens.push(token);
      });
    }

    // Process Polygon balances
    if (chainBalances.polygon && chainBalances.polygon.length > 0) {
      chainBalances.polygon.forEach((backendToken) => {
        const token: ProcessedToken = {
          id: backendToken.token.id,
          symbol: backendToken.token.symbol,
          name: backendToken.token.name,
          url: getTokenIconUrl(backendToken.token.symbol),
          portfolioPercent: 0,
          price: getTokenPrice(backendToken.token.symbol),
          priceChange: 0,
          balance: parseFloat(backendToken.amount),
          value: 0,
          isPositive: true,
          blockchain: 'polygon',
          isNative: backendToken.token.isNative,
          tokenAddress: backendToken.token.tokenAddress,
          standard: backendToken.token.standard
        };
        tokens.push(token);
      });
    }

    // Process Arbitrum balances
    if (chainBalances.arbitrum && chainBalances.arbitrum.length > 0) {
      chainBalances.arbitrum.forEach((backendToken) => {
        const token: ProcessedToken = {
          id: backendToken.token.id,
          symbol: backendToken.token.symbol,
          name: backendToken.token.name,
          url: getTokenIconUrl(backendToken.token.symbol),
          portfolioPercent: 0,
          price: getTokenPrice(backendToken.token.symbol),
          priceChange: 0,
          balance: parseFloat(backendToken.amount),
          value: 0,
          isPositive: true,
          blockchain: 'arbitrum',
          isNative: backendToken.token.isNative,
          tokenAddress: backendToken.token.tokenAddress,
          standard: backendToken.token.standard
        };
        tokens.push(token);
      });
    }

    // Calculate values and percentages
    tokens.forEach(token => {
      token.value = token.balance * token.price;
      totalValue += token.value;
    });

    // Calculate portfolio percentages
    if (totalValue > 0) {
      tokens.forEach(token => {
        token.portfolioPercent = (token.value / totalValue) * 100;
      });
    }

    const result = {
      totalPortfolioValue: totalValue,
      tokenBalances: tokens,
      ethereumBalance: tokens.filter(t => t.blockchain === 'ethereum').reduce((sum, t) => sum + t.value, 0),
      polygonBalance: tokens.filter(t => t.blockchain === 'polygon').reduce((sum, t) => sum + t.value, 0),
      arbitrumBalance: tokens.filter(t => t.blockchain === 'arbitrum').reduce((sum, t) => sum + t.value, 0),
      hasBalances: tokens.length > 0
    };
    
    console.log('Processed token data:', result);
    return result;
  }, [chainBalances]);

  const getTokenByBlockchain = (blockchain: string): ProcessedToken | null => {
    return tokenBalanceData.tokenBalances.find(t => t.blockchain === blockchain) || null;
  };

  const getBalanceBySymbol = (symbol: string): number => {
    const token = tokenBalanceData.tokenBalances.find(t => t.symbol === symbol);
    return token?.value || 0;
  };

  // Fetch balances when userData changes
  useEffect(() => {
    if (userData?.uid) {
      fetchBalances();
    }
  }, [userData?.uid, fetchBalances]);

  const contextValue: TokenBalanceContextType = {
    ...tokenBalanceData,
    chainBalances,
    isLoading: loading || balancesLoading,
    pricesLoading,
    refreshBalances: fetchBalances,
    refreshPrices: fetchPrices,
    getTokenByBlockchain,
    getBalanceBySymbol
  };

  return (
    <TokenBalanceContext.Provider value={contextValue}>
      {children}
    </TokenBalanceContext.Provider>
  );
}

export function useTokenBalance() {
  const context = useContext(TokenBalanceContext);
  if (context === undefined) {
    throw new Error('useTokenBalance must be used within a TokenBalanceProvider');
  }
  return context;
}
