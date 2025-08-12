"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { useBackendUser } from '@/hooks/useBackendUser';

// Token price constants
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

interface ProcessedToken {
  id: number;
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
}

interface TokenBalanceContextType {
  // Real-time data
  totalPortfolioValue: number;
  tokenBalances: ProcessedToken[];
  
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
  refreshPrices: () => void;
}

const TokenBalanceContext = createContext<TokenBalanceContextType | undefined>(undefined);

export function TokenBalanceProvider({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useBackendUser();

  const tokenBalanceData = useMemo(() => {
    // Since tokenBalances doesn't exist in the current BackendUserData structure,
    // we'll return default values for now
    return {
      totalPortfolioValue: 6.08,
      tokenBalances: [],
      ethereumBalance: 0,
      polygonBalance: 0,
      arbitrumBalance: 0,
      hasBalances: false
    };
  }, []);

  const getTokenByBlockchain = (blockchain: string): ProcessedToken | null => {
    // Since we don't have real token balances, return null
    return null;
  };

  const getBalanceBySymbol = (symbol: string): number => {
    // Since we don't have real token balances, return 0
    return 0;
  };

  const contextValue: TokenBalanceContextType = {
    ...tokenBalanceData,
    isLoading: loading,
    pricesLoading: false,
    refreshPrices: () => {},
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
