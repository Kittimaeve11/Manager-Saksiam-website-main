// “ฟอร์มแก้ไขประเภทคำถามที่พบบ่อย”

"use client";

/* ======================================================
   IMPORT COMPONENT จาก MUI
====================================================== */

import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";

/* ======================================================
   IMPORT React Hook และ TYPE ที่จำเป็น
====================================================== */

import { useEffect, useState } from "react";

import type { Dispatch, FC, SetStateAction } from "react";

/* ======================================================
   IMPORT API CLIENT และ COMPONENT ที่ใช้งาน
====================================================== */

// API CLIENT สำหรับเชื่อมต่อ Backend
import { apiFetch } from "../../../API/client";

// TextField สำหรับกรอกข้อมูล
import BasicTextField from "../../Model/TextField/BasicTextField";

// ปุ่มสำหรับบันทึกข้อมูล
import TextButton from "../../Buttom/TextButton";

// Popup ยืนยันก่อนแก้ไขข้อมูล
import ConfirmDialog from "../../Model/Pop_up/ConfirmDialog";

/* ======================================================
   TYPE ของ Notification Popup
====================================================== */

type NotifyType = "success" | "error" | "warning" | "info";

/* ======================================================
   TYPE ของ Props ที่ Component รับเข้ามา
====================================================== */

interface Props {
  fullnamePer: string; // ชื่อผู้ใช้งานที่ใช้บันทึกข้อมูล

  IDPer?: string; // รหัสผู้ใช้งาน

  typeUser?: string; // ประเภทผู้ใช้งาน

  setOpenPopup: Dispatch<SetStateAction<boolean>>; // function สำหรับเปิด/ปิด popup

  setNotify: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      message: string;
      type: NotifyType;
    }>
  >; // function สำหรับแสดง notification popup

  fetchFaqType: () => void; // function สำหรับโหลดข้อมูลประเภท FAQ ใหม่

  page: number; // หน้าปัจจุบันของ table

  rowsPerPage: number; // จำนวนข้อมูลต่อหน้า

  id: number | null; // id ของประเภท FAQ ที่ต้องการแก้ไข
}

/* ======================================================
   COMPONENT : ฟอร์มแก้ไขประเภทคำถามที่พบบ่อย
====================================================== */

const ComponentsFaqTypeEditForm: FC<Props> = ({
  fullnamePer,
  setOpenPopup,
  setNotify,
  fetchFaqType,
  id,
}) => {

  /* ======================================================
     เรียกใช้งาน Theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     STATE : ข้อมูลชื่อประเภท FAQ
  ====================================================== */

  const [nameTH, setNameTH] = useState("");
  const [nameEN, setNameEN] = useState("");

  /* ======================================================
     STATE : เก็บข้อความ error ของ form
  ====================================================== */

  const [error, setError] = useState({
    nameTH: "",
    nameEN: "",
  });

  /* ======================================================
     STATE : เก็บข้อมูลเดิมสำหรับตรวจสอบการแก้ไข
  ====================================================== */

  const [originalData, setOriginalData] = useState({
    nameTH: "",
    nameEN: "",
  });

  /* ======================================================
     STATE : Confirm Dialog
  ====================================================== */

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    isLoading: false,
    onConfirm: () => {},
  });

  /* ======================================================
     FUNCTION : ล้าง error เมื่อกรอกข้อมูล
  ====================================================== */

  const handleFieldChange = (fieldName: string, value: unknown) => {

    // ล้าง error ของชื่อภาษาไทย
    if (fieldName === "nameTH") {
      setError((prev) => ({
        ...prev,
        nameTH: value ? "" : prev.nameTH,
      }));
    }

    // ล้าง error ของชื่อภาษาอังกฤษ
    if (fieldName === "nameEN") {
      setError((prev) => ({
        ...prev,
        nameEN: value ? "" : prev.nameEN,
      }));
    }
  };

  /* ======================================================
     EFFECT : โหลดข้อมูลรายละเอียด FAQ Type
  ====================================================== */

  useEffect(() => {

    const fetchDetail = async () => {

      // ถ้าไม่มี id ให้หยุดทำงาน
      if (!id) return;

      try {

        // เรียก API โหลดข้อมูลประเภท FAQ
        const res = await apiFetch(`/api/auther/showFaqTypeIDAPI/${id}`, {
          method: "GET",
        });

        // ตรวจสอบ response
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        // แปลง response เป็น json
        const json = await res.json();

        const data = json.data || {};

        // รองรับชื่อ field ได้หลายรูปแบบ
        const detail = {
          nameTH:
            data.faqtypenameTH || data.int_saksiam_typefqa_nameTH || "",

          nameEN:
            data.faqtypenameEN || data.int_saksiam_typefqa_nameEN || "",
        };

        // set ค่าเข้า form
        setNameTH(detail.nameTH);
        setNameEN(detail.nameEN);

        // เก็บข้อมูลเดิมไว้ตรวจสอบการเปลี่ยนแปลง
        setOriginalData(detail);

      } catch (error) {

        console.error("Error fetching FAQ type detail:", error);

        // แจ้งเตือนกรณีโหลดข้อมูลไม่สำเร็จ
        setNotify({
          isOpen: true,
          message: "ไม่สามารถโหลดข้อมูลสำหรับแก้ไขได้",
          type: "error",
        });
      }
    };

    fetchDetail();

  }, [id, setNotify]);

  /* ======================================================
     FUNCTION : ตรวจสอบว่ามีการแก้ไขข้อมูลหรือไม่
  ====================================================== */

  const hasChanges = () =>
    nameTH !== originalData.nameTH ||
    nameEN !== originalData.nameEN;

  /* ======================================================
     FUNCTION : สร้าง payload สำหรับ update API
  ====================================================== */

  const buildUpdatePayload = () => {
    return {
      nameTH,
      nameEN,
      updatename: fullnamePer,
    };
  };

  /* ======================================================
     FUNCTION : บันทึกข้อมูลแก้ไข
  ====================================================== */

  const handleSubmit = async () => {

    // ตรวจสอบข้อมูลว่าง
    if (!nameTH || !nameEN) {

      setError({
        nameTH: !nameTH ? "กรุณากรอกชื่อภาษาไทย" : "",

        nameEN: !nameEN ? "กรุณากรอกชื่อภาษาอังกฤษ" : "",
      });

      return;
    }

    // ตรวจสอบว่ามีการแก้ไขข้อมูลหรือไม่
    if (!hasChanges()) {

      setNotify({
        isOpen: true,
        message: "ไม่มีการเปลี่ยนแปลงข้อมูล",
        type: "info",
      });

      return;
    }

    /* ======================================================
       เปิด Confirm Dialog ก่อนบันทึกข้อมูล
    ====================================================== */

    setConfirmDialog({
      isOpen: true,
      isLoading: false,

      onConfirm: async () => {

        // เปิด loading ระหว่างบันทึกข้อมูล
        setConfirmDialog((prev) => ({
          ...prev,
          isLoading: true,
        }));

        try {

          // เรียก API แก้ไขข้อมูล
          const response = await apiFetch(`/api/auther/updateFaqTypeAPI/${id}`, {
            method: "PUT",

            body: JSON.stringify(buildUpdatePayload()),
          });

          // ตรวจสอบ response
          if (!response.ok) {

            const errorData = await response.json();

            throw new Error(
              errorData.message ||
              errorData.error ||
              "ไม่สามารถแก้ไขข้อมูลได้"
            );
          }

          // โหลดข้อมูลใหม่
          fetchFaqType();

          // แจ้งเตือนสำเร็จ
          setNotify({
            isOpen: true,
            message: "แก้ไขข้อมูลสำเร็จ",
            type: "success",
          });

          // ปิด popup
          setOpenPopup(false);

        } catch (error) {

          // แจ้งเตือนกรณีเกิด error
          setNotify({
            isOpen: true,

            message:
              error instanceof Error
                ? error.message
                : "ไม่สามารถแก้ไขข้อมูลได้",

            type: "error",
          });

        } finally {

          // reset confirm dialog
          setConfirmDialog({
            isOpen: false,
            isLoading: false,
            onConfirm: () => {},
          });
        }
      },
    });
  };

  /* ======================================================
     ส่วนแสดงผล UI ของฟอร์มแก้ไขประเภทคำถาม
  ====================================================== */

  return (

    /* ======================================================
       Card Container ของฟอร์ม
    ====================================================== */

    <Paper
      elevation={0}
      sx={{
        mt: 5,
        py: 2,
        borderRadius: 3,
        width: "100%",

        // เปลี่ยนพื้นหลังตาม theme mode
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.primary.darker
            : "white",
      }}
    >

      {/* ======================================================
         Container ภายในฟอร์ม
      ====================================================== */}

      <Box
        sx={{
          px: { xs: 2, sm: 5 },
          mb: 2,
        }}
      >

        {/* ======================================================
           หัวข้อฟอร์ม
        ====================================================== */}

        <Typography
          variant="h6"
          fontWeight={600}
        >
          ฟอร์มแก้ไขประเภทคำถาม
        </Typography>

        {/* ======================================================
           Grid Layout ของฟอร์ม
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
             ปุ่มแก้ไขข้อมูล
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
                    theme.palette.warning.main,
                }}
              >
                แก้ไขข้อมูล
              </TextButton>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* ======================================================
         Confirm Dialog สำหรับยืนยันการแก้ไขข้อมูล
      ====================================================== */}

      <ConfirmDialog
        type="edit"
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
    </Paper>
  );
};


export default ComponentsFaqTypeEditForm;