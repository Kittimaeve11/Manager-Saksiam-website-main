"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
  Box,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
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
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../../API/client";
import { useAuth } from "../../../Context/AuthContext";
import { usePageTitle } from "../../../Context/PageTitleContext";
import BasicTextField from "../../Model/TextField/BasicTextField";
import TextButton from "../../Buttom/TextButton";
import ConfirmDialog from "../../Model/Pop_up/ConfirmDialog";
import Notifications from "../../Model/Pop_up/Notifications";
import ComponentsFormCard from "../../Form/ComponentsFormCard";
import ComponentsFormSection from "../../Form/ComponentsFormSection";
import ComponentsNewsRichTextField from "../News/ComponentsNewsRichTextField";
import ImageRemoveButton from "../../Buttom/ImageRemoveButton";

type NotifyType = "success" | "error" | "warning" | "info";

type FormErrors = {
  topicTH?: string;
  topicEN?: string;
  titleTH?: string;
  titleEN?: string;
  picture?: string;
};

type Props = {
  missionId?: string | number;
  mode?: "add" | "edit";
};

const PHOTO_BASE =
  import.meta.env.VITE_BASE_URL_API_PHOTO || import.meta.env.VITE_BASE_URL_API || "";

const buildPhotoUrl = (path?: string) => {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const base = String(PHOTO_BASE).replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  return `${base}/${cleanPath}`;
};

const isAllowedImage = (file: File) =>
  ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(file.type) ||
  /\.(jpe?g|png|gif)$/i.test(file.name);

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_MISSION_ITEMS = 10;

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, "")
    .trim();

const preserveHtmlSpacing = (html: string) =>
  html
    .split(/(<[^>]+>)/g)
    .map((part) => {
      if (part.startsWith("<") && part.endsWith(">")) return part;
      return part.replace(/ {2,}/g, (spaces) => "&nbsp;".repeat(spaces.length));
    })
    .join("");

const getMissionErrorMessage = (message?: string) => {
  const text = message?.trim();

  if (!text) return "บันทึกข้อมูลพันธกิจไม่สำเร็จ";

  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("mission picture") &&
    lowerText.includes("already exists")
  ) {
    return "รูปพันธกิจนี้มีอยู่ในระบบแล้ว";
  }

  if (lowerText.includes("mission") && lowerText.includes("already exists")) {
    return "ข้อมูลพันธกิจนี้มีอยู่ในระบบแล้ว";
  }

  return text;
};

const editorExtensionsTH = [
  StarterKit,
  Placeholder.configure({
    placeholder: "กรุณากรอกรายละเอียดพันธกิจภาษาไทย",
  }),
];

const editorExtensionsEN = [
  StarterKit,
  Placeholder.configure({
    placeholder: "กรุณากรอกรายละเอียดพันธกิจภาษาอังกฤษ",
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

const ComponentsMissionAddForm = ({ missionId, mode = "add" }: Props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const titleTHRef = useRef<RichTextEditorRef>(null);
  const titleENRef = useRef<RichTextEditorRef>(null);

  const [openDetail, setOpenDetail] = useState(true);
  const [openImage, setOpenImage] = useState(true);
  const [topicTH, setTopicTH] = useState("");
  const [topicEN, setTopicEN] = useState("");
  const [titleTH, setTitleTH] = useState("");
  const [titleEN, setTitleEN] = useState("");
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState("");
  const [originalData, setOriginalData] = useState({
    topicTH: "",
    topicEN: "",
    titleTH: "",
    titleEN: "",
    picture: "",
  });
    /* ======================================================
     ตรวจสอบว่าเป็นโหมด edit หรือไม่
  ====================================================== */

  const isEditMode =
    mode === "edit";


  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [notify, setNotify] = useState({
    isOpen: false,
    message: "",
    type: "success" as NotifyType,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    isLoading: false,
    onConfirm: () => { },
  });

  const fullName = `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim();
  const isEdit = mode === "edit";

  useEffect(() => {
    setTitle(isEdit ? "แก้ไขพันธกิจ" : "เพิ่มพันธกิจ");
  }, [isEdit, setTitle]);

  const fetchMissionDetail = useCallback(async () => {
    if (!isEdit || !missionId) return;

    try {
      const response = await apiFetch(`/api/auther/showMissionIDAPI/${missionId}`, {
        method: "GET",
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result?.status === false) {
        throw new Error(result?.message || "ไม่พบข้อมูลพันธกิจที่ต้องการแก้ไข");
      }

      const detail = result?.data ?? result?.result ?? result ?? {};
      const nextTopicTH =
        detail.topicTH ?? detail.int_saksiam_mission_topicTH ?? "";
      const nextTopicEN =
        detail.topicEN ?? detail.int_saksiam_mission_topicEN ?? "";
      const nextTitleTH =
        detail.titleTH ?? detail.int_saksiam_mission_titleTH ?? "";
      const nextTitleEN =
        detail.titleEN ?? detail.int_saksiam_mission_titleEN ?? "";
      const nextPicture =
        detail.picture ?? detail.int_saksiam_mission_picture ?? "";

      setTopicTH(nextTopicTH);
      setTopicEN(nextTopicEN);
      setTitleTH(nextTitleTH);
      setTitleEN(nextTitleEN);
      setPicturePreview(buildPhotoUrl(nextPicture));
      setOriginalData({
        topicTH: nextTopicTH,
        topicEN: nextTopicEN,
        titleTH: nextTitleTH,
        titleEN: nextTitleEN,
        picture: nextPicture,
      });
    } catch (error) {
      setNotify({
        isOpen: true,
        message:
          error instanceof Error
            ? error.message
            : "ไม่พบข้อมูลพันธกิจที่ต้องการแก้ไข",
        type: "error",
      });
    }
  }, [isEdit, missionId]);

  useEffect(() => {
    fetchMissionDetail();
  }, [fetchMissionDetail]);

  useEffect(() => {
    return () => {
      if (picturePreview.startsWith("blob:")) {
        URL.revokeObjectURL(picturePreview);
      }
    };
  }, [picturePreview]);

  const handleFieldChange = (fieldKey: string, value: unknown) => {
    setErrors((prev) => ({
      ...prev,
      [fieldKey]: String(value ?? "").trim()
        ? undefined
        : prev[fieldKey as keyof FormErrors],
    }));
  };

  const setSelectedFile = (file: File) => {
    if (!isAllowedImage(file)) {
      setErrors((prev) => ({
        ...prev,
        picture: "รองรับเฉพาะไฟล์ JPG, JPEG, PNG หรือ GIF เท่านั้น",
      }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        picture: "ขนาดรูปภาพต้องไม่เกิน 2MB",
      }));
      return;
    }

    if (picturePreview.startsWith("blob:")) {
      URL.revokeObjectURL(picturePreview);
    }

    setPictureFile(file);
    setPicturePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, picture: undefined }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  };

  const removeImage = () => {
    if (picturePreview.startsWith("blob:")) {
      URL.revokeObjectURL(picturePreview);
    }
    setPictureFile(null);
    setPicturePreview("");
  };

  const getLatestDetails = () => ({
    titleTH: titleTHRef.current?.editor?.getHTML() ?? titleTH,
    titleEN: titleENRef.current?.editor?.getHTML() ?? titleEN,
  });

  const validateForm = (details = getLatestDetails()) => {
    const nextErrors: FormErrors = {};

    if (!topicTH.trim()) nextErrors.topicTH = "กรุณากรอกหัวข้อพันธกิจภาษาไทย";
    if (!topicEN.trim()) nextErrors.topicEN = "กรุณากรอกหัวข้อพันธกิจภาษาอังกฤษ";
    if (!stripHtml(details.titleTH)) nextErrors.titleTH = "กรุณากรอกรายละเอียดพันธกิจภาษาไทย";
    if (!stripHtml(details.titleEN)) nextErrors.titleEN = "กรุณากรอกรายละเอียดพันธกิจภาษาอังกฤษ";
    if (!isEdit && !pictureFile) nextErrors.picture = "กรุณาเลือกรูปพันธกิจ";

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const hasChanged = (details = getLatestDetails()) =>
    topicTH.trim() !== originalData.topicTH ||
    topicEN.trim() !== originalData.topicEN ||
    details.titleTH !== originalData.titleTH ||
    details.titleEN !== originalData.titleEN ||
    Boolean(pictureFile);

  const fetchMissionCount = async () => {
    const query = new URLSearchParams({
      active: "",
      offset: "0",
      limit: "1",
    }).toString();

    const response = await apiFetch(`/api/auther/showMissionAPI?${query}`, {
      method: "GET",
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error("ตรวจสอบจำนวนพันธกิจไม่สำเร็จ");
    }

    const data = result?.data ?? result;
    const rawItems = data?.missions ?? result?.result ?? [];

    return Number(
      data?.counts ??
      data?.count ??
      (Array.isArray(rawItems) ? rawItems.length : 0)
    );
  };

  const saveMission = async () => {
    const details = getLatestDetails();

    if (!validateForm(details)) return;

    if (isEdit && !hasChanged(details)) {
      setNotify({
        isOpen: true,
        message: "ไม่มีการเปลี่ยนแปลงข้อมูล",
        type: "info",
      });
      return;
    }

    setSaving(true);

    try {
      if (!isEdit) {
        const missionCount = await fetchMissionCount();

        if (missionCount >= MAX_MISSION_ITEMS) {
          setNotify({
            isOpen: true,
            message: `เพิ่มข้อมูลพันธกิจได้สูงสุด ${MAX_MISSION_ITEMS} รายการ`,
            type: "warning",
          });
          return;
        }
      }

      const formData = new FormData();
      formData.append("topicTH", topicTH.trim());
      formData.append("topicEN", topicEN.trim());
      formData.append("titleTH", preserveHtmlSpacing(details.titleTH));
      formData.append("titleEN", preserveHtmlSpacing(details.titleEN));

      if (pictureFile) {
        formData.append("picture", pictureFile);
      }

      if (isEdit) {
        formData.append("updatename", fullName || "Unknown");
      } else {
        formData.append("savename", fullName || "Unknown");
        formData.append("active", "1");
      }

      const endpoint = isEdit
        ? `/api/auther/updateMissionIDAPI/${missionId}`
        : "/api/auther/createMissionAPI";

      const response = await apiFetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result?.status === false) {
        throw new Error(
          getMissionErrorMessage(result?.message || result?.error)
        );
      }

      navigate("/About/Mission", {
        state: {
          notify: {
            isOpen: true,
            message: isEdit ? "แก้ไขข้อมูลพันธกิจสำเร็จ" : "เพิ่มพันธกิจสำเร็จ",
            type: "success",
          },
        },
      });
    } catch (error) {
      setNotify({
        isOpen: true,
        message:
          error instanceof Error
            ? getMissionErrorMessage(error.message)
            : "บันทึกข้อมูลพันธกิจไม่สำเร็จ",
        type: "error",
      });
    } finally {
      setSaving(false);
      setConfirmDialog((prev) => ({
        ...prev,
        isOpen: false,
        isLoading: false,
      }));
    }
  };

  const handleSubmit = () => {
    const details = getLatestDetails();

    setTitleTH(details.titleTH);
    setTitleEN(details.titleEN);

    if (!validateForm(details)) return;

    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: saveMission,
    });
  };

  return (
    <ComponentsFormCard title={isEdit ? "ฟอร์มแก้ไขข้อมูลพันธกิจ" : "ฟอร์มการบันทึกพันธกิจ"}>
      <ComponentsFormSection
        title="รูปพันธกิจ"
        open={openImage}
        onToggle={() => setOpenImage((prev) => !prev)}
        iconType="image"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          hidden
          onChange={handleFileChange}
        />

        <Box
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: `1px dashed ${errors.picture ? theme.palette.error.main : theme.palette.grey[500]}`,
            borderRadius: 2,
            minHeight: { xs: 300, md: 340 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            p: 3,
            textAlign: "center",
          }}
        >
          {picturePreview ? (
            <Box
              sx={{
                position: "relative",
                width: { xs: 220, sm: 260 },
                height: { xs: 220, sm: 260 },
                maxWidth: "100%",
              }}
            >
              <Box
                component="img"
                src={picturePreview}
                alt="mission preview"
                sx={{
                  width: "100%",
                  height: "100%",
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                }}
              />
              <ImageRemoveButton onRemove={removeImage} />
            </Box>
          ) : (
            <Stack spacing={1.3} alignItems="center">
              <Box
                sx={{
                  width: 130,
                  height: 130,
                  borderRadius: "50%",
                  border: `1px dashed ${errors.picture
                    ? theme.palette.error.main
                    : theme.palette.mode === "dark"
                      ? theme.palette.grey[100]
                      : theme.palette.grey[400]
                    }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Box
                  sx={{
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    backgroundColor: errors.picture
                      ? theme.palette.error.lighter
                      : theme.palette.mode === "dark"
                        ? theme.palette.grey[800]
                        : "#D9D9D9",
                    transition: theme.transitions.create(
                      ["background-color", "color", "font-weight"],
                      { duration: theme.transitions.duration.shorter }
                    ),
                    "&:hover": {
                      backgroundColor: errors.picture
                        ? alpha(theme.palette.error.lighter, 0.6)
                        : theme.palette.mode === "dark"
                          ? alpha(theme.palette.grey[700], 0.7)
                          : "#AFAFAF",
                      "& .MuiSvgIcon-root": {
                        color: errors.picture
                          ? alpha(theme.palette.error.main, 0.75)
                          : theme.palette.common.white,
                      },
                      "& .MuiTypography-root": {
                        color: errors.picture
                          ? alpha(theme.palette.error.main, 0.75)
                          : theme.palette.text.primary,
                        fontWeight: 500,
                      },
                    },
                  }}
                >
                  <CameraAltIcon
                    fontSize="medium"
                    sx={{
                      color: errors.picture
                        ? theme.palette.error.main
                        : theme.palette.common.white,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      color: errors.picture
                        ? theme.palette.error.main
                        : theme.palette.text.primary,
                      fontWeight: 400,
                    }}
                  >
                    อัปโหลดรูป
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                รองรับไฟล์ภาพ *.jpeg, *.jpg, *.png, *.gif ขนาดไม่เกิน 2 MB
              </Typography>
            </Stack>
          )}
        </Box>

        {errors.picture && (
          <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
            {errors.picture}
          </Typography>
        )}
      </ComponentsFormSection>

      <ComponentsFormSection
        title="รายละเอียดข้อมูลพันธกิจ"
        open={openDetail}
        onToggle={() => setOpenDetail((prev) => !prev)}
        noMargin
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <BasicTextField
              name="หัวข้อพันธกิจภาษาไทย"
              titlename="กรุณากรอกหัวข้อพันธกิจภาษาไทย"
              subject={topicTH}
              setsubject={setTopicTH}
              topon={0}
              handleFieldChange={handleFieldChange}
              error={errors.topicTH}
              fieldKey="topicTH"
              specify
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <BasicTextField
              name="หัวข้อพันธกิจภาษาอังกฤษ"
              titlename="กรุณากรอกหัวข้อพันธกิจภาษาอังกฤษ"
              subject={topicEN}
              setsubject={setTopicEN}
              topon={0}
              handleFieldChange={handleFieldChange}
              error={errors.topicEN}
              fieldKey="topicEN"
              specify
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ComponentsNewsRichTextField
              ref={titleTHRef}
              label="รายละเอียดพันธกิจภาษาไทย"
              error={errors.titleTH}
              extensions={editorExtensionsTH}
              content={titleTH}
              renderControls={editorControls}
              onChange={(html) => {
                setTitleTH(html);
                if (stripHtml(html)) {
                  setErrors((prev) => ({ ...prev, titleTH: undefined }));
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ComponentsNewsRichTextField
              ref={titleENRef}
              label="รายละเอียดพันธกิจภาษาอังกฤษ"
              error={errors.titleEN}
              extensions={editorExtensionsEN}
              content={titleEN}
              renderControls={editorControls}
              onChange={(html) => {
                setTitleEN(html);
                if (stripHtml(html)) {
                  setErrors((prev) => ({ ...prev, titleEN: undefined }));
                }
              }}
            />
          </Grid>
        </Grid>
      </ComponentsFormSection>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <TextButton
          onClick={handleSubmit}
          loading={saving}
          sx={{
            backgroundColor:
              isEditMode
                ? theme.palette.warning.main
                : theme.palette.secondary.main,
          }}
        >
          {isEditMode
            ? "แก้ไขข้อมูล"
            : "บันทึกข้อมูล"}
        </TextButton>
      </Box>

      <ConfirmDialog
        type={isEdit ? "edit" : "add"}
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
      <Notifications notify={notify} setNotify={setNotify} />
    </ComponentsFormCard>
  );
};

export default ComponentsMissionAddForm;
