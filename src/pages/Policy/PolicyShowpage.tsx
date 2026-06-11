"use client";

/* ======================================================
   IMPORTS
   ====================================================== */

/* -------------------- REACT -------------------- */
import { useEffect, useMemo, useState } from "react";

/* -------------------- MUI -------------------- */
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

/* -------------------- ICONS -------------------- */
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";

/* -------------------- LIB -------------------- */
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";

/* -------------------- API / CONTEXT -------------------- */
import { apiFetch } from "../../API/client";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../Context/PageTitleContext";

/* -------------------- COMPONENTS -------------------- */
import TextButton from "../../components/Buttom/TextButton";
import SwitchButton from "../../components/Buttom/SwitchButton";
import ApprovalDecisionCard from "../../components/Approval/ApprovalDecisionCard";
import ApprovalReasonDisplay, {
  firstApprovalReason,
  getApprovalReasonFromRecord,
} from "../../components/Approval/ApprovalReasonDisplay";
import ApprovalReasonDialog from "../../components/Approval/ApprovalReasonDialog";
import PublishReasonDialog from "../../components/Approval/PublishReasonDialog";
import Notifications from "../../components/Model/Pop_up/Notifications";

/* -------------------- UTILS -------------------- */
import { decodePolicyDetailFromApi } from "../../utils/policyDetail";
type NotifyType = "success" | "error" | "warning" | "info";
type ApprovalDecision = "" | "approve" | "reject" | "edit";
type ContentLanguage = "th" | "en";

type PolicyDetail = {
  id: number;
  code: string;
  nameTH: string;
  nameEN: string;
  detailTH: string;
  detailEN: string;
  active: string;
  createname: string;
  updatename: string;
  createAt: string;
  updateAt: string | null;
  approvedName: string;
  approvedDate: string | null;
  rejectReason: string;
};

const getPolicyCode = (item: any) =>
  String(item.code ?? item.policyNum ?? item.int_saksiam_policy_num ?? "");

const getPolicyId = (item: any) =>
  Number(item.id ?? item.policyID ?? item.int_saksiam_policy_id ?? 0);

const getPolicyList = (result: any) => {
  const data = result?.data ?? result;
  const rawPolicies =
    data?.policies ??
    data?.policy ??
    data?.items ??
    result?.result ??
    [];

  return Array.isArray(rawPolicies) ? rawPolicies : [];
};

const resolvePolicyId = async (code: string) => {
  if (/^\d+$/.test(code)) return code;

  const response = await apiFetch("/api/auther/showPolicyAPI?active=&offset=0&limit=1000", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("ไม่พบข้อมูลนโยบายตามรหัสนี้");
  }

  const result = await response.json();
  const found = getPolicyList(result).find((item) => getPolicyCode(item) === code);
  const foundId = found ? getPolicyId(found) : 0;

  if (!foundId) {
    throw new Error("ไม่พบข้อมูลนโยบายตามรหัสนี้");
  }

  return String(foundId);
};

const normalizePolicyDetail = (data: any, fallbackId = 0): PolicyDetail => {
  const payload = data?.data ?? data?.result ?? data;
  const activeValue = String(payload.active ?? payload.int_saksiam_policy_active ?? "0");
  const rejectReason =
    activeValue === "4"
      ? firstApprovalReason(
          getApprovalReasonFromRecord(activeValue, payload, "int_saksiam_policy"),
          payload.improvement,
          payload.improvement_text,
          payload.improvementText,
          payload.int_saksiam_policy_improvement,
          payload.rejectReason,
          payload.reason,
          payload.note,
          payload.int_saksiam_policy_note
        )
      : activeValue === "0"
        ? firstApprovalReason(
            getApprovalReasonFromRecord(activeValue, payload, "int_saksiam_policy"),
            payload.cancellation,
            payload.cancelReason,
            payload.int_saksiam_policy_cancellation,
            payload.rejectReason,
            payload.reason,
            payload.note,
            payload.int_saksiam_policy_note
          )
        : firstApprovalReason(
            getApprovalReasonFromRecord(activeValue, payload, "int_saksiam_policy"),
            payload.note,
            payload.rejectReason,
            payload.reason,
            payload.int_saksiam_policy_note,
            payload.cancellation,
            payload.int_saksiam_policy_cancellation
          );

  return {
    id: getPolicyId(payload) || fallbackId,
    code: getPolicyCode(payload),
    nameTH: payload.nameTH ?? payload.int_saksiam_policy_nameTH ?? "",
    nameEN: payload.nameEN ?? payload.int_saksiam_policy_nameEN ?? "",
    detailTH: decodePolicyDetailFromApi(payload.detailTH ?? payload.int_saksiam_policy_detailTH ?? ""),
    detailEN: decodePolicyDetailFromApi(payload.detailEN ?? payload.int_saksiam_policy_detailEN ?? ""),
    active: activeValue,
    createname:
      payload.createname ??
      payload.savename ??
      payload.int_saksiam_policy_createname ??
      "-",
    updatename:
      payload.updatename ??
      payload.updateName ??
      payload.int_saksiam_policy_updatename ??
      "",
    createAt:
      payload.createAt ??
      payload.int_saksiam_policy_createAt ??
      "",
    updateAt:
      payload.updateAt ??
      payload.int_saksiam_policy_updateAt ??
      null,
    approvedName:
      payload.approvedName ??
      payload.approvename ??
      payload.int_saksiam_policy_approvedName ??
      payload.int_saksiam_policy_changename ??
      "-",
    approvedDate:
      payload.approvedDate ??
      payload.approvedate ??
      payload.int_saksiam_policy_approvedDate ??
      payload.int_saksiam_policy_changetime ??
      null,
    rejectReason,
  };
};

const getStatusChip = (active: string) => {
  if (active === "1") return { label: "เผยแพร่", bg: "#d7f1e2", text: "#48af75" };
  if (active === "2") return { label: "รอการอนุมัติ", bg: "#FFF6E6", text: "#FFAA37" };
  if (active === "4") return { label: "รอการแก้ไข", bg: "#FFF6E6", text: "#FFAA37" };
  if (active === "3") return { label: "ไม่อนุมัติ", bg: "#ffe6eb", text: "#ff3741" };
  return { label: "ยกเลิก", bg: "#e7e3e3", text: "#3b3a3a" };
};

const PolicyShowpage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { code } = useParams();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [policyDetail, setPolicyDetail] = useState<PolicyDetail | null>(null);
  const [language, setLanguage] = useState<ContentLanguage>("th");
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
  const status = useMemo(() => getStatusChip(policyDetail?.active ?? "0"), [policyDetail?.active]);
  const currentStatus = policyDetail?.active ?? "";
  const isPendingApproval = currentStatus === "2";
  const isRejected = currentStatus === "3";
  const isRevisionRequested = currentStatus === "4";
  const isUnpublished = currentStatus === "0";
  const canTogglePublish = ["0", "1"].includes(currentStatus);
  const currentTitle = `${policyDetail?.nameTH || "-"} (${policyDetail?.nameEN || "-"})`;
  const currentDetail = language === "th" ? policyDetail?.detailTH : policyDetail?.detailEN;
  const displayOwner =
    policyDetail?.updateAt
      ? policyDetail.updatename || policyDetail.createname || "-"
      : policyDetail?.createname || "-";
  const displayOwnerDate = policyDetail?.updateAt || policyDetail?.createAt || "";
  useEffect(() => {
    /* ======================================================
       INIT PAGE + FETCH DATA
       ====================================================== */

    // ตั้งชื่อหน้า
    setTitle("ตรวจสอบนโยบาย");

    // ฟังก์ชันโหลดข้อมูล
    const fetchDetail = async () => {
      if (!code) {
        navigate("/Policy");
        return;
      }

      try {
        setLoading(true);

        const detailId = await resolvePolicyId(code);

        const response = await apiFetch(
          `/api/auther/showPolicyIDAPI/${detailId}`,
          { method: "GET" }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result?.message || result?.error || "ไม่พบข้อมูลนโยบาย"
          );
        }

        setPolicyDetail(
          normalizePolicyDetail(result?.data ?? result ?? {}, Number(detailId))
        );

      } catch (error) {
        setNotify({
          isOpen: true,
          message:
            error instanceof Error
              ? error.message
              : "โหลดข้อมูลนโยบายไม่สำเร็จ",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

  }, [code, navigate, setTitle]);

  const updatePolicyStatus = async (payload: Record<string, string>) => {
    if (!policyDetail?.id) {
      throw new Error("ไม่พบรหัสข้อมูลนโยบาย");
    }

    const response = await apiFetch(`/api/auther/updatePolicyAPI/${policyDetail.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result?.status === false) {
      throw new Error(result?.message || result?.error || "อัปเดตสถานะไม่สำเร็จ");
    }
  };

  const handlePublishChange = async (checked: boolean) => {
    if (!policyDetail) return;

    if (!checked) {
      setPublishDialogOpen(true);
      setPublishReason("");
      setPublishReasonError("");
      return;
    }

    try {
      setUpdating(true);
      await updatePolicyStatus({
        active: "1",
        changename: fullName,
        updatename: fullName,
      });

      setPolicyDetail((prev) =>
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
        message: "เปิดเผยแพร่นโยบายสำเร็จ",
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
    if (!policyDetail) return;

    const cleanReason = publishReason.trim();
    if (!cleanReason) {
      setPublishReasonError("กรุณากรอกเหตุผลที่ต้องปิดเผยแพร่");
      return;
    }

    try {
      setUpdating(true);
      await updatePolicyStatus({
        active: "0",
        changename: fullName,
        updatename: fullName,
        note: cleanReason,
        reason: cleanReason,
        rejectReason: cleanReason,
        cancellation: cleanReason,
        improvement_text: cleanReason,
      });

      setPolicyDetail((prev) =>
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
        message: "ปิดเผยแพร่นโยบายสำเร็จ",
        type: "success",
      });
    } catch (error) {
      setNotify({
        isOpen: true,
        message:
          error instanceof Error ? error.message : "ไม่สามารถปิดเผยแพร่นโยบายได้",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleApprovalDecision = async (decision: ApprovalDecision, reason = "") => {
    if (!policyDetail) return;

    const approvedate = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const cleanReason = reason.trim();
    const approved = decision === "approve";

    try {
      setUpdating(true);
      await updatePolicyStatus({
        active: decision === "approve" ? "1" : decision === "reject" ? "3" : "4",
        changename: fullName,
        approvename: fullName,
        approvedName: fullName,
        approvedate,
        approvedDate: approvedate,
        note: approved ? "" : cleanReason,
        rejectReason: approved ? "" : cleanReason,
        cancellation: approved ? "" : cleanReason,
        improvement_text: approved ? "" : cleanReason,
      });

      setPolicyDetail((prev) =>
        prev
          ? {
            ...prev,
            active: decision === "approve" ? "1" : decision === "reject" ? "3" : "4",
            approvedName: fullName,
            approvedDate: approvedate,
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
            ? "อนุมัติและเผยแพร่นโยบายสำเร็จ"
            : decision === "reject"
              ? "ไม่อนุมัตินโยบายสำเร็จ"
              : "ส่งกลับให้แก้ไขนโยบายสำเร็จ",
        type: "success",
      });
    } catch (error) {
      setNotify({
        isOpen: true,
        message:
          error instanceof Error ? error.message : "บันทึกผลการอนุมัติไม่สำเร็จ",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectClick = (decision: ApprovalDecision) => {
    setPendingDecision(decision);
    setApprovalDecision(decision);
    setRejectReason(policyDetail?.rejectReason || "");
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
          <Typography variant="h6" fontWeight={700} sx={{ color: "#fff" }}>
            ตรวจสอบนโยบาย
          </Typography>
          {/* <TextButton onClick={() => navigate("/Policy")}>กลับ</TextButton> */}
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

              <Box
                sx={{
                  whiteSpace: "pre-wrap",
                  "& p": { mt: 0, mb: 1, whiteSpace: "pre-wrap" },
                  "& ul, & ol": { pl: 3 },
                }}
                dangerouslySetInnerHTML={{ __html: currentDetail || "-" }}
              />
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

                <ApprovalReasonDisplay active={currentStatus} reason={policyDetail?.rejectReason} />
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
                      checked={policyDetail?.active === "1"}
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
        moduleName="นโยบาย"
        reason={rejectReason}
        error={rejectReasonError}
        loading={updating}
        onReasonChange={(value) => {
          setRejectReason(value);
          setRejectReasonError("");
        }}
        onCancel={() => {
          setRejectDialogOpen(false);
          setApprovalDecision("");
        }}
        onConfirm={handleRejectConfirm}
      />

      <PublishReasonDialog
        open={publishDialogOpen}
        moduleName="นโยบาย"
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

export default PolicyShowpage;
