// “Rich Text Editor สำหรับคำถามที่พบบ่อย”

"use client";

/* ======================================================
   IMPORT React และ TYPE ที่จำเป็น
====================================================== */

import { forwardRef, type ReactNode } from "react";

/* ======================================================
   IMPORT COMPONENT จาก MUI
====================================================== */

import { Box, Typography, useTheme } from "@mui/material";

/* ======================================================
   IMPORT Rich Text Editor
====================================================== */

import {
  RichTextEditor,
  type RichTextEditorRef,
} from "mui-tiptap";

/* ======================================================
   TYPE ของ Props ที่ Component รับเข้ามา
====================================================== */

type ComponentsFaqQuestionRichTextFieldProps = {
  label: string; // ชื่อหัวข้อ editor

  error?: string; // ข้อความ error

  extensions: any[]; // extensions สำหรับ editor

  content?: string; // ค่าเริ่มต้นของ editor

  renderControls: () => ReactNode; // function สำหรับ render toolbar

  required?: boolean; // สถานะบังคับกรอกข้อมูล
};

/* ======================================================
   COMPONENT : Rich Text Editor สำหรับคำถามที่พบบ่อย
====================================================== */

const ComponentsFaqQuestionRichTextField = forwardRef<
  RichTextEditorRef,
  ComponentsFaqQuestionRichTextFieldProps
>(
  (
    {
      label,
      error,
      extensions,
      content = "",
      renderControls,
      required = true,
    },
    ref
  ) => {

    /* ======================================================
       เรียกใช้งาน Theme ของ MUI
    ====================================================== */

    const theme = useTheme();

    /* ======================================================
       ส่วนแสดงผล UI
    ====================================================== */

    return (
      <>
        {/* ======================================================
           แสดงหัวข้อของ Rich Text Editor
        ====================================================== */}

        <Typography variant="body1" sx={{ mb: 1 }}>
          {label}{" "}

          {/* แสดง * เมื่อเป็น field บังคับกรอก */}
          {required && (
            <span
              style={{
                color: theme.palette.error.main,
              }}
            >
              *
            </span>
          )}
        </Typography>

        {/* ======================================================
           Container ครอบ Rich Text Editor
        ====================================================== */}

        <Box
          sx={{

            // เปลี่ยนสี border เมื่อมี error
            "& .MuiTiptap-FieldContainer-notchedOutline": {
              borderColor: error
                ? theme.palette.error.main
                : undefined,
            },

            // เปลี่ยนสี border ตอน hover เมื่อมี error
            "&:hover .MuiTiptap-FieldContainer-notchedOutline": {
              borderColor: error
                ? theme.palette.error.main
                : undefined,
            },
          }}
        >

          {/* ======================================================
             Rich Text Editor
          ====================================================== */}

          <RichTextEditor
            ref={ref}
            extensions={extensions}
            content={content}
            renderControls={renderControls}
          />
        </Box>

        {/* ======================================================
           แสดงข้อความ error
        ====================================================== */}

        {error && (
          <Typography
            color="error"
            variant="caption"
            sx={{
              mt: 0.75,
              display: "block",
            }}
          >
            {error}
          </Typography>
        )}
      </>
    );
  }
);

/* ======================================================
   กำหนด displayName สำหรับ forwardRef
====================================================== */

ComponentsFaqQuestionRichTextField.displayName =
  "ComponentsFaqQuestionRichTextField";

export default ComponentsFaqQuestionRichTextField;