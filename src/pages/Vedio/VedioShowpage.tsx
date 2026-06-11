"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../../API/client";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../Context/PageTitleContext";
import ApprovalDecisionCard from "../../components/Approval/ApprovalDecisionCard";
import ApprovalReasonDisplay, {
  firstApprovalReason,
  getApprovalReasonFromRecord,
} from "../../components/Approval/ApprovalReasonDisplay";
import ApprovalReasonDialog from "../../components/Approval/ApprovalReasonDialog";
import PublishReasonDialog from "../../components/Approval/PublishReasonDialog";
import SwitchButton from "../../components/Buttom/SwitchButton";
import TextButton from "../../components/Buttom/TextButton";
import Notifications from "../../components/Model/Pop_up/Notifications";

type NotifyType = "success" | "error" | "warning" | "info";
type ApprovalDecision = "" | "approve" | "reject" | "edit";

type VedioDetail = {
  id: number;
  nameTH: string;
  link: string;
  youtubeID: string;
  active: string;
  createname: string;
  updatename: string;
  createAt: string;
  updateAt: string | null;
  approvename: string;
  approvedate: string | null;
  rejectReason: string;
  videoCreated: string;
};

const extractYoutubeId = (url: string) => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "";

  const iframeSrc = trimmedUrl.match(/src=["']([^"']+)["']/i)?.[1];
  const nextUrl = iframeSrc || trimmedUrl;

  try {
    const parsedUrl = new URL(nextUrl);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (hostname.includes("youtube.com")) {
      const watchId = parsedUrl.searchParams.get("v");
      if (watchId) return watchId;

      const [type, id] = parsedUrl.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live", "v"].includes(type) && id) return id;
    }
  } catch {
    const fallbackMatch = nextUrl.match(
      /(?:[?&]v=|youtu\.be\/|embed\/|shorts\/|live\/|\/v\/)([A-Za-z0-9_-]{6,})/
    );

    if (fallbackMatch?.[1]) return fallbackMatch[1];
  }

  return "";
};

const normalizeVedioDetail = (data: any): VedioDetail => {
  const active = String(
    data.vedio_active ?? data.active ?? data.int_saksiam_vedio_active ?? "2"
  );
  const vedioNote = firstApprovalReason(
    getApprovalReasonFromRecord(active, data, "int_saksiam_vedio"),
    data.vedio_note,
    data.note,
    data.rejectReason,
    data.reason,
    data.int_saksiam_vedio_note
  );
  const rejectReason =
    active === "4"
      ? firstApprovalReason(
          vedioNote,
          data.improvement,
          data.improvement_text,
          data.int_saksiam_vedio_improvement
        )
      : active === "0"
        ? firstApprovalReason(
            data.cancellation,
            data.int_saksiam_vedio_cancellation,
            vedioNote
          )
        : firstApprovalReason(
            vedioNote,
            data.cancellation,
            data.int_saksiam_vedio_cancellation
          );
  const link = data.vedio_link ?? data.linkURL ?? data.int_saksiam_vedio_link ?? "";
  const actionDate =
    data.vedio_changeTime ??
    data.vedio_changetime ??
    data.changetime ??
    data.changeTime ??
    data.int_saksiam_vedio_changetime ??
    null;
  const youtubeID =
    data.vedio_youtubeID ??
    data.youtubeID ??
    data.int_saksiam_vedio_youtubeID ??
    extractYoutubeId(link);

  return {
    id: Number(data.vedio_id ?? data.int_saksiam_vedio_id ?? data.id ?? 0),
    nameTH: data.nameTH_Vedio ?? data.nameTH ?? data.int_saksiam_vedio_nameTH ?? "",
    link,
    youtubeID,
    active,
    createname:
      data.vedio_createname ??
      data.savename ??
      data.createname ??
      data.int_saksiam_vedio_createname ??
      "-",
    updatename:
      data.vedio_updatename ??
      data.updatename ??
      data.updateName ??
      data.int_saksiam_vedio_updatename ??
      "",
    createAt:
      data.vedio_createAT ??
      data.createAt ??
      data.int_saksiam_vedio_createAt ??
      "",
    updateAt:
      data.vedio_updateAT ??
      data.updateAt ??
      data.int_saksiam_vedio_updateAt ??
      null,
    approvename:
      data.vedio_approvedname ??
      data.approvedName ??
      data.approvedname ??
      data.vedio_approvename ??
      data.approvename ??
      data.approveName ??
      data.int_saksiam_vedio_approvedname ??
      data.int_saksiam_vedio_approvename ??
      "-",
    approvedate:
      data.vedio_approvedDate ??
      data.approvedDate ??
      data.approveddate ??
      data.int_saksiam_vedio_approvedDate ??
      data.int_saksiam_vedio_approveddate ??
      data.vedio_approveAt ??
      data.approvedate ??
      data.approveDate ??
      data.int_saksiam_vedio_approveAt ??
      (["0", "3", "4"].includes(active) ? actionDate : null) ??
      null,
    rejectReason,
    videoCreated:
      data.vedio_creationdate ??
      data.videoCreated ??
      data.int_saksiam_vedio_creationdate ??
      "",
  };
};

const getStatusChip = (active: string) => {
  if (active === "1") return { label: "เผยแพร่", bg: "#d7f1e2", text: "#48af75" };
  if (active === "2") return { label: "รอการอนุมัติ", bg: "#FFF6E6", text: "#FFAA37" };
  if (active === "4") return { label: "รอการแก้ไข", bg: "#FFF6E6", text: "#FFAA37" };
  if (active === "3") return { label: "ไม่อนุมัติ", bg: "#ffe6eb", text: "#ff3741" };
  return { label: "ยกเลิก", bg: "#e7e3e3", text: "#3b3a3a" };
};

const VedioShowpage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [vedioDetail, setVedioDetail] = useState<VedioDetail | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<ApprovalDecision>("");
  const [pendingDecision, setPendingDecision] = useState<ApprovalDecision>("reject");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishReason, setPublishReason] = useState("");
  const [publishReasonError, setPublishReasonError] = useState("");
  const [notify, setNotify] = useState({
    isOpen: false,
    message: "",
    type: "success" as NotifyType,
  });

  const fullName = `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim() || "Unknown";
  const status = useMemo(
    () => getStatusChip(vedioDetail?.active ?? "0"),
    [vedioDetail?.active]
  );
  const currentStatus = vedioDetail?.active ?? "";
  const isPendingApproval = currentStatus === "2";
  const isRejected = currentStatus === "3";
  const isRevisionRequested = currentStatus === "4";
  const isUnpublished = currentStatus === "0";
  const canTogglePublish = ["0", "1"].includes(currentStatus);
  const displayOwner =
    vedioDetail?.updateAt
      ? vedioDetail.updatename || vedioDetail.createname || "-"
      : vedioDetail?.createname || "-";
  const displayOwnerDate = vedioDetail?.updateAt || vedioDetail?.createAt || "";

  useEffect(() => {
    setTitle("ตรวจสอบวิดีโอ");

    const fetchDetail = async () => {
      if (!id) {
        navigate("/Vedio");
        return;
      }

      try {
        setLoading(true);
        const response = await apiFetch(`/api/auther/showVedioIDAPI/${id}`, {
          method: "GET",
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || result?.status === false) {
          throw new Error(result?.message || result?.error || "ไม่พบข้อมูลวิดีโอ");
        }

        setVedioDetail(normalizeVedioDetail(result?.data ?? result ?? {}));
      } catch (error) {
        setNotify({
          isOpen: true,
          message:
            error instanceof Error ? error.message : "โหลดข้อมูลวิดีโอไม่สำเร็จ",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate, setTitle]);

  const updateVedioStatus = async (payload: Record<string, string>) => {
    if (!vedioDetail?.id) throw new Error("ไม่พบรหัสข้อมูลวิดีโอ");

    const response = await apiFetch(`/api/auther/updateVedioAPI/${vedioDetail.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result?.status === false) {
      throw new Error(result?.message || result?.error || "อัปเดตสถานะไม่สำเร็จ");
    }
  };

  const handlePublishChange = async (checked: boolean) => {
    if (!vedioDetail) return;

    if (!checked) {
      setPublishDialogOpen(true);
      setPublishReason("");
      setPublishReasonError("");
      return;
    }

    try {
      setUpdating(true);
      await updateVedioStatus({
        active: "1",
        changename: fullName,
        updatename: fullName,
      });

      setVedioDetail((prev) =>
        prev
          ? {
              ...prev,
              active: "1",
              updatename: fullName,
              updateAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
              rejectReason: "",
            }
          : prev
      );
      setNotify({
        isOpen: true,
        message: "เปิดเผยแพร่วิดีโอสำเร็จ",
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
    if (!vedioDetail) return;

    const cleanReason = publishReason.trim();
    if (!cleanReason) {
      setPublishReasonError("กรุณากรอกเหตุผลที่ต้องปิดเผยแพร่");
      return;
    }

    try {
      setUpdating(true);
      await updateVedioStatus({
        active: "0",
        changename: fullName,
        updatename: fullName,
        note: cleanReason,
        int_saksiam_vedio_note: cleanReason,
        reason: cleanReason,
        rejectReason: cleanReason,
        cancellation: cleanReason,
        improvement_text: cleanReason,
      });

      setVedioDetail((prev) =>
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
        message: "ปิดเผยแพร่วิดีโอสำเร็จ",
        type: "success",
      });
    } catch (error) {
      setNotify({
        isOpen: true,
        message:
          error instanceof Error ? error.message : "ไม่สามารถปิดเผยแพร่วิดีโอได้",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleApprovalDecision = async (decision: ApprovalDecision, reason = "") => {
    if (!vedioDetail) return;

    const approvedate = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const cleanReason = reason.trim();
    const approved = decision === "approve";

    try {
      setUpdating(true);
      await updateVedioStatus({
        active: decision === "approve" ? "1" : decision === "reject" ? "3" : "4",
        approvedname: fullName,
        approvedName: fullName,
        int_saksiam_vedio_approvedname: fullName,
        approvename: fullName,
        approveName: fullName,
        approvedate,
        approveddate: approvedate,
        approvedDate: approvedate,
        int_saksiam_vedio_approvedDate: approvedate,
        int_saksiam_vedio_approveddate: approvedate,
        approveAt: approvedate,
        approveDate: approvedate,
        note: approved ? "" : cleanReason,
        int_saksiam_vedio_note: approved ? "" : cleanReason,
        rejectReason: approved ? "" : cleanReason,
        cancellation: approved ? "" : cleanReason,
        improvement: approved ? "" : cleanReason,
        improvement_text: approved ? "" : cleanReason,
      });

      setVedioDetail((prev) =>
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
            ? "อนุมัติและเผยแพร่วิดีโอสำเร็จ"
            : decision === "reject"
              ? "ไม่อนุมัติวิดีโอสำเร็จ"
              : "ส่งกลับให้แก้ไขวิดีโอสำเร็จ",
        type: "success",
      });
    } catch (error) {
      setNotify({
        isOpen: true,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถบันทึกผลการอนุมัติได้",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectClick = (decision: ApprovalDecision) => {
    setPendingDecision(decision);
    setApprovalDecision(decision);
    setRejectReason(vedioDetail?.rejectReason || "");
    setRejectReasonError("");
    setRejectDialogOpen(true);
  };

  const handleDecisionChange = (decision: ApprovalDecision) => {
    setApprovalDecision(decision);
    if (decision === "reject" || decision === "edit") handleRejectClick(decision);
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
          <Typography variant="h6" fontWeight={700} sx={{ color: "#fff" }}>
            ตรวจสอบวิดีโอ
          </Typography>
          {/* <TextButton onClick={() => navigate("/Vedio")}>กลับ</TextButton> */}
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
              <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
                {vedioDetail?.nameTH || "-"}
              </Typography>

              {vedioDetail?.youtubeID ? (
                <Box
                  component="iframe"
                  src={`https://www.youtube.com/embed/${vedioDetail.youtubeID}`}
                  title={vedioDetail.nameTH || "video"}
                  sx={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    border: 0,
                    borderRadius: 3,
                    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <Typography color="text.secondary">ไม่พบวิดีโอ</Typography>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                วันที่วิดีโอ:{" "}
                {vedioDetail?.videoCreated
                  ? dayjs(vedioDetail.videoCreated).format("DD MMM YYYY")
                  : "-"}
              </Typography>
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

                <ApprovalReasonDisplay active={currentStatus} reason={vedioDetail?.rejectReason} />
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
                      checked={vedioDetail?.active === "1"}
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

      <ApprovalReasonDialog
        open={rejectDialogOpen}
        decision={pendingDecision === "edit" ? "edit" : "reject"}
        moduleName="วิดีโอ"
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
        moduleName="วิดีโอ"
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

      <Notifications notify={notify} setNotify={setNotify} />
    </Container>
  );
};

export default VedioShowpage;
