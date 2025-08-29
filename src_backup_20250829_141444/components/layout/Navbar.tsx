"use client";

import Link from 'next/link';
import { ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useCartStore } from '@/lib/store/cart';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCartStore();

  // Calculate cartItemsCount based on your new logic
  const cartItemsCount = items.reduce((total, item) => {
    // If the item is for rental, count it as 1 item
    if (item.type === 'rental') {
      return total + 1;
    }
    // If the item is for purchase, count its quantity
    return total + item.quantity;
  }, 0);

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center text-2xl font-bold gap-1">
          <img src="./logo.png" alt="Wahiba Bridal World" className='logo' />
          Wahiba Bridal World
        </Link>

        <div className="hidden md:flex items-center gap-6 md:!flex">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Accueil
          </Link>
          <Link href="/dresses" className="hover:text-gray-600 transition-colors">
            Robes
          </Link>
          <Link href="/about" className="hover:text-gray-600 transition-colors">
            À propos
          </Link>
          <Link href="/contact" className="hover:text-gray-600 transition-colors">
            Contact
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="md:hidden">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-2">
            <Link href="/" className="block py-2 hover:text-gray-600 transition-colors">
              Accueil
            </Link>
            <Link href="/dresses" className="block py-2 hover:text-gray-600 transition-colors">
              Robes
            </Link>
            <Link href="/about" className="block py-2 hover:text-gray-600 transition-colors">
              À propos
            </Link>
            <Link href="/contact" className="block py-2 hover:text-gray-600 transition-colors">
              Contact
            </Link>
            <Link href="/cart" className="block py-2 hover:text-gray-600 transition-colors">
              <div className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart {cartItemsCount > 0 && `(${cartItemsCount})`}
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}