"use client";

/* ======================================================
   IMPORTS
   ====================================================== */

/* -------------------- REACT -------------------- */
import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";

/* -------------------- MUI -------------------- */
import {
  Box,
  Container,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";

/* -------------------- ICONS -------------------- */
import { FiRefreshCw } from "react-icons/fi";

/* -------------------- ROUTER -------------------- */
import { useLocation, useNavigate } from "react-router-dom";

/* -------------------- API -------------------- */
import { apiFetch } from "../../API/client";

/* -------------------- CONTEXT -------------------- */
import { usePageTitle } from "../../Context/PageTitleContext";

/* -------------------- COMPONENTS -------------------- */
import AppIconButton from "../../components/Buttom/IconButton";
import TextButton from "../../components/Buttom/TextButton";
import MenuDropdownstatus from "../../components/Model/Dropdown/MenuDropdownstatus";
import Notifications from "../../components/Model/Pop_up/Notifications";
import ComponentsPolicyTableView, {
  type PolicyItem,
} from "../../components/View/Policy/ComponentsPolicyTableView";

/* -------------------- UTILS -------------------- */
import { decodePolicyDetailFromApi } from "../../utils/policyDetail";

type NotifyType = "success" | "error" | "warning" | "info";
type FileType = "all" | "active" | "inactive" | "waiting_approve" | "approved" | "waiting_edit" | "cancel";

type PolicyData = {
  counts: number;
  policies: PolicyItem[];
};

const emptyPolicyData: PolicyData = {
  counts: 0,
  policies: [],
};

const policyStatusOptions = [
  { valuename: "all", labelname: "แสดงทั้งหมด" },
  { valuename: "active", labelname: "เผยแพร่" },
  { valuename: "inactive", labelname: "ยกเลิก" },
  { valuename: "waiting_approve", labelname: "รอการอนุมัติ" },
  { valuename: "waiting_edit", labelname: "รอการแก้ไข" },
  { valuename: "cancel", labelname: "ไม่อนุมัติ" },
];

const normalizePolicy = (item: any): PolicyItem => ({
  id: Number(item.id ?? item.policyID ?? item.int_saksiam_policy_id ?? 0),
  code:
    item.code ??
    item.policyNum ??
    item.policy_num ??
    item.int_saksiam_policy_num ??
    "",
  nameTH: item.nameTH ?? item.policynameTH ?? item.int_saksiam_policy_nameTH ?? "",
  nameEN: item.nameEN ?? item.policynameEN ?? item.int_saksiam_policy_nameEN ?? "",
  detailTH: decodePolicyDetailFromApi(item.detailTH ?? item.int_saksiam_policy_detailTH ?? ""),
  detailEN: decodePolicyDetailFromApi(item.detailEN ?? item.int_saksiam_policy_detailEN ?? ""),
  active: item.active ?? item.policyactive ?? item.int_saksiam_policy_active ?? 1,
  createname:
    item.createname ??
    item.savename ??
    item.int_saksiam_policy_createname ??
    "-",
  updatename:
    item.updatename ??
    item.updateName ??
    item.int_saksiam_policy_updatename ??
    "",
  createAt:
    item.createAt ??
    item.int_saksiam_policy_createAt ??
    "",
  updateAt: (() => {
    const hasUpdateName =
      item.updatename ||
      item.updateName ||
      item.int_saksiam_policy_updatename;

    const changeTime =
      item.changetime ??
      item.changeTime ??
      item.int_saksiam_policy_changetime ??
      null;

    return (
      item.updateAt ??
      item.int_saksiam_policy_updateAt ??
      (hasUpdateName ? changeTime : null) ??
      null
    );
  })(),
  approvedName:
    item.approvedName ??
    item.approvename ??
    item.int_saksiam_policy_approvedName ??
    item.int_saksiam_policy_changename ??
    "-",
  approvedDate:
    item.approvedDate ??
    item.approvedate ??
    item.int_saksiam_policy_approvedDate ??
    item.int_saksiam_policy_changetime ??
    null,
  order: Number(
    item.order ??
      item.policyorder ??
      item.policyOrder ??
      item.int_saksiam_policy_order ??
      0
  ),
});

const normalizePolicyResponse = (result: any): PolicyData => {
  const data = result?.data ?? result;
  const rawPolicies =
    data?.policies ??
    data?.policy ??
    data?.items ??
    result?.result ??
    [];
  const policies = Array.isArray(rawPolicies)
    ? rawPolicies.map(normalizePolicy).filter((item) => item.id)
    : [];

  return {
    counts: Number(data?.counts ?? result?.counts ?? policies.length),
    policies,
  };
};

const Policypage = () => {
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("xl", 1800));
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [fileType, setFileType] = useState<FileType>("all");
  const [policyData, setPolicyData] = useState<PolicyData>(emptyPolicyData);
  const [notify, setNotify] = useState({
    isOpen: false,
    message: "",
    type: "success" as NotifyType,
  });


  const fetchPolicy = useCallback(async () => {
    try {
      setLoading(true);

      const activeMap: Record<FileType, string> = {
        all: "",
        active: "1",
        inactive: "0",
        waiting_approve: "",
        approved: "",
        waiting_edit: "",
        cancel: "",
      };
      const query = new URLSearchParams({
        active: activeMap[fileType],
        offset: String(page * rowsPerPage),
        limit: String(rowsPerPage),
      }).toString();

      const response = await apiFetch(`/api/auther/showPolicyAPI?${query}`, { method: "GET" });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const normalized = normalizePolicyResponse(result);
      const filteredPolicies = normalized.policies.filter((item) => {
        const active = String(item.active);
        if (fileType === "waiting_approve") return active === "2";
        if (fileType === "approved") return active === "1";
        if (fileType === "waiting_edit") return active === "4";
        if (fileType === "cancel") return active === "3";
        return true;
      });

      setPolicyData({
        counts: ["all", "active", "inactive"].includes(fileType)
          ? normalized.counts
          : filteredPolicies.length,
        policies: filteredPolicies,
      });
    } catch (error) {
      console.error("Error fetching policy data:", error);
      setPolicyData(emptyPolicyData);
      setNotify({
        isOpen: true,
        message: "ไม่สามารถโหลดข้อมูลนโยบายได้",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [fileType, page, rowsPerPage]);

  useEffect(() => {
    setTitle("การจัดการนโยบาย");

    const state = location.state as { notify?: { message: string; type: NotifyType } } | null;

    if (state?.notify) {
      setNotify({
        isOpen: true,
        message: state.notify.message,
        type: state.notify.type,
      });
      navigate(location.pathname, { replace: true });
    }

    fetchPolicy();
  }, [fetchPolicy, location.pathname, location.state, navigate, setTitle]);

  const handleRefresh = () => {
    setFileType("all");
    setPage(0);
  };

  const handleStatusChange = (event: ChangeEvent<{ value: unknown }>) => {
    setFileType(String(event.target.value) as FileType);
    setPage(0);
  };

  const handleAddItemClick = () => {
    navigate("/Policy/create");
  };

  const handleMoveItemClick = () => {
    navigate("/Policy/rank");
  };

  const handleEditItemClick = (id: number) => {
    navigate(`/Policy/edit/${id}`);
  };

  const handleViewItemClick = (id: number, code?: string) => {
    navigate(`/Policy/view/${code || id}`);
  };

  return (
    <Container maxWidth="xl">
      <Paper
        elevation={0}
        sx={{
          mt: 5,
          py: 5,
          borderRadius: 3,
          width: "100%",
          backgroundColor:
            theme.palette.mode === "dark" ? theme.palette.primary.darker : "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: isMediumScreen ? "row" : { xs: "column", md: "row" },
            justifyContent: { xs: "flex-start", lg: "space-between" },
            alignItems: isMediumScreen ? "center" : { xs: "flex-start", lg: "center" },
            width: "100%",
            flexWrap: "nowrap",
            gap: 2,
            px: 3,
            pb: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "end",
              gap: 2,
              width: { xs: "100%", md: "auto" },
              mx: { xs: 1, md: 0, xl: 0 },
            }}
          >
            <MenuDropdownstatus
              titlename="สถานะ"
              handleFileTypeChange={handleStatusChange}
              fileType={fileType as any}
              statusOptions={policyStatusOptions}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: { xs: "flex-start", md: "flex-end" },
              mx: { xs: 1, md: 0, xl: 0 },
              mt: { xs: 1, md: 3 },
              width: "100%",
            }}
          >
            <TextButton onClick={handleAddItemClick}>เพิ่มนโยบาย</TextButton>
            <TextButton
              variant="outlined"
              sx={{
                color: "black",
                borderColor: theme.palette.grey[900],
                backgroundColor: "white",
              }}
              onClick={handleMoveItemClick}
            >
              เรียงลำดับนโยบาย
            </TextButton>
            <AppIconButton title="รีเฟรชข้อมูล" onClick={handleRefresh}>
              <FiRefreshCw
                style={{
                  fontSize: theme.typography.h6.fontSize,
                  strokeWidth: 2.5,
                }}
              />
            </AppIconButton>
          </Box>
        </Box>

        <Box px={3}>
          <ComponentsPolicyTableView
            policyData={policyData}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            setPage={setPage}
            setRowsPerPage={setRowsPerPage}
            handleEdit={handleEditItemClick}
            handleView={handleViewItemClick}
            handleApprove={handleViewItemClick}
          />
        </Box>
      </Paper>

      <Notifications notify={notify} setNotify={setNotify} />
    </Container>
  );
};

export default Policypage;
