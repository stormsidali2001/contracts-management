import axios from 'axios';

export const SERVER_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
export const BASE_URL = `${SERVER_URL}/api`;

export default axios.create({
    baseURL:BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL:BASE_URL,
    withCredentials:true
})