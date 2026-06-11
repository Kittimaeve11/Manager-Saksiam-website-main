"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import StarterKit from "@tiptap/starter-kit";
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
import { useNavigate, useParams } from "react-router-dom";
import Placeholder from "@tiptap/extension-placeholder";

import { apiFetch } from "../../API/client";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../Context/PageTitleContext";
import BasicTextField from "../../components/Model/TextField/BasicTextField";
import CategorySelectField from "../../components/Model/Dropdown/CategorySelectField";
import TextButton from "../../components/Buttom/TextButton";
import ConfirmDialog from "../../components/Model/Pop_up/ConfirmDialog";
import Notifications from "../../components/Model/Pop_up/Notifications";
import ComponentsFormSection from "../../components/Form/ComponentsFormSection";
import ComponentsFaqQuestionRichTextField from "../../components/View/Faq/ComponentsFaqQuestionRichTextField";

type NotifyType = "success" | "error" | "warning" | "info";

type FaqTypeOption = {
  id: number;
  nameTH: string;
  nameEN: string;
  active: string | number;
};

type FormErrors = {
  typeId?: string;
  questionTH?: string;
  questionEN?: string;
  answerTH?: string;
  answerEN?: string;
};

const editorExtensionsTH = [
  StarterKit,
  Placeholder.configure({
    placeholder: "กรุณากรอกรายละเอียดคำถามที่พบบ่อยภาษาไทย",
  }),
];

const editorExtensionsEN = [
  StarterKit,
  Placeholder.configure({
    placeholder: "กรุณากรอกรายละเอียดคำถามที่พบบ่อยภาษาอังกฤษ",
  }),
];

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

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, "")
    .trim();

const normalizeCompareValue = (value: unknown) => String(value ?? "").trim();

const buildFaqQuestionSnapshot = (value: {
  typeId: number | null;
  questionTH: string;
  questionEN: string;
  answerTH: string;
  answerEN: string;
}) =>
  JSON.stringify({
    typeId: normalizeCompareValue(value.typeId),
    questionTH: normalizeCompareValue(value.questionTH),
    questionEN: normalizeCompareValue(value.questionEN),
    answerTH: normalizeCompareValue(value.answerTH),
    answerEN: normalizeCompareValue(value.answerEN),
  });

const normalizeFaqType = (item: any): FaqTypeOption => ({
  id: Number(item.faqtypeID ?? item.int_saksiam_typefqa_id ?? 0),
  nameTH: item.faqtypenameTH ?? item.int_saksiam_typefqa_nameTH ?? "",
  nameEN: item.faqtypenameEN ?? item.int_saksiam_typefqa_nameEN ?? "",
  active: item.faqtypeactive ?? item.int_saksiam_typefqa_active ?? "1",
});

const FaqQuestionEditpage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();

  const answerTHRef = useRef<RichTextEditorRef>(null);
  const answerENRef = useRef<RichTextEditorRef>(null);

  const [loading, setLoading] = useState(true);
  const [typeBlockOpen, setTypeBlockOpen] = useState(true);
  const [detailBlockOpen, setDetailBlockOpen] = useState(true);
  const [faqTypes, setFaqTypes] = useState<FaqTypeOption[]>([]);
  const [typeId, setTypeId] = useState<number | null>(null);
  const [questionTH, setQuestionTH] = useState("");
  const [questionEN, setQuestionEN] = useState("");
  const [answerTH, setAnswerTH] = useState("");
  const [answerEN, setAnswerEN] = useState("");
  const [initialSnapshot, setInitialSnapshot] = useState("");
  const [error, setError] = useState<FormErrors>({});

  const [notify, setNotify] = useState<{
    isOpen: boolean;
    message: string;
    type: NotifyType;
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    isLoading: false,
    onConfirm: () => { },
  });

  useEffect(() => {
    setTitle("แก้ไขคำถามที่พบบ่อย");

    const fetchData = async () => {
      if (!id) {
        navigate("/Faq_Question");
        return;
      }

      try {
        setLoading(true);

        const [typeResponse, detailResponse] = await Promise.all([
          apiFetch("/api/auther/showFaqTypelistAPI", { method: "GET" }),
          apiFetch(`/api/auther/showFqaIDAPI/${id}`, { method: "GET" }),
        ]);

        if (typeResponse.ok) {
          const typeResult = await typeResponse.json();
          const options = Array.isArray(typeResult?.result)
            ? typeResult.result.map(normalizeFaqType).filter((item: FaqTypeOption) => item.id)
            : [];
          setFaqTypes(options);
        }

        if (!detailResponse.ok) {
          throw new Error("ไม่พบข้อมูลคำถามที่ต้องการแก้ไข");
        }

        const detailResult = await detailResponse.json();
        const data = detailResult?.data ?? detailResult;

        const nextTypeId =
          Number(
            data.faqtypeID ??
            data.typeID ??
            data.type ??
            data.int_saksiam_fqa_type ??
            0
          ) || null;
        const nextQuestionTH =
          data.questionTH ??
          data.faqquestionTH ??
          data.int_saksiam_fqa_questionTH ??
          "";
        const nextQuestionEN =
          data.questionEN ??
          data.faqquestionEN ??
          data.int_saksiam_fqa_questionEN ??
          "";
        const nextAnswerTH =
          data.answerTH ??
          data.answersTH ??
          data.int_saksiam_fqa_answersTH ??
          "";
        const nextAnswerEN =
          data.answerEN ??
          data.answersEN ??
          data.int_saksiam_fqa_answersEN ??
          "";

        setTypeId(nextTypeId);
        setQuestionTH(nextQuestionTH);
        setQuestionEN(nextQuestionEN);
        setAnswerTH(nextAnswerTH);
        setAnswerEN(nextAnswerEN);
        setInitialSnapshot(
          buildFaqQuestionSnapshot({
            typeId: nextTypeId,
            questionTH: nextQuestionTH,
            questionEN: nextQuestionEN,
            answerTH: nextAnswerTH,
            answerEN: nextAnswerEN,
          })
        );
      } catch (error) {
        setNotify({
          isOpen: true,
          message:
            error instanceof Error
              ? error.message
              : "โหลดข้อมูลคำถามไม่สำเร็จ",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, setTitle]);

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setError((prev) => ({
      ...prev,
      [fieldName]: value ? "" : prev[fieldName as keyof FormErrors],
    }));
  };

  const handleTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setTypeId(value || null);
    handleFieldChange("typeId", value);
  };

  const getEditorValues = () => {
    const latestAnswerTH = answerTHRef.current?.editor?.getHTML() ?? answerTH;
    const latestAnswerEN = answerENRef.current?.editor?.getHTML() ?? answerEN;

    return { answerTH: latestAnswerTH, answerEN: latestAnswerEN };
  };

  const validateForm = () => {
    const latestAnswers = getEditorValues();

    const errors: FormErrors = {
      typeId: !typeId ? "กรุณาเลือกประเภทบทความ" : "",
      questionTH: !questionTH.trim() ? "กรุณากรอกหัวข้อคำถามภาษาไทย" : "",
      questionEN: !questionEN.trim() ? "กรุณากรอกหัวข้อคำถามภาษาอังกฤษ" : "",
      answerTH: !stripHtml(latestAnswers.answerTH)
        ? "กรุณากรอกรายละเอียดคำถามที่พบบ่อยภาษาไทย"
        : "",
      answerEN: !stripHtml(latestAnswers.answerEN)
        ? "กรุณากรอกรายละเอียดคำถามที่พบบ่อยภาษาอังกฤษ"
        : "",
    };

    setError(errors);
    return {
      isValid: !Object.values(errors).some(Boolean),
      ...latestAnswers,
    };
  };

  const handleSubmit = () => {
    const validation = validateForm();
    if (!validation.isValid || !id) return;

    const currentSnapshot = buildFaqQuestionSnapshot({
      typeId,
      questionTH,
      questionEN,
      answerTH: validation.answerTH,
      answerEN: validation.answerEN,
    });

    if (initialSnapshot && currentSnapshot === initialSnapshot) {
      setNotify({
        isOpen: true,
        message: "ไม่มีการเปลี่ยนแปลงข้อมูล",
        type: "info",
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
          const fullName =
            `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim() || "Unknown";

          const latestAnswers = getEditorValues();
          const payload = {
            typeID: typeId,
            faqtypeID: typeId,
            type: typeId,
            questionTH: questionTH.trim(),
            questionEN: questionEN.trim(),
            answerTH: latestAnswers.answerTH,
            answersTH: latestAnswers.answerTH,
            answerEN: latestAnswers.answerEN,
            answersEN: latestAnswers.answerEN,
            updatename: fullName,
          };

          const response = await apiFetch(`/api/auther/updateFqaAPI/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(
              result?.message ||
              result?.error ||
              `แก้ไขข้อมูลไม่สำเร็จ (${response.status})`
            );
          }

          navigate("/Faq_Question", {
            state: {
              notify: {
                message: "แก้ไขข้อมูลสำเร็จ",
                type: "success",
              },
            },
          });
        } catch (error) {
          setNotify({
            isOpen: true,
            message:
              error instanceof Error
                ? error.message
                : "เกิดข้อผิดพลาดในการแก้ไขข้อมูล",
            type: "error",
          });
        } finally {
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
    <Container maxWidth="xl">
      <Paper
        elevation={0}
        sx={{
          mt: 5,
          py: 2,
          borderRadius: 3,
          overflow: "hidden",
          width: "100%",
          backgroundColor:
            theme.palette.mode === "dark" ? theme.palette.primary.darker : "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            backgroundColor: "transparent",
            color: theme.palette.primary.dark,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              ฟอร์มแก้ไขข้อมูลคำถามที่พบบ่อย
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ px: { xs: 2, sm: 5 }, py: 4 }}>
            <ComponentsFormSection
              title="ประเภทบทความ"
              open={typeBlockOpen}
              onToggle={() => setTypeBlockOpen((prev) => !prev)}
            >
              <CategorySelectField
                label="เลือกประเภทคำถามที่พบบ่อย"
                placeholder="กรุณาเลือกประเภทคำถามที่พบบ่อย"
                value={typeId ?? 0}
                onChange={handleTypeChange}
                options={faqTypes}
                error={error.typeId}
                required
              />
            </ComponentsFormSection>

            <ComponentsFormSection
              title="รายละเอียดข้อมูลคำถามที่พบบ่อย"
              open={detailBlockOpen}
              onToggle={() => setDetailBlockOpen((prev) => !prev)}
              noMargin
            >
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <BasicTextField
                    name="หัวข้อคำถามภาษาไทย"
                    titlename="กรุณากรอกหัวข้อคำถามภาษาไทย"
                    subject={questionTH}
                    setsubject={setQuestionTH}
                    topon={0}
                    handleFieldChange={handleFieldChange}
                    error={error.questionTH}
                    fieldKey="questionTH"
                    specify
                  />
                </Grid>

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

                <Grid size={{ xs: 12 }}>
                  <ComponentsFaqQuestionRichTextField
                    ref={answerTHRef}
                    label="รายละเอียดคำถามที่พบบ่อยภาษาไทย"
                    error={error.answerTH}
                    extensions={editorExtensionsTH}
                    content={answerTH}
                    renderControls={editorControls}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <ComponentsFaqQuestionRichTextField
                    ref={answerENRef}
                    label="รายละเอียดคำถามที่พบบ่อยภาษาอังกฤษ"
                    error={error.answerEN}
                    extensions={editorExtensionsEN}
                    content={answerEN}
                    renderControls={editorControls}
                  />
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" mt={4}>
                <TextButton
                  onClick={handleSubmit}
                  sx={{ backgroundColor: theme.palette.warning.main }}
                >
                  แก้ไขข้อมูล
                </TextButton>
              </Box>
            </ComponentsFormSection>
          </Box>
        )}
      </Paper>

      <ConfirmDialog
        type="edit"
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
      <Notifications notify={notify} setNotify={setNotify} />
    </Container>
  );
};

export default FaqQuestionEditpage;
