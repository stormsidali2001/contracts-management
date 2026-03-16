import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosPrivate from '@/hooks/auth/useAxiosPrivate';
import { agreementKeys } from '@/lib/query-keys';
import { PaginationResponse } from '@/features/dashboard/models/paginationResponse.interface';
import { CreateAgreement } from '@/features/contract/models/CreateAgreement.interface';
import { ExecuteAgreement } from '@/features/contract/models/ExecuteAgreement.interface';

export type AgreementType = 'contract' | 'convension';

export interface AgreementListParams {
  page: number;
  pageSize: number;
  agreementType: AgreementType;
  orderBy?: string;
  searchQuery?: string;
  directionId?: string;
  departementId?: string;
  status?: string;
  vendorId?: string;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const useAgreements = (params: AgreementListParams) => {
  const axios = useAxiosPrivate({});
  const { page, pageSize, agreementType, orderBy, searchQuery, directionId, departementId, status, vendorId } = params;
  return useQuery({
    queryKey: agreementKeys.list(params),
    queryFn: () =>
      axios
        .get<PaginationResponse<any>>('/agreements', {
          params: {
            offset: page * pageSize,
            limit: pageSize,
            agreementType,
            ...(orderBy && { orderBy }),
            ...(searchQuery && { searchQuery }),
            ...(directionId && { directionId }),
            ...(departementId && { departementId }),
            ...(status && { status }),
            ...(vendorId && { vendorId }),
          },
        })
        .then((r) => r.data),
  });
};

export const useContracts = (params: Omit<AgreementListParams, 'agreementType'>) =>
  useAgreements({ ...params, agreementType: 'contract' });

export const useConvensions = (params: Omit<AgreementListParams, 'agreementType'>) =>
  useAgreements({ ...params, agreementType: 'convension' });

export const useAgreement = (id: string | undefined, type: AgreementType) => {
  const axios = useAxiosPrivate({});
  return useQuery({
    queryKey: agreementKeys.detail(id ?? '', type),
    queryFn: () =>
      axios
        .get<any>(`/Agreements/${id}`, { params: { agreementType: type } })
        .then((r) => r.data),
    enabled: !!id,
  });
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const useCreateAgreement = () => {
  const axios = useAxiosPrivate({});
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAgreement) =>
      axios.post('/Agreements', payload).then((r) => r.data),
    onSuccess: (_data, { type }) => {
      queryClient.invalidateQueries({
        queryKey: agreementKeys.list({ agreementType: type } as any),
      });
      // Invalidate all agreement lists to be safe
      queryClient.invalidateQueries({ queryKey: agreementKeys.lists() });
    },
  });
};

export const useExecuteAgreement = () => {
  const axios = useAxiosPrivate({});
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExecuteAgreement) =>
      axios.patch('/Agreements/exec', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agreementKeys.details() });
      queryClient.invalidateQueries({ queryKey: agreementKeys.lists() });
    },
  });
};

export const useUploadAgreementFile = () => {
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
        .post<{ filename: string }>('/agreements/files/upload', formData, {
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
