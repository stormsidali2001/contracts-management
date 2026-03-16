import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosPrivate from '@/hooks/auth/useAxiosPrivate';
import { userKeys } from '@/lib/query-keys';
import { PaginationResponse } from '@/features/dashboard/models/paginationResponse.interface';
import { CreateUser } from '@/features/dashboard/models/CreateUser.interface';

export interface UserListParams {
  page: number;
  pageSize: number;
  orderBy?: string;
  searchQuery?: string;
  directionId?: string;
  departementId?: string;
  role?: string;
}

export interface UpdateUserPayload {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
  active?: boolean;
  imageUrl?: string;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const useUsers = (params: UserListParams) => {
  const axios = useAxiosPrivate({});
  const { page, pageSize, orderBy, searchQuery, directionId, departementId, role } = params;
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () =>
      axios
        .get<PaginationResponse<any>>('/users', {
          params: {
            offset: page * pageSize,
            limit: pageSize,
            ...(orderBy && { orderBy }),
            ...(searchQuery && { searchQuery }),
            ...(directionId && { directionId }),
            ...(departementId && { departementId }),
            ...(role && { role }),
          },
        })
        .then((r) => r.data),
  });
};

export const useUser = (userId: string | null | undefined) => {
  const axios = useAxiosPrivate({});
  return useQuery({
    queryKey: userKeys.detail(userId ?? ''),
    queryFn: () =>
      axios.get<any>(`/users/${userId}`).then((r) => r.data),
    enabled: !!userId,
  });
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const useCreateUser = () => {
  const axios = useAxiosPrivate({});
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUser) =>
      axios.post('/auth/register', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUpdateUser = () => {
  const axios = useAxiosPrivate({});
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateUserPayload) =>
      axios.put(`/users/${id}`, payload).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
};

export const useDeleteUser = () => {
  const axios = useAxiosPrivate({});
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      axios.delete(`/users/${id}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUploadUserImage = () => {
  const axios = useAxiosPrivate({});
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      return axios
        .post<{ filename: string }>('/users/image/upload', formData, {
          onUploadProgress: (e) => {
            if (onProgress && e.total) {
              onProgress(Math.floor((e.loaded / e.total) * 100));
            }
          },
        })
        .then((r) => r.data);
    },
  });
};
