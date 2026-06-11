// “Popup / Dialog กรอกเหตุผลการปิดเผยแพร่”

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
   TYPE ของ Props ที่ Component รับเข้ามา
====================================================== */

type PublishReasonDialogProps = {
  open: boolean; // สถานะเปิด / ปิด Dialog

  moduleName: string; // ชื่อโมดูลที่กำลังจัดการ

  reason: string; // เหตุผลที่กรอก

  error?: string; // ข้อความ error

  loading?: boolean; // สถานะ loading ตอนกดยืนยัน

  onReasonChange: (value: string) => void; // function เมื่อมีการเปลี่ยนข้อความเหตุผล

  onCancel: () => void; // function เมื่อกดยกเลิก

  onConfirm: () => void; // function เมื่อกดยืนยัน
};

/* ======================================================
   COMPONENT : Dialog สำหรับกรอกเหตุผลปิดเผยแพร่
====================================================== */

const PublishReasonDialog = ({
  open,
  moduleName,
  reason,
  error = "",
  loading = false,
  onReasonChange,
  onCancel,
  onConfirm,
}: PublishReasonDialogProps) => {
  /* ======================================================
     เรียกใช้งาน Theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     ส่วนแสดงผล UI
  ====================================================== */

  return (
    <Dialog
      open={open}
      onClose={() => {
        // ป้องกันการปิด Dialog ขณะ loading
        if (!loading) onCancel();
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: "#fff",
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
        }}
      >
        ปิดเผยแพร่{moduleName}
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
          กรุณาระบุเหตุผลที่ต้องปิดเผยแพร่
          เพื่อเก็บเป็นข้อมูลประกอบการตรวจสอบ
        </Typography>

        {/* ช่องกรอกเหตุผล */}
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={reason}
          onChange={(event) =>
            onReasonChange(event.target.value)
          }
          error={Boolean(error)}
          helperText={error}
          placeholder="กรุณากรอกเหตุผลที่ต้องปิดเผยแพร่"
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

        {/* ปุ่มบันทึก */}
        <TextButton
          loading={loading}
          sx={{
            backgroundColor: theme.palette.secondary.main,
          }}
          onClick={onConfirm}
        >
          บันทึก
        </TextButton>
      </DialogActions>
    </Dialog>
  );
};

export default PublishReasonDialog;