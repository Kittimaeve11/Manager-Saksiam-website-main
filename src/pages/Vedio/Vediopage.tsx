"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Box, Container, Paper, useMediaQuery, useTheme } from "@mui/material";
import { FiRefreshCw } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

import { apiFetch } from "../../API/client";
import { usePageTitle } from "../../Context/PageTitleContext";
import { usePermission } from "../../hooks/usePermission";
import MenuDropdownstatus from "../../components/Model/Dropdown/MenuDropdownstatus";
import TextButton from "../../components/Buttom/TextButton";
import AppIconButton from "../../components/Buttom/IconButton";
import ConfirmDialog from "../../components/Model/Pop_up/ConfirmDialog";
import Notifications from "../../components/Model/Pop_up/Notifications";
import ComponentsVedioTableView, {
  type VedioItem,
} from "../../components/View/Vedio/ComponentsVedioTableView";

type FileType = "all" | "active" | "inactive" | "waiting_approve" | "waiting_edit" | "cancel";
type NotifyType = "success" | "error" | "warning" | "info";

type VedioData = {
  counts: number;
  vedios: VedioItem[];
};

const emptyVedioData: VedioData = {
  counts: 0,
  vedios: [],
};

const statusQueryMap: Record<FileType, string> = {
  all: "",
  active: "1",
  inactive: "0",
  waiting_approve: "2",
  waiting_edit: "4",
  cancel: "3",
};

const approvalStatusOptions = [
  { valuename: "all", labelname: "แสดงทั้งหมด" },
  { valuename: "active", labelname: "เผยแพร่" },
  { valuename: "inactive", labelname: "ยกเลิก" },
  { valuename: "waiting_approve", labelname: "รอการอนุมัติ" },
  { valuename: "waiting_edit", labelname: "รอการแก้ไข" },
  { valuename: "cancel", labelname: "ไม่อนุมัติ" },
];

const extractYoutubeId = (url: string) => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "";

  try {
    const parsedUrl = new URL(trimmedUrl);
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
    const fallbackMatch = trimmedUrl.match(
      /(?:[?&]v=|youtu\.be\/|embed\/|shorts\/|live\/|\/v\/)([A-Za-z0-9_-]{6,})/
    );

    if (fallbackMatch?.[1]) return fallbackMatch[1];
  }

  return "";
};

const normalizeVedio = (item: any): VedioItem => {
  const link = item.vedio_link ?? item.linkURL ?? item.int_saksiam_vedio_link ?? "";
  const active = item.vedio_active ?? item.active ?? item.int_saksiam_vedio_active ?? 2;
  const activeText = String(active);
  const actionDate =
    item.vedio_changeTime ??
    item.vedio_changetime ??
    item.changetime ??
    item.changeTime ??
    item.int_saksiam_vedio_changetime ??
    null;
  const youtubeID =
    item.vedio_youtubeID ??
    item.youtubeID ??
    item.int_saksiam_vedio_youtubeID ??
    extractYoutubeId(link);

  return {
    id: Number(item.vedio_id ?? item.int_saksiam_vedio_id ?? item.id ?? 0),
    nameTH: item.nameTH_Vedio ?? item.nameTH ?? item.int_saksiam_vedio_nameTH ?? "",
    link,
    youtubeID,
    active,
    approveName:
      item.vedio_approvedname ??
      item.approvedName ??
      item.approvedname ??
      item.vedio_approvename ??
      item.approveName ??
      item.approvename ??
      item.int_saksiam_vedio_approvedname ??
      item.int_saksiam_vedio_approvename ??
      "-",
    approveDate:
      item.vedio_approvedDate ??
      item.approvedDate ??
      item.approveddate ??
      item.int_saksiam_vedio_approvedDate ??
      item.int_saksiam_vedio_approveddate ??
      item.vedio_approveAt ??
      item.approveDate ??
      item.approvedate ??
      item.int_saksiam_vedio_approveAt ??
      (["0", "3", "4"].includes(activeText) ? actionDate : null) ??
      null,
    savename:
      item.vedio_createname ??
      item.savename ??
      item.createname ??
      item.int_saksiam_vedio_createname ??
      "-",
    createAt:
      item.vedio_createAT ??
      item.createAt ??
      item.int_saksiam_vedio_createAt ??
      "",
    updateAt:
      item.vedio_updateAT ??
      item.updateAt ??
      item.int_saksiam_vedio_updateAt ??
      null,
    videoCreated:
      item.vedio_creationdate ??
      item.videoCreated ??
      item.int_saksiam_vedio_creationdate ??
      "",
  };
};

const normalizeResponse = (result: any): VedioData => {
  const data = result?.data ?? result;
  const rawVedios = data?.vedio ?? data?.vedios ?? data?.reviews ?? result?.result ?? [];
  const vedios = Array.isArray(rawVedios)
    ? rawVedios
        .map(normalizeVedio)
        .filter((item) => Number.isFinite(item.id) && item.id > 0)
    : [];

  return {
    counts: Number(data?.vedioCount ?? data?.counts ?? data?.count ?? vedios.length),
    vedios,
  };
};

const Vediopage = () => {
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("xl", 1800));
  const { can } = usePermission();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [fileType, setFileType] = useState<FileType>("all");
  const [vedioData, setVedioData] = useState<VedioData>(emptyVedioData);
  const [notify, setNotify] = useState({
    isOpen: false,
    message: "",
    type: "success" as NotifyType,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    isLoading: false,
    onConfirm: () => {},
  });

  const fetchVedio = useCallback(async () => {
    try {
      setLoading(true);
      const offset = page * rowsPerPage;
      const query = new URLSearchParams({
        active: statusQueryMap[fileType],
        offset: String(offset),
        limit: String(rowsPerPage),
      }).toString();

      const response = await apiFetch(`/api/auther/showVedioAPI?${query}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setVedioData(normalizeResponse(result));
    } catch (error) {
      console.error("Error fetching vedio data:", error);
      setVedioData(emptyVedioData);
    } finally {
      setLoading(false);
    }
  }, [fileType, page, rowsPerPage]);

  useEffect(() => {
    setTitle("การจัดการวิดีโอ");

    const stateNotify = (location.state as any)?.notify;
    if (stateNotify) {
      setNotify({
        isOpen: true,
        message: stateNotify.message,
        type: stateNotify.type ?? "success",
      });
      navigate(location.pathname, { replace: true, state: {} });
    }

    fetchVedio();
  }, [fetchVedio, location.pathname, location.state, navigate, setTitle]);

  const handleFileTypeChange = (event: ChangeEvent<{ value: unknown }>) => {
    setFileType(event.target.value as FileType);
    setPage(0);
  };

  const handleRefresh = () => {
    setFileType("all");
    setPage(0);
  };

  const handleAddItemClick = () => {
    navigate("/Vedio/create");
  };

  const handleMoveItemClick = () => {
    navigate("/Vedio/rank");
  };

  const handleEditItemClick = (id: number) => {
    navigate(`/Vedio/edit/${id}`);
  };

  const handleApproveItemClick = (id: number) => {
    navigate(`/Vedio/view/${id}`);
  };

  const handleDelete = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
          const response = await apiFetch(`/api/auther/deleteVedioAPI/${id}`, {
            method: "DELETE",
          });
          const result = await response.json().catch(() => ({}));

          if (!response.ok || result?.status === false) {
            throw new Error(result?.message || result?.error || "ลบข้อมูลไม่สำเร็จ");
          }

          setNotify({
            isOpen: true,
            message: "ลบข้อมูลวิดีโอสำเร็จ",
            type: "success",
          });
          fetchVedio();
        } catch (error) {
          setNotify({
            isOpen: true,
            message:
              error instanceof Error ? error.message : "ไม่สามารถลบข้อมูลวิดีโอได้",
            type: "error",
          });
        } finally {
          setConfirmDialog({
            isOpen: false,
            isLoading: false,
            onConfirm: () => {},
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
          <Box sx={{ width: { xs: 140, md: 140 }, flexShrink: 0 }}>
            <MenuDropdownstatus
              titlename="สถานะ"
              handleFileTypeChange={handleFileTypeChange}
              fileType={fileType}
              statusOptions={approvalStatusOptions}
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
            {can("Vedio") && (
              <TextButton onClick={handleAddItemClick}>เพิ่มวิดีโอ</TextButton>
            )}

            {can("Vedio") && (
              <TextButton
                variant="outlined"
                sx={{
                  color: "black",
                  borderColor: theme.palette.grey[900],
                  backgroundColor: "white",
                }}
                onClick={handleMoveItemClick}
              >
                เรียงลำดับวิดีโอ
              </TextButton>
            )}

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
          <ComponentsVedioTableView
            vedioData={vedioData}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            setPage={setPage}
            setRowsPerPage={setRowsPerPage}
            handleDelete={handleDelete}
            handleEdit={handleEditItemClick}
            handleApprove={handleApproveItemClick}
            can={can}
          />
        </Box>
      </Paper>

      <ConfirmDialog
        type="delete"
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
      <Notifications notify={notify} setNotify={setNotify} />
    </Container>
  );
};

export default Vediopage;
