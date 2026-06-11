// “ฟอร์มเพิ่มและแก้ไขนโยบาย”

"use client";

/* ======================================================
   IMPORT React Hook
====================================================== */

import { useEffect, useRef, useState } from "react";

/* ======================================================
   IMPORT COMPONENT จาก MUI
====================================================== */

import { Box, Grid, useTheme } from "@mui/material";

/* ======================================================
   IMPORT Tiptap Editor
====================================================== */

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

/* ======================================================
   IMPORT Toolbar ของ Rich Text Editor
====================================================== */

import {
  MenuButtonBlockquote,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonCode,
  MenuButtonEditLink,
  MenuButtonHorizontalRule,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonStrikethrough,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  type RichTextEditorRef,
} from "mui-tiptap";

/* ======================================================
   IMPORT COMPONENT ที่ใช้งาน
====================================================== */

import TextButton from "../../Buttom/TextButton";
import BasicTextField from "../../Model/TextField/BasicTextField";
import ComponentsFormSection from "../../Form/ComponentsFormSection";
import ComponentsFormCard from "../../Form/ComponentsFormCard";
import ComponentsPolicyRichTextField from "./ComponentsPolicyRichTextField";

/* ======================================================
   TYPE : ข้อมูลฟอร์มนโยบาย
====================================================== */

export type PolicyFormValue = {

  nameTH: string; // ชื่อนโยบายภาษาไทย

  nameEN: string; // ชื่อนโยบายภาษาอังกฤษ

  detailTH: string; // รายละเอียดภาษาไทย

  detailEN: string; // รายละเอียดภาษาอังกฤษ
};

/* ======================================================
   TYPE : Error ของฟอร์ม
====================================================== */

type PolicyFormErrors =
  Partial<Record<keyof PolicyFormValue, string>>;

/* ======================================================
   TYPE : Props ของ ComponentsPolicyForm
====================================================== */

type ComponentsPolicyFormProps = {

  initialValue?: PolicyFormValue; // ค่าเริ่มต้นของ form

  loading?: boolean; // สถานะ loading

  formTitle?: string; // ชื่อหัวข้อฟอร์ม

  buttonText: string; // ข้อความปุ่ม submit

  buttonColor?: string | "warning"; // สีปุ่ม

  preventNoChange?: boolean; // ป้องกัน submit ถ้าไม่มีการเปลี่ยนแปลง

  onNoChange?: () => void; // callback เมื่อไม่มีการเปลี่ยนแปลงข้อมูล

  onSubmit: (value: PolicyFormValue) => void; // callback submit form
};

/* ======================================================
   FUNCTION : Toolbar ของ Rich Text Editor
====================================================== */

const editorControls = () => (
  <MenuControlsContainer>
    <MenuSelectHeading />
    <MenuDivider />
    <MenuButtonBold />
    <MenuButtonItalic />
    <MenuButtonStrikethrough />
    <MenuButtonCode />
    <MenuDivider />
    <MenuButtonBulletedList />
    <MenuButtonOrderedList />
    <MenuButtonBlockquote />
    <MenuButtonHorizontalRule />
    <MenuButtonEditLink />
  </MenuControlsContainer>
);

/* ======================================================
   FUNCTION : ลบ HTML Tag ออกจากข้อความ
====================================================== */

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, "") // ลบ HTML Tag
    .replace(/&nbsp;/g, "") // ลบ &nbsp;
    .trim(); // ลบช่องว่างหน้า-หลัง

/* ======================================================
   EXTENSIONS : Editor ภาษาไทย
====================================================== */

const editorExtensionsTH = [
  StarterKit,
  Placeholder.configure({

    // placeholder ภาษาไทย
    placeholder: "กรุณากรอกรายละเอียดนโยบายภาษาไทย",
  }),
];

/* ======================================================
   EXTENSIONS : Editor ภาษาอังกฤษ
====================================================== */

const editorExtensionsEN = [
  StarterKit,
  Placeholder.configure({

    // placeholder ภาษาอังกฤษ
    placeholder: "กรุณากรอกรายละเอียดนโยบายภาษาอังกฤษ",
  }),
];

/* ======================================================
   ค่าเริ่มต้นของฟอร์ม
====================================================== */

const emptyValue: PolicyFormValue = {

  nameTH: "",

  nameEN: "",

  detailTH: "",

  detailEN: "",
};

/* ======================================================
   FUNCTION : แปลงค่าเพื่อใช้เปรียบเทียบข้อมูล
====================================================== */

const normalizeCompareValue = (
  value: unknown
) =>
  String(value ?? "").trim();

/* ======================================================
   FUNCTION : สร้าง snapshot สำหรับตรวจสอบการเปลี่ยนแปลง
====================================================== */

const buildPolicySnapshot = (
  value: PolicyFormValue
) =>
  JSON.stringify({

    // ชื่อนโยบายภาษาไทย
    nameTH:
      normalizeCompareValue(value.nameTH),

    // ชื่อนโยบายภาษาอังกฤษ
    nameEN:
      normalizeCompareValue(value.nameEN),

    // รายละเอียดภาษาไทย
    detailTH:
      normalizeCompareValue(value.detailTH),

    // รายละเอียดภาษาอังกฤษ
    detailEN:
      normalizeCompareValue(value.detailEN),
  });

/* ======================================================
   COMPONENT : ฟอร์มเพิ่มและแก้ไขนโยบาย
====================================================== */

const ComponentsPolicyForm = ({
  initialValue,
  loading = false,
  formTitle = "ฟอร์มการบันทึกนโยบาย",
  buttonText,
  buttonColor,
  preventNoChange = false,
  onNoChange,
  onSubmit,
}: ComponentsPolicyFormProps) => {

  /* ======================================================
     เรียกใช้งาน Theme
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     REF : Rich Text Editor
  ====================================================== */

  // editor ภาษาไทย
  const detailTHRef =
    useRef<RichTextEditorRef>(null);

  // editor ภาษาอังกฤษ
  const detailENRef =
    useRef<RichTextEditorRef>(null);

  /* ======================================================
     STATE : เปิด / ปิด section
  ====================================================== */

  const [
    detailBlockOpen,
    setDetailBlockOpen,
  ] = useState(true);

  /* ======================================================
     STATE : ข้อมูลฟอร์ม
  ====================================================== */

  const [value, setValue] =
    useState<PolicyFormValue>(
      initialValue ?? emptyValue
    );

  /* ======================================================
     STATE : Error ของฟอร์ม
  ====================================================== */

  const [error, setError] =
    useState<PolicyFormErrors>({});

  /* ======================================================
     EFFECT : set ค่า initialValue
  ====================================================== */

  useEffect(() => {

    // ถ้ามี initialValue ให้ set ลง form
    if (initialValue) {
      setValue(initialValue);
    }
  }, [initialValue]);

  /* ======================================================
     FUNCTION : เปลี่ยนค่าฟอร์ม
  ====================================================== */

  const handleChange = (
    field: keyof PolicyFormValue,
    fieldValue: string
  ) => {

    // update ค่า form
    setValue((prev) => ({
      ...prev,
      [field]: fieldValue,
    }));

    // ล้าง error ของ field
    setError((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  /* ======================================================
     FUNCTION : ล้าง error ของ field
  ====================================================== */

  const handleFieldChange = (
    fieldName: string,
    fieldValue: unknown
  ) => {

    setError((prev) => ({
      ...prev,

      [fieldName]:
        fieldValue
          ? ""
          : prev[
          fieldName as keyof PolicyFormErrors
          ],
    }));
  };

  /* ======================================================
     FUNCTION : ดึงค่าจาก Rich Text Editor
  ====================================================== */

  const getEditorValues = () => ({

    // รายละเอียดภาษาไทย
    detailTH:
      detailTHRef.current
        ?.editor
        ?.getHTML() ??
      value.detailTH,

    // รายละเอียดภาษาอังกฤษ
    detailEN:
      detailENRef.current
        ?.editor
        ?.getHTML() ??
      value.detailEN,
  });

  /* ======================================================
     FUNCTION : ตรวจสอบข้อมูลก่อน submit
  ====================================================== */

  const validateForm = () => {

    // ดึงค่าจาก editor
    const editorValues =
      getEditorValues();

    /* ======================================================
       สร้าง object error
    ====================================================== */

    const errors: PolicyFormErrors = {

      // ตรวจสอบชื่อนโยบายภาษาไทย
      nameTH:
        !value.nameTH.trim()
          ? "กรุณากรอกชื่อนโยบายภาษาไทย"
          : "",

      // ตรวจสอบชื่อนโยบายภาษาอังกฤษ
      nameEN:
        !value.nameEN.trim()
          ? "กรุณากรอกชื่อนโยบายภาษาอังกฤษ"
          : "",

      // ตรวจสอบรายละเอียดภาษาไทย
      detailTH:
        !stripHtml(editorValues.detailTH)
          ? "กรุณากรอกรายละเอียดนโยบายภาษาไทย"
          : "",

      // ตรวจสอบรายละเอียดภาษาอังกฤษ
      detailEN:
        !stripHtml(editorValues.detailEN)
          ? "กรุณากรอกรายละเอียดนโยบายภาษาอังกฤษ"
          : "",
    };

    // set error
    setError(errors);

    return {

      // ตรวจสอบว่ามี error หรือไม่
      isValid:
        !Object.values(errors)
          .some(Boolean),

      // คืนค่าฟอร์ม
      formValue: {

        nameTH:
          value.nameTH.trim(),

        nameEN:
          value.nameEN.trim(),

        detailTH:
          editorValues.detailTH.trim(),

        detailEN:
          editorValues.detailEN.trim(),
      },
    };
  };

  /* ======================================================
     FUNCTION : submit form
  ====================================================== */

  const handleSubmit = () => {

    // validate form
    const validation =
      validateForm();

    // ถ้า validation ไม่ผ่าน
    if (!validation.isValid)
      return;

    /* ======================================================
       ตรวจสอบข้อมูลซ้ำ
    ====================================================== */

    if (
      preventNoChange &&
      initialValue &&
      buildPolicySnapshot(
        validation.formValue
      ) ===
      buildPolicySnapshot(
        initialValue
      )
    ) {

      // callback เมื่อไม่มีการเปลี่ยนแปลงข้อมูล
      onNoChange?.();

      return;
    }

    /* ======================================================
       submit ข้อมูล
    ====================================================== */

    onSubmit(
      validation.formValue
    );
  };

  return (
    /* ======================================================
       CARD : ฟอร์มข้อมูลนโยบาย
    ====================================================== */
    <ComponentsFormCard title={formTitle}>
      {/* ======================================================
         SECTION : รายละเอียดข้อมูลนโยบาย
      ====================================================== */}
      <ComponentsFormSection
        title="รายละเอียดข้อมูลนโยบาย"
        open={detailBlockOpen}
        onToggle={() => setDetailBlockOpen((prev) => !prev)}
        noMargin
      >
        {/* ======================================================
           GRID : จัด layout ฟอร์ม
        ====================================================== */}
        <Grid container spacing={3}>
          {/* ======================================================
             INPUT : ชื่อนโยบายภาษาไทย
          ====================================================== */}
          <Grid size={{ xs: 12, md: 6 }}>
            <BasicTextField
              name="ชื่อนโยบายภาษาไทย"
              titlename="กรุณากรอกชื่อนโยบายภาษาไทย"
              subject={value.nameTH}
              setsubject={(fieldValue) => handleChange("nameTH", fieldValue)}
              topon={0}
              handleFieldChange={handleFieldChange}
              error={error.nameTH}
              fieldKey="nameTH"
              specify
            />
          </Grid>

          {/* ======================================================
             INPUT : ชื่อนโยบายภาษาอังกฤษ
          ====================================================== */}
          <Grid size={{ xs: 12, md: 6 }}>
            <BasicTextField
              name="ชื่อนโยบายภาษาอังกฤษ"
              titlename="กรุณากรอกชื่อนโยบายภาษาอังกฤษ"
              subject={value.nameEN}
              setsubject={(fieldValue) => handleChange("nameEN", fieldValue)}
              topon={0}
              handleFieldChange={handleFieldChange}
              error={error.nameEN}
              fieldKey="nameEN"
              specify
            />
          </Grid>

          {/* ======================================================
             RICH TEXT EDITOR : รายละเอียดนโยบายภาษาไทย
          ====================================================== */}
          <Grid size={{ xs: 12 }}>
            <ComponentsPolicyRichTextField
              ref={detailTHRef}
              label="รายละเอียดนโยบายภาษาไทย"
              error={error.detailTH}
              extensions={editorExtensionsTH}
              content={value.detailTH}
              renderControls={editorControls}
              onChange={(html) => handleChange("detailTH", html)}
            />
          </Grid>

          {/* ======================================================
             RICH TEXT EDITOR : รายละเอียดนโยบายภาษาอังกฤษ
          ====================================================== */}
          <Grid size={{ xs: 12 }}>
            <ComponentsPolicyRichTextField
              ref={detailENRef}
              label="รายละเอียดนโยบายภาษาอังกฤษ"
              error={error.detailEN}
              extensions={editorExtensionsEN}
              content={value.detailEN}
              renderControls={editorControls}
              onChange={(html) => handleChange("detailEN", html)}
            />
          </Grid>
        </Grid>

        {/* ======================================================
           BUTTON : ปุ่มบันทึก / แก้ไขข้อมูล
        ====================================================== */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <TextButton
            loading={loading}
            onClick={handleSubmit}
            sx={{
              backgroundColor:
                buttonColor === "warning"
                  ? theme.palette.warning.main
                  : buttonColor ?? theme.palette.secondary.main,
            }}
          >
            {/* ข้อความบนปุ่ม */}
            {buttonText}
          </TextButton>
        </Box>
      </ComponentsFormSection>
    </ComponentsFormCard>
  );
};

export default ComponentsPolicyForm;
