//“Popup / Dialog กรอกเหตุผล” ในระบบอนุมัติ
"use client";

/* ======================================================
   IMPORT COMPONENT จาก MUI
====================================================== */

import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, useTheme, } from "@mui/material";

/* ======================================================
   IMPORT COMPONENT ปุ่มแบบกำหนดเอง
====================================================== */

import TextButton from "../Buttom/TextButton";

/* ======================================================
   TYPE ของสถานะที่สามารถเปิด Dialog ได้
====================================================== */

// ใช้เฉพาะกรณี ไม่อนุมัติ หรือ ส่งกลับแก้ไข
type ApprovalReasonDecision =
  | "reject"
  | "edit";

/* ======================================================
   TYPE ของ Props ที่ Component รับเข้ามา
====================================================== */

type ApprovalReasonDialogProps = {
  open: boolean;   // สถานะเปิด / ปิด Dialog

  decision: ApprovalReasonDecision;   // ประเภทของการดำเนินการ

  moduleName: string;   // ชื่อโมดูลที่กำลังจัดการ

  reason: string;   // เหตุผลที่กรอก

  error?: string;   // ข้อความ error

  loading?: boolean;   // สถานะ loading ตอนกดยืนยัน

  onReasonChange: (value: string) => void;   // function เมื่อมีการเปลี่ยนข้อความเหตุผล

  onCancel: () => void;   // function เมื่อกดยกเลิก

  onConfirm: () => void;   // function เมื่อกดยืนยัน

};

/* ======================================================
   COMPONENT : Dialog สำหรับกรอกเหตุผล
====================================================== */

const ApprovalReasonDialog = ({
  open,
  decision,
  moduleName,
  reason,
  error = "",
  loading = false,
  onReasonChange,
  onCancel,
  onConfirm,
}: ApprovalReasonDialogProps) => {
  /* ======================================================
     เรียกใช้งาน Theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     ตรวจสอบว่าเป็นโหมดแก้ไขหรือไม่
  ====================================================== */

  const isEdit = decision === "edit";

  const getSafeModuleName = () => {
    if (moduleName && !moduleName.includes("?")) {
      return moduleName;
    }

    if (typeof window === "undefined") {
      return "";
    }

    const pathname = window.location.pathname.toLowerCase();

    if (pathname.includes("policy")) {
      return "นโยบาย";
    }

    if (pathname.includes("news_activity")) {
      return "ข่าวสารและกิจกรรม";
    }

    if (pathname.includes("vedio") || pathname.includes("video")) {
      return "วิดีโอ";
    }

    return "";
  };

  const safeModuleName = getSafeModuleName();

  /* ======================================================
     ข้อความต่าง ๆ ภายใน Dialog
  ====================================================== */

  // หัวข้อ Dialog
  const title = isEdit
    ? `ส่งกลับให้แก้ไข${safeModuleName}`
    : `ไม่อนุมัติ${safeModuleName}`;

  // ข้อความอธิบายใต้หัวข้อ
  const helperText = isEdit
    ? "กรุณาระบุเหตุผลที่ต้องแก้ไข เพื่อให้ผู้ที่เกี่ยวข้องทราบว่าต้องปรับปรุงส่วนใด"
    : "กรุณาระบุเหตุผลที่ไม่อนุมัติ เพื่อให้ผู้ที่เกี่ยวข้องทราบว่าต้องปรับปรุงส่วนใด";

  // placeholder ภายใน TextField
  const placeholder = isEdit
    ? "กรุณากรอกเหตุผลที่ต้องแก้ไข"
    : "กรุณากรอกเหตุผลที่ไม่อนุมัติ";

  /* ======================================================
     ส่วนแสดงผล UI
  ====================================================== */

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!loading) onCancel();         // ป้องกันการปิด Dialog ขณะ loading
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: "#fff",
          p: 1,
        },
      }}
    >
      {/* ======================================================
         ส่วนหัว Dialog
      ====================================================== */}

      <DialogTitle
        sx={{
          fontWeight: 700,
          color: theme.palette.primary.dark,
          pb: 1,
        }}
      >
        {title}
      </DialogTitle>

      {/* ======================================================
         เนื้อหา Dialog
      ====================================================== */}

      <DialogContent>
        {/* ข้อความอธิบาย */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1.5 }}
        >
          {helperText}
        </Typography>

        {/* ช่องกรอกเหตุผล */}
        <TextField
          fullWidth
          multiline
          minRows={4}
          autoFocus
          value={reason}
          onChange={(event) =>
            onReasonChange(event.target.value)
          }
          error={Boolean(error)}
          helperText={error}
          placeholder={placeholder}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              backgroundColor: "#fff",
            },
          }}
        />
      </DialogContent>

      {/* ======================================================
         ปุ่มด้านล่าง Dialog
      ====================================================== */}

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        {/* ปุ่มยกเลิก */}
        <TextButton
          variant="outlined"
          disabled={loading}
          onClick={onCancel}
        >
          ยกเลิก
        </TextButton>

        {/* ปุ่มยืนยัน */}
        <TextButton
          loading={loading}
          sx={{
            backgroundColor: isEdit
              ? theme.palette.secondary.main
              : theme.palette.error.main,
          }}
          onClick={onConfirm}
        >
          {isEdit
            ? "ยืนยันส่งกลับแก้ไข"
            : "ยืนยันไม่อนุมัติ"}
        </TextButton>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalReasonDialog;
