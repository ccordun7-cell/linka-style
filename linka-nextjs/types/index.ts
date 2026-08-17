export interface Brand {
  id: string
  slug: string
  name: string
  country?: string
  description?: string
  logo_url?: string
}

export interface ProductImage {
  id: string
  url: string
  position: number
}

export interface ProductSize {
  size: number
  price: number
  stock: number
}

export interface Product {
  id: string
  slug: string
  name: string
  name_ru?: string
  product_code?: string
  brand_id: string
  brand_name: string
  brand_slug: string
  type: string
  category: 'girls' | 'boys' | 'barefoot' | 'school'
  price: number
  description?: string
  description_ru?: string
  is_barefoot: boolean
  is_premium: boolean
  is_school: boolean
  is_sale: boolean
  sale_price?: number
  is_active: boolean
  images: ProductImage[]
  sizes: ProductSize[]
  created_at: string
}

export interface CartItem {
  product_id: string
  product_name: string
  product_brand: string
  slug: string
  image_url: string
  size: number
  price: number
  quantity: number
}

export interface Order {
  id: string
  order_number: number
  customer_name: string
  customer_phone: string
  customer_email?: string
  delivery_address?: string
  delivery_city: string
  payment_method: string
  total: number
  delivery_cost: number
  status: 'noua' | 'confirmata' | 'in_livrare' | 'livrata' | 'anulata'
  notes?: string
  created_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  product_name: string
  product_brand: string
  size: number
  price: number
  quantity: number
}

export interface ReturnRequest {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  reason: string
  refund_method?: string
  bank_details?: string
  status: 'noua' | 'in_procesare' | 'finalizata' | 'respinsa'
  created_at: string
}

export interface DashboardStats {
  total_orders: number
  orders_today: number
  revenue_total: number
  revenue_today: number
  total_products: number
  new_orders: number
}
