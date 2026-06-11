//การ์ดสำหรับเลือกสถานะการอนุมัติ
"use client";

/* ======================================================
   IMPORT COMPONENT จาก MUI
====================================================== */

import { Checkbox, FormControlLabel, Paper, RadioGroup, Typography, useTheme, } from "@mui/material";

/* ======================================================
   TYPE ของค่าที่เลือกได้
====================================================== */

// กำหนดค่าที่ Radio สามารถเลือกได้
export type ApprovalDecisionValue =
  | "" // ยังไม่ได้เลือกสถานะ
  | "approve" // อนุมัติ
  | "reject" // ไม่อนุมัติ
  | "edit"; // ส่งกลับแก้ไข
  
/* ======================================================
   TYPE ของ Props ที่ Component รับเข้ามา
====================================================== */

type ApprovalDecisionCardProps = {
  approverName: string;   // ชื่อผู้อนุมัติ
  value: ApprovalDecisionValue;   // ค่าปัจจุบันที่ถูกเลือก
  onChange: (value: ApprovalDecisionValue) => void;   // function สำหรับส่งค่ากลับไปยัง parent component
};

/* ======================================================
   COMPONENT : การ์ดสำหรับเลือกสถานะการอนุมัติ
====================================================== */

const ApprovalDecisionCard = ({
  approverName,
  value,
  onChange,
}: ApprovalDecisionCardProps) => {
  /* ======================================================
     เรียกใช้งาน Theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     ส่วนแสดงผล UI
  ====================================================== */

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3, // มุมโค้ง
        p: 3, // padding ด้านใน
        backgroundColor: "#fff", // สีพื้นหลัง
      }}
    >
      {/* ======================================================
         แสดงชื่อผู้อนุมัติ
      ====================================================== */}

      <Typography sx={{ mb: 2 }}>
        ผู้อนุมัติ : {approverName}
      </Typography>

      {/* ======================================================
         กลุ่ม Checkbox สำหรับเลือกสถานะ
      ====================================================== */}

      <RadioGroup
        row // เรียงแนวนอน
        sx={{
          justifyContent: "center",
          gap: 1,
        }}
      >
        {/* ======================================================
           ปุ่ม : อนุมัติ
        ====================================================== */}

        <FormControlLabel
          control={
            <Checkbox
              checked={value === "approve"}
              onChange={() => onChange("approve")}
              sx={{
                // สีปกติของ Checkbox
                color: theme.palette.primary.main,

                // สีตอนถูกเลือก
                "&.Mui-checked": {
                  color: theme.palette.success.main,
                },
              }}
            />
          }
          label="อนุมัติ"
          sx={{
            // ถ้าเลือกอยู่ ให้ข้อความเป็นสีเขียว
            color:
              value === "approve"
                ? theme.palette.success.main
                : "inherit",
          }}
        />

        {/* ======================================================
           ปุ่ม : ไม่อนุมัติ
        ====================================================== */}

        <FormControlLabel
          control={
            <Checkbox
              checked={value === "reject"}
              onChange={() => onChange("reject")}
              sx={{
                color: theme.palette.primary.main,

                "&.Mui-checked": {
                  color: theme.palette.error.main,
                },
              }}
            />
          }
          label="ไม่อนุมัติ"
          sx={{
            // ถ้าเลือกอยู่ ให้ข้อความเป็นสีแดง
            color:
              value === "reject"
                ? theme.palette.error.main
                : "inherit",
          }}
        />

        {/* ======================================================
           ปุ่ม : แก้ไข
        ====================================================== */}

        <FormControlLabel
          control={
            <Checkbox
              checked={value === "edit"}
              onChange={() => onChange("edit")}
              sx={{
                color: theme.palette.primary.main,

                "&.Mui-checked": {
                  color: theme.palette.warning.main,
                },
              }}
            />
          }
          label="แก้ไข"
          sx={{
            // ถ้าเลือกอยู่ ให้ข้อความเป็นสีเหลือง
            color:
              value === "edit"
                ? theme.palette.warning.main
                : "inherit",
          }}
        />
      </RadioGroup>
    </Paper>
  );
};

export default ApprovalDecisionCard;