// “Rich Text Editor สำหรับข่าวและกิจกรรม”

"use client";

/* ======================================================
   IMPORT React และ TYPE ที่จำเป็น
====================================================== */

import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    type ReactNode,
} from "react";

/* ======================================================
   IMPORT COMPONENT จาก MUI
====================================================== */

import { Box, Typography, useTheme } from "@mui/material";

/* ======================================================
   IMPORT Rich Text Editor
====================================================== */

import { RichTextEditor, type RichTextEditorRef } from "mui-tiptap";

/* ======================================================
   TYPE : Props ของ ComponentsNewsRichTextField
====================================================== */

type ComponentsNewsRichTextFieldProps = {
    label: string; // ชื่อหัวข้อ editor
    error?: string; // ข้อความ error
    extensions: any[]; // extensions ของ tiptap
    content?: string; // ค่าเริ่มต้นของ editor
    renderControls: () => ReactNode; // function render toolbar
    required?: boolean; // แสดง * บังคับกรอก
    onChange?: (html: string) => void;
};

/* ======================================================
   COMPONENT : Rich Text Editor สำหรับข่าวและกิจกรรม
====================================================== */

const ComponentsNewsRichTextField = forwardRef<
    RichTextEditorRef,
    ComponentsNewsRichTextFieldProps
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
           เรียกใช้งาน Theme
        ====================================================== */

        const theme = useTheme();
        const editorRef = useRef<RichTextEditorRef>(null);

        useImperativeHandle(ref, () => editorRef.current as RichTextEditorRef);

        useEffect(() => {
            const editor = editorRef.current?.editor;
            if (!editor) return;

            const nextContent = content || "";
            if (editor.getHTML() !== nextContent) {
                editor.commands.setContent(nextContent, false);
            }
        }, [content]);

        /* ======================================================
           ส่วนแสดงผล UI
        ====================================================== */

        return (
            <>

                {/* ======================================================
                   ชื่อหัวข้อ editor
                ====================================================== */}

                <Typography variant="body1" sx={{ mb: 1 }}>
                    {label}{" "}

                    {/* แสดง * เมื่อ field บังคับกรอก */}
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
                   Container ของ Rich Text Editor
                ====================================================== */}

                <Box
                    sx={{

                        // เปลี่ยนสี border เมื่อมี error
                        "& .MuiTiptap-FieldContainer-notchedOutline": {
                            borderColor:
                                error
                                    ? theme.palette.error.main
                                    : undefined,
                        },

                        // เปลี่ยนสี border ตอน hover เมื่อมี error
                        "&:hover .MuiTiptap-FieldContainer-notchedOutline": {
                            borderColor:
                                error
                                    ? theme.palette.error.main
                                    : undefined,
                        },
                    }}
                >

                    {/* ======================================================
                       Rich Text Editor
                    ====================================================== */}

                    <RichTextEditor
                        ref={editorRef}
                        extensions={extensions}
                        content={content}
                        renderControls={renderControls}
                        onUpdate={({ editor }) => {
                            onChange?.(editor.getHTML());
                        }}
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

ComponentsNewsRichTextField.displayName = "ComponentsNewsRichTextField";

export default ComponentsNewsRichTextField;
