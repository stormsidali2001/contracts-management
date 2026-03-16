import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosPrivate from '@/hooks/auth/useAxiosPrivate';
import { vendorKeys } from '@/lib/query-keys';
import { PaginationResponse } from '@/features/dashboard/models/paginationResponse.interface';
import { Vendor } from '@/features/vendor/models/vendor.interface';

export interface VendorListParams {
  page: number;
  pageSize: number;
  orderBy?: string;
  searchQuery?: string;
}

export interface UpdateVendorPayload extends Partial<Vendor> {
  id: string;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const useVendors = (params: VendorListParams) => {
  const axios = useAxiosPrivate({});
  const { page, pageSize, orderBy, searchQuery } = params;
  return useQuery({
    queryKey: vendorKeys.list(params),
    queryFn: () =>
      axios
        .get<PaginationResponse<any>>('/vendors', {
          params: {
            offset: page * pageSize,
            limit: pageSize,
            ...(orderBy && { orderBy }),
            ...(searchQuery && { searchQuery }),
          },
        })
        .then((r) => r.data),
  });
};

export const useVendor = (vendorId: string | null | undefined) => {
  const axios = useAxiosPrivate({});
  return useQuery({
    queryKey: vendorKeys.detail(vendorId ?? ''),
    queryFn: () =>
      axios.get<any>(`/vendors/${vendorId}`).then((r) => r.data),
    enabled: !!vendorId,
  });
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const useCreateVendor = () => {
  const axios = useAxiosPrivate({});
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Vendor) =>
      axios.post('/vendors', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
};

export const useUpdateVendor = () => {
  const axios = useAxiosPrivate({});
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateVendorPayload) =>
      axios.patch(`/vendors/${id}`, payload).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(id) });
    },
  });
};

export const useDeleteVendor = () => {
  const axios = useAxiosPrivate({});
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      axios.delete(`/vendors/${id}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
};
