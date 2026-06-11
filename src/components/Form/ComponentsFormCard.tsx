// “Card Layout สำหรับใช้ครอบ Form / Content Section”

"use client";

/* ======================================================
   IMPORT TYPE และ COMPONENT จาก MUI
====================================================== */

import type { ReactNode } from "react";

import { Box, Paper, Typography, useTheme, } from "@mui/material";

import type { SxProps, Theme, } from "@mui/material/styles";

/* ======================================================
   TYPE : Props ที่ Component รับเข้ามา
====================================================== */

type ComponentsFormCardProps = {
  title: ReactNode; // หัวข้อ card

  children: ReactNode; // เนื้อหาภายใน card

  sx?: SxProps<Theme>; // custom style ของ Paper

  contentSx?: SxProps<Theme>; // custom style ของ content ด้านใน
};

/* ======================================================
   COMPONENT : Form Card Layout
------------------------------------------------------
   ใช้สำหรับครอบ:
   - Form
   - Section Content
   - Input Group
   - Setting Panel
====================================================== */

const ComponentsFormCard = ({
  title,
  children,
  sx,
  contentSx,
}: ComponentsFormCardProps) => {
  /* ======================================================
     เรียกใช้งาน Theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     ส่วนแสดงผล UI
  ====================================================== */

  return (
    <Paper
      elevation={0}

      sx={{
        mt: 5,
        py: 2,
        borderRadius: 3,
        width: "100%",

        /* ======================================================
           background card
           รองรับ dark mode
        ====================================================== */

        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.primary.darker
            : "white",

        /* ======================================================
           custom sx จาก parent
        ====================================================== */

        ...sx,
      }}
    >
      {/* ======================================================
         Content Container
      ====================================================== */}

      <Box
        sx={{
          /* ======================================================
             responsive padding แนวนอน
          ====================================================== */

          px: {
            xs: 2,
            sm: 5,
          },

          mb: 2,

          /* ======================================================
             custom content style
          ====================================================== */

          ...contentSx,
        }}
      >
        {/* ======================================================
           Header Section
        ====================================================== */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          {/* ======================================================
             Title ของ Card
          ====================================================== */}

          <Typography
            variant="h6"
            fontWeight={600}
          >
            {title}
          </Typography>
        </Box>

        {/* ======================================================
           Content ด้านใน Card
        ====================================================== */}

        {children}
      </Box>
    </Paper>
  );
};

export default ComponentsFormCard;