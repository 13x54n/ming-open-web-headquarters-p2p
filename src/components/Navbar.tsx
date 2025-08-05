"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Wallet, User, Bell, LogOut, Settings, ChevronDown } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function P2PNavbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const { currentUser, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="https://ik.imagekit.io/lexy/Ming/3.png?updatedAt=1724359838994"
                alt="Ming HQ"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-white">Ming HQ</span>
            </Link>
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Balance */}
            <Link href="/wallet" className="flex items-center space-x-2 bg-muted/20 hover:bg-muted/30 px-4 py-2 rounded-lg transition-colors cursor-pointer border border-border">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-white">$6.08</span>
              <div className="flex items-center gap-1 text-green-500 text-xs">
                <span>+1.69%</span>
              </div>
            </Link>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative cursor-pointer hover:bg-muted/20">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">3</Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-card border-border" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Notifications</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-muted/20">
                      Mark all read
                    </Button>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <div className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-muted/20">
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-white">Trade Completed</span>
                      <span className="text-xs text-muted-foreground ml-auto">2m ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Your USDT purchase of ₹1,500 has been completed successfully.</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-muted/20">
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-white">New Offer Available</span>
                      <span className="text-xs text-muted-foreground ml-auto">15m ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground">A new ETH seller is available at ₹92.39 per ETH.</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-muted/20">
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-white">Payment Pending</span>
                      <span className="text-xs text-muted-foreground ml-auto">1h ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Please complete payment for your STRK order within 24 hours.</p>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild>
                  <Link href="/notifications" className="cursor-pointer text-center w-full hover:bg-muted/20">
                    <span className="text-sm text-white">View all notifications</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-auto rounded-lg cursor-pointer hover:bg-muted/20 px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={currentUser.photoURL || undefined}
                        alt={currentUser.displayName || 'User'}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-orange-400 via-blue-500 to-purple-600 text-white text-xs">
                        {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-white hidden lg:block">
                      {currentUser.displayName || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      {currentUser.displayName || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild>
                  <Link href="/wallet" className="cursor-pointer hover:bg-muted/20">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-white">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer hover:bg-muted/20">
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-white">Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? 'Signing out...' : 'Log out'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-muted/20">
                <Menu className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card border-border">
              <div className="flex flex-col space-y-4 mt-4">
                {/* Mobile User Info */}
                <div className="flex items-center space-x-4 pb-4 border-b border-border">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={currentUser.photoURL || undefined}
                      alt={currentUser.displayName || 'User'}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-orange-400 via-blue-500 to-purple-600 text-white">
                      {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {currentUser.displayName || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                {/* Mobile Balance */}
                <Link href="/wallet" className="flex items-center justify-between bg-muted/20 p-4 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer border border-border">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-white">Current Balance</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">$6.08</div>
                    <div className="text-xs text-green-500">+1.69%</div>
                  </div>
                </Link>

                {/* Mobile Actions */}
                <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                  <Button variant="ghost" className="justify-start hover:bg-muted/20" asChild>
                    <Link href="/notifications" onClick={() => setIsOpen(false)}>
                      <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-white">Notifications</span>
                      <Badge className="ml-auto bg-red-500 text-white">3</Badge>
                    </Link>
                  </Button>
                  <div variant="ghost" className="justify-start hover:bg-muted/20" asChild>
                    <Link href="/wallet" onClick={() => setIsOpen(false)}>
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-white">Profile</span>
                    </Link>
                  </div>
                  <Button variant="ghost" className="justify-start hover:bg-muted/20" asChild>
                    <Link href="/settings" onClick={() => setIsOpen(false)}>
                      <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-white">Settings</span>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      setIsOpen(false)
                      handleLogout()
                    }}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? 'Signing out...' : 'Log out'}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
