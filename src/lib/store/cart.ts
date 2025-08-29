import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  dressId: string;
  type: 'rental' | 'purchase' | 'quote';
  color: string;
  size: string;
  quantity: number;
  startDate?: Date;
  endDate?: Date;
  pricePerDay?: number;
  buyPrice?: number;
};

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (dressId: string, type: 'rental' | 'purchase' | 'quote', color: string, size: string) => void;
  getTotal: () => number;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem: CartItem) => {
        set((state) => {
          // Find if there's an existing item with the same dressId, type, color, and size
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.dressId === newItem.dressId &&
              item.type === newItem.type &&
              item.color === newItem.color &&
              item.size === newItem.size
          );

          if (existingItemIndex !== -1) {
            // If item exists, update its quantity
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
            };
            return { items: updatedItems };
          } else {
            // If item doesn't exist, add it as a new item
            return { items: [...state.items, newItem] };
          }
        });
      },
      removeItem: (dressId: string, type: 'rental' | 'purchase' | 'quote', color: string, size: string) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(
              item.dressId === dressId && 
              item.type === type && 
              item.color === color && 
              item.size === size
            )
          ),
        }));
      },
      getTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          if (item.type === 'rental' && item.pricePerDay) {
            return total + (item.pricePerDay * item.quantity);
          }
          if (item.type === 'purchase' && item.buyPrice) {
            return total + (item.buyPrice * item.quantity);
          }
          return total;
        }, 0);
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);