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

interface TokenBalance {
  token: {
    id: string;
    blockchain: string;
    name: string;
    symbol: string;
    decimals: number;
    isNative: boolean;
    updateDate: string;
    createDate: string;
  };
  amount: string;
  updateDate: string;
}

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
    if (!userData?.tokenBalances) {
      return {
        totalPortfolioValue: 6.08,
        tokenBalances: [],
        ethereumBalance: 0,
        polygonBalance: 0,
        arbitrumBalance: 0,
        hasBalances: false
      };
    }

    const { ethereum, polygon, arbitrum } = userData.tokenBalances;
    let totalValue = 0;
    
    // Track aggregated balances for cross-chain tokens
    const aggregatedBalances: Record<string, { balance: number; chains: string[]; token: any }> = {};

    // First pass: collect balances and identify cross-chain tokens
    const collectBalances = (balances: TokenBalance[], chainType: string) => {
      balances.forEach((balance) => {
        const amount = parseFloat(balance.amount) || 0;
        if (amount <= 0) return;

        const token = balance.token;
        const symbol = token.symbol?.toUpperCase();
        const blockchain = token.blockchain;
        
        if (!symbol) return;

        // Use blockchain mapping to identify the actual token symbol
        let actualSymbol = symbol;
        if (blockchain && blockchain in BLOCKCHAIN_MAPPING) {
          actualSymbol = BLOCKCHAIN_MAPPING[blockchain as keyof typeof BLOCKCHAIN_MAPPING].symbol;
        }

        // Identify token type for aggregation
        if (actualSymbol === 'USDC' || actualSymbol === 'USDT' || actualSymbol === 'ETH') {
          // Aggregate cross-chain tokens (USDC, USDT, ETH)
          if (!aggregatedBalances[actualSymbol]) {
            aggregatedBalances[actualSymbol] = {
              balance: 0,
              chains: [],
              token: token
            };
          }
          aggregatedBalances[actualSymbol].balance += amount;
          aggregatedBalances[actualSymbol].chains.push(chainType);
        } else {
          // For chain-specific tokens, add directly
          if (!aggregatedBalances[actualSymbol]) {
            aggregatedBalances[actualSymbol] = {
              balance: amount,
              chains: [chainType],
              token: token
            };
          }
        }
      });
    };

    // Collect balances from all chains
    if (ethereum && ethereum.length > 0) {
      collectBalances(ethereum, 'ethereum');
    }
    if (polygon && polygon.length > 0) {
      collectBalances(polygon, 'polygon');
    }
    if (arbitrum && arbitrum.length > 0) {
      collectBalances(arbitrum, 'arbitrum');
    }

    // Second pass: create processed tokens from aggregated balances
    const processedTokens: ProcessedToken[] = [];
    
    Object.entries(aggregatedBalances).forEach(([symbol, data]) => {
      // Map token information using blockchain mapping
      let tokenInfo = {
        symbol: symbol,
        name: data.token.name || symbol,
        url: '',
        price: 0,
        priceChange: 0,
        isPositive: true
      };

              // Set token-specific information based on symbol
        if (symbol === 'ETH') {
          tokenInfo = {
            symbol: 'ETH',
            name: 'Ethereum',
            url: 'https://ik.imagekit.io/lexy/Ming/tokens/ethereum-eth.webp?updatedAt=1754373033878',
            price: TOKEN_PRICES.ETH,
            priceChange: 2.86,
            isPositive: true
          };
        } else if (symbol === 'USDC') {
          tokenInfo = {
            symbol: 'USDC',
            name: 'USD Coin',
            url: 'https://ik.imagekit.io/lexy/Ming/tokens/USD_Coin_icon.webp',
            price: TOKEN_PRICES.USDC,
            priceChange: 0.00,
            isPositive: true
          };
        } else if (symbol === 'USDT') {
          tokenInfo = {
            symbol: 'USDT',
            name: 'Tether',
            url: 'https://ik.imagekit.io/lexy/Ming/tokens/Tether-USDT-icon.webp?updatedAt=1754373237083',
            price: TOKEN_PRICES.USDT,
            priceChange: 0.00,
            isPositive: true
          };
        } else {
          // For other tokens, try to find them in the blockchain mapping
          const blockchainInfo = Object.values(BLOCKCHAIN_MAPPING).find(info => info.symbol === symbol);
          if (blockchainInfo) {
            tokenInfo = {
              symbol: blockchainInfo.symbol,
              name: blockchainInfo.name,
              url: symbol === 'MATIC' ? 'https://ik.imagekit.io/lexy/Ming/tokens/polygon-matic-logo-png_seeklogo-444501.webp' :
                    symbol === 'ARB' ? 'https://ik.imagekit.io/lexy/Ming/tokens/arbitrum-arb-logo.webp' : '',
              price: blockchainInfo.price,
              priceChange: symbol === 'MATIC' ? 1.2 : -0.5,
              isPositive: symbol === 'MATIC'
            };
          }
        }

      // Calculate value and add to total
      const value = data.balance * tokenInfo.price;
      totalValue += value;

      // Add to processed tokens
      processedTokens.push({
        id: processedTokens.length + 1,
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        url: tokenInfo.url,
        portfolioPercent: 0,
        price: tokenInfo.price,
        priceChange: tokenInfo.priceChange,
        balance: data.balance,
        value: value,
        isPositive: tokenInfo.isPositive,
        blockchain: data.chains.join(', ')
      });
    });

    // Calculate portfolio percentages
    if (totalValue > 0) {
      processedTokens.forEach(token => {
        token.portfolioPercent = (token.value / totalValue) * 100;
      });
    }

    // Calculate individual chain balances
    const ethereumBalance = processedTokens.find(t => t.blockchain.includes('ethereum'))?.balance || 0;
    const polygonBalance = processedTokens.find(t => t.blockchain.includes('polygon'))?.balance || 0;
    const arbitrumBalance = processedTokens.find(t => t.blockchain.includes('arbitrum'))?.balance || 0;

    return {
      totalPortfolioValue: totalValue > 0 ? totalValue : 6.08,
      tokenBalances: processedTokens,
      ethereumBalance,
      polygonBalance,
      arbitrumBalance,
      hasBalances: processedTokens.length > 0
    };
  }, [userData?.tokenBalances]);

  const getTokenByBlockchain = (blockchain: string): ProcessedToken | null => {
    return tokenBalanceData.tokenBalances.find(token => token.blockchain.includes(blockchain)) || null;
  };

  const getBalanceBySymbol = (symbol: string): number => {
    const token = tokenBalanceData.tokenBalances.find(t => t.symbol === symbol);
    return token ? token.balance : 0;
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
