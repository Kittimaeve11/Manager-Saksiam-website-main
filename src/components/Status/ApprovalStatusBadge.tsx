// “ป้ายแสดงสถานะการอนุมัติ”

"use client";

/* ======================================================
   IMPORT TYPE จาก React
====================================================== */

import type { MouseEvent } from "react";

/* ======================================================
   IMPORT COMPONENT และ TYPE จาก MUI
====================================================== */

import { Box, Chip, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

/* ======================================================
   IMPORT ICON
====================================================== */

// icon สำหรับปุ่มส่งอนุมัติ
import { BsSendFill } from "react-icons/bs";

/* ======================================================
   IMPORT COMPONENT BUTTON
====================================================== */

// ปุ่ม icon button แบบ custom
import AppIconButton from "../Buttom/IconButton";

/* ======================================================
   TYPE : Props ของ Component
====================================================== */

type ApprovalStatusBadgeProps = {

  value?: string | number; // ค่าสถานะ

  onClick?: (
    event: MouseEvent<HTMLElement>
  ) => void; // event เมื่อกด badge

  onApproveClick?: (
    event: MouseEvent<HTMLElement>
  ) => void; // event เมื่อกดปุ่มอนุมัติ

  blinkKey?: string; // key สำหรับ animation กระพริบ
  sx?: SxProps<Theme>; // custom style เพิ่มเติม
};

/* ======================================================
   TYPE : รูปแบบข้อมูลสถานะการอนุมัติ
====================================================== */

type ApprovalStatusConfig = {

  label: string; // ข้อความสถานะ
  bg: string; // สีพื้นหลัง
  text: string; // สีข้อความ
  isWaitingApprove: boolean; // ตรวจสอบว่าเป็นสถานะรออนุมัติหรือไม่
};

/* ======================================================
   FUNCTION : แปลงค่าสถานะสำหรับแสดงผล
====================================================== */

export const getApprovalStatus = (
  value?: string | number
): ApprovalStatusConfig => {

  // แปลงค่า status เป็น string
  const status = String(value ?? "");

  /* ======================================================
     สถานะ : รออนุมัติ
  ====================================================== */

  if (
    status === "2" ||
    status === "waiting_approve"
  ) {
    return {
      label: "รออนุมัติ",
      bg: "#FFF6E6",
      text: "#FFAA37",
      isWaitingApprove: true,
    };
  }

  /* ======================================================
     สถานะ : เผยแพร่ / อนุมัติแล้ว
  ====================================================== */

  if (
    status === "1" ||
    status === "approved" ||
    status === "active"
  ) {
    return {
      label: "เผยแพร่",
      bg: "#d7f1e2",
      text: "#48af75",
      isWaitingApprove: false,
    };
  }

  /* ======================================================
     สถานะ : รอการแก้ไข
  ====================================================== */

  if (
    status === "4" ||
    status === "waiting_edit"
  ) {
    return {
      label: "รอการแก้ไข",
      bg: "#FFF6E6",
      text: "#FFAA37",
      isWaitingApprove: false,
    };
  }

  /* ======================================================
     สถานะ : ไม่อนุมัติ
  ====================================================== */

  if (
    status === "3" ||
    status === "cancel"
  ) {
    return {
      label: "ไม่อนุมัติ",
      bg: "#ffe6eb",
      text: "#ff3741",
      isWaitingApprove: false,
    };
  }

  /* ======================================================
     สถานะ : ยกเลิก / inactive
  ====================================================== */

  if (
    status === "0" ||
    status === "inactive"
  ) {
    return {
      label: "ยกเลิก",
      bg: "#e7e3e3",
      text: "#3b3a3a",
      isWaitingApprove: false,
    };
  }

  /* ======================================================
     กรณีไม่พบสถานะ
  ====================================================== */

  return {
    label: status || "-",
    bg: "#e8edf5",
    text: "#20304f",
    isWaitingApprove: false,
  };
};

/* ======================================================
   COMPONENT : ป้ายแสดงสถานะการอนุมัติ
====================================================== */

const ApprovalStatusBadge = ({
  value,
  onClick,
  onApproveClick,
  blinkKey = "approvalStatusBlinking",
  sx,
}: ApprovalStatusBadgeProps) => {

  /* ======================================================
     เรียกใช้งาน Theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     ดึงข้อมูลสถานะสำหรับแสดงผล
  ====================================================== */

  const status = getApprovalStatus(value);

  /* ======================================================
     กรณีสถานะ : รออนุมัติ
     แสดงปุ่ม icon พร้อม animation กระพริบ
  ====================================================== */

  if (status.isWaitingApprove) {
    return (
      <Box
        component="span"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* ======================================================
           ปุ่มส่งอนุมัติ
        ====================================================== */}

        <AppIconButton
          title=""
          variant="filled"
          customColor={
            theme.palette.primary.dark
          }

          onClick={onApproveClick}

          sx={{
            opacity: 1,

            cursor: "pointer",

            // animation กระพริบ
            animation: `${blinkKey} 1s infinite`,

            [`@keyframes ${blinkKey}`]: {
              "0%": { opacity: 1 },

              "50%": { opacity: 0.55 },

              "100%": { opacity: 1 },
            },

            ...sx,
          }}
        >

          {/* icon ส่งอนุมัติ */}
          <BsSendFill
            style={{
              fontSize:
                theme.typography.h6.fontSize,

              color: "#fff",
            }}
          />
        </AppIconButton>
      </Box>
    );
  }

  /* ======================================================
     แสดง badge สถานะทั่วไป
  ====================================================== */

  return (
    <Chip
      label={status.label}
      size="small"
      onClick={onClick}
      sx={{
        borderRadius: "999px",
        fontWeight: 600,
        px: 1,
        py: 2,
        backgroundColor: status.bg,
        color: status.text,
        cursor: onClick
          ? "pointer"
          : "default",

        transition: "all 0.2s ease",

        "&:hover": {
          filter: onClick
            ? "brightness(0.97)"
            : undefined,
        },

        "& .MuiChip-label": {
          px: 1,
        },

        ...sx,
      }}
    />
  );
};


export default ApprovalStatusBadge;