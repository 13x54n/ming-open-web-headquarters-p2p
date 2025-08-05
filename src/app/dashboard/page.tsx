"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('All payment methods');
  const [sortBy, setSortBy] = useState('Sort By Price');
  const [selectedCurrency, setSelectedCurrency] = useState('NPR');

  const cryptocurrencies = ['USDT', 'ETH', 'STRK', 'SOL'];

  const currencies = [
    { code: 'NPR', name: 'Nepalese Rupee', flag: '🇳🇵' },
    // { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    // { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    // { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    // { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
    // { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  ];

  const handleTabSwitch = (checked: boolean) => {
    setActiveTab(checked ? 'sell' : 'buy');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen text-foreground p-6">
        <div className="max-w-7xl mx-auto">
 

          {/* Main Trading Interface */}
            <CardContent className="py-2 px-6">
              {/* Buy/Sell Switch and Cryptocurrency Tickers */}
              <div className="flex items-center justify-between mb-6">
                {/* Buy/Sell Switch */}
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${activeTab === 'buy' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Buy
                  </span>
                  <Switch
                    checked={activeTab === 'sell'}
                    onCheckedChange={handleTabSwitch}
                  />
                  <span className={`text-sm font-medium ${activeTab === 'sell' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Sell
                  </span>
                </div>

                {/* Cryptocurrency Tickers */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {cryptocurrencies.map((crypto) => (
                    <Badge
                      key={crypto}
                      variant={selectedCrypto === crypto ? 'default' : 'outline'}
                      className={`cursor-pointer ${selectedCrypto === crypto
                        ? 'bg-white text-gray-900 hover:bg-gray-200'
                        : 'bg-transparent border-border text-muted-foreground hover:bg-accent'
                        }`}
                      onClick={() => setSelectedCrypto(crypto)}
                    >
                      {crypto}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Filters and Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Transaction Amount */}
                <div className="relative">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Transaction amount
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter amount"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                      className="bg-background border-border text-foreground placeholder-muted-foreground pr-20"
                    />
                    {/* Currency Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2 hover:bg-accent"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center bg-background">
                              <span className="text-sm">{currencies.find(c => c.code === selectedCurrency)?.flag}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{selectedCurrency}</span>
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {currencies.map((currency) => (
                          <DropdownMenuItem
                            key={currency.code}
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => setSelectedCurrency(currency.code)}
                          >
                            <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center bg-background">
                              <span className="text-base">{currency.flag}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{currency.code}</span>
                              <span className="text-xs text-muted-foreground">{currency.name}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Payment method
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-background border-border text-foreground hover:bg-accent"
                      >
                        {paymentMethod}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="text-foreground hover:bg-accent"
                        onClick={() => setPaymentMethod('All payment methods')}
                      >
                        All payment methods
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-foreground hover:bg-accent"
                        onClick={() => setPaymentMethod('Bank Transfer')}
                      >
                        Bank Transfer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-foreground hover:bg-accent"
                        onClick={() => setPaymentMethod('Cash')}
                      >
                        Cash
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-foreground hover:bg-accent"
                        onClick={() => setPaymentMethod('Digital Wallet')}
                      >
                        Digital Wallet
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>



                {/* Sort and Refresh */}
                <div className="flex gap-2 items-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-between bg-background border-border text-foreground hover:bg-accent"
                      >
                        {sortBy}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="text-foreground hover:bg-accent"
                        onClick={() => setSortBy('Sort By Price')}
                      >
                        Sort By Price
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-foreground hover:bg-accent"
                        onClick={() => setSortBy('Sort By Time')}
                      >
                        Sort By Time
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-foreground hover:bg-accent"
                        onClick={() => setSortBy('Sort By Volume')}
                      >
                        Sort By Volume
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Trading Pairs List */}
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Showing {activeTab === 'buy' ? 'buy' : 'sell'} offers for {selectedCrypto}
                </div>

                {/* Column Headers */}
                <div className="grid grid-cols-5 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
                  <div>Advertisers</div>
                  <div>Price</div>
                  <div>Available/Order Limit</div>
                  <div>Payment</div>
                  <div>Trade</div>
                </div>

                {/* Sample Trading Pairs */}
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="grid grid-cols-5 gap-4 px-4 pb-4 border-b">
                    {/* Advertisers Column */}
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="w-7 h-7">
                          <AvatarImage 
                            src={`https://i.pravatar.cc/150?img=${item}`} 
                            alt={`Trader ${item}`}
                          />
                          <AvatarFallback className="bg-muted text-foreground">
                            {item}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">trader{item}</span>

                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {Math.floor(Math.random() * 1000) + 100} orders • {Math.floor(Math.random() * 5) + 95}% completion
                        </div>
                        <div className="text-xs text-muted-foreground">
                          👍 {Math.floor(Math.random() * 10) + 90}% • ⏱️ {Math.floor(Math.random() * 60) + 5} min
                        </div>
                      </div>
                    </div>

                    {/* Price Column */}
                    <div className="flex items-center">
                      <div className="font-medium text-foreground">
                        ₹ {Math.floor(Math.random() * 1000) + 100}.{Math.floor(Math.random() * 100)}
                      </div>
                    </div>

                    {/* Available/Order Limit Column */}
                    <div className="flex flex-col justify-center">
                      <div className="font-medium text-foreground">
                        {Math.floor(Math.random() * 1000) + 100}.{Math.floor(Math.random() * 100)} {selectedCrypto}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 50000) + 10000} - {Math.floor(Math.random() * 100000) + 50000} NPR
                      </div>
                    </div>

                    {/* Payment Column */}
                    <div className="flex flex-col gap-1">
                      {(() => {
                        const allPaymentMethods = [
                          { name: 'Bank Transfer', color: 'bg-yellow-500' },
                          { name: 'Esewa', color: 'bg-green-500' },
                          { name: 'Airtime Mobile Top-Up', color: 'bg-green-500' },
                        ];
                        
                        // Randomly select 1-3 payment methods for each trader
                        const numMethods = Math.floor(Math.random() * 3) + 1;
                        const shuffled = allPaymentMethods.sort(() => 0.5 - Math.random());
                        const selectedMethods = shuffled.slice(0, numMethods);
                        
                        return selectedMethods.map((method, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`w-1 h-3 ${method.color} rounded-sm`}></div>
                            <span className="text-sm text-foreground">{method.name}</span>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Trade Column */}
                    <div className="flex items-center">
                      <Button
                        variant={activeTab === 'buy' ? 'default' : 'outline'}
                        className={`${activeTab === 'buy'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                      >
                        {activeTab === 'buy' ? `Buy ${selectedCrypto}` : `Sell ${selectedCrypto}`}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
        </div>
      </div>
    </ProtectedRoute>
  );
} 