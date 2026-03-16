/**
 * Centralized query key factory.
 * Structured keys allow precise cache invalidation:
 *   queryClient.invalidateQueries({ queryKey: userKeys.lists() })
 *   → invalidates every user list regardless of filters
 *
 *   queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
 *   → invalidates only that single user entry
 */

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: object) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (params: object) => [...vendorKeys.lists(), params] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

export const directionKeys = {
  all: ['directions'] as const,
  lists: () => [...directionKeys.all, 'list'] as const,
  list: (params?: object) => [...directionKeys.lists(), params ?? {}] as const,
};

export const agreementKeys = {
  all: ['agreements'] as const,
  lists: () => [...agreementKeys.all, 'list'] as const,
  list: (params: object) => [...agreementKeys.lists(), params] as const,
  details: () => [...agreementKeys.all, 'detail'] as const,
  detail: (id: string, type: string) => [...agreementKeys.details(), id, type] as const,
};

export const statisticsKeys = {
  all: ['statistics'] as const,
  detail: (startDate?: string, endDate?: string) =>
    [...statisticsKeys.all, { startDate, endDate }] as const,
};
