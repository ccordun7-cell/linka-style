'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CartItem } from '@/types'

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (product_id: string, size: number) => void
  updateQuantity: (product_id: string, size: number, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  totalItems: number
  subtotal: number
  deliveryCost: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'linka-cart'
const FREE_DELIVERY_THRESHOLD = 1000
const DELIVERY_COST = 80

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch (e) {
      console.error('Eroare la citirea cosului:', e)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.error('Eroare la salvarea cosului:', e)
    }
  }, [items, hydrated])

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === item.product_id && i.size === item.size)
      if (existing) {
        return prev.map(i =>
          i.product_id === item.product_id && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
    setIsOpen(true)
  }

  const removeItem = (product_id: string, size: number) => {
    setItems(prev => prev.filter(i => !(i.product_id === product_id && i.size === size)))
  }

  const updateQuantity = (product_id: string, size: number, quantity: number) => {
    if (quantity < 1) return
    setItems(prev => prev.map(i =>
      i.product_id === product_id && i.size === size ? { ...i, quantity } : i
    ))
  }

  const clearCart = () => setItems([])
  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const deliveryCost = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST
  const total = subtotal + deliveryCost

  return (
    <CartContext.Provider value={{
      items, isOpen, addItem, removeItem, updateQuantity, clearCart,
      openCart, closeCart, totalItems, subtotal, deliveryCost, total
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart trebuie folosit in interiorul unui CartProvider')
  return ctx
}
