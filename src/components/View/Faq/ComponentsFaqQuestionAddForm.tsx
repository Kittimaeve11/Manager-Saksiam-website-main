// “Form เพิ่ม / แก้ไข คำถามที่พบบ่อย”

"use client";

/* ======================================================
   IMPORT REACT HOOK
====================================================== */

import { useEffect, useRef, useState } from "react";

/* ======================================================
   IMPORT COMPONENT จาก MUI
====================================================== */

import {
  Box,
  Container,
  Grid,
  useTheme,
} from "@mui/material";

/* ======================================================
   IMPORT TIPTAP EDITOR
====================================================== */

import StarterKit from "@tiptap/starter-kit";

/* ======================================================
   IMPORT MENU TOOLBAR ของ mui-tiptap
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
   IMPORT NAVIGATE
====================================================== */

import { useNavigate } from "react-router-dom";

/* ======================================================
   IMPORT API และ CONTEXT
====================================================== */

import { apiFetch } from "../../../API/client";

import { useAuth } from "../../../Context/AuthContext";

import { usePageTitle } from "../../../Context/PageTitleContext";

/* ======================================================
   IMPORT COMPONENT CUSTOM
====================================================== */

import BasicTextField from "../../Model/TextField/BasicTextField";

import BasicDropDownseletedata from "../../Model/Dropdown/BasicDropDownseletedata";

import TextButton from "../../Buttom/TextButton";

import ConfirmDialog from "../../Model/Pop_up/ConfirmDialog";

import Notifications from "../../Model/Pop_up/Notifications";

import ComponentsFormSection from "../../Form/ComponentsFormSection";

import ComponentsFormCard from "../../Form/ComponentsFormCard";

import ComponentsFaqQuestionRichTextField from "./ComponentsFaqQuestionRichTextField";

/* ======================================================
   IMPORT TIPTAP EXTENSION
====================================================== */

import Placeholder from "@tiptap/extension-placeholder";

/* ======================================================
   TYPE : ประเภท notification
====================================================== */

type NotifyType =
  | "success"
  | "error"
  | "warning"
  | "info";

/* ======================================================
   TYPE : ข้อมูลประเภท FAQ
====================================================== */

type FaqTypeOption = {
  id: number; // รหัสประเภท

  nameTH: string; // ชื่อภาษาไทย

  nameEN: string; // ชื่อภาษาอังกฤษ

  active: string | number; // สถานะใช้งาน
};

/* ======================================================
   TYPE : error ของ form
====================================================== */

type FormErrors = {
  typeId?: string;

  questionTH?: string;

  questionEN?: string;

  answerTH?: string;

  answerEN?: string;
};

/* ======================================================
   เช็คว่าเปิดใช้งาน FAQ API หรือไม่
====================================================== */

const isFaqQuestionApiReady =
  import.meta.env.VITE_ENABLE_FAQ_QUESTION_API === "true";

/* ======================================================
   TIPTAP EXTENSIONS ภาษาไทย
====================================================== */

const editorExtensionsTH = [
  StarterKit,

  /* ======================================================
     placeholder ภาษาไทย
  ====================================================== */

  Placeholder.configure({
    placeholder:
      "กรุณากรอกรายละเอียดคำถามที่พบบ่อยภาษาไทย",
  }),
];

/* ======================================================
   TIPTAP EXTENSIONS ภาษาอังกฤษ
====================================================== */

const editorExtensionsEN = [
  StarterKit,

  /* ======================================================
     placeholder ภาษาอังกฤษ
  ====================================================== */

  Placeholder.configure({
    placeholder:
      "กรุณากรอกรายละเอียดคำถามที่พบบ่อยภาษาอังกฤษ",
  }),
];

/* ======================================================
   FUNCTION : editorControls
------------------------------------------------------
   toolbar controls ของ Tiptap Editor
====================================================== */

const editorControls = () => (
  <MenuControlsContainer>
    {/* ======================================================
       เลือก heading
    ====================================================== */}

    <MenuSelectHeading />

    <MenuDivider />

    {/* ======================================================
       ตัวหนา
    ====================================================== */}

    <MenuButtonBold />

    {/* ======================================================
       ตัวเอียง
    ====================================================== */}

    <MenuButtonItalic />

    {/* ======================================================
       ขีดฆ่าข้อความ
    ====================================================== */}

    <MenuButtonStrikethrough />

    {/* ======================================================
       code block
    ====================================================== */}

    <MenuButtonCode />

    <MenuDivider />

    {/* ======================================================
       bullet list
    ====================================================== */}

    <MenuButtonBulletedList />

    {/* ======================================================
       ordered list
    ====================================================== */}

    <MenuButtonOrderedList />

    {/* ======================================================
       blockquote
    ====================================================== */}

    <MenuButtonBlockquote />

    {/* ======================================================
       เส้นคั่น
    ====================================================== */}

    <MenuButtonHorizontalRule />

    {/* ======================================================
       insert / edit link
    ====================================================== */}

    <MenuButtonEditLink />
  </MenuControlsContainer>
);

/* ======================================================
   FUNCTION : stripHtml
------------------------------------------------------
   ลบ HTML tag ออกจากข้อความ
====================================================== */

const stripHtml = (html: string) =>
  html
    // ลบ html tag
    .replace(/<[^>]*>/g, "")

    // ลบ &nbsp;
    .replace(/&nbsp;/g, "")

    // trim space
    .trim();

/* ======================================================
   COMPONENT : Form เพิ่มคำถามที่พบบ่อย
====================================================== */

const ComponentsFaqQuestionAddForm = () => {
  /* ======================================================
     เรียกใช้งาน theme และ context
  ====================================================== */

  const theme = useTheme();

  const navigate = useNavigate();

  const { user } = useAuth();

  const { setTitle } = usePageTitle();

  /* ======================================================
     REF : editor ภาษาไทย / อังกฤษ
  ====================================================== */

  const answerTHRef =
    useRef<RichTextEditorRef>(null);

  const answerENRef =
    useRef<RichTextEditorRef>(null);

  /* ======================================================
     STATE : เปิด / ปิด section
  ====================================================== */

  const [typeBlockOpen, setTypeBlockOpen] =
    useState(true);

  const [detailBlockOpen, setDetailBlockOpen] =
    useState(true);

  /* ======================================================
     STATE : ประเภท FAQ
  ====================================================== */

  const [faqTypes, setFaqTypes] = useState<
    FaqTypeOption[]
  >([]);

  /* ======================================================
     STATE : form field
  ====================================================== */

  const [typeId, setTypeId] =
    useState<number | null>(null);

  const [questionTH, setQuestionTH] =
    useState("");

  const [questionEN, setQuestionEN] =
    useState("");

  /* ======================================================
     STATE : error form
  ====================================================== */

  const [error, setError] =
    useState<FormErrors>({});

  /* ======================================================
     STATE : notification
  ====================================================== */

  const [notify, setNotify] = useState<{
    isOpen: boolean;
    message: string;
    type: NotifyType;
  }>({
    isOpen: false,
    message: "",
    type: "success",
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
     EFFECT : โหลดข้อมูลประเภท FAQ
  ====================================================== */

  useEffect(() => {
    // เปลี่ยน title page
    setTitle("เพิ่มคำถามที่พบบ่อย");

    /* ======================================================
       FUNCTION : fetchFaqTypes
    ====================================================== */

    const fetchFaqTypes = async () => {
      try {
        const response = await apiFetch(
          "/api/auther/showFaqTypelistAPI",
          {
            method: "GET",
          }
        );

        // ถ้า response ไม่สำเร็จ
        if (!response.ok) return;

        const result = await response.json();

        /* ======================================================
           map ข้อมูลประเภท FAQ
        ====================================================== */

        const options = Array.isArray(
          result?.result
        )
          ? result.result.map(
            (item: any) => ({
              id: Number(
                item.faqtypeID ??
                item.int_saksiam_typefqa_id
              ),

              nameTH:
                item.faqtypenameTH ??
                item.int_saksiam_typefqa_nameTH ??
                "",

              nameEN:
                item.faqtypenameEN ??
                item.int_saksiam_typefqa_nameEN ??
                "",

              active:
                item.faqtypeactive ??
                item.int_saksiam_typefqa_active ??
                "1",
            })
          )
          : [];

        // set options
        setFaqTypes(options);
      } catch (error) {
        /* ======================================================
           error fetch FAQ type
        ====================================================== */

        console.error(
          "Error fetching FAQ types:",
          error
        );
      }
    };

    fetchFaqTypes();
  }, [setTitle]);

  /* ======================================================
     FUNCTION : handleFieldChange
------------------------------------------------------
     clear error เมื่อมีการกรอกข้อมูล
  ====================================================== */

  const handleFieldChange = (
    fieldName: string,
    value: unknown
  ) => {
    setError((prev) => ({
      ...prev,

      [fieldName]: value
        ? ""
        : prev[
        fieldName as keyof FormErrors
        ],
    }));
  };

  /* ======================================================
     FUNCTION : getEditorValues
------------------------------------------------------
     ดึงค่า HTML จาก editor
  ====================================================== */

  const getEditorValues = () => {
    const answerTH =
      answerTHRef.current?.editor?.getHTML() ??
      "";

    const answerEN =
      answerENRef.current?.editor?.getHTML() ??
      "";

    return {
      answerTH,
      answerEN,
    };
  };

  /* ======================================================
     FUNCTION : validateForm
------------------------------------------------------
     validate ข้อมูล form
  ====================================================== */

  const validateForm = () => {
    // ดึงค่าจาก editor
    const { answerTH, answerEN } =
      getEditorValues();

    /* ======================================================
       ตรวจสอบ error
    ====================================================== */

    const errors: FormErrors = {
      typeId: !typeId
        ? "กรุณาเลือกประเภทคำถามที่พบบ่อย"
        : "",

      questionTH: !questionTH
        ? "กรุณากรอกหัวข้อคำถามภาษาไทย"
        : "",

      questionEN: !questionEN
        ? "กรุณากรอกหัวข้อคำถามภาษาอังกฤษ"
        : "",

      answerTH: !stripHtml(answerTH)
        ? "กรุณากรอกรายละเอียดคำถามที่พบบ่อยภาษาไทย"
        : "",

      answerEN: !stripHtml(answerEN)
        ? "กรุณากรอกรายละเอียดคำถามที่พบบ่อยภาษาอังกฤษ"
        : "",
    };

    // set error state
    setError(errors);

    return {
      /* ======================================================
         form valid หรือไม่
      ====================================================== */

      isValid:
        !Object.values(errors).some(Boolean),

      answerTH,

      answerEN,
    };
  };


  /* ======================================================
     FUNCTION : handleSubmit
  ------------------------------------------------------
     submit form บันทึกข้อมูล FAQ
  ====================================================== */

  const handleSubmit = () => {
    /* ======================================================
       validate form
    ====================================================== */

    const validation = validateForm();

    // ถ้า form ไม่ผ่าน validation
    if (!validation.isValid) return;

    /* ======================================================
       เปิด confirm dialog
    ====================================================== */

    setConfirmDialog({
      isOpen: true,

      isLoading: false,

      onConfirm: async () => {
        /* ======================================================
           loading state
        ====================================================== */

        setConfirmDialog((prev) => ({
          ...prev,

          isLoading: true,
        }));

        try {
          /* ======================================================
             เช็คว่าเปิด API หรือยัง
          ====================================================== */

          if (!isFaqQuestionApiReady) {
            setNotify({
              isOpen: true,

              message:
                "ยังไม่ได้เปิด API สำหรับบันทึกคำถามที่พบบ่อย",

              type: "warning",
            });

            return;
          }

          /* ======================================================
             ดึงค่าล่าสุดจาก editor
          ====================================================== */

          const latestAnswers =
            getEditorValues();

          /* ======================================================
             payload สำหรับส่ง API
          ====================================================== */

          const payload = {
            typeID: typeId,

            faqtypeID: typeId,

            type: typeId,

            questionTH:
              questionTH.trim(),

            questionEN:
              questionEN.trim(),

            answerTH:
              latestAnswers.answerTH,

            answersTH:
              latestAnswers.answerTH,

            answerEN:
              latestAnswers.answerEN,

            answersEN:
              latestAnswers.answerEN,

            active: "1",

            /* ======================================================
               ชื่อผู้บันทึก
            ====================================================== */

            savename:
              `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim() ||
              "Unknown",
          };

          /* ======================================================
             เรียก API บันทึกข้อมูล
          ====================================================== */

          const response =
            await apiFetch(
              "/api/auther/createFaqQuestionAPI",
              {
                method: "POST",

                body: JSON.stringify(
                  payload
                ),
              }
            );

          const result =
            await response.json();

          /* ======================================================
             ถ้า response ไม่สำเร็จ
          ====================================================== */

          if (!response.ok) {
            throw new Error(
              result?.message ||
              result?.error ||
              `บันทึกข้อมูลไม่สำเร็จ (${response.status})`
            );
          }

          /* ======================================================
             redirect หลังบันทึกสำเร็จ
          ====================================================== */

          navigate("/Faq_Question", {
            state: {
              notify: {
                message:
                  "บันทึกข้อมูลสำเร็จ",

                type: "success",
              },
            },
          });
        } catch (error) {
          /* ======================================================
             แจ้งเตือนเมื่อเกิด error
          ====================================================== */

          setNotify({
            isOpen: true,

            message:
              error instanceof Error
                ? error.message
                : "เกิดข้อผิดพลาดในการบันทึกข้อมูล",

            type: "error",
          });
        } finally {
          /* ======================================================
             รีเซ็ตสถานะกล่องยืนยัน
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
     ส่วนแสดงผล UI
  ====================================================== */

  return (
    <Container maxWidth="xl">
      {/* ======================================================
       Card หลักของ form
      ====================================================== */}

      <ComponentsFormCard
        title="ฟอร์มการบันทึกคำถามที่พบบ่อย"
      >
        {/* ======================================================
         Section : ประเภทคำถามที่พบบ่อย
        ====================================================== */}

        <ComponentsFormSection
          title="ประเภทคำถามที่พบบ่อย"

          open={typeBlockOpen}

          onToggle={() =>
            setTypeBlockOpen(
              (prev) => !prev
            )
          }
        >
          {/* ======================================================
           dropdown เลือกประเภท FAQ
          ====================================================== */}

          <BasicDropDownseletedata
            titlename="เลือกประเภทคำถามที่พบบ่อย"
            placeholder="กรุณาเลือกประเภทคำถามที่พบบ่อย"
            selecte={typeId}
            setSelected={setTypeId}
            topon={0}
            handleFieldChange={handleFieldChange}
            error={error.typeId}
            fieldKey="typeId"
            specify
            showPlaceholderOption={false}

            /* ======================================================
               แปลงข้อมูล faqTypes เป็น option สำหรับ dropdown
            ====================================================== */

            statusOptions={faqTypes.map(
              (item) => ({
                id: item.id,
                valuename: String(
                  item.id
                ),
                labelname:
                  item.nameTH,
              })
            )}
          />
        </ComponentsFormSection>

        {/* ======================================================
         Section : รายละเอียดคำถามที่พบบ่อย
        ====================================================== */}

        <ComponentsFormSection
          title="รายละเอียดข้อมูลคำถามที่พบบ่อย"
          open={detailBlockOpen}
          onToggle={() =>
            setDetailBlockOpen(
              (prev) => !prev
            )
          }
          noMargin
        >
          <Grid
            container
            spacing={4}
          >

            {/* ======================================================
             หัวข้อคำถามภาษาไทย
            ====================================================== */}

            <Grid size={{ xs: 12, md: 6 }}>
              <BasicTextField
                name="หัวข้อคำถามภาษาไทย"
                titlename="กรุณากรอกหัวข้อคำถามภาษาไทย"
                subject={questionTH}
                setsubject={
                  setQuestionTH
                }
                topon={0}
                handleFieldChange={
                  handleFieldChange
                }
                error={error.questionTH}
                fieldKey="questionTH"
                specify
              />
            </Grid>

            {/* ======================================================
             หัวข้อคำถามภาษาอังกฤษ
            ====================================================== */}

            <Grid size={{ xs: 12, md: 6 }}>
              <BasicTextField
                name="หัวข้อคำถามภาษาอังกฤษ"
                titlename="กรุณากรอกหัวข้อคำถามภาษาอังกฤษ"
                subject={questionEN}
                setsubject={setQuestionEN}
                topon={0}
                handleFieldChange={handleFieldChange}
                error={error.questionEN}
                fieldKey="questionEN"
                specify
              />
            </Grid>

            {/* ======================================================
             ตัวแก้ไขข้อความภาษาไทยแบบ Rich Text
            ====================================================== */}

            <Grid size={{ xs: 12 }}>
              <ComponentsFaqQuestionRichTextField
                ref={answerTHRef}
                label="รายละเอียดคำถามที่พบบ่อยภาษาไทย"
                error={error.answerTH}
                extensions={editorExtensionsTH}
                content=""
                renderControls={editorControls}
              />
            </Grid>

            {/* ======================================================
              ตัวแก้ไขข้อความภาษาอังกฤษแบบ Rich Text
            ====================================================== */}

            <Grid size={{ xs: 12 }}>
              <ComponentsFaqQuestionRichTextField
                ref={answerENRef}
                label="รายละเอียดคำถามที่พบบ่อยภาษาอังกฤษ"
                error={error.answerEN}
                extensions={editorExtensionsEN}
                content=""
                renderControls={editorControls}
              />
            </Grid>
          </Grid>

          {/* ======================================================
           ปุ่มบันทึกข้อมูล
          ====================================================== */}

          <Box
            sx={{
              display: "flex",
              justifyContent:
                "flex-end",
              mt: 4,
            }}
          >
            <TextButton
              onClick={handleSubmit}
              sx={{
                backgroundColor:
                  theme.palette
                    .secondary.main,
              }}
            >
              บันทึกข้อมูล
            </TextButton>
          </Box>
        </ComponentsFormSection>
      </ComponentsFormCard>

      {/* ======================================================
       กล่องยืนยันการทำรายการ
      ====================================================== */}

      <ConfirmDialog
        type="add"
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />

      {/* ======================================================
       กล่องแจ้งเตือน Popup
      ====================================================== */}

      <Notifications
        notify={notify}
        setNotify={setNotify}
      />
    </Container>
  );
};

export default ComponentsFaqQuestionAddForm;
