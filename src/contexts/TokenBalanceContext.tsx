"use client";

import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { useBackendUser } from '@/hooks/useBackendUser';

// Real-time token prices from backend
interface BackendTokenPrices {
  ethPrice: number;
  maticPrice: number;
  arbPrice: number;
}

// Helper functions
const getTokenIconUrl = (symbol: string): string => {
  const symbolLower = symbol.toLowerCase();

  // Map common token symbols to their icon URLs
  if (symbolLower.includes('eth')) {
    return 'https://ik.imagekit.io/lexy/Ming/tokens/ethereum-eth.webp?updatedAt=1754373033878';
  } else if (symbolLower.includes('matic') || symbolLower.includes('pol-amoy')) {
    return 'https://ik.imagekit.io/lexy/Ming/tokens/polygon-matic-logo-png_seeklogo-444501.webp?updatedAt=1754949573578';
  } else if (symbolLower.includes('arb') || symbolLower.includes('arbitrum')) {
    return 'https://ik.imagekit.io/lexy/Ming/tokens/arb_fba92b25bc.webp?updatedAt=1755281918999';
  } else if (symbolLower.includes('usdc')) {
    return 'https://ik.imagekit.io/lexy/Ming/tokens/Circle_USDC_Logo.webp?updatedAt=1754946527294';
  } else if (symbolLower.includes('usdt')) {
    return 'https://ik.imagekit.io/lexy/Ming/tokens/Tether-USDT-icon.webp?updatedAt=1754373237083';
  } else if (symbolLower.includes('btc')) {
    return 'https://ik.imagekit.io/lexy/Ming/tokens/bitcoin_PNG38.webp?updatedAt=1754373429532';
  }

  return 'https://ik.imagekit.io/lexy/Ming/tokens/bitcoin_PNG38.webp?updatedAt=1754373429532';
};

const getTokenPrice = (symbol: string, backendPrices: BackendTokenPrices | null): number => {
  const symbolLower = symbol.toLowerCase();

  // Use backend prices if available for ETH, POL (MATIC), and ARB
  if (backendPrices) {
    if (symbolLower.includes('eth')) {
      return backendPrices.ethPrice;
    } else if (symbolLower.includes('matic') || symbolLower.includes('polygon') || symbolLower.includes('pol')) {
      return backendPrices.maticPrice;
    } else if (symbolLower.includes('arb') || symbolLower.includes('arbitrum')) {
      return backendPrices.arbPrice;
    }
  } else {
    // If no backend prices available, return 0 for ETH, POL, and ARB to prevent incorrect calculations
    if (symbolLower.includes('eth') || symbolLower.includes('matic') || symbolLower.includes('polygon') || symbolLower.includes('pol') || symbolLower.includes('arb') || symbolLower.includes('arbitrum')) {
      return 0;
    }
  }

  // Fallback to constants for stablecoins and other tokens
  if (symbolLower.includes('usdc') || symbolLower.includes('usdt')) {
    return 1.00; // Fallback to 1.00 for USDC and USDT
  } else if (symbolLower.includes('strk')) {
    return 0.75; // Fallback to 0.75 for STRK
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
  percentChange?: number; // Add percent change from backend
}

interface BackendBalances {
  ethereum: BackendToken[];
  polygon: BackendToken[];
  arbitrum: BackendToken[];
  ethPrice?: number;
  maticPrice?: number;
  arbPrice?: number;
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
  chainBalances?: { [chain: string]: number }; // Store individual chain balances
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

  // Real-time prices
  backendPrices: BackendTokenPrices | null;

  // Portfolio performance
  totalPercentageChange: number;

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
  const [backendPrices, setBackendPrices] = useState<BackendTokenPrices | null>(null);

  // Fetch balance data from backend
  const fetchBalances = useCallback(async () => {
    if (!userData?.uid) return;

    try {
      setBalancesLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/users/uid/${userData.uid}/balance`);

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          setChainBalances(data.data);
          
          // Extract token prices from backend response
          if (data.data.ethPrice && data.data.maticPrice && data.data.arbPrice) {
            setBackendPrices({
              ethPrice: data.data.ethPrice,
              maticPrice: data.data.maticPrice,
              arbPrice: data.data.arbPrice
            });
          } else {
            console.warn('Backend token prices not available. ETH, POL, and ARB tokens will have 0 value until prices are fetched.');
            setBackendPrices(null);
          }
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
    if (!chainBalances) {
      return {
        totalPortfolioValue: 0,
        tokenBalances: [],
        ethereumBalance: 0,
        polygonBalance: 0,
        arbitrumBalance: 0,
        hasBalances: false,
        totalPercentageChange: 0
      };
    }

    const tokens: ProcessedToken[] = [];
    let totalValue = 0;
    let totalWeightedChange = 0;

    // Process Ethereum balances
    if (chainBalances.ethereum && chainBalances.ethereum.length > 0) {
      chainBalances.ethereum.forEach((backendToken) => {
        const token: ProcessedToken = {
          id: backendToken.token.id,
          symbol: backendToken.token.symbol,
          name: backendToken.token.name,
          url: getTokenIconUrl(backendToken.token.symbol),
          portfolioPercent: 0, // Will calculate after total
          price: getTokenPrice(backendToken.token.symbol, backendPrices),
          priceChange: backendToken.percentChange || 0, // Use percentChange from backend
          balance: parseFloat(backendToken.amount),
          value: 0, // Will calculate after balance
          isPositive: (backendToken.percentChange || 0) >= 0,
          blockchain: 'ethereum',
          isNative: backendToken.token.isNative,
          tokenAddress: backendToken.token.tokenAddress,
          standard: backendToken.token.standard,
          chainBalances: {
            ethereum: parseFloat(backendToken.amount)
          }
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
          price: getTokenPrice(backendToken.token.symbol, backendPrices),
          priceChange: backendToken.percentChange || 0,
          balance: parseFloat(backendToken.amount),
          value: 0,
          isPositive: (backendToken.percentChange || 0) >= 0,
          blockchain: 'polygon',
          isNative: backendToken.token.isNative,
          tokenAddress: backendToken.token.tokenAddress,
          standard: backendToken.token.standard,
          chainBalances: {
            polygon: parseFloat(backendToken.amount)
          }
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
          price: getTokenPrice(backendToken.token.symbol, backendPrices),
          priceChange: backendToken.percentChange || 0,
          balance: parseFloat(backendToken.amount),
          value: 0,
          isPositive: (backendToken.percentChange || 0) >= 0,
          blockchain: 'arbitrum',
          isNative: backendToken.token.isNative,
          tokenAddress: backendToken.token.tokenAddress,
          standard: backendToken.token.standard,
          chainBalances: {
            arbitrum: parseFloat(backendToken.amount)
          }
        };
        
        tokens.push(token);
      });
    }

    // Aggregate tokens by symbol across blockchains
    const aggregatedTokens = new Map<string, ProcessedToken>();
    
    tokens.forEach(token => {
      const key = token.symbol.toUpperCase();
      const existingToken = aggregatedTokens.get(key);
      
      if (existingToken) {
        // Combine balances and values for the same token symbol
        const oldBalance = existingToken.balance;
        const newBalance = token.balance;
        existingToken.balance += newBalance;
        existingToken.value += token.balance * token.price;
        
        // Update blockchain info to show multiple chains
        if (existingToken.blockchain !== token.blockchain) {
          existingToken.blockchain = `${existingToken.blockchain}, ${token.blockchain}`;
        }
        
        // Combine chain balances
        if (existingToken.chainBalances && token.chainBalances) {
          existingToken.chainBalances = { ...existingToken.chainBalances, ...token.chainBalances };
        }
        
        // For percentage change, use weighted average based on balance
        // Only combine if both tokens have valid percentage changes
        if (token.balance > 0 && existingToken.priceChange !== undefined && token.priceChange !== undefined) {
          const oldWeight = oldBalance / existingToken.balance;
          const newWeight = newBalance / existingToken.balance;
          existingToken.priceChange = (existingToken.priceChange * oldWeight) + (token.priceChange * newWeight);
        } else if (token.priceChange !== undefined && existingToken.priceChange === undefined) {
          // If existing token has no percentage change but new one does, use the new one
          existingToken.priceChange = token.priceChange;
        }
        // If existing token has percentage change but new one doesn't, keep existing
        
        // Use the first token's metadata (name, url, etc.) as primary
        // Keep the first token's price (they should be the same for stablecoins)
      } else {
        // First occurrence of this token symbol
        const newToken: ProcessedToken = {
          ...token,
          value: token.balance * token.price
        };
        aggregatedTokens.set(key, newToken);
      }
    });

    // Convert aggregated tokens back to array
    const finalTokens = Array.from(aggregatedTokens.values());

    // Calculate values and percentages
    finalTokens.forEach(token => {
      totalValue += token.value;
    });

    // Calculate portfolio percentages and weighted percentage change
    if (totalValue > 0) {
      finalTokens.forEach(token => {
        token.portfolioPercent = (token.value / totalValue) * 100;
        
        // Calculate weighted contribution to total percentage change
        if (token.priceChange !== undefined && !isNaN(token.priceChange)) {
          const weight = token.value / totalValue;
          totalWeightedChange += token.priceChange * weight;
        }
      });
    }

    const result = {
      totalPortfolioValue: totalValue,
      tokenBalances: finalTokens,
      ethereumBalance: tokens.filter(t => t.blockchain === 'ethereum').reduce((sum, t) => sum + (t.balance * getTokenPrice(t.symbol, backendPrices)), 0),
      polygonBalance: tokens.filter(t => t.blockchain === 'polygon').reduce((sum, t) => sum + (t.balance * getTokenPrice(t.symbol, backendPrices)), 0),
      arbitrumBalance: tokens.filter(t => t.blockchain === 'arbitrum').reduce((sum, t) => sum + (t.balance * getTokenPrice(t.symbol, backendPrices)), 0),
      hasBalances: finalTokens.length > 0,
      totalPercentageChange: totalWeightedChange
    };

    return result;
  }, [chainBalances, backendPrices]);

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
    backendPrices,
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
