// “Dropdown แบบเลือกหลายรายการ (Multi Select Dropdown)”

"use client";

/* ======================================================
   IMPORT REACT และ COMPONENT จาก MUI
====================================================== */

import React from "react";

import {Autocomplete,Box,Chip,TextField,Typography,useTheme,} from "@mui/material";

/* ======================================================
   IMPORT TYPE
====================================================== */

import type { OptionType } from "../../../utils/types";

/* ======================================================
   TYPE ของ Props ที่ Component รับเข้ามา
====================================================== */

interface BasicDropDownMultiSelectProps {
  titlename: string; // ชื่อหัวข้อ dropdown

  value: string; // ค่าปัจจุบันที่เก็บแบบ string

  setValue: React.Dispatch<React.SetStateAction<string>>; // setState ของ value

  handleFieldChange: (field: string, value: unknown) => void; // callback ส่งค่ากลับ form หลัก

  error?: string; // ข้อความ error validation

  fieldKey: string; // key ของ field

  specify: boolean; // ใช้กำหนดว่าฟิลด์นี้ required หรือไม่

  options: OptionType[]; // รายการตัวเลือกทั้งหมด

  topon?: number; // margin top
}

/* ======================================================
   FUNCTION : แปลง string เป็น array
------------------------------------------------------
   รองรับ:
   "A,B,C"
   หรือ
   "A/B/C"

   ให้กลายเป็น:
   ["A", "B", "C"]
====================================================== */

const splitMultiValue = (value: string) =>
  value
    .split(/[,/]/) // แยกค่าด้วย , หรือ /
    .map((item) => item.trim()) // ตัด space หน้า-หลัง
    .filter(Boolean); // ลบค่าว่างออก

/* ======================================================
   COMPONENT : Multi Select Dropdown
------------------------------------------------------
   Dropdown สำหรับเลือกข้อมูลได้หลายรายการ
   และส่งค่ากลับไปยัง parent component
====================================================== */

const BasicDropDownMultiSelect = ({
  titlename, // ชื่อหัวข้อ dropdown

  value, // ค่าปัจจุบันที่เก็บแบบ string

  setValue, // function สำหรับ update value

  handleFieldChange, // callback ส่งค่ากลับ form หลัก

  error, // ข้อความ error validation

  fieldKey, // key ของ field ที่ใช้อ้างอิงใน form

  specify, // ใช้กำหนดว่าฟิลด์นี้ required หรือไม่

  options, // รายการตัวเลือกทั้งหมด

  topon = 0, // margin-top ของ component
}: BasicDropDownMultiSelectProps) => {

  /* ======================================================
     เรียกใช้งาน Theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     แปลงค่าปัจจุบันจาก string -> array
  ====================================================== */

  const selectedValues = splitMultiValue(value || "");

/* ======================================================
   หา option ที่ถูกเลือกจาก options ทั้งหมด
------------------------------------------------------
   ใช้สำหรับนำค่าที่ถูกเลือกมาแสดงใน Autocomplete

   ตรวจสอบทั้ง:
   - labelname
   - valuename

   เพื่อรองรับข้อมูลหลายรูปแบบ
====================================================== */

const selectedOptions = options.filter(
  (option) =>
    selectedValues.includes(option.labelname) ||
    selectedValues.includes(option.valuename)
);

  /* ======================================================
     ส่วนแสดงผล UI
  ====================================================== */

  return (
    <Box
      sx={{
        width: "100%",
        mt: topon,
      }}
    >
      {/* ======================================================
         หัวข้อ Dropdown
      ====================================================== */}

      <Typography sx={{ mb: 1 }}>
        {titlename}{" "}

        {/* ======================================================
           แสดง * เมื่อเป็น required field
        ====================================================== */}

        {specify && (
          <span style={{ color: theme.palette.error.main }}>
            *
          </span>
        )}
      </Typography>

      {/* ======================================================
         Dropdown แบบเลือกหลายรายการ
      ====================================================== */}

      <Autocomplete
        multiple
        options={options}
        disableCloseOnSelect
        filterSelectedOptions
        value={selectedOptions}

        /* ======================================================
           กำหนด label ที่ใช้แสดงใน dropdown
        ====================================================== */

        getOptionLabel={(option) => option.labelname}

        /* ======================================================
           เมื่อมีการเลือก / ลบ option
        ====================================================== */

        onChange={(_event, newValue) => {
          /* ======================================================
             รวมค่าที่เลือกทั้งหมดเป็น string

             ["A", "B"]
             =>
             "A,B"
          ====================================================== */

          const text = newValue
            .map((item) => item.labelname)
            .join(",");

          // update state ภายใน component หลัก
          setValue(text);

          // ส่งค่ากลับ form หลัก
          handleFieldChange(fieldKey, text);
        }}

        /* ======================================================
           custom tag/chip ของค่าที่เลือก
        ====================================================== */

        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id ?? option.valuename}
              label={option.labelname}
              sx={{
                /* ======================================================
                   สีพื้นหลัง chip
                ====================================================== */

                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "#131e2e"
                    : "#ecf2fd",

                /* ======================================================
                   สีข้อความ chip
                ====================================================== */

                color:
                  theme.palette.mode === "dark"
                    ? "#60a7f6"
                    : "#0f5de6",

                /* ======================================================
                   style ปุ่มลบ chip
                ====================================================== */

                "& .MuiChip-deleteIcon": {
                  color:
                    theme.palette.mode === "dark"
                      ? "#60a7f6"
                      : "#0f5de6",

                  opacity: 0.7,

                  "&:hover": {
                    color: theme.palette.error.main,
                    opacity: 1,
                  },
                },
              }}
            />
          ))
        }

        /* ======================================================
           custom input field
        ====================================================== */

        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={`เลือก${titlename}`}
            error={Boolean(error)}
            helperText={error}
            sx={{
              /* ======================================================
                 style ตัว input หลัก
              ====================================================== */

              "& .MuiInputBase-root": {
                minHeight: 40,
                borderRadius: 1,
                backgroundColor: "#fff",
              },

              /* ======================================================
                 style text ภายใน input
              ====================================================== */

              "& .MuiInputBase-input": {
                fontSize: theme.typography.body2.fontSize,
                fontWeight: 300,
              },

              /* ======================================================
                 style placeholder
              ====================================================== */

              "& .MuiInputBase-input::placeholder": {
                fontSize: theme.typography.body2.fontSize,
              },

              /* ======================================================
                 style helper text / error text
              ====================================================== */

              "& .MuiFormHelperText-root": {
                fontSize: theme.typography.body2.fontSize,
              },
            }}
          />
        )}

        /* ======================================================
           style tag ของ autocomplete
        ====================================================== */

        sx={{
          "& .MuiAutocomplete-tag": {
            borderRadius: "6px",
          },
        }}
      />
    </Box>
  );
};

export default BasicDropDownMultiSelect;