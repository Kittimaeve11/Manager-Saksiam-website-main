const BASE_URL = import.meta.env.VITE_BASE_URL_API;
const API_KEY = import.meta.env.VITE_BASE_Authorization_KEY_API;; // ใช้ค่านี้ตามที่คุณกำหนด
import { tokenRefresher } from "../Auth/tokenRefresher";

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

/**
 * ฟังก์ชัน fetch API แบบมี Interceptor + Refresh Token
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("access_token");

  // แปลง header ผู้ใช้ให้เป็น object เสมอ
  const userHeaders = (options.headers || {}) as Record<string, string>;

  // header เริ่มต้น (ต้องมี API KEY เสมอ)
  const headers: Record<string, string> = {
    ...userHeaders,
    "X-API-KEY": API_KEY,
  };

  // ถ้าข้อมูลไม่ใช่ FormData ให้ใส่ Content-Type
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  // ถ้ามี token ให้แนบด้วย
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(BASE_URL + url, fetchOptions);

  // ตรวจจับ Token หมดอายุ
  if (response.status === 401) {
    return handle401(url, fetchOptions);
  }

  return response;
}

/**
 * ระบบ Refresh Token (Queue แบบเดียวกับ Axios)
 */
async function handle401(url: string, options: RequestInit): Promise<Response> {

  // ถ้ากำลัง refresh อยู่ → ให้รอใน queue
  if (isRefreshing) {
    return new Promise((resolve) => {
      queue.push((newToken: string) => {

        const headers = {
          ...(options.headers as Record<string, string>),
          "X-API-KEY": API_KEY,                 // ใส่ API KEY กลับเข้าไปทุกครั้ง
          Authorization: `Bearer ${newToken}`,
        };

        resolve(
          fetch(BASE_URL + url, {
            ...options,
            headers,
            credentials: "include",
          })
        );
      });
    });
  }

  isRefreshing = true;

  try {
    // เรียก refreshAccessToken ผ่าน tokenRefresher
    const newToken = await tokenRefresher.refresh();

    // ส่งต่อ token ใหม่ให้ queue ที่รออยู่
    queue.forEach((cb) => cb(newToken));
    queue = [];
    isRefreshing = false;

    // แนบ token ใหม่แล้ว retry
    const newHeaders = {
      ...(options.headers as Record<string, string>),
      "X-API-KEY": API_KEY,                 // สำคัญมาก
      Authorization: `Bearer ${newToken}`,  // token ใหม่
    };

    return fetch(BASE_URL + url, {
      ...options,
      headers: newHeaders,
      credentials: "include",
    });

  } catch (error) {
    isRefreshing = false;
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    throw error;
  }
}


export interface ApiResponse<T = unknown> {
  status: boolean;
  message?: string;
  data?: T;
}
