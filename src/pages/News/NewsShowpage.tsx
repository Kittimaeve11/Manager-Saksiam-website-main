"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import ImageIcon from "@mui/icons-material/Image";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../../API/client";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../Context/PageTitleContext";
import SwitchButton from "../../components/Buttom/SwitchButton";
import TextButton from "../../components/Buttom/TextButton";
import ApprovalDecisionCard from "../../components/Approval/ApprovalDecisionCard";
import ApprovalReasonDisplay, {
  firstApprovalReason,
  getApprovalReasonFromRecord,
} from "../../components/Approval/ApprovalReasonDisplay";
import ApprovalReasonDialog from "../../components/Approval/ApprovalReasonDialog";
import PublishReasonDialog from "../../components/Approval/PublishReasonDialog";
import Notifications from "../../components/Model/Pop_up/Notifications";
import ComponentsDateTable from "../../components/Model/Table/ComponentsDateTable";
import { parseGallery } from "../../utils/Format/format-JSON";

type NotifyType = "success" | "error" | "warning" | "info";
type ApprovalDecision = "" | "approve" | "reject" | "edit";
type ContentLanguage = "th" | "en";

type NewsDetail = {
  id: number;
  typeNameTH: string;
  typeNameEN: string;
  titleTH: string;
  titleEN: string;
  descriptionTH: string;
  descriptionEN: string;
  active: string;
  pin: string;
  createname: string;
  updatename: string;
  createAt: string;
  updateAt: string | null;
  approvename: string;
  approvedate: string | null;
  rejectReason: string;
  images: string[];
};

const PHOTO_BASE =
  import.meta.env.VITE_BASE_URL_API_PHOTO || import.meta.env.VITE_BASE_URL_API || "";

const detailEndpoints = [
  "/api/auther/showEditorialIDAPI",
  "/api/auther/showNewsIDAPI",
  "/api/auther/showNewsActivityIDAPI",
];

const updateEndpoints = [
  "/api/auther/updateEditorialAPI",
  "/api/auther/updateNewsAPI",
  "/api/auther/updateNewsActivityAPI",
];

const newsListEndpoints = [
  "/api/auther/showEditorialAPI",
  "/api/auther/showEditorialDataAPI",
  "/api/auther/showNewsAPI",
  "/api/auther/showNewsDataAPI",
];

const normalizeGallery = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const image = item as Record<string, unknown>;
          return (
            image.url ??
            image.path ??
            image.src ??
            image.image ??
            image.file ??
            image.name ??
            ""
          );
        }
        return "";
      })
      .filter((item): item is string => typeof item === "string" && Boolean(item));
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = parseGallery(value);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((item): item is string => typeof item === "string" && Boolean(item));
    }

    return [value];
  }

  return [];
};

const buildPhotoUrl = (path: string) => {
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const base = String(PHOTO_BASE).replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  return `${base}/${cleanPath}`;
};

const normalizeDetail = (data: any, fallbackId = 0): NewsDetail => {
  const payload = data?.data ?? data?.result ?? data;
  const detail = Array.isArray(payload) ? payload[0] ?? {} : payload ?? {};
  const activeValue = String(
    detail.active ??
      detail.editoria_active ??
      detail.editorialactive ??
      detail.int_saksiam_editoria_active ??
      detail.int_saksiam_editorial_active ??
      "0"
  );
  const rejectReason =
    activeValue === "4"
      ? firstApprovalReason(
          getApprovalReasonFromRecord(activeValue, detail, "int_saksiam_editoria"),
          detail.improvement,
          detail.improvement_text,
          detail.improvementText,
          detail.editoria_improvement,
          detail.editoria_improvement_text,
          detail.editorial_improvement,
          detail.editorial_improvement_text,
          detail.int_saksiam_editoria_improvement,
          detail.int_saksiam_editoria_improvement_text,
          detail.int_saksiam_editorial_improvement,
          detail.int_saksiam_editorial_improvement_text,
          detail.rejectReason,
          detail.reason,
          detail.note,
          detail.editoria_note,
          detail.editorial_note,
          detail.int_saksiam_editoria_note,
          detail.int_saksiam_editorial_note
        )
      : activeValue === "0"
        ? firstApprovalReason(
            getApprovalReasonFromRecord(activeValue, detail, "int_saksiam_editoria"),
            detail.cancellation,
            detail.cancelReason,
            detail.editoria_cancellation,
            detail.editorial_cancellation,
            detail.int_saksiam_editoria_cancellation,
            detail.int_saksiam_editorial_cancellation,
            detail.rejectReason,
            detail.reason,
            detail.note,
            detail.editoria_note,
            detail.editorial_note,
            detail.int_saksiam_editoria_note,
            detail.int_saksiam_editorial_note
          )
        : firstApprovalReason(
            getApprovalReasonFromRecord(activeValue, detail, "int_saksiam_editoria"),
            detail.note,
            detail.rejectReason,
            detail.reason,
            detail.editoria_note,
            detail.editorial_note,
            detail.int_saksiam_editoria_note,
            detail.int_saksiam_editorial_note,
            detail.cancellation,
            detail.editoria_cancellation,
            detail.int_saksiam_editoria_cancellation
          );
  const galleryCandidates = [
    normalizeGallery(detail.galleryList),
    normalizeGallery(detail.gallaryList),
    normalizeGallery(detail.gallery),
    normalizeGallery(detail.gallary),
    normalizeGallery(detail.editoriagallery),
    normalizeGallery(detail.editoria_gallery),
    normalizeGallery(detail.editoria_gallary),
    normalizeGallery(detail.int_saksiam_editoria_gallary),
  ];
  const gallery = galleryCandidates.find((item) => item.length > 0) ?? [];
  const singleImage =
    detail.image ??
    detail.imageURL ??
    detail.editorialimage ??
    detail.newsimage ??
    detail.int_saksiam_editoria_image ??
    "";

  return {
    id: Number(
      detail.id ??
        detail.editorialID ??
        detail.editoriaID ??
        detail.newsID ??
        detail.int_saksiam_editoria_id ??
        detail.int_saksiam_editorial_id ??
        fallbackId
    ),
    typeNameTH:
      detail.typeNameTH ??
      detail.editorialtypeNameTH ??
      detail.editorialtypenameTH ??
      detail.int_saksiam_typeeditorial_nameTH ??
      "-",
    typeNameEN:
      detail.typeNameEN ??
      detail.editorialtypeNameEN ??
      detail.editorialtypenameEN ??
      detail.int_saksiam_typeeditorial_nameEN ??
      "",
    titleTH:
      detail.titleTH ??
      detail.editorialtitleTH ??
      detail.titieTH ??
      detail.int_saksiam_editoria_titieTH ??
      detail.int_saksiam_editorial_titleTH ??
      "",
    titleEN:
      detail.titleEN ??
      detail.editorialtitleEN ??
      detail.titieEN ??
      detail.int_saksiam_editoria_titieEN ??
      detail.int_saksiam_editorial_titleEN ??
      "",
    descriptionTH:
      detail.descriptionTH ??
      detail.detailTH ??
      detail.contentTH ??
      detail.int_saksiam_editoria_descriptionTH ??
      detail.int_saksiam_editorial_detailTH ??
      "",
    descriptionEN:
      detail.descriptionEN ??
      detail.detailEN ??
      detail.contentEN ??
      detail.int_saksiam_editoria_descriptionEN ??
      detail.int_saksiam_editorial_detailEN ??
      "",
    active: activeValue,
    pin: String(
      detail.pin ??
        detail.editoria_pin ??
        detail.editorialpin ??
        detail.int_saksiam_editoria_pin ??
        detail.int_saksiam_editorial_pin ??
        "0"
    ),
    createname:
      detail.createname ??
      detail.savename ??
      detail.editoria_createname ??
      detail.int_saksiam_editoria_createname ??
      "-",
    updatename:
      detail.updatename ??
      detail.updateName ??
      detail.editoria_updatename ??
      detail.int_saksiam_editoria_updatename ??
      detail.int_saksiam_editorial_updatename ??
      "",
    createAt:
      detail.createAt ??
      detail.editoria_creacteAt ??
      detail.int_saksiam_editoria_creacteAt ??
      detail.int_saksiam_editorial_createAt ??
      "",
    updateAt:
      detail.updateAt ??
      detail.int_saksiam_editoria_updateAt ??
      detail.int_saksiam_editorial_updateAt ??
      null,
    approvename:
      detail.approvename ??
      detail.approveName ??
      detail.editoria_approvename ??
      detail.int_saksiam_editoria_approvename ??
      detail.int_saksiam_editorial_approvename ??
      detail.changename ??
      detail.chagename ??
      detail.changeName ??
      detail.editoria_chagename ??
      detail.int_saksiam_editoria_chagename ??
      detail.int_saksiam_editoria_changename ??
      "-",
    approvedate:
      detail.approvedate ??
      detail.approveDate ??
      detail.editoria_approvedate ??
      detail.int_saksiam_editoria_approvedate ??
      detail.int_saksiam_editorial_approvedate ??
      detail.changetime ??
      detail.changeTime ??
      detail.editoria_changetime ??
      detail.int_saksiam_editoria_changetime ??
      null,
    rejectReason,
    images: gallery.length ? gallery : normalizeGallery(singleImage),
  };
};

const getNewsCode = (item: any) =>
  String(
    item.code ??
      item.editoriaNum ??
      item.editoria_num ??
      item.editorialNum ??
      item.editorialnum ??
      item.newsNum ??
      item.int_saksiam_editoria_num ??
      item.int_saksiam_editorial_num ??
      ""
  );

const getNewsId = (item: any) =>
  Number(
    item.id ??
      item.editorialID ??
      item.editoriaID ??
      item.newsID ??
      item.int_saksiam_editoria_id ??
      item.int_saksiam_editorial_id ??
      0
  );

const getNewsList = (result: any) => {
  const data = result?.data ?? result;
  const rawNews =
    data?.editorias ??
    data?.editorials ??
    data?.editorial ??
    data?.articles ??
    data?.news ??
    data?.items ??
    result?.result ??
    [];

  return Array.isArray(rawNews) ? rawNews : [];
};

const resolveNewsId = async (code: string) => {
  if (/^\d+$/.test(code)) return code;

  const query = new URLSearchParams({
    typeID: "",
    status: "",
    active: "",
    startDate: "",
    endDate: "",
    postStartDate: "",
    postEndDate: "",
    createStartDate: "",
    createEndDate: "",
    offset: "0",
    limit: "1000",
  }).toString();

  for (const endpoint of newsListEndpoints) {
    const response = await apiFetch(`${endpoint}?${query}`, { method: "GET" });
    if (!response.ok) {
      if (response.status === 404) continue;
      break;
    }

    const result = await response.json();
    const found = getNewsList(result).find((item) => getNewsCode(item) === code);
    const foundId = found ? getNewsId(found) : 0;

    if (foundId) return String(foundId);
  }

  throw new Error("ไม่พบข้อมูลข่าวสารและกิจกรรมตามรหัสบทความนี้");
};

const getStatusChip = (active: string) => {
  if (active === "1") return { label: "กำลังใช้งาน", bg: "#d7f1e2", text: "#48af75" };
  if (active === "2") return { label: "รอการอนุมัติ", bg: "#FFF6E6", text: "#FFAA37" };
  if (active === "4") return { label: "รอการแก้ไข", bg: "#FFF6E6", text: "#FFAA37" };
  if (active === "3") return { label: "ไม่อนุมัติ", bg: "#ffe6eb", text: "#ff3741" };
  return { label: "ยกเลิก", bg: "#e7e3e3", text: "#3b3a3a" };
};

const NewsShowpage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { code } = useParams();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishReason, setPublishReason] = useState("");
  const [publishReasonError, setPublishReasonError] = useState("");
  const [pendingDecision, setPendingDecision] = useState<ApprovalDecision>("reject");
  const [approvalDecision, setApprovalDecision] = useState<ApprovalDecision>("");
  const [language, setLanguage] = useState<ContentLanguage>("th");
  const [notify, setNotify] = useState({
    isOpen: false,
    message: "",
    type: "success" as NotifyType,
  });

  const fullName = `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim() || "Unknown";
  const status = useMemo(
    () => getStatusChip(newsDetail?.active ?? "0"),
    [newsDetail?.active]
  );
  const hasApproveInfo =
    ["0", "1", "3"].includes(String(newsDetail?.active ?? "")) &&
    Boolean(newsDetail?.approvedate) &&
    Boolean(newsDetail?.approvename) &&
    newsDetail?.approvename !== "-";
  const currentStatus = newsDetail?.active ?? "";
  const isPendingApproval = currentStatus === "2";
  const isRejected = currentStatus === "3";
  const isRevisionRequested = currentStatus === "4";
  const isUnpublished = currentStatus === "0";
  const canTogglePublish = ["0", "1"].includes(currentStatus);
  const displayOwner =
    newsDetail?.updateAt
      ? newsDetail.updatename || newsDetail.createname || "-"
      : newsDetail?.createname || "-";
  const displayOwnerDate = newsDetail?.updateAt || newsDetail?.createAt || "";
  const currentTitle = language === "th" ? newsDetail?.titleTH : newsDetail?.titleEN;
  const currentDescription =
    language === "th" ? newsDetail?.descriptionTH : newsDetail?.descriptionEN;

  useEffect(() => {
    setTitle("รายละเอียดข่าวสารและกิจกรรม");

    const fetchDetail = async () => {
      if (!code) {
        navigate("/News_Activity");
        return;
      }

      try {
        setLoading(true);
        let response: Response | null = null;
        const detailId = await resolveNewsId(code);

        for (const endpoint of detailEndpoints) {
          response = await apiFetch(`${endpoint}/${detailId}`, { method: "GET" });
          if (response.ok || response.status !== 404) break;
        }

        if (!response?.ok) {
          throw new Error(`ไม่พบข้อมูลข่าวสารและกิจกรรม (${response?.status ?? 404})`);
        }

        const result = await response.json();
        setNewsDetail(normalizeDetail(result?.data ?? result ?? {}, Number(detailId) || 0));
      } catch (error) {
        setNotify({
          isOpen: true,
          message:
            error instanceof Error
              ? error.message
              : "โหลดข้อมูลข่าวสารและกิจกรรมไม่สำเร็จ",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [code, navigate, setTitle]);

  const updateEditorialStatus = async (payload: Record<string, string>) => {
    let response: Response | null = null;
    const updateId = newsDetail?.id;

    if (!updateId) {
      throw new Error("ไม่พบรหัสข้อมูลข่าวสารและกิจกรรม");
    }

    for (const endpoint of updateEndpoints) {
      response = await apiFetch(`${endpoint}/${updateId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (response.ok || response.status !== 404) break;
    }

    const result = await response?.json().catch(() => ({}));
    if (!response?.ok) {
      throw new Error(result?.message || result?.error || "อัปเดตสถานะไม่สำเร็จ");
    }
  };

  const handlePublishChange = async (checked: boolean) => {
    if (!newsDetail) return;

    if (!checked) {
      setPublishDialogOpen(true);
      setPublishReason("");
      setPublishReasonError("");
      return;
    }

    try {
      setUpdating(true);
      await updateEditorialStatus({
        active: "1",
        changename: fullName,
        updatename: fullName,
      });

      setNewsDetail((prev) =>
        prev
          ? {
              ...prev,
              active: "1",
              updatename: fullName,
              updateAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            }
          : prev
      );
      setNotify({
        isOpen: true,
        message: "เปิดเผยแพร่ข้อมูลสำเร็จ",
        type: "success",
      });
    } catch (error) {
      setNotify({
        isOpen: true,
        message:
          error instanceof Error ? error.message : "ไม่สามารถอัปเดตสถานะเผยแพร่ได้",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePublishCloseConfirm = async () => {
    if (!newsDetail) return;

    const cleanReason = publishReason.trim();
    if (!cleanReason) {
      setPublishReasonError("กรุณากรอกเหตุผลที่ต้องปิดเผยแพร่");
      return;
    }

    try {
      setUpdating(true);
      await updateEditorialStatus({
        active: "0",
        changename: fullName,
        updatename: fullName,
        note: cleanReason,
        reason: cleanReason,
        rejectReason: cleanReason,
        cancellation: cleanReason,
        improvement_text: cleanReason,
      });

      setNewsDetail((prev) =>
        prev
          ? {
              ...prev,
              active: "0",
              updatename: fullName,
              updateAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
              rejectReason: cleanReason,
            }
          : prev
      );
      setPublishDialogOpen(false);
      setPublishReason("");
      setPublishReasonError("");
      setNotify({
        isOpen: true,
        message: "ปิดเผยแพร่ข้อมูลสำเร็จ",
        type: "success",
      });
    } catch (error) {
      setNotify({
        isOpen: true,
        message:
          error instanceof Error ? error.message : "ไม่สามารถปิดเผยแพร่ข้อมูลได้",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleApprovalDecision = async (decision: ApprovalDecision, reason = "") => {
    if (!newsDetail) return;

    const approvedate = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const cleanReason = reason.trim();
    const approved = decision === "approve";

    try {
      setUpdating(true);
      await updateEditorialStatus({
        active: decision === "approve" ? "1" : decision === "reject" ? "3" : "4",
        changename: fullName,
        approvename: fullName,
        approvedate,
        note: approved ? "" : cleanReason,
        reason: approved ? "" : cleanReason,
        rejectReason: approved ? "" : cleanReason,
        cancellation: approved ? "" : cleanReason,
        improvement_text: approved ? "" : cleanReason,
      });

      setNewsDetail((prev) =>
        prev
          ? {
              ...prev,
              active: decision === "approve" ? "1" : decision === "reject" ? "3" : "4",
              approvename: fullName,
              approvedate,
              rejectReason: approved ? "" : cleanReason,
            }
          : prev
      );
      setRejectDialogOpen(false);
      setRejectReason("");
      setRejectReasonError("");
      setNotify({
        isOpen: true,
        message:
          decision === "approve"
            ? "อนุมัติและเผยแพร่ข้อมูลสำเร็จ"
            : decision === "reject"
              ? "ไม่อนุมัติข้อมูลสำเร็จ"
              : "ส่งกลับให้แก้ไขข้อมูลสำเร็จ",
        type: "success",
      });
    } catch (error) {
      setNotify({
        isOpen: true,
        message:
          error instanceof Error ? error.message : "ไม่สามารถบันทึกผลการอนุมัติได้",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectClick = (decision: ApprovalDecision) => {
    setPendingDecision(decision);
    setApprovalDecision(decision);
    setRejectReason(newsDetail?.rejectReason || "");
    setRejectReasonError("");
    setRejectDialogOpen(true);
  };

  const handleDecisionChange = (decision: ApprovalDecision) => {
    setApprovalDecision(decision);

    if (decision === "reject" || decision === "edit") {
      handleRejectClick(decision);
    }
  };

  const handleRejectConfirm = () => {
    const cleanReason = rejectReason.trim();

    if (!cleanReason) {
      setRejectReasonError(
        pendingDecision === "edit"
          ? "กรุณากรอกเหตุผลที่ต้องแก้ไข"
          : "กรุณากรอกเหตุผลที่ไม่อนุมัติ"
      );
      return;
    }

    handleApprovalDecision(pendingDecision, cleanReason);
  };

  const handleReportSubmit = () => {
    if (!approvalDecision) {
      setNotify({
        isOpen: true,
        message: "กรุณาเลือกผลการอนุมัติ",
        type: "warning",
      });
      return;
    }

    if (approvalDecision === "approve") {
      handleApprovalDecision("approve");
      return;
    }

    handleRejectClick(approvalDecision);
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Paper elevation={0} sx={{ mt: 5, py: 8, borderRadius: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 5, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              color: "#fff",
              display: "inline-flex",
            }}
          >
            ตรวจสอบข่าวสารและกิจกรรม
          </Typography>
          {/* <TextButton onClick={() => navigate("/News_Activity")}>กลับ</TextButton> */}
        </Box>

        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 3,
                p: { xs: 2.5, md: 4 },
                minHeight: 520,
                backgroundColor: "#fff",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 4 }}>
                <Typography variant="h5" fontWeight={700}>
                  {currentTitle || "-"}
                </Typography>
                <TextField
                  select
                  size="small"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as ContentLanguage)}
                  sx={{
                    minWidth: 120,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      backgroundColor: "#fff",
                    },
                  }}
                >
                  <MenuItem value="th">ภาษาไทย</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </TextField>
              </Box>

              {newsDetail?.images[0] && (
                <Box
                  component="img"
                  src={buildPhotoUrl(newsDetail.images[0])}
                  alt={currentTitle || "news-cover"}
                  sx={{
                    display: "block",
                    width: { xs: "100%", md: "82%" },
                    height: { xs: 260, md: 360 },
                    objectFit: "cover",
                    mx: "auto",
                    mb: 4,
                    borderRadius: 3,
                    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
                  }}
                />
              )}

              <Box
                sx={{
                  whiteSpace: "pre-wrap",
                  "& p": { mt: 0, mb: 1, whiteSpace: "pre-wrap" },
                  "& ul, & ol": { pl: 3 },
                  mb: 4,
                }}
                dangerouslySetInnerHTML={{ __html: currentDescription || "-" }}
              />

              {newsDetail?.images.slice(1).length ? (
                <Grid container spacing={2} justifyContent="center">
                  {newsDetail.images.slice(1, 10).map((image, index) => (
                    <Grid key={`${image}-${index}`} size={{ xs: 6, md: 3 }}>
                      <Box
                        component="img"
                        src={buildPhotoUrl(image)}
                        alt={`gallery-${index}`}
                        sx={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          boxShadow: "0 6px 16px rgba(15, 23, 42, 0.08)",
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : null}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: "grid", gap: 3 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, backgroundColor: "#fff" }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                  วันที่อัปโหลดข้อมูล
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <AccessTimeIcon fontSize="small" />
                  <Typography variant="body2">
                    {displayOwnerDate ? dayjs(displayOwnerDate).format("DD MMM YYYY") : "-"}
                  </Typography>
                </Box>

                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  อัปโหลดข้อมูลโดย
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <PersonIcon fontSize="small" />
                  <Typography variant="body2">{displayOwner}</Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Typography fontWeight={700}>สถานะ:</Typography>
                  <Chip
                    label={status.label}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      backgroundColor: status.bg,
                      color: status.text,
                    }}
                  />
                </Box>

                <ApprovalReasonDisplay active={currentStatus} reason={newsDetail?.rejectReason} />
              </Paper>

              {isPendingApproval && (
                <ApprovalDecisionCard
                  approverName={fullName}
                  value={approvalDecision}
                  onChange={(value) => handleDecisionChange(value as ApprovalDecision)}
                />
              )}

              {canTogglePublish && (
                <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, backgroundColor: "#fff" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography fontWeight={700}>เผยแพร่</Typography>
                    <SwitchButton
                      checked={newsDetail?.active === "1"}
                      handleChange={(event) => handlePublishChange(event.target.checked)}
                    />
                  </Box>
                </Paper>
              )}

              {isPendingApproval && (
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <TextButton
                    loading={updating}
                    onClick={handleReportSubmit}
                    sx={{ backgroundColor: theme.palette.secondary.main }}
                  >
                    บันทึกการรายงานผล
                  </TextButton>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Paper elevation={0} sx={{ display: "none", mt: 5, py: 2, borderRadius: 3, width: "100%" }}>
        <Box sx={{ px: { xs: 2, sm: 5 }, mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EditSquareIcon sx={{ color: theme.palette.primary.dark }} />
              <Typography variant="h6" fontWeight={600} color={theme.palette.primary.dark}>
                รายละเอียดข่าวสารและกิจกรรม
              </Typography>
            </Box>

            {/* <TextButton onClick={() => navigate("/News_Activity")}>กลับ</TextButton> */}
          </Box>

          <Paper variant="outlined" sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                backgroundColor: theme.palette.primary.dark,
                color: "white",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EditSquareIcon />
                <Typography fontWeight={600}>ข้อมูลการเผยแพร่</Typography>
              </Box>
              {isPendingApproval ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextButton
                    loading={updating}
                    customColor="#48af75"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleApprovalDecision("approve")}
                  >
                    อนุมัติ
                  </TextButton>
                  <TextButton
                    loading={updating}
                    customColor="#ff3741"
                    startIcon={<CancelIcon />}
                    onClick={() => handleRejectClick("reject")}
                  >
                    ไม่อนุมัติ
                  </TextButton>
                </Box>
              ) : canTogglePublish ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography fontWeight={600}>เผยแพร่</Typography>
                  <Box
                    sx={{
                      opacity: updating ? 0.5 : 1,
                      pointerEvents: updating ? "none" : "auto",
                    }}
                  >
                    <SwitchButton
                      checked={newsDetail?.active === "1"}
                      handleChange={(event) => handlePublishChange(event.target.checked)}
                    />
                  </Box>
                </Box>
              ) : null}
            </Box>

            <Box sx={{ p: 2.5, backgroundColor: "#fff" }}>
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                    สถานะ
                  </Typography>
                  <Chip
                    label={status.label}
                    sx={{
                      borderRadius: 1,
                      fontWeight: 600,
                      backgroundColor: status.bg,
                      color: status.text,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                    ประเภท
                  </Typography>
                  <Typography>{newsDetail?.typeNameTH || "-"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                    ชื่อ/วันที่อัปโหลดข้อมูล
                  </Typography>
                  <ComponentsDateTable
                    fullname={displayOwner}
                    startdate={displayOwnerDate}
                    updatedate={null}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                    ชื่อ/วันที่อนุมัติ
                  </Typography>
                  {hasApproveInfo ? (
                    <ComponentsDateTable
                      fullname={newsDetail?.approvename || "-"}
                      startdate={newsDetail?.approvedate || ""}
                      updatedate={null}
                    />
                  ) : (
                    <Typography>-</Typography>
                  )}
                </Grid>
                {(isRejected || isRevisionRequested || isUnpublished) && (
                  <Grid size={{ xs: 12 }}>
                    <ApprovalReasonDisplay active={currentStatus} reason={newsDetail?.rejectReason} />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1.5,
                backgroundColor: theme.palette.primary.dark,
                color: "white",
              }}
            >
              <EditSquareIcon />
              <Typography fontWeight={600}>รายละเอียดข้อมูลข่าวสารและกิจกรรม</Typography>
            </Box>

            <Box sx={{ p: 2.5, backgroundColor: "#fff" }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                    หัวข้อข่าวภาษาไทย
                  </Typography>
                  <Typography>{newsDetail?.titleTH || "-"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                    หัวข้อข่าวภาษาอังกฤษ
                  </Typography>
                  <Typography>{newsDetail?.titleEN || "-"}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                    รายละเอียดข่าวและกิจกรรมภาษาไทย
                  </Typography>
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 2,
                      minHeight: 90,
                      whiteSpace: "pre-wrap",
                      "& p": { m: 0, whiteSpace: "pre-wrap" },
                    }}
                    dangerouslySetInnerHTML={{ __html: newsDetail?.descriptionTH || "-" }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                    รายละเอียดข่าวและกิจกรรมภาษาอังกฤษ
                  </Typography>
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 2,
                      minHeight: 90,
                      whiteSpace: "pre-wrap",
                      "& p": { m: 0, whiteSpace: "pre-wrap" },
                    }}
                    dangerouslySetInnerHTML={{ __html: newsDetail?.descriptionEN || "-" }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1.5,
                backgroundColor: theme.palette.primary.dark,
                color: "white",
              }}
            >
              <ImageIcon />
              <Typography fontWeight={600}>รูปข่าวและกิจกรรม</Typography>
            </Box>

            <Box sx={{ p: 2.5, backgroundColor: "#fff" }}>
              {newsDetail?.images.length ? (
                <Grid container spacing={2}>
                  {newsDetail.images.map((image, index) => (
                    <Grid key={`${image}-${index}`} size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
                      <Box
                        component="img"
                        src={buildPhotoUrl(image)}
                        alt={`news-${index + 1}`}
                        sx={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  ไม่มีรูปข่าวและกิจกรรม
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Paper>

      <Notifications notify={notify} setNotify={setNotify} />
      <ApprovalReasonDialog
        open={rejectDialogOpen}
        decision={pendingDecision === "edit" ? "edit" : "reject"}
        moduleName="ข่าวสารและกิจกรรม"
        reason={rejectReason}
        error={rejectReasonError}
        loading={updating}
        onReasonChange={(value) => {
          setRejectReason(value);
          if (value.trim()) setRejectReasonError("");
        }}
        onCancel={() => {
          setRejectDialogOpen(false);
          setApprovalDecision("");
        }}
        onConfirm={handleRejectConfirm}
      />
      <PublishReasonDialog
        open={publishDialogOpen}
        moduleName="ข่าวสารและกิจกรรม"
        reason={publishReason}
        error={publishReasonError}
        loading={updating}
        onReasonChange={(value) => {
          setPublishReason(value);
          if (value.trim()) setPublishReasonError("");
        }}
        onCancel={() => {
          setPublishDialogOpen(false);
          setPublishReason("");
          setPublishReasonError("");
        }}
        onConfirm={handlePublishCloseConfirm}
      />
    </Container>
  );
};

export default NewsShowpage;
