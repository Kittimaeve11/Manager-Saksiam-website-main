// src/routes/RedirectHome.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePermission } from "./usePermission";


export default function RedirectHome() {
  const navigate = useNavigate();
  const { permissions } = usePermission();

  useEffect(() => {
    let target = "/Personel";

    if (permissions.includes("Brander")) target = "/Brander";
    else if (permissions.includes("InquiriesSubmitted")) target = "/Inquiries_Submitted";
    else if (permissions.includes("Analytics")) target = "/Analytics";

    navigate(target, { replace: true });
  }, [permissions, navigate]);

  return null; // ไม่มี UI แสดง
}