import axios from "axios";

const BASE_URL = "http://192.168.43.45:4000/api"; // 👈 use this IP

export default axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json'},
    withCredentials: true
});