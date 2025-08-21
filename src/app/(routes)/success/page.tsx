"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useCartStore } from "@/lib/store/cart";

const Confetti = dynamic(() => import("react-confetti"), {
  ssr: false,
});

export default function SuccessPage() {
  const { clearCart } = useCartStore()
  setTimeout(() => {
    clearCart()
  }, 2000)
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <Confetti
        width={typeof window !== "undefined" ? window.innerWidth : 0}
        height={typeof window !== "undefined" ? window.innerHeight : 0}
        recycle={false}
        numberOfPieces={500}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold"
        >
          Merci !
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600 max-w-md mx-auto"
        >
          Votre commande a été passée avec succès. Nous vous contacterons bientôt avec les détails.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}