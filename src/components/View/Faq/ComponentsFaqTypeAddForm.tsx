// “ฟอร์มเพิ่มประเภทคำถามที่พบบ่อย”

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
   IMPORT API CLIENT สำหรับเชื่อมต่อ Backend
====================================================== */

import { apiFetch } from "../../../API/client";

/* ======================================================
   IMPORT COMPONENT UI ที่ใช้งานภายในฟอร์ม
====================================================== */

// ปุ่มสำหรับบันทึกข้อมูล
import TextButton from "../../Buttom/TextButton";

// TextField สำหรับกรอกข้อมูล
import BasicTextField from "../../Model/TextField/BasicTextField";

// Popup ยืนยันก่อนบันทึกข้อมูล
import ConfirmDialog from "../../Model/Pop_up/ConfirmDialog";

/* ======================================================
   TYPE ของ Notification
====================================================== */

type NotifyType =
  | "success"
  | "error"
  | "warning"
  | "info";

/* ======================================================
   TYPE Props ของ Component
====================================================== */

type Props = {
  fullnamePer: string;

  setOpenPopup: Dispatch<
    SetStateAction<boolean>
  >;

  setNotify: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      message: string;
      type: NotifyType;
    }>
  >;

  fetchshowTopics: () => void;

  page: number;
  rowsPerPage: number;
  IDPer?: string;
  typeUser?: string;
};

/* ======================================================
   COMPONENT : ฟอร์มเพิ่มประเภทคำถามที่พบบ่อย
====================================================== */

const ComponentsFaqTypeAddForm = ({
  fullnamePer,
  setOpenPopup,
  setNotify,
  fetchshowTopics,
}: Props) => {

  /* ======================================================
     เรียกใช้งาน Theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     STATE เก็บข้อมูลฟอร์ม
  ====================================================== */

  const [nameTH, setNameTH] =
    useState("");

  const [nameEN, setNameEN] =
    useState("");

  /* ======================================================
     STATE เก็บข้อความ Error ของแต่ละ Field
  ====================================================== */

  const [error, setError] =
    useState({
      nameTH: "",

      nameEN: "",
    });

  /* ======================================================
     STATE สำหรับ Confirm Dialog
  ====================================================== */

  const [
    confirmDialog,
    setConfirmDialog,
  ] = useState({
    isOpen: false,
    isLoading: false,
    onConfirm: () => { },
  });

  /* ======================================================
     FUNCTION : เคลียร์ Error เมื่อมีการกรอกข้อมูล
  ====================================================== */

  const handleFieldChange = (
    fieldName: string,
    value: unknown
  ) => {

    /* ======================================================
       ตรวจสอบ Field ภาษาไทย
    ====================================================== */

    if (fieldName === "nameTH") {
      setError((prev) => ({
        ...prev,

        nameTH: value
          ? ""
          : prev.nameTH,
      }));
    }

    /* ======================================================
       ตรวจสอบ Field ภาษาอังกฤษ
    ====================================================== */

    if (fieldName === "nameEN") {
      setError((prev) => ({
        ...prev,

        nameEN: value
          ? ""
          : prev.nameEN,
      }));
    }
  };

  /* ======================================================
     FUNCTION : บันทึกข้อมูลประเภทคำถามที่พบบ่อย
  ====================================================== */

  const handleSubmit = async (
    e: MouseEvent<HTMLButtonElement>
  ) => {

    // ป้องกัน refresh หน้า
    e.preventDefault();

    /* ======================================================
       VALIDATE ฟอร์มก่อนบันทึก
    ====================================================== */

    if (!nameTH || !nameEN) {

      setError({
        nameTH:
          !nameTH
            ? "กรุณากรอกชื่อภาษาไทย"
            : "",

        nameEN:
          !nameEN
            ? "กรุณากรอกชื่อภาษาอังกฤษ"
            : "",
      });

      return;
    }

    /* ======================================================
       เปิด Confirm Dialog ก่อนบันทึก
    ====================================================== */

    setConfirmDialog({
      isOpen: true,

      isLoading: false,

      onConfirm: async () => {

        /* ======================================================
           เปิด Loading ของ Dialog
        ====================================================== */

        setConfirmDialog((prev) => ({
          ...prev,

          isLoading: true,
        }));

        try {

          /* ======================================================
             เรียก API สำหรับบันทึกประเภทคำถามที่พบบ่อย
          ====================================================== */

          const response = await apiFetch(`/api/auther/createFaqTypeAPI`, {
            method: "POST",

            body: JSON.stringify({
              nameTH,
              nameEN,

              // ชื่อผู้บันทึกข้อมูล
              savename: fullnamePer,

              // สถานะเริ่มต้น = เปิดใช้งาน
              active: "1",
            }),
          });
          /* ======================================================
             ตรวจสอบ Response Error
          ====================================================== */

          if (!response.ok) {

            const errorData =
              await response.json();

            throw new Error(
              errorData.message ||
              errorData.error ||
              "ไม่สามารถบันทึกข้อมูลได้"
            );
          }

          /* ======================================================
             โหลดข้อมูลใหม่หลังบันทึกสำเร็จ
          ====================================================== */

          fetchshowTopics();

          /* ======================================================
             แสดง Notification Success
          ====================================================== */

          setNotify({
            isOpen: true,
            message: "บันทึกข้อมูลสำเร็จ",
            type: "success",
          });

          /* ======================================================
             ปิด Popup ฟอร์ม
          ====================================================== */

          setOpenPopup(false);

        } catch (error) {

          /* ======================================================
             แสดง Notification Error
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
             RESET Confirm Dialog
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
       CARD ฟอร์มเพิ่มประเภทคำถาม
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
         CONTAINER หลักของฟอร์ม
      ====================================================== */}

      <Box
        px={{ xs: 2, sm: 5 }}
        mb={2}
      >

        {/* ======================================================
           หัวข้อฟอร์ม
        ====================================================== */}

        <Typography variant="h6" fontWeight={600}>
          ฟอร์มเพิ่มประเภทคำถาม
        </Typography>

        {/* ======================================================
           GRID จัด Layout ของฟอร์ม
        ====================================================== */}

        <Grid
          container
          spacing={2}
          mt={1}
        >

          {/* ======================================================
             ช่องกรอกชื่อประเภทคำถามภาษาไทย
          ====================================================== */}

          <Grid size={{ xs: 12, md: 5 }}>
            <BasicTextField
              name="ชื่อประเภทคำถาม (TH)"
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
             ช่องกรอกชื่อประเภทคำถามภาษาอังกฤษ
          ====================================================== */}

          <Grid size={{ xs: 12, md: 5 }}>
            <BasicTextField
              name="ชื่อประเภทคำถาม (EN)"
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
             ปุ่มบันทึกข้อมูล
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
                  backgroundColor:
                    theme.palette.secondary.main,
                }}
              >
                บันทึกข้อมูล
              </TextButton>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* ======================================================
         CONFIRM DIALOG สำหรับยืนยันก่อนบันทึก
      ====================================================== */}

      <ConfirmDialog
        type="add"
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
    </Paper>
  );
};

export default ComponentsFaqTypeAddForm;