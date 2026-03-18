import { useEffect } from 'react';
import axios from '@/api/axios';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface PropType {
  withResponseInterceptor?: boolean;
  withRequestInterceptor?: boolean;
}

const useAxiosPrivate = (props: PropType) => {
  const withRequestInterceptor = props?.withRequestInterceptor === false ? false : true;
  const withResponseInterceptor = props?.withResponseInterceptor === false ? false : true;

  const jwt = useAuthStore((s) => s.jwt);

  useEffect(() => {
    let requestInterceptor: number = 0;
    let responseInterceptor: number = 0;

    if (withRequestInterceptor) {
      requestInterceptor = axios.interceptors.request.use(
        (config) => {
          if (!config?.headers) return config;
          if (!config.headers['Authorization']) {
            config.headers['Authorization'] = `Bearer ${jwt}`;
          }
          return config;
        },
        (error) => Promise.reject(error),
      );
    }

    if (withResponseInterceptor) {
      responseInterceptor = axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          const previousRequest = error?.config;
          if (
            (error?.response?.status !== 403 || error?.response?.status !== 401) &&
            previousRequest?.sent
          )
            return Promise.reject(error);

          previousRequest.sent = true;
          await useAuthStore.getState().refresh();
          const newJwt = useAuthStore.getState().jwt;
          previousRequest.headers['Authorization'] = `Bearer ${newJwt}`;
          return axios(previousRequest);
        },
      );
    }

    return () => {
      if (withRequestInterceptor) axios.interceptors.request.eject(requestInterceptor);
      if (withResponseInterceptor) axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return axios;
};

export default useAxiosPrivate;
