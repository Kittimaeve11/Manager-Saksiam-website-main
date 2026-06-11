// “ฟอร์มเพิ่มประเภทข่าวสารและกิจกรรม”

"use client";

/* ======================================================
   IMPORT COMPONENT จาก MUI
====================================================== */

import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";

/* ======================================================
   IMPORT React Hook และ TYPE ที่จำเป็น
====================================================== */

import { useState } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";

/* ======================================================
   IMPORT API และ COMPONENT ที่ใช้งาน
====================================================== */

import { apiFetch } from "../../../API/client";
import TextButton from "../../Buttom/TextButton";
import BasicTextField from "../../Model/TextField/BasicTextField";
import ConfirmDialog from "../../Model/Pop_up/ConfirmDialog";

/* ======================================================
   TYPE : ประเภทการแจ้งเตือน
====================================================== */

type NotifyType = "success" | "error" | "warning" | "info";

/* ======================================================
   TYPE : Props ของ Component
====================================================== */

type Props = {

  fullnamePer: string; // ชื่อผู้บันทึกข้อมูล

  setOpenPopup: Dispatch<SetStateAction<boolean>>; // เปิด/ปิด popup

  setNotify: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      message: string;
      type: NotifyType;
    }>
  >; // จัดการ notification

  fetchNewsType: () => void; // โหลดข้อมูลประเภทข่าวใหม่
};

/* ======================================================
   COMPONENT : ฟอร์มเพิ่มประเภทข่าวสารและกิจกรรม
====================================================== */

const ComponentsNewsTypeAddForm = ({
  fullnamePer,
  setOpenPopup,
  setNotify,
  fetchNewsType,
}: Props) => {

  /* ======================================================
     THEME : เรียกใช้งาน theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     STATE : ชื่อประเภทข่าวภาษาไทย
  ====================================================== */

  const [nameTH, setNameTH] = useState("");

  /* ======================================================
     STATE : ชื่อประเภทข่าวภาษาอังกฤษ
  ====================================================== */

  const [nameEN, setNameEN] = useState("");

  /* ======================================================
     STATE : เก็บข้อความ error ของฟอร์ม
  ====================================================== */

  const [error, setError] = useState({
    nameTH: "",
    nameEN: "",
  });

  /* ======================================================
     STATE : จัดการ popup confirm dialog
  ====================================================== */

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    isLoading: false,
    onConfirm: () => { },
  });

  /* ======================================================
     FUNCTION : clear error เมื่อมีการกรอกข้อมูล
  ====================================================== */

  const handleFieldChange = (fieldName: string, value: unknown) => {

    // clear error ภาษาไทย
    if (fieldName === "nameTH") {
      setError((prev) => ({
        ...prev,
        nameTH: value ? "" : prev.nameTH,
      }));
    }

    // clear error ภาษาอังกฤษ
    if (fieldName === "nameEN") {
      setError((prev) => ({
        ...prev,
        nameEN: value ? "" : prev.nameEN,
      }));
    }
  };

  /* ======================================================
     FUNCTION : บันทึกข้อมูลประเภทข่าว
  ====================================================== */

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {

    // ป้องกัน reload page
    e.preventDefault();

    /* ======================================================
       VALIDATE : ตรวจสอบข้อมูลก่อนบันทึก
    ====================================================== */

    if (!nameTH || !nameEN) {

      setError({
        nameTH: !nameTH ? "กรุณากรอกชื่อภาษาไทย" : "",
        nameEN: !nameEN ? "กรุณากรอกชื่อภาษาอังกฤษ" : "",
      });

      return;
    }

    /* ======================================================
       OPEN : popup ยืนยันการบันทึก
    ====================================================== */

    setConfirmDialog({
      isOpen: true,
      isLoading: false,

      /* ======================================================
         FUNCTION : เมื่อกดยืนยันบันทึกข้อมูล
      ====================================================== */

      onConfirm: async () => {

        // เปิด loading
        setConfirmDialog((prev) => ({
          ...prev,
          isLoading: true,
        }));

        try {

          /* ======================================================
             API : เพิ่มประเภทข่าวสารและกิจกรรม
          ====================================================== */

          const response = await apiFetch("/api/auther/createEditorialTypeAPI", {
            method: "POST",

            body: JSON.stringify({
              nameTH,
              nameEN,
              savename: fullnamePer,
              active: "1",
            }),
          });

          /* ======================================================
             ERROR : กรณี response ไม่สำเร็จ
          ====================================================== */

          if (!response.ok) {

            const errorData = await response.json();

            throw new Error(
              errorData.message ||
              errorData.error ||
              "ไม่สามารถบันทึกข้อมูลได้"
            );
          }

          /* ======================================================
             SUCCESS : บันทึกข้อมูลสำเร็จ
          ====================================================== */

          fetchNewsType();

          setNotify({
            isOpen: true,
            message: "บันทึกข้อมูลสำเร็จ",
            type: "success",
          });

          // ปิด popup
          setOpenPopup(false);

        } catch (error) {

          /* ======================================================
             ERROR : แจ้งเตือนเมื่อบันทึกไม่สำเร็จ
          ====================================================== */

          setNotify({
            isOpen: true,
            message:
              error instanceof Error
                ? error.message
                : "ไม่สามารถบันทึกข้อมูลได้",
            type: "error",
          });

        } finally {

          /* ======================================================
             RESET : ปิด confirm dialog
          ====================================================== */

          setConfirmDialog({
            isOpen: false,
            isLoading: false,
            onConfirm: () => { },
          });
        }
      },
    });
  };

  return (

    /* ======================================================
       CONTAINER : กล่องฟอร์มเพิ่มประเภทข่าวและกิจกรรม
    ====================================================== */

    <Paper
      elevation={0}
      sx={{
        mt: 5,
        py: 2,
        borderRadius: 3,
      }}
    >

      {/* ======================================================
         CONTENT : ส่วนข้อมูลภายในฟอร์ม
      ====================================================== */}

      <Box px={{ xs: 2, sm: 5 }} mb={2}>

        {/* ======================================================
           TITLE : หัวข้อฟอร์ม
        ====================================================== */}

        <Typography variant="h6" fontWeight={600}>
          ฟอร์มเพิ่มประเภทข่าวและกิจกรรม
        </Typography>

        {/* ======================================================
           GRID : จัด layout ฟอร์ม
        ====================================================== */}

        <Grid container spacing={2} mt={1}>

          {/* ======================================================
             INPUT : ชื่อประเภทข่าวภาษาไทย
          ====================================================== */}

          <Grid size={{ xs: 12, md: 5 }}>
            <BasicTextField
              name="ชื่อประเภทข่าวและกิจกรรม (TH)"
              titlename="กรุณากรอกชื่อภาษาไทย"
              subject={nameTH}
              setsubject={setNameTH}
              topon={0}
              handleFieldChange={handleFieldChange}
              error={error.nameTH}
              fieldKey="nameTH"
              specify
            />
          </Grid>

          {/* ======================================================
             INPUT : ชื่อประเภทข่าวภาษาอังกฤษ
          ====================================================== */}

          <Grid size={{ xs: 12, md: 5 }}>
            <BasicTextField
              name="ชื่อประเภทข่าวและกิจกรรม (EN)"
              titlename="กรุณากรอกชื่อภาษาอังกฤษ"
              subject={nameEN}
              setsubject={setNameEN}
              topon={0}
              handleFieldChange={handleFieldChange}
              error={error.nameEN}
              fieldKey="nameEN"
              specify
            />
          </Grid>

          {/* ======================================================
             BUTTON : ปุ่มบันทึกข้อมูล
          ====================================================== */}

          <Grid size={{ xs: 12, md: 2 }}>
            <Box
              display="flex"
              justifyContent="flex-end"
              mt={4}
            >
              <TextButton
                onClick={handleSubmit}
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                }}
              >
                บันทึกข้อมูล
              </TextButton>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* ======================================================
         POPUP : กล่องยืนยันการบันทึกข้อมูล
      ====================================================== */}

      <ConfirmDialog
        type="add"
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
    </Paper>
  );
};

export default ComponentsNewsTypeAddForm;