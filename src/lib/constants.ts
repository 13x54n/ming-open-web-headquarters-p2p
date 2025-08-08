// Universal payment methods configuration (matching MongoDB schema)
export const PAYMENT_METHODS = [
  { 
    id: 'bank_transfer',
    name: 'Bank Transfer', 
    color: 'bg-yellow-500',
    description: 'Direct bank transfer'
  },
  { 
    id: 'esewa',
    name: 'Esewa', 
    color: 'bg-green-500',
    description: 'Esewa digital wallet'
  },
  { 
    id: 'khalti',
    name: 'Khalti', 
    color: 'bg-purple-500',
    description: 'Khalti digital wallet'
  },
  { 
    id: 'connect_ips',
    name: 'Connect IPS', 
    color: 'bg-blue-500',
    description: 'Connect IPS payment'
  }
] as const;

// Universal currencies configuration
export const CURRENCIES = [
  { 
    code: 'NPR', 
    name: 'Nepalese Rupee', 
    flag: '🇳🇵',
    symbol: 'रु',
    description: 'Nepal'
  },
  // { 
  //   code: 'USD', 
  //   name: 'US Dollar', 
  //   flag: '🇺🇸',
  //   symbol: '$',
  //   description: 'United States'
  // },
  // { 
  //   code: 'EUR', 
  //   name: 'Euro', 
  //   flag: '🇪🇺',
  //   symbol: '€',
  //   description: 'European Union'
  // },
  // { 
  //   code: 'GBP', 
  //   name: 'British Pound', 
  //   flag: '🇬🇧',
  //   symbol: '£',
  //   description: 'United Kingdom'
  // },
  // { 
  //   code: 'INR', 
  //   name: 'Indian Rupee', 
  //   flag: '🇮🇳',
  //   symbol: '₹',
  //   description: 'India'
  // },
  // { 
  //   code: 'CNY', 
  //   name: 'Chinese Yuan', 
  //   flag: '🇨🇳',
  //   symbol: '¥',
  //   description: 'China'
  // }
] as const;

// Cryptocurrencies configuration (matching MongoDB schema: USDT, BTC, ETH)
export const CRYPTOCURRENCIES = [
  { 
    symbol: 'USDT', 
    name: 'Tether USD',
    description: 'Tether USD Stablecoin'
  },
  { 
    symbol: 'ETH', 
    name: 'Ethereum',
    description: 'Ethereum'
  },
  { 
    symbol: 'STRK', 
    name: 'Starknet',
    description: 'Starknet Token'
  },
  { 
    symbol: 'SOL', 
    name: 'Solana',
    description: 'Solana'
  },
  { 
    symbol: 'BTC', 
    name: 'Bitcoin',
    description: 'Bitcoin'
  }
  // { 
  //   symbol: 'BNB', 
  //   name: 'BNB',
  //   description: 'Binance Coin'
  // }
] as const;

// Helper functions
export const getPaymentMethodById = (id: string) => {
  return PAYMENT_METHODS.find(method => method.id === id);
};

export const getCurrencyByCode = (code: string) => {
  return CURRENCIES.find(currency => currency.code === code);
};

export const getCryptocurrencyBySymbol = (symbol: string) => {
  return CRYPTOCURRENCIES.find(crypto => crypto.symbol === symbol);
};

// Type definitions
export type PaymentMethodId = typeof PAYMENT_METHODS[number]['id'];
export type CurrencyCode = typeof CURRENCIES[number]['code'];
export type CryptocurrencySymbol = typeof CRYPTOCURRENCIES[number]['symbol']; 