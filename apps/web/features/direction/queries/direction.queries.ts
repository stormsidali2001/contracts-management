import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosPrivate from '@/hooks/auth/useAxiosPrivate';
import { directionKeys } from '@/lib/query-keys';
import { Direction, DisplayDirection } from '@/features/direction/models/direction.interface';
import { Departement } from '@/features/direction/models/departement.interface';

export interface CreateDirectionPayload extends DisplayDirection {
  departements: Omit<Departement, 'id' | 'users'>[];
}

export interface CreateDepartementPayload extends Omit<Departement, 'id' | 'users'> {
  directionId: string;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const useDirections = () => {
  const axios = useAxiosPrivate({});
  return useQuery({
    queryKey: directionKeys.list(),
    queryFn: () =>
      axios
        .get<Direction[]>('/directions', { params: { offset: 0, limit: 100 } })
        .then((r) => r.data),
  });
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const useCreateDirection = () => {
  const axios = useAxiosPrivate({});
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDirectionPayload) =>
      axios.post<Direction>('/directions', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: directionKeys.lists() });
    },
  });
};

export const useDeleteDirection = () => {
  const axios = useAxiosPrivate({});
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (directionId: string) =>
      axios.delete(`/directions/${directionId}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: directionKeys.lists() });
    },
  });
};

export const useCreateDepartement = () => {
  const axios = useAxiosPrivate({});
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepartementPayload) =>
      axios.post<Departement>('/departements', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: directionKeys.lists() });
    },
  });
};

export const useDeleteDepartement = () => {
  const axios = useAxiosPrivate({});
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (departementId: string) =>
      axios.delete(`/departements/${departementId}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: directionKeys.lists() });
    },
  });
};
