// “Select Dropdown พร้อมแสดง Tag แบบ Chip”

"use client";

/* ======================================================
   IMPORT COMPONENT และ TYPE จาก MUI
====================================================== */

import { Box, Chip, FormControl, MenuItem, Select, Typography, useTheme, } from "@mui/material";

import type { SelectChangeEvent } from "@mui/material";

/* ======================================================
   TYPE : ข้อมูล option ของ dropdown
====================================================== */

export type SelectChipTagOption = {
  valuename: string; // value ที่ใช้จริง
  labelname: string; // label ที่ใช้แสดงผล
};

/* ======================================================
   TYPE : Props ที่ Component รับเข้ามา
====================================================== */

type ComponentSelectChipTagModelProps = {
  name: string; // ชื่อหัวข้อ field
  titlename: string; // placeholder ของ dropdown
  tags: string; // ค่าที่เลือกทั้งหมดแบบ string
  setsubject: (value: string) => void; // setState สำหรับ update ค่า

  handleFieldChange: (
    fieldName: string,
    value: unknown
  ) => void; // callback ส่งค่ากลับ form หลัก
  topon: number; // margin-top
  error?: string; // ข้อความ error validation
  fieldKey: string; // key ของ field
  specify?: boolean; // กำหนดว่า required หรือไม่
  options: SelectChipTagOption[]; // รายการ option ทั้งหมด
};

/* ======================================================
   COMPONENT : Select Dropdown + Chip Tags
====================================================== */

const ComponentSelectChipTagModel = ({
  name,
  titlename,
  tags,
  setsubject,
  handleFieldChange,
  topon,
  error,
  fieldKey,
  specify = false,
  options,
}: ComponentSelectChipTagModelProps) => {
  /* ======================================================
     เรียกใช้งาน Theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     แปลง string tags -> array
  ------------------------------------------------------
     ตัวอย่าง: "A / B / C" => ["A", "B", "C"]
  ====================================================== */

  const selectedValues = tags
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);

  /* ======================================================
     เช็คว่ามี error หรือไม่
  ====================================================== */

  const hasError = Boolean(error);

  /* ======================================================
     Map สำหรับแปลง:
     value -> label
  ====================================================== */

  const optionLabelMap = new Map(
    options.map((option) => [
      option.valuename,
      option.labelname,
    ])
  );

  /* ======================================================
     Map สำหรับแปลง:
     label -> value
  ====================================================== */

  const optionValueByLabelMap = new Map(
    options.map((option) => [
      option.labelname,
      option.valuename,
    ])
  );

  /* ======================================================
     แปลง selected value ให้เป็น valuename จริง
  ====================================================== */

  const selectedOptionValues = selectedValues.map(
    (value) =>
      optionValueByLabelMap.get(value) ?? value
  );

  /* ======================================================
     FUNCTION : updateTags
  ------------------------------------------------------
     update ค่า tags
     และส่งค่ากลับ parent form
  ====================================================== */

  const updateTags = (nextTags: string[]) => {
    /* ======================================================
       รวม array -> string ["A", "B"] => "A / B"
    ====================================================== */

    const nextValue = nextTags.join(" / ");
    setsubject(nextValue);    // update state
    handleFieldChange(fieldKey, nextValue);    // ส่งค่ากลับ form หลัก
  };

  /* ======================================================
     FUNCTION : handleChange
  ------------------------------------------------------
     เมื่อเลือก option ใหม่จาก dropdown
  ====================================================== */

  const handleChange = (
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value;

    /* ======================================================
       ป้องกัน:
       - ค่า empty
       - ค่า duplicate
    ====================================================== */

    if (
      !value ||
      selectedOptionValues.includes(value)
    )
      return;

    // เพิ่ม tag ใหม่
    updateTags([...selectedValues, value]);
  };

  /* ======================================================
     FUNCTION : handleDelete
  ------------------------------------------------------
     ลบ tag ที่เลือก
  ====================================================== */

  const handleDelete = (
    valueToDelete: string
  ) => {
    updateTags(
      selectedValues.filter(
        (value) => value !== valueToDelete
      )
    );
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
              color: theme.palette.error.main,
            }}
          >
            *
          </span>
        )}
      </Typography>

      {/* ======================================================
         Select Dropdown
      ====================================================== */}

      <FormControl
        fullWidth
        error={hasError}
        sx={{ mt: 1 }}
      >
        <Select
          value=""
          displayEmpty
          onChange={handleChange}

          /* ======================================================
             Placeholder ของ Select
          ====================================================== */

          renderValue={() => (
            <Typography
              component="span"
              sx={{
                color: hasError
                  ? theme.palette.error.main
                  : theme.palette.grey[500],

                fontWeight: 300,
              }}
            >
              {titlename}
            </Typography>
          )}

          sx={{
            height: 40,
            borderRadius: 1,
            backgroundColor: "#fff",

            fontSize:
              theme.typography.body2.fontSize,

            /* ======================================================
               style select text
            ====================================================== */

            "& .MuiSelect-select": {
              py: 0.7,
              display: "flex",
              alignItems: "center",
            },

            /* ======================================================
               border ปกติ
            ====================================================== */

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: hasError
                ? theme.palette.error.main
                : theme.palette.divider,
            },

            /* ======================================================
               border ตอน hover
            ====================================================== */

            "&:hover .MuiOutlinedInput-notchedOutline":
            {
              borderColor: hasError
                ? theme.palette.error.main
                : theme.palette.text.primary,
            },

            /* ======================================================
               border ตอน focus
            ====================================================== */

            "&.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: hasError
                ? theme.palette.error.main
                : theme.palette.primary.main,

              borderWidth: 2,
            },
          }}
        >
          {/* ======================================================
             ตัวเลือกเริ่มต้นของ dropdown
          ====================================================== */}

          <MenuItem value="" disabled>
            {titlename}
          </MenuItem>

          {/* ======================================================
             แสดงรายการ option ทั้งหมด
          ====================================================== */}

          {options.map((option) => (
            <MenuItem
              key={option.valuename}
              value={option.valuename}

              /* ======================================================
                 ปิด option ที่ถูกเลือกแล้ว
              ====================================================== */

              disabled={selectedOptionValues.includes(
                option.valuename
              )}
            >
              {option.labelname}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ======================================================
         แสดง Chip Tag ที่เลือก
      ====================================================== */}

      {selectedValues.length > 0 && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            mt: 1,
          }}
        >
          {selectedValues.map((value) => (
            <Chip
              key={value}

              /* ======================================================
                 แสดง label จาก map
              ====================================================== */

              label={optionLabelMap.get(value) ?? value}

              onDelete={() => handleDelete(value)}

              sx={{
                maxWidth: "100%",
                backgroundColor: "#E8F1FF",
                color: "#0B5ED7",

                /* ======================================================
                   style ปุ่มลบ chip
                ====================================================== */

                "& .MuiChip-deleteIcon": {
                  color: "#0B5ED7",

                  "&:hover": {
                    color: "#084298",
                  },
                },

                /* ======================================================
                   style label chip
                ====================================================== */

                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: 500,
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* ======================================================
         แสดงข้อความ error
      ====================================================== */}

      {hasError && (
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.error.main,

            fontSize:
              theme.typography.caption.fontSize,

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

export default ComponentSelectChipTagModel;