// “ฟอร์มเพิ่มและแก้ไขข้อมูลวิดีโอ”

"use client";

/* ======================================================
   IMPORT React Hook
====================================================== */

import { useEffect, useState } from "react";

/* ======================================================
   IMPORT COMPONENT จาก MUI
====================================================== */

import {
  Box,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";

/* ======================================================
   IMPORT ICON
====================================================== */

import YouTubeIcon from "@mui/icons-material/YouTube";

/* ======================================================
   IMPORT LIBRARY
====================================================== */

import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

/* ======================================================
   IMPORT API และ CONTEXT
====================================================== */

import { apiFetch } from "../../../API/client";
import { useAuth } from "../../../Context/AuthContext";
import { usePageTitle } from "../../../Context/PageTitleContext";

/* ======================================================
   IMPORT COMPONENT ภายในระบบ
====================================================== */

import BasicTextField from "../../Model/TextField/BasicTextField";
import ComponentsFormCard from "../../Form/ComponentsFormCard";
import ComponentsDatePickerField from "../../Form/ComponentsDatePickerField";
import TextButton from "../../Buttom/TextButton";
import ConfirmDialog from "../../Model/Pop_up/ConfirmDialog";
import Notifications from "../../Model/Pop_up/Notifications";
import ComponentsFormSection from "../../Form/ComponentsFormSection";

/* ======================================================
   TYPE : ประเภท Notification
====================================================== */

type NotifyType =
  | "success"
  | "error"
  | "warning"
  | "info";

/* ======================================================
   TYPE : Error ของฟอร์ม
====================================================== */

type FormErrors = {

  nameTH?: string; // error ชื่อวิดีโอ

  linkURL?: string; // error ลิงก์ YouTube

  videoCreated?: string; // error วันที่วิดีโอ
};

/* ======================================================
   TYPE : Props ของ Component
====================================================== */

type ComponentsVedioAddFormProps = {

  mode?: "add" | "edit"; // โหมดเพิ่มหรือแก้ไข

  vedioId?: string | number; // id วิดีโอ
};

/* ======================================================
   FUNCTION : ดึง YouTube ID จาก URL
====================================================== */

const extractYoutubeId = (url: string) => {

  // ตัดช่องว่างหน้าและหลัง
  const trimmedUrl = url.trim();

  // ถ้าไม่มี url
  if (!trimmedUrl) return "";

  // รองรับกรณี iframe
  const iframeSrc =
    trimmedUrl.match(/src=["']([^"']+)["']/i)?.[1];

  // ใช้ iframe src ถ้ามี
  const nextUrl = iframeSrc || trimmedUrl;

  try {

    // parse URL
    const parsedUrl = new URL(nextUrl);

    // ตัด www.
    const hostname =
      parsedUrl.hostname.replace(/^www\./, "");

    /* ======================================================
       CHECK : ลิงก์ youtu.be
    ====================================================== */

    if (hostname === "youtu.be") {

      return (
        parsedUrl.pathname
          .split("/")
          .filter(Boolean)[0] ?? ""
      );
    }

    /* ======================================================
       CHECK : ลิงก์ youtube.com
    ====================================================== */

    if (hostname.includes("youtube.com")) {

      // query parameter ?v=
      const watchId =
        parsedUrl.searchParams.get("v");

      if (watchId) return watchId;

      // path เช่น embed / shorts / live
      const [type, id] =
        parsedUrl.pathname
          .split("/")
          .filter(Boolean);

      if (
        ["embed", "shorts", "live", "v"].includes(type) &&
        id
      ) {
        return id;
      }
    }

  } catch {

    /* ======================================================
       FALLBACK : ใช้ regex หา YouTube ID
    ====================================================== */

    const fallbackMatch = nextUrl.match(
      /(?:[?&]v=|youtu\.be\/|embed\/|shorts\/|live\/|\/v\/)([A-Za-z0-9_-]{6,})/
    );

    if (fallbackMatch?.[1]) {
      return fallbackMatch[1];
    }
  }

  return "";
};

/* ======================================================
   FUNCTION : normalize value สำหรับ compare
====================================================== */

const normalizeCompareValue = (
  value: unknown
) => String(value ?? "").trim();

/* ======================================================
   FUNCTION : format วันที่
====================================================== */

const formatDateValue = (
  value: Dayjs | string | null
) => {

  // ถ้าไม่มีค่า
  if (!value) return "";

  // แปลงเป็น YYYY-MM-DD
  return dayjs(value).isValid()
    ? dayjs(value).format("YYYY-MM-DD")
    : "";
};

/* ======================================================
   FUNCTION : สร้าง snapshot สำหรับ compare ข้อมูล
====================================================== */

const buildVedioSnapshot = (
  value: {
    nameTH: string;
    linkURL: string;
    videoCreated: Dayjs | string | null;
  }
) =>
  JSON.stringify({

    // normalize ชื่อวิดีโอ
    nameTH:
      normalizeCompareValue(value.nameTH),

    // normalize ลิงก์
    linkURL:
      normalizeCompareValue(value.linkURL),

    // format วันที่
    videoCreated:
      formatDateValue(value.videoCreated),
  });

/* ======================================================
   FUNCTION : normalize ข้อมูลวิดีโอจาก API
====================================================== */

const normalizeVedioDetail = (data: any) => ({

  // ชื่อวิดีโอภาษาไทย
  nameTH:
    data.nameTH_Vedio ??
    data.nameTH ??
    data.int_saksiam_vedio_nameTH ??
    "",

  // ลิงก์วิดีโอ
  linkURL:
    data.vedio_link ??
    data.linkURL ??
    data.int_saksiam_vedio_link ??
    "",

  // วันที่วิดีโอ
  videoCreated:
    data.vedio_creationdate ??
    data.videoCreated ??
    data.int_saksiam_vedio_creationdate ??
    "",
});

/* ======================================================
   COMPONENT : ฟอร์มเพิ่มและแก้ไขวิดีโอ
====================================================== */

const ComponentsVedioAddForm = ({
  mode = "add",
  vedioId,
}: ComponentsVedioAddFormProps) => {

  /* ======================================================
     THEME และ NAVIGATE
  ====================================================== */

  const theme = useTheme();

  const navigate = useNavigate();

  /* ======================================================
     CONTEXT : ข้อมูลผู้ใช้งาน
  ====================================================== */

  const { user } = useAuth();

  const { setTitle } = usePageTitle();

  /* ======================================================
     STATE : เปิด / ปิด section รายละเอียด
  ====================================================== */

  const [detailBlockOpen, setDetailBlockOpen] =
    useState(true);

  /* ======================================================
     STATE : ชื่อวิดีโอภาษาไทย
  ====================================================== */

  const [nameTH, setNameTH] =
    useState("");

  /* ======================================================
     STATE : ลิงก์ YouTube
  ====================================================== */

  const [linkURL, setLinkURL] =
    useState("");

  /* ======================================================
     STATE : วันที่วิดีโอ
  ====================================================== */

  const [videoCreated, setVideoCreated] =
    useState<Dayjs | null>(null);

  /* ======================================================
     STATE : snapshot สำหรับ compare ข้อมูล
  ====================================================== */

  const [initialSnapshot, setInitialSnapshot] =
    useState("");

  /* ======================================================
     STATE : error ของ form
  ====================================================== */

  const [error, setError] =
    useState<FormErrors>({});

  /* ======================================================
     STATE : notification popup
  ====================================================== */

  const [notify, setNotify] = useState({
    isOpen: false,
    message: "",
    type: "success" as NotifyType,
  });

  /* ======================================================
     STATE : confirm dialog
  ====================================================== */

  const [confirmDialog, setConfirmDialog] =
    useState({
      isOpen: false,
      isLoading: false,
      onConfirm: () => { },
    });

  /* ======================================================
     CHECK : ตรวจสอบว่าเป็นโหมด edit หรือไม่
  ====================================================== */

  const isEditMode = mode === "edit";

  /* ======================================================
     EFFECT : โหลดข้อมูลวิดีโอเมื่อแก้ไข
  ====================================================== */

  useEffect(() => {

    // เปลี่ยน title หน้า
    setTitle(
      isEditMode
        ? "แก้ไขวิดีโอ"
        : "เพิ่มวิดีโอ"
    );

    /* ======================================================
       FUNCTION : โหลดรายละเอียดวิดีโอ
    ====================================================== */

    const fetchDetail = async () => {

      // ถ้าไม่ใช่โหมด edit หรือไม่มี id
      if (!isEditMode || !vedioId) return;

      try {

        // เรียก API โหลดข้อมูลวิดีโอ
        const response = await apiFetch(
          `/api/auther/showVedioIDAPI/${vedioId}`,
          {
            method: "GET",
          }
        );

        // parse response json
        const result =
          await response.json().catch(() => ({}));

        // ตรวจสอบ response
        if (
          !response.ok ||
          result?.status === false
        ) {
          throw new Error(
            result?.message ||
            result?.error ||
            "ไม่พบข้อมูลวิดีโอ"
          );
        }

        // normalize ข้อมูลจาก API
        const nextValue =
          normalizeVedioDetail(
            result?.data ?? result ?? {}
          );

        // set ค่าเข้า form
        setNameTH(nextValue.nameTH);

        setLinkURL(nextValue.linkURL);

        setVideoCreated(
          nextValue.videoCreated
            ? dayjs(nextValue.videoCreated)
            : null
        );

        // เก็บ snapshot เดิมไว้ compare
        setInitialSnapshot(
          buildVedioSnapshot(nextValue)
        );

      } catch (error) {

        // แจ้งเตือนกรณีโหลดข้อมูลไม่สำเร็จ
        setNotify({
          isOpen: true,
          message:
            error instanceof Error
              ? error.message
              : "โหลดข้อมูลวิดีโอไม่สำเร็จ",
          type: "error",
        });
      }
    };

    // เรียกโหลดข้อมูล
    fetchDetail();

  }, [isEditMode, setTitle, vedioId]);

  /* ======================================================
     VARIABLE : YouTube ID
  ====================================================== */

  const youtubeID =
    extractYoutubeId(linkURL);

  /* ======================================================
     FUNCTION : clear error เมื่อกรอกข้อมูล
  ====================================================== */

  const handleFieldChange = (
    fieldName: string,
    value: unknown
  ) => {

    setError((prev) => ({
      ...prev,

      // ถ้ามีค่าให้ล้าง error
      [fieldName]:
        value
          ? ""
          : prev[fieldName as keyof FormErrors],
    }));
  };

  /* ======================================================
     FUNCTION : validate form
  ====================================================== */

  const validateForm = () => {

    const errors: FormErrors = {

      // validate ชื่อวิดีโอ
      nameTH:
        !nameTH.trim()
          ? "กรุณากรอกชื่อวิดีโอภาษาไทย"
          : "",

      // validate ลิงก์ YouTube
      linkURL:
        !linkURL.trim()
          ? "กรุณากรอกลิงก์วิดีโอ"
          : !youtubeID
            ? "กรุณากรอกลิงก์ YouTube ให้ถูกต้อง"
            : "",

      // validate วันที่วิดีโอ
      videoCreated:
        !videoCreated
          ? "กรุณาเลือกวันที่วิดีโอ"
          : "",
    };

    // set error เข้า state
    setError(errors);

    // return true เมื่อไม่มี error
    return !Object.values(errors).some(Boolean);
  };

  /* ======================================================
     FUNCTION : submit form
  ====================================================== */

  const handleSubmit = () => {

    // validate form
    if (!validateForm()) return;

    /* ======================================================
       SNAPSHOT : สร้าง snapshot ปัจจุบัน
    ====================================================== */

    const currentSnapshot =
      buildVedioSnapshot({
        nameTH,
        linkURL,
        videoCreated,
      });

    /* ======================================================
       CHECK : ตรวจสอบว่ามีการแก้ไขข้อมูลหรือไม่
    ====================================================== */

    if (
      isEditMode &&
      initialSnapshot &&
      currentSnapshot === initialSnapshot
    ) {

      // แจ้งเตือนไม่มีการเปลี่ยนแปลงข้อมูล
      setNotify({
        isOpen: true,
        message: "ไม่มีการเปลี่ยนแปลงข้อมูล",
        type: "info",
      });

      return;
    }

    /* ======================================================
       DIALOG : เปิด confirm dialog ก่อนบันทึกข้อมูล
    ====================================================== */

    setConfirmDialog({
      isOpen: true,
      isLoading: false,

      /* ======================================================
         FUNCTION : เมื่อกดยืนยันบันทึกข้อมูล
      ====================================================== */

      onConfirm: async () => {

        // เปิด loading ของ dialog
        setConfirmDialog((prev) => ({
          ...prev,
          isLoading: true,
        }));

        try {

          /* ======================================================
             VARIABLE : ชื่อผู้ใช้งาน
          ====================================================== */

          const fullName =
            `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim() ||
            "Unknown";

          /* ======================================================
             VARIABLE : YouTube ID
          ====================================================== */

          const videoId =
            extractYoutubeId(linkURL);

          /* ======================================================
             VARIABLE : วันที่วิดีโอ
          ====================================================== */

          const videoDate =
            formatDateValue(videoCreated);

          /* ======================================================
             PAYLOAD : ข้อมูลสำหรับส่ง API
          ====================================================== */

          const payload = {

            // ชื่อวิดีโอ
            nameTH: nameTH.trim(),
            nameTH_Vedio: nameTH.trim(),
            int_saksiam_vedio_nameTH: nameTH.trim(),

            // ลิงก์วิดีโอ
            linkURL: linkURL.trim(),
            vedio_link: linkURL.trim(),
            link: linkURL.trim(),
            int_saksiam_vedio_link: linkURL.trim(),

            // YouTube ID
            youtubeID: videoId,
            vedio_youtubeID: videoId,
            int_saksiam_vedio_youtubeID: videoId,

            // วันที่วิดีโอ
            videoCreated: videoDate,
            creationdate: videoDate,
            int_saksiam_vedio_creationdate: videoDate,

            /* ======================================================
               CHECK : payload สำหรับ edit หรือ add
            ====================================================== */

            ...(isEditMode
              ? {

                // ผู้แก้ไขข้อมูล
                updatename: fullName,
                int_saksiam_vedio_updatename: fullName,

                // สถานะรออนุมัติ
                active: 2,
                int_saksiam_vedio_active: 2,
              }
              : {

                // ผู้บันทึกข้อมูล
                savename: fullName,
                createname: fullName,
                int_saksiam_vedio_createname: fullName,

                // สถานะรออนุมัติ
                active: 2,
                int_saksiam_vedio_active: 2,
              }),
          };

          /* ======================================================
             API : create / update วิดีโอ
          ====================================================== */

          const response = await apiFetch(

            // เลือก endpoint ตาม mode
            isEditMode
              ? `/api/auther/updateVedioAPI/${vedioId}`
              : "/api/auther/createVedioAPI",

            {
              method: isEditMode
                ? "PUT"
                : "POST",

              body: JSON.stringify(payload),
            }
          );

          /* ======================================================
             RESPONSE : parse json
          ====================================================== */

          const result =
            await response.json().catch(() => ({}));

          /* ======================================================
             CHECK : ตรวจสอบ response
          ====================================================== */

          if (
            !response.ok ||
            result?.status === false
          ) {

            throw new Error(
              result?.message ||
              result?.error ||
              "บันทึกวิดีโอไม่สำเร็จ"
            );
          }

          /* ======================================================
             NAVIGATE : กลับหน้ารายการวิดีโอ
          ====================================================== */

          navigate("/Vedio", {
            state: {

              // notification success
              notify: {
                message: isEditMode
                  ? "แก้ไขข้อมูลวิดีโอสำเร็จ"
                  : "บันทึกข้อมูลวิดีโอสำเร็จ",

                type: "success",
              },
            },
          });

        } catch (saveError) {

          /* ======================================================
             ERROR : แจ้งเตือนเมื่อบันทึกข้อมูลไม่สำเร็จ
          ====================================================== */

          setNotify({
            isOpen: true,

            message:
              saveError instanceof Error
                ? saveError.message
                : "เกิดข้อผิดพลาดในการบันทึกวิดีโอ",

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
    <>

      {/* ======================================================
         CARD : ฟอร์มเพิ่ม / แก้ไขข้อมูลวิดีโอ
      ====================================================== */}

      <ComponentsFormCard
        title={
          isEditMode
            ? "ฟอร์มแก้ไขข้อมูลวิดีโอ"
            : "ฟอร์มการบันทึกวิดีโอ"
        }
      >

        {/* ======================================================
           SECTION : รายละเอียดข้อมูลวิดีโอ
        ====================================================== */}

        <ComponentsFormSection
          title="รายละเอียดข้อมูลวิดีโอ"

          // เปิด / ปิด section
          open={detailBlockOpen}

          // toggle section
          onToggle={() =>
            setDetailBlockOpen((prev) => !prev)
          }

          noMargin
        >

          {/* ======================================================
             GRID : layout ฟอร์มข้อมูลวิดีโอ
          ====================================================== */}

          <Grid container spacing={3}>

            {/* ======================================================
               FIELD : ชื่อวิดีโอภาษาไทย
            ====================================================== */}

            <Grid size={{ xs: 12 }}>
              <BasicTextField
                name="ชื่อวิดีโอภาษาไทย"
                titlename="กรุณากรอกชื่อวิดีโอภาษาไทย"

                // value
                subject={nameTH}

                // set value
                setsubject={setNameTH}

                topon={0}

                // validate field
                handleFieldChange={handleFieldChange}

                // error message
                error={error.nameTH}

                // key field
                fieldKey="nameTH"

                specify
              />
            </Grid>

            {/* ======================================================
               FIELD : ลิงก์วิดีโอ YouTube
            ====================================================== */}

            <Grid size={{ xs: 12, md: 8 }}>
              <BasicTextField
                name="ลิงก์วิดีโอ YouTube"
                titlename="กรุณากรอกลิงก์วิดีโอ YouTube"

                // value
                subject={linkURL}

                // set value
                setsubject={setLinkURL}

                topon={0}

                // validate field
                handleFieldChange={handleFieldChange}

                // error message
                error={error.linkURL}

                // key field
                fieldKey="linkURL"

                specify
              />
            </Grid>

            {/* ======================================================
               FIELD : วันที่วิดีโอ
            ====================================================== */}

            <Grid size={{ xs: 12, md: 4 }}>
              <ComponentsDatePickerField
                label="วันที่วิดีโอ"
                value={videoCreated}
                onChange={(value) => {
                  setVideoCreated(value);
                  handleFieldChange("videoCreated", value);
                }}
                error={error.videoCreated}
                required
              />
            </Grid>

            {/* ======================================================
               PREVIEW : แสดงตัวอย่างวิดีโอ YouTube
            ====================================================== */}

            <Grid size={{ xs: 12 }}>

              <Box
                sx={{

                  // กรอบแบบ dashed
                  border: "1px dashed",

                  // เปลี่ยนสีกรอบเมื่อมี youtube id
                  borderColor:
                    youtubeID
                      ? theme.palette.secondary.main
                      : theme.palette.grey[400],

                  // ความโค้งของกรอบ
                  borderRadius: 2,

                  // ความสูงขั้นต่ำของ preview
                  minHeight: 260,

                  // จัดตำแหน่งให้อยู่ตรงกลาง
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  // สีพื้นหลัง
                  backgroundColor: "#fff",

                  // ซ่อน overflow
                  overflow: "hidden",
                }}
              >

                {/* ======================================================
                   CHECK : ถ้ามี youtube id ให้แสดง iframe
                ====================================================== */}

                {youtubeID ? (

                  <Box
                    component="iframe"

                    // ลิงก์ embed YouTube
                    src={`https://www.youtube.com/embed/${youtubeID}`}

                    title="ตัวอย่างวิดีโอ"

                    sx={{

                      // กว้างเต็มพื้นที่
                      width: "100%",

                      // จำกัดความกว้างสูงสุด
                      maxWidth: 720,

                      // ratio วิดีโอ
                      aspectRatio: "16 / 9",

                      // ซ่อนเส้นขอบ iframe
                      border: 0,
                    }}

                    // สิทธิ์ของ iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"

                    allowFullScreen
                  />

                ) : (

                  /* ======================================================
                     EMPTY : กรณียังไม่มีลิงก์ YouTube
                  ====================================================== */

                  <Box
                    sx={{
                      textAlign: "center",
                      color: theme.palette.grey[600],
                    }}
                  >

                    {/* ======================================================
                       ICON : ไอคอน YouTube
                    ====================================================== */}

                    <YouTubeIcon
                      sx={{
                        fontSize: 64,
                        color: theme.palette.error.main,
                      }}
                    />

                    {/* ======================================================
                       TEXT : ข้อความ placeholder
                    ====================================================== */}

                    <Typography fontWeight={600}>
                      ตัวอย่างวิดีโอจะแสดงที่นี่
                    </Typography>

                    <Typography variant="body2">
                      รองรับลิงก์ YouTube
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* ======================================================
             ACTION : ปุ่มบันทึก / แก้ไขข้อมูล
          ====================================================== */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 4,
            }}
          >

            <TextButton
              onClick={handleSubmit}

              sx={{

                // เปลี่ยนสีปุ่มตาม mode
                backgroundColor:
                  isEditMode
                    ? theme.palette.warning.main
                    : theme.palette.secondary.main,
              }}
            >

              {/* ======================================================
                 TEXT : ข้อความบนปุ่ม
              ====================================================== */}

              {isEditMode
                ? "แก้ไขข้อมูล"
                : "บันทึกข้อมูล"}
            </TextButton>
          </Box>
        </ComponentsFormSection>
      </ComponentsFormCard>

      {/* ======================================================
         POPUP : กล่องยืนยันการทำรายการ
      ====================================================== */}

      <ConfirmDialog
        type={isEditMode ? "edit" : "add"}
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />

      {/* ======================================================
         POPUP : แจ้งเตือนสถานะการทำงาน
      ====================================================== */}

      <Notifications
        notify={notify}
        setNotify={setNotify}
      />
    </>
  );
};

export default ComponentsVedioAddForm;
