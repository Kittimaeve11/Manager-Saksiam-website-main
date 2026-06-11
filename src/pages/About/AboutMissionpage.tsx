"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Box, Container, Paper, useMediaQuery, useTheme } from "@mui/material";
import { FiRefreshCw } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

import { apiFetch } from "../../API/client";
import { datastatusType } from "../../API/StausData";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../Context/PageTitleContext";
import MenuDropdownstatus from "../../components/Model/Dropdown/MenuDropdownstatus";
import TextButton from "../../components/Buttom/TextButton";
import AppIconButton from "../../components/Buttom/IconButton";
import ConfirmDialog from "../../components/Model/Pop_up/ConfirmDialog";
import Notifications from "../../components/Model/Pop_up/Notifications";
import ComponentsMissionTableView, {
  type MissionItem,
} from "../../components/View/About/ComponentsMissionTableView";

type FileType = "all" | "active" | "inactive";
type NotifyType = "success" | "error" | "warning" | "info";

type MissionData = {
  counts: number;
  missions: MissionItem[];
};

const emptyMissionData: MissionData = {
  counts: 0,
  missions: [],
};

const normalizeMission = (item: any): MissionItem => ({
  id: Number(
    item.mission_ID ??
      item.missionID ??
      item.int_saksiam_mission_ID ??
      item.id ??
      0
  ),
  titleTH:
    item.titleTH ??
    item.missionTitleTH ??
    item.int_saksiam_mission_titleTH ??
    "",
  titleEN:
    item.titleEN ??
    item.missionTitleEN ??
    item.int_saksiam_mission_titleEN ??
    "",
  topicTH:
    item.topicTH ??
    item.missionTopicTH ??
    item.int_saksiam_mission_topicTH ??
    "",
  topicEN:
    item.topicEN ??
    item.missionTopicEN ??
    item.int_saksiam_mission_topicEN ??
    "",
  picture:
    item.picture ??
    item.missionPicture ??
    item.int_saksiam_mission_picture ??
    "",
  active:
    item.active ??
    item.missionActive ??
    item.int_saksiam_mission_active ??
    1,
  savename:
    item.savename ??
    item.int_saksiam_mission_savename ??
    "-",
  createAt:
    item.createAt ??
    item.int_saksiam_mission_createAt ??
    "",
  updateAt:
    item.updateAt ??
    item.int_saksiam_mission_updateAt ??
    null,
});

const normalizeResponse = (result: any): MissionData => {
  const data = result?.data ?? result;
  const rawItems = data?.missions ?? result?.result ?? [];
  const missions = Array.isArray(rawItems)
    ? rawItems.map(normalizeMission).filter((item) => Number.isFinite(item.id))
    : [];

  return {
    counts: Number(data?.counts ?? data?.count ?? missions.length),
    missions,
  };
};

const AboutMissionpage = () => {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("xl", 1800));
  const navigate = useNavigate();
  const location = useLocation();
  const { setTitle } = usePageTitle();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [fileType, setFileType] = useState<FileType>("all");
  const [fetchFileType, setFetchFileType] = useState<FileType>("all");
  const [missionData, setMissionData] = useState<MissionData>(emptyMissionData);
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

  const fullName = `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim();

  const fetchMission = useCallback(async () => {
    try {
      setLoading(true);

      let activeFilter = "";
      if (fetchFileType === "active") activeFilter = "1";
      if (fetchFileType === "inactive") activeFilter = "0";

      const offset = page * rowsPerPage;
      const query = new URLSearchParams({
        active: activeFilter,
        offset: String(offset),
        limit: String(rowsPerPage),
      }).toString();

      const response = await apiFetch(`/api/auther/showMissionAPI?${query}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setMissionData(normalizeResponse(result));
    } catch (error) {
      console.error("Error fetching mission data:", error);
      setMissionData(emptyMissionData);
    } finally {
      setLoading(false);
    }
  }, [fetchFileType, page, rowsPerPage]);

  useEffect(() => {
    setTitle("การจัดการพันธกิจ");

    const routeNotify = (location.state as { notify?: typeof notify } | null)?.notify;
    if (routeNotify) {
      setNotify(routeNotify);
      navigate(location.pathname, { replace: true, state: null });
    }

    fetchMission();
  }, [fetchMission, location.pathname, location.state, navigate, setTitle]);

  const handleFileTypeChange = (event: ChangeEvent<{ value: unknown }>) => {
    const newType = event.target.value as FileType;
    setFileType(newType);
    setFetchFileType(newType);
    setPage(0);
  };

  const handleRefresh = () => {
    setFileType("all");
    setFetchFileType("all");
    setPage(0);
  };

  const handleStatusChange = async (id: number, checked: boolean) => {
    const active = checked ? "1" : "0";

    try {
      const formData = new FormData();
      formData.append("active", active);
      formData.append("changename", fullName || "Unknown");

      const response = await apiFetch(`/api/auther/updateMissionIDAPI/${id}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result?.status === false) {
        throw new Error(result?.message || "Update status failed");
      }

      setMissionData((prev) => ({
        ...prev,
        missions: prev.missions.map((item) =>
          item.id === id ? { ...item, active } : item
        ),
      }));
    } catch (error) {
      setNotify({
        isOpen: true,
        message:
          error instanceof Error ? error.message : "ไม่สามารถเปลี่ยนสถานะได้",
        type: "error",
      });
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
          const response = await apiFetch(`/api/auther/deleteMissionAPI/${id}`, {
            method: "DELETE",
          });
          const result = await response.json().catch(() => ({}));

          if (!response.ok || result?.status === false) {
            throw new Error(result?.message || "Delete failed");
          }

          setMissionData((prev) => ({
            ...prev,
            counts: Math.max(prev.counts - 1, 0),
            missions: prev.missions.filter((item) => item.id !== id),
          }));

          setNotify({
            isOpen: true,
            message: "ลบข้อมูลพันธกิจสำเร็จ",
            type: "success",
          });
        } catch (error) {
          setNotify({
            isOpen: true,
            message:
              error instanceof Error ? error.message : "ลบข้อมูลพันธกิจไม่สำเร็จ",
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
              statusOptions={datastatusType}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              mx: { xs: 1, md: 0, xl: 0 },
              mt: { xs: 1, md: 3 },
              width: "100%",
            }}
          >
            <TextButton onClick={() => navigate("/About/Mission/create")}>
              เพิ่มพันธกิจ
            </TextButton>

            <TextButton
              variant="outlined"
              onClick={() => navigate("/About/Mission/rank")}
            >
              เรียงลำดับพันธกิจ
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
          <ComponentsMissionTableView
            missionData={missionData}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            setPage={setPage}
            setRowsPerPage={setRowsPerPage}
            handleStatusChange={handleStatusChange}
            handleEdit={(id) => navigate(`/About/Mission/edit/${id}`)}
            handleDelete={handleDelete}
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

export default AboutMissionpage;
