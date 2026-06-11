"use client";

/* ======================================================
   IMPORT : React และ TYPE ที่ใช้งาน
====================================================== */

import { forwardRef, type ReactNode } from "react";

/* ======================================================
   IMPORT : COMPONENT จาก MUI
====================================================== */

import { Box, Typography, useTheme } from "@mui/material";

/* ======================================================
   IMPORT : Rich Text Editor จาก mui-tiptap
====================================================== */

import { RichTextEditor, type RichTextEditorRef } from "mui-tiptap";

/* ======================================================
   TYPE : Props ของ ComponentsPolicyRichTextField
====================================================== */

type ComponentsPolicyRichTextFieldProps = {

  label: string; // ชื่อหัวข้อ field
  error?: string; // ข้อความ error
  extensions: any[]; // extensions ของ editor
  content?: string; // ค่าเริ่มต้นของ editor
  renderControls: () => ReactNode; // function render toolbar control
  required?: boolean; // บังคับกรอกข้อมูลหรือไม่
  onChange?: (html: string) => void;

};

/* ======================================================
   COMPONENT : Rich Text Editor สำหรับนโยบาย
====================================================== */

const ComponentsPolicyRichTextField = forwardRef<
  RichTextEditorRef,
  ComponentsPolicyRichTextFieldProps
>(
  (
    {
      label,
      error,
      extensions,
      content = "",
      renderControls,
      required = true,
      onChange,
    },
    ref
  ) => {

    /* ======================================================
       THEME : เรียกใช้งาน theme จาก MUI
    ====================================================== */

    const theme = useTheme();

    return (
      <>

        {/* ======================================================
           LABEL : ชื่อหัวข้อของ editor
        ====================================================== */}

        <Typography variant="body1" sx={{ mb: 1 }}>
          {label} {required && <span style={{ color: theme.palette.error.main }}>*</span>}
        </Typography>

        {/* ======================================================
           WRAPPER : ครอบ Rich Text Editor
        ====================================================== */}

        <Box
          sx={{

            // เปลี่ยนสี border เมื่อเกิด error
            "& .MuiTiptap-FieldContainer-notchedOutline": {
              borderColor: error ? theme.palette.error.main : undefined,
            },

            // เปลี่ยนสี border ตอน hover เมื่อเกิด error
            "&:hover .MuiTiptap-FieldContainer-notchedOutline": {
              borderColor: error ? theme.palette.error.main : undefined,
            },

          }}
        >

          {/* ======================================================
             EDITOR : Rich Text Editor
          ====================================================== */}

          <RichTextEditor
            ref={ref}
            extensions={extensions}
            content={content}
            renderControls={renderControls}
            onUpdate={({ editor }) => {
              onChange?.(editor.getHTML());
            }}
          />
        </Box>

        {/* ======================================================
           ERROR : แสดงข้อความแจ้งเตือน error
        ====================================================== */}

        {error && (
          <Typography
            color="error"
            variant="caption"
            sx={{ mt: 0.75, display: "block" }}
          >
            {error}
          </Typography>
        )}
      </>
    );
  }
);

/* ======================================================
   DISPLAY NAME : ชื่อ component สำหรับ React DevTools
====================================================== */

ComponentsPolicyRichTextField.displayName = "ComponentsPolicyRichTextField";

export default ComponentsPolicyRichTextField;
