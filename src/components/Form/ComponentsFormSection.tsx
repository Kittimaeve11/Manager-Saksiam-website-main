// “Section Card แบบเปิด/ปิดได้ (Collapse Form Section)”

"use client";

/* ======================================================
   IMPORT TYPE และ COMPONENT จาก MUI
====================================================== */

import type { ReactNode } from "react";
import { Box, Collapse, IconButton, Paper, Typography, useTheme, } from "@mui/material";
import type { SxProps, Theme, } from "@mui/material/styles";

/* ======================================================
   IMPORT ICON
====================================================== */

import EditSquareIcon from "@mui/icons-material/EditSquare";
import ImageIcon from "@mui/icons-material/Image";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

/* ======================================================
   TYPE : Props ที่ Component รับเข้ามา
====================================================== */

type ComponentsFormSectionProps = {
  title: ReactNode; // หัวข้อ section
  open: boolean; // สถานะเปิด/ปิด section
  onToggle: () => void; // function toggle collapse
  children: ReactNode; // content ภายใน section
  iconType?: "edit" | "image"; // ประเภท icon ที่แสดง
  noMargin?: boolean; // ปิด margin-bottom
  contentSx?: SxProps<Theme>; // custom style ของ content
};

/* ======================================================
   COMPONENT : Collapse Form Section
------------------------------------------------------
   ใช้สำหรับ:
   - แบ่ง section ของ form
   - เปิด/ปิดเนื้อหา
   - จัดกลุ่มข้อมูล
====================================================== */

const ComponentsFormSection = ({
  title,
  open,
  onToggle,
  children,
  iconType = "edit",
  noMargin = false,
  contentSx,
}: ComponentsFormSectionProps) => {
  /* ======================================================
     เรียกใช้งาน Theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     เลือก icon ตามประเภท section
  ------------------------------------------------------
     image => ImageIcon
     edit => EditSquareIcon
  ====================================================== */

  const Icon =
    iconType === "image"
      ? ImageIcon
      : EditSquareIcon;

  /* ======================================================
     ส่วนแสดงผล UI
  ====================================================== */

  return (
    <Paper
      variant="outlined"

      sx={{
        mb: noMargin ? 0 : 3,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* ======================================================
         Header Section
      ------------------------------------------------------
         ใช้กดเปิด/ปิด collapse
      ====================================================== */}

      <Box
        onClick={onToggle}

        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          cursor: "pointer",
          backgroundColor:
            theme.palette.primary.dark,

          color: "white",
        }}
      >
        {/* ======================================================
           ส่วนซ้ายของ header
           แสดง icon + title
        ====================================================== */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* ======================================================
             Icon ของ section
          ====================================================== */}

          <Icon />

          {/* ======================================================
             Title ของ section
          ====================================================== */}

          <Typography fontWeight={600}>
            {title}
          </Typography>
        </Box>

        {/* ======================================================
           ปุ่มลูกศรสำหรับ collapse
        ====================================================== */}

        <IconButton
          size="small"
          sx={{
            color: "white",
          }}
        >
          <KeyboardArrowDownIcon
            sx={{
              /* ======================================================
                 หมุน icon เมื่อ section เปิด
              ====================================================== */

              transform: open
                ? "rotate(180deg)"
                : "rotate(0deg)",

              transition: "0.2s",
            }}
          />
        </IconButton>
      </Box>

      {/* ======================================================
         เนื้อหาแบบพับเก็บได้
      ====================================================== */}

      <Collapse in={open}>
        <Box
          sx={{
            p: 2,
            backgroundColor: "#fff",
            ...contentSx,
          }}
        >
          {/* ======================================================
             เนื้อหาภายใน section
          ====================================================== */}

          {children}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ComponentsFormSection;