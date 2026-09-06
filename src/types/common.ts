/**
 * DummyJSON list endpoints all share { total, skip, limit } but the array
 * itself is keyed by resource name (e.g. `products`, `users`). This mapped
 * type lets each feature reuse the shape without repeating the boilerplate.
 */
export type PaginatedResponse<Key extends string, T> = {
  [K in Key]: T[]
} & {
  total: number
  skip: number
  limit: number
}

export type SortOrder = 'asc' | 'desc'

export interface PageParams {
  limit: number
  skip: number
}

/**
 * Discriminated union for one-shot async actions (submit, delete...) where
 * TanStack Query's own status isn't already covering the state — e.g. local
 * form submission feedback. Narrowing on `status` gives full type safety in
 * each branch without optional-everywhere fields.
 */
export type ActionState<E = string> =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'success' }
  | { status: 'error'; error: E }
