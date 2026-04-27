import { Navigate } from "react-router-dom";
import { usePermission } from "./usePermission";
import type { ReactNode } from "react";


interface ProtectedRouteProps {
  permission?: string;
  permissions?: string[];
  children: ReactNode;
}

export default function ProtectedRoute({
  permission,
  permissions,
  children,
}: ProtectedRouteProps) {
  const { can, loading } = usePermission();
  if (loading) {
    return null; // หรือ <Loading />
  }
  // รวมสิทธิ์ทั้งหมดให้เป็น array
  const requiredPermissions = [
    ...(permissions ?? []),
    ...(permission ? [permission] : []),
  ];

  // ไม่ได้ส่ง permission อะไรมา → อนุญาตเสมอ
  if (requiredPermissions.length === 0) return children;

  // แบบ OR → มีสิทธิ์ตัวใดตัวหนึ่งผ่านเลย
  const allowed = requiredPermissions.some((p) => can(p));

  if (!allowed) {
    return <Navigate to="*" replace />;
  }

  return children;
}