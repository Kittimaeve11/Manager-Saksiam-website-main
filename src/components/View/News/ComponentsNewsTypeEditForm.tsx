// “ฟอร์มแก้ไขประเภทข่าวสารและกิจกรรม”

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
   IMPORT API และ COMPONENT ที่ใช้งาน
====================================================== */

import { apiFetch } from "../../../API/client";
import BasicTextField from "../../Model/TextField/BasicTextField";
import TextButton from "../../Buttom/TextButton";
import ConfirmDialog from "../../Model/Pop_up/ConfirmDialog";

/* ======================================================
   TYPE : ประเภทการแจ้งเตือน
====================================================== */

type NotifyType = "success" | "error" | "warning" | "info";

/* ======================================================
   TYPE : Props ของ Component
====================================================== */

interface Props {

  fullnamePer: string; // ชื่อผู้แก้ไขข้อมูล

  setOpenPopup: Dispatch<SetStateAction<boolean>>; // เปิด/ปิด popup

  setNotify: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      message: string;
      type: NotifyType;
    }>
  >; // จัดการ notification

  fetchNewsType: () => void; // โหลดข้อมูลประเภทข่าวใหม่

  id: number | null; // id ประเภทข่าวที่ต้องการแก้ไข
}

/* ======================================================
   COMPONENT : ฟอร์มแก้ไขประเภทข่าวสารและกิจกรรม
====================================================== */

const ComponentsNewsTypeEditForm: FC<Props> = ({
  fullnamePer,
  setOpenPopup,
  setNotify,
  fetchNewsType,
  id,
}) => {

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
     STATE : เก็บข้อมูลเดิมก่อนแก้ไข
  ====================================================== */

  const [originalData, setOriginalData] = useState({
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
     EFFECT : โหลดรายละเอียดประเภทข่าว
  ====================================================== */

  useEffect(() => {

    /* ======================================================
       FUNCTION : ดึงข้อมูลรายละเอียดประเภทข่าว
    ====================================================== */

    const fetchDetail = async () => {

      // ถ้าไม่มี id ให้หยุดทำงาน
      if (!id) return;

      try {

        /* ======================================================
           API : ดึงข้อมูลประเภทข่าวตาม id
        ====================================================== */

        const res = await apiFetch(`/api/auther/showEditorialTypeIDAPI/${id}`, {
          method: "GET",
        });

        /* ======================================================
           ERROR : กรณี response ไม่สำเร็จ
        ====================================================== */

        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        /* ======================================================
           RESPONSE : แปลงข้อมูลจาก API
        ====================================================== */

        const json = await res.json();

        const data = json.data || {};

        /* ======================================================
           NORMALIZE : รองรับหลายชื่อ field จาก API
        ====================================================== */

        const detail = {

          nameTH:
            data.newstypenameTH ||
            data.editorialtypenameTH ||
            data.editorialTypeNameTH ||
            data.int_saksiam_typeeditorial_nameTH ||
            data.newsTypeNameTH ||
            data.int_saksiam_typenews_nameTH ||
            data.int_saksiam_typenew_nameTH ||
            "",

          nameEN:
            data.newstypenameEN ||
            data.editorialtypenameEN ||
            data.editorialTypeNameEN ||
            data.int_saksiam_typeeditorial_nameEN ||
            data.newsTypeNameEN ||
            data.int_saksiam_typenews_nameEN ||
            data.int_saksiam_typenew_nameEN ||
            "",
        };

        /* ======================================================
           SET STATE : กำหนดค่าลง form
        ====================================================== */

        setNameTH(detail.nameTH);
        setNameEN(detail.nameEN);

        /* ======================================================
           SET STATE : เก็บข้อมูลเดิม
        ====================================================== */

        setOriginalData(detail);

      } catch (error) {

        /* ======================================================
           ERROR : แจ้งเตือนเมื่อโหลดข้อมูลไม่สำเร็จ
        ====================================================== */

        console.error("Error fetching news type detail:", error);

        setNotify({
          isOpen: true,
          message: "ไม่สามารถโหลดข้อมูลสำหรับแก้ไขได้",
          type: "error",
        });
      }
    };

    // เรียกใช้งานโหลดข้อมูล
    fetchDetail();

  }, [id, setNotify]);


  /* ======================================================
     FUNCTION : ตรวจสอบว่ามีการแก้ไขข้อมูลหรือไม่
  ====================================================== */

  const hasChanges = () =>
    nameTH !== originalData.nameTH || nameEN !== originalData.nameEN;

  /* ======================================================
     FUNCTION : จัดการบันทึกข้อมูลแก้ไข
  ====================================================== */

  const handleSubmit = async () => {

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
       VALIDATE : ตรวจสอบว่ามีการแก้ไขข้อมูลหรือไม่
    ====================================================== */

    if (!hasChanges()) {

      setNotify({
        isOpen: true,
        message: "ไม่มีการเปลี่ยนแปลงข้อมูล",
        type: "info",
      });

      return;
    }

    /* ======================================================
       DIALOG : เปิด popup ยืนยันการแก้ไขข้อมูล
    ====================================================== */

    setConfirmDialog({
      isOpen: true,
      isLoading: false,

      /* ======================================================
         FUNCTION : เมื่อกดยืนยันการแก้ไข
      ====================================================== */

      onConfirm: async () => {

        /* ======================================================
           STATE : เปิด loading ระหว่างบันทึกข้อมูล
        ====================================================== */

        setConfirmDialog((prev) => ({
          ...prev,
          isLoading: true,
        }));

        try {

          /* ======================================================
             API : ส่งข้อมูลแก้ไขประเภทข่าวและกิจกรรม
          ====================================================== */

          const response = await apiFetch(`/api/auther/updateEditorialTypeAPI/${id}`, {
            method: "PUT",
            body: JSON.stringify({
              nameTH,
              nameEN,
              updatename: fullnamePer,
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
              "ไม่สามารถแก้ไขข้อมูลได้"
            );
          }

          /* ======================================================
             REFRESH : โหลดข้อมูลประเภทข่าวใหม่
          ====================================================== */

          fetchNewsType();

          /* ======================================================
             NOTIFY : แจ้งเตือนบันทึกสำเร็จ
          ====================================================== */

          setNotify({
            isOpen: true,
            message: "แก้ไขข้อมูลสำเร็จ",
            type: "success",
          });

          /* ======================================================
             POPUP : ปิด popup ฟอร์ม
          ====================================================== */

          setOpenPopup(false);

        } catch (error) {

          /* ======================================================
             ERROR : แจ้งเตือนเมื่อเกิดข้อผิดพลาด
          ====================================================== */

          setNotify({
            isOpen: true,
            message:
              error instanceof Error
                ? error.message
                : "ไม่สามารถแก้ไขข้อมูลได้",
            type: "error",
          });

        } finally {

          /* ======================================================
             RESET : รีเซ็ต confirm dialog
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

  /* ======================================================
     UI : ฟอร์มแก้ไขประเภทข่าวและกิจกรรม
  ====================================================== */

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 5,
        py: 2,
        borderRadius: 3,
        width: "100%",

        /* ======================================================
           STYLE : สีพื้นหลังตามโหมด Light / Dark
        ====================================================== */

        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.primary.darker
            : "white",
      }}
    >

      {/* ======================================================
       CONTAINER : ครอบเนื้อหาภายในฟอร์ม
    ====================================================== */}

      <Box sx={{ px: { xs: 2, sm: 5 }, mb: 2 }}>

        {/* ======================================================
         TITLE : หัวข้อฟอร์ม
      ====================================================== */}

        <Typography variant="h6" fontWeight={600}>
          ฟอร์มแก้ไขประเภทข่าวและกิจกรรม
        </Typography>

        {/* ======================================================
         GRID : จัด layout ฟอร์ม
      ====================================================== */}

        <Grid container spacing={2} mt={1}>

          {/* ======================================================
           INPUT : ชื่อประเภทข่าวและกิจกรรมภาษาไทย
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
           INPUT : ชื่อประเภทข่าวและกิจกรรมภาษาอังกฤษ
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
           ACTION : ปุ่มแก้ไขข้อมูล
        ====================================================== */}

          <Grid size={{ xs: 12, md: 2 }}>
            <Box display="flex" justifyContent="flex-end" mt={4}>
              <TextButton
                onClick={handleSubmit}
                sx={{ backgroundColor: theme.palette.warning.main }}
              >
                แก้ไขข้อมูล
              </TextButton>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* ======================================================
       POPUP : Confirm Dialog ยืนยันการแก้ไขข้อมูล
    ====================================================== */}

      <ConfirmDialog
        type="edit"
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
    </Paper>
  );
};

export default ComponentsNewsTypeEditForm;