// “Input Tag แบบพิมพ์ข้อความและแสดงเป็น Chip”

"use client";

/* ======================================================
   IMPORT COMPONENT และ HOOK
====================================================== */

import { Box, Chip, InputBase, Typography, useTheme, } from "@mui/material";

import { useState } from "react";

/* ======================================================
   TYPE : Props ที่ Component รับเข้ามา
====================================================== */

type ComponentTextChipTagModelProps = {
  name: string; // ชื่อหัวข้อ field

  titlename: string; // placeholder

  tags: string; // ค่า tag ทั้งหมดแบบ string

  setsubject: (value: string) => void; // setState สำหรับ update ค่า

  handleFieldChange: (
    fieldName: string,
    value: unknown
  ) => void; // callback ส่งค่ากลับ form หลัก

  topon: number; // margin-top

  error?: string; // ข้อความ error validation

  fieldKey: string; // key ของ field

  specify?: boolean; // กำหนดว่า required หรือไม่
};

/* ======================================================
   COMPONENT : Text Chip Tag Input
------------------------------------------------------
   Component สำหรับ:
   - พิมพ์ข้อความ
   - กด Enter เพื่อเพิ่ม tag
   - แสดง tag เป็น Chip
====================================================== */

const ComponentTextChipTagModel = ({
  name,
  titlename,
  tags,
  setsubject,
  handleFieldChange,
  topon,
  error,
  fieldKey,
  specify = false,
}: ComponentTextChipTagModelProps) => {
  /* ======================================================
     เรียกใช้งาน Theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     STATE : ค่าที่กำลังพิมพ์
  ====================================================== */

  const [inputValue, setInputValue] =
    useState("");

  /* ======================================================
     แปลง tags string -> array
  ------------------------------------------------------
     ตัวอย่าง:
     "A / B / C"
     =>
     ["A", "B", "C"]
  ====================================================== */

  const textList = tags
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);

  /* ======================================================
     เช็คว่ามี error หรือไม่
  ====================================================== */

  const hasError = Boolean(error);

  /* ======================================================
     FUNCTION : updateTags
  ------------------------------------------------------
     update ค่า tags
     และส่งค่ากลับ form หลัก
  ====================================================== */

  const updateTags = (
    nextTags: string[]
  ) => {
    /* ======================================================
       รวม array -> string

       ["A", "B"]
       =>
       "A / B"
    ====================================================== */

    const nextValue =
      nextTags.join(" / ");

    // update state
    setsubject(nextValue);

    // ส่งค่ากลับ form หลัก
    handleFieldChange(
      fieldKey,
      nextValue
    );
  };

  /* ======================================================
     FUNCTION : handleDelete
  ------------------------------------------------------
     ลบ tag ตาม index
  ====================================================== */

  const handleDelete = (
    indexToDelete: number
  ) => {
    updateTags(
      textList.filter(
        (_, index) =>
          index !== indexToDelete
      )
    );
  };

  /* ======================================================
     FUNCTION : handleAdd
  ------------------------------------------------------
     เพิ่ม tag ใหม่
  ====================================================== */

  const handleAdd = () => {
    /* ======================================================
       ตัด space หน้า-หลัง
    ====================================================== */

    const newText =
      inputValue.trim();

    /* ======================================================
       เพิ่มเฉพาะ:
       - ค่าที่ไม่ว่าง
       - ค่าที่ไม่ซ้ำ
    ====================================================== */

    if (
      newText &&
      !textList.includes(newText)
    ) {
      updateTags([
        ...textList,
        newText,
      ]);
    }

    /* ======================================================
       reset input
    ====================================================== */

    setInputValue("");
  };

  /* ======================================================
     FUNCTION : handleKeyDown
  ------------------------------------------------------
     เมื่อกด Enter
     ให้เพิ่ม tag
  ====================================================== */

  const handleKeyDown = (
    event: React.KeyboardEvent
  ) => {
    if (event.key === "Enter") {
      // ป้องกัน form submit
      event.preventDefault();

      // เพิ่ม tag
      handleAdd();
    }
  };

  /* ======================================================
     ส่วนแสดงผล UI
  ====================================================== */

  return (
    <Box sx={{ mt: topon }}>
      {/* ======================================================
         Label ของ field
      ====================================================== */}

      <Typography
        variant="body1"
        component="label"
        sx={{
          display: "block",
        }}
      >
        {name}{" "}

        {/* ======================================================
           แสดง * เมื่อ field เป็น required
        ====================================================== */}

        {specify && (
          <span
            style={{
              color:
                theme.palette.error.main,
            }}
          >
            *
          </span>
        )}
      </Typography>

      {/* ======================================================
         กล่องครอบ input
      ====================================================== */}

      <Box
        sx={{
          border: hasError
            ? `1px solid ${theme.palette.error.main}`
            : `1px solid ${theme.palette.divider}`,

          borderRadius: 1,
          px: 1.5,
          mt: 1,
          minHeight: 40,
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          transition:
            "border-color 0.2s ease-in-out",

          /* ======================================================
             border ตอน hover
          ====================================================== */

          "&:hover": {
            borderColor: hasError
              ? theme.palette.error.main
              : theme.palette.text.primary,
          },

          /* ======================================================
             border ตอน focus
          ====================================================== */

          "&:focus-within": {
            border: `2px solid ${hasError
                ? theme.palette.error.main
                : theme.palette.primary.main
              }`,
          },
        }}
      >
        {/* ======================================================
           Input Field
        ====================================================== */}

        <InputBase
          value={inputValue}

          /* ======================================================
             เมื่อมีการพิมพ์ข้อความ
          ====================================================== */

          onChange={(event) => {
            setInputValue(
              event.target.value
            );

            /* ======================================================
               update field ระหว่างพิมพ์
            ====================================================== */

            if (event.target.value) {
              handleFieldChange(
                fieldKey,
                event.target.value
              );
            }
          }}

          onKeyDown={handleKeyDown}

          /* ======================================================
             เมื่อ input เสีย focus
             ให้เพิ่ม tag อัตโนมัติ
          ====================================================== */

          onBlur={handleAdd}

          /* ======================================================
             แสดง placeholder
             เฉพาะตอนยังไม่มี tag
          ====================================================== */

          placeholder={
            textList.length
              ? ""
              : titlename
          }

          sx={{
            width: "100%",

            fontSize:
              theme.typography.body2
                .fontSize,

            color: hasError
              ? theme.palette.error.main
              : theme.palette.text.primary,

            /* ======================================================
               style input text
            ====================================================== */

            "& .MuiInputBase-input": {
              fontWeight: 300,

              py: 0.7,
            },

            /* ======================================================
               style placeholder
            ====================================================== */

            "& .MuiInputBase-input::placeholder":
            {
              color: hasError
                ? theme.palette.error.main
                : theme.palette.grey[500],

              opacity: 1,
            },
          }}
        />
      </Box>

      {/* ======================================================
         แสดงรายการ Chip Tag
      ====================================================== */}

      {textList.length > 0 && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            mt: 1,
          }}
        >
          {textList.map(
            (item, index) => (
              <Chip
                key={`${item}-${index}`}
                label={item}
                onDelete={() =>
                  handleDelete(index)
                }

                sx={{
                  maxWidth: "100%",
                  backgroundColor:
                    "#E8F1FF",
                  color: "#0B5ED7",

                  "& .MuiChip-deleteIcon":
                  {
                    color: "#0B5ED7",

                    "&:hover": {
                      color:
                        "#084298",
                    },
                  },

                  "& .MuiChip-label":
                  {
                    overflow:
                      "hidden",
                    textOverflow:
                      "ellipsis",
                    fontWeight: 500,
                  },
                }}
              />
            )
          )}
        </Box>
      )}

      {/* ======================================================
         แสดงข้อความ error
      ====================================================== */}

      {hasError && (
        <Typography
          variant="caption"
          sx={{
            color:
              theme.palette.error.main,
            fontSize:
              theme.typography.caption
                .fontSize,
            fontWeight: 400,
            mt: 0.5,
            ml: 1,
            display: "block",
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ComponentTextChipTagModel;