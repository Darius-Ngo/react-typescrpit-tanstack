import type { PaginatedResponse } from '@/types/common'

export interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  stock: number
  rating: number
  thumbnail: string
}

export type ProductsResponse = PaginatedResponse<'products', Product>
