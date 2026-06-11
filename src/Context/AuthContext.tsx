import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../API/client";
import { tokenRefresher } from "../Auth/tokenRefresher";
import { PermissionProvider } from "./PermissionContext";
interface User {
  id: number;
  num: string;
  pname: string;
  fname: string;
  lname: string;
  picture: string;
  email: string;
  role_id: number;
  role_name: string;
}

interface AuthContextProps {
  user: User | null;
  permissions: string[];
  login: (email: string, password: string) => Promise<string[]>; // ⬅️ เพิ่มตรงนี้
  logout: () => void;
  loading: boolean;
}



const AuthContext = createContext<AuthContextProps | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // 1) Register refreshAccessToken ให้ apiFetch ผ่าน tokenRefresher
    tokenRefresher.setCallback(refreshAccessToken);

    // 2) โหลดโปรไฟล์ถ้ามี access_token ใน localStorage
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch("/api/auther/profile")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setPermissions(data.permissions || []);
        if (data.user) {
          localStorage.setItem("current_user", JSON.stringify(data.user));
        }
      })
      .finally(() => setLoading(false));

  }, []); // มี useEffect แค่ตัวเดียว


  const login = async (email: string, password: string) => {

    const res = await apiFetch("/api/auth/loginapi", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Login failed");

    const data = await res.json();
    const { access_token, user } = data;

    if (!access_token) throw new Error("No token received");

    localStorage.setItem("access_token", access_token);
    setUser(user);
    if (user) {
      localStorage.setItem("current_user", JSON.stringify(user));
    }

    // ดึงสิทธิ์
    const profileRes = await apiFetch("/api/auther/profile", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const profileData = await profileRes.json();
    setUser(profileData.user || []);
    setPermissions(profileData.permissions || []);
    if (profileData.user) {
      localStorage.setItem("current_user", JSON.stringify(profileData.user));
    }

    return profileData.permissions; // 👉 ส่ง permissions กลับไปให้ Loginpage ใช้
  };


  const refreshAccessToken = async () => {
    const res = await apiFetch("/api/auth/refreshTokenapi", {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) throw new Error("Cannot refresh token");

    localStorage.setItem("access_token", data.access_token);
    return data.access_token;
  };

  const logout = async () => {
    try {
      // เรียก API ลบ refresh_token (เพราะเป็น HttpOnly cookie)
      await apiFetch("/api/auther/logoutapi", {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.error("Logout API error:", error);
    }

    // ลบ access_token
    localStorage.removeItem("access_token");
    localStorage.removeItem("current_user");

    // ล้าง state
    setUser(null);
    setPermissions([]);

    // redirect ไปหน้า login
    window.location.href = "/";
  };
  return (
    <PermissionProvider permissions={permissions}>
      <AuthContext.Provider value={{ user, permissions, login, logout, loading }}>
        {children}
      </AuthContext.Provider>
    </PermissionProvider>
  )
}


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
