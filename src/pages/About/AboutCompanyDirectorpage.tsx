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
import ComponentsCompanyDirectorTableView, {
  type CompanyDirectorItem,
} from "../../components/View/About/ComponentsCompanyDirectorTableView";

type FileType = "all" | "active" | "inactive";
type NotifyType = "success" | "error" | "warning" | "info";

type CompanyDirectorData = {
  counts: number;
  directors: CompanyDirectorItem[];
};

const emptyCompanyDirectorData: CompanyDirectorData = {
  counts: 0,
  directors: [],
};

const normalizeDirectorTag = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(String).join(" / ");
  }

  if (typeof value !== "string") {
    return "";
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  try {
    const parsedValue = JSON.parse(trimmedValue);
    if (Array.isArray(parsedValue)) {
      return parsedValue.map(String).join(" / ");
    }
  } catch {
    // รองรับข้อมูลเดิมที่บันทึกแบบข้อความคั่นด้วย /
  }

  return trimmedValue;
};

const firstFilledValue = (...values: unknown[]) =>
  values.find((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim() !== "";
    return value !== null && value !== undefined;
  }) ?? "";

const normalizeDirector = (item: any): CompanyDirectorItem => ({
  id: Number(
    item.team_ID ??
    item.teamID ??
    item.directorID ??
    item.companydirectorID ??
    item.int_saksiam_team_id ??
    item.id ??
    0
  ),
  image:
    item.team_image ??
    item.team_picture ??
    item.picture ??
    item.image ??
    item.photo ??
    "",
  nameTH:
    item.team_nameTH ??
    item.nameTH ??
    item.directorNameTH ??
    item.int_saksiam_team_nameTH ??
    "",
  positionTH:
    item.team_positionTH ??
    item.positionTH ??
    item.directorPositionTH ??
    item.int_saksiam_team_positionTH ??
    "",
  directorTag: normalizeDirectorTag(
    firstFilledValue(
      item.int_saksiam_directors_tag,
      item.directors_tag,
      item.directorTag,
      item.directorsTag,
      item.tag,
      item.directorstag,
      item.teamTag,
      item.teamtag,
      item.team_tag,
      item.committeeTag,
      item.committeeTags,
      item.committeeGroups,
      item.committee_groups,
      item.int_saksiam_companydirector_tag,
      item.int_saksiam_team_tag
    )
  ),
  active:
    item.team_active ??
    item.active ??
    item.directorActive ??
    item.int_saksiam_team_active ??
    1,
  savename:
    item.team_savename ??
    item.savename ??
    item.createName ??
    item.int_saksiam_team_savename ??
    "-",
  createAt:
    item.companydirector_createAt ??
    item.team_createAt ??
    item.createAt ??
    item.createdAt ??
    item.int_saksiam_companydirector_createAt ??
    item.int_saksiam_team_createAt ??
    "",
  updateAt:
    item.companydirector_updateAt ??
    item.companydirector_update_at ??
    item.team_updateAt ??
    item.team_update_at ??
    item.updateAt ??
    item.updatedAt ??
    item.int_saksiam_companydirector_updateAt ??
    item.int_saksiam_companydirector_update_at ??
    item.int_saksiam_team_updateAt ??
    item.int_saksiam_team_update_at ??
    null,
});

const normalizeResponse = (result: any): CompanyDirectorData => {
  const data = result?.data ?? result;
  const rawItems =
    data?.companydirectorcounts ??
    data?.companyDirectors ??
    data?.directors ??
    data?.teams ??
    result?.result ??
    [];
  const directors = Array.isArray(rawItems)
    ? rawItems.map(normalizeDirector).filter((item) => item.id)
    : [];

  return {
    counts: Number(
      data?.companydirectorcount ??
      data?.counts ??
      data?.count ??
      directors.length
    ),
    directors,
  };
};

const getDirectorDetailTag = async (id: number) => {
  const endpoints = [
    `/api/auther/showcompanydirectorIDAPI/${id}`,
    `/api/auther/showCompanyDirectorIDAPI/${id}`,
    `/api/author/showcompanydirectorIDAPI/${id}`,
  ];

  for (const endpoint of endpoints) {
    const response = await apiFetch(endpoint, { method: "GET" });
    const result = await response.json().catch(() => ({}));

    if (response.ok && result?.status !== false) {
      const detail = result?.data ?? result?.result ?? result ?? {};
      return normalizeDirectorTag(
        firstFilledValue(
          detail.int_saksiam_directors_tag,
          detail.directors_tag,
          detail.directorTag,
          detail.directorsTag,
          detail.tag,
          detail.directorstag,
          detail.teamTag,
          detail.teamtag,
          detail.team_tag,
          detail.committeeTag,
          detail.committeeTags,
          detail.committeeGroups,
          detail.committee_groups,
          detail.int_saksiam_companydirector_tag,
          detail.int_saksiam_team_tag
        )
      );
    }

    if (response.status !== 404) {
      break;
    }
  }

  return "";
};

const enrichMissingDirectorTags = async (directors: CompanyDirectorItem[]) =>
  Promise.all(
    directors.map(async (director) => {
      if (director.directorTag) return director;

      const directorTag = await getDirectorDetailTag(director.id);
      return directorTag ? { ...director, directorTag } : director;
    })
  );

const AboutCompanyDirectorpage = () => {
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
  const [companyDirectorData, setCompanyDirectorData] =
    useState<CompanyDirectorData>(emptyCompanyDirectorData);
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

  const fetchCompanyDirector = useCallback(async () => {
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

      const response = await apiFetch(`/api/auther/showcompanydirectorAPI?${query}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const normalizedData = normalizeResponse(result);
      const enrichedDirectors = await enrichMissingDirectorTags(normalizedData.directors);
      setCompanyDirectorData({
        ...normalizedData,
        directors: enrichedDirectors,
      });
    } catch (error) {
      console.error("Error fetching company director data:", error);
      setCompanyDirectorData(emptyCompanyDirectorData);
    } finally {
      setLoading(false);
    }
  }, [fetchFileType, page, rowsPerPage]);

  useEffect(() => {
    setTitle("การจัดการคณะกรรมการ");
    const routeNotify = (location.state as { notify?: typeof notify } | null)?.notify;
    if (routeNotify) {
      setNotify(routeNotify);
      navigate(location.pathname, { replace: true, state: null });
    }
    fetchCompanyDirector();
  }, [fetchCompanyDirector, location.pathname, location.state, navigate, setTitle]);

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

  const handleAddItemClick = () => {
    navigate("/About/Company_Director/create");
  };

  const handleEditItemClick = (id: number) => {
    navigate(`/About/Company_Director/edit/${id}`);
  };

  const handleMoveItemClick = () => {
    navigate("/About/Company_Director/rank");
  };

  const handleStatusChange = async (id: number, checked: boolean) => {
    const active = checked ? "1" : "0";

    try {
      const response = await apiFetch(`/api/auther/updatecompanydirectorIDAPI/${id}`, {
        method: "POST",
        body: JSON.stringify({
          active,
          changename: fullName || "Unknown",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Update status failed");
      }

      setCompanyDirectorData((prev) => ({
        ...prev,
        directors: prev.directors.map((item) =>
          item.id === id ? { ...item, active } : item
        ),
      }));
    } catch (error) {
      console.error("Error updating company director status:", error);
      setNotify({
        isOpen: true,
        message: "ไม่สามารถเปลี่ยนสถานะได้",
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
          const endpoints = [
            `/api/auther/deletecompanydirectorIDAPI/${id}`,
            `/api/auther/deleteCompanyDirectorAPI/${id}`,
            `/api/author/deletecompanydirectorIDAPI/${id}`,
          ];
          let deleted = false;
          let message = "Delete failed";

          for (const endpoint of endpoints) {
            const response = await apiFetch(endpoint, { method: "DELETE" });
            const result = await response.json().catch(() => ({}));

            if (response.ok && result?.status !== false) {
              deleted = true;
              break;
            }

            message = result?.message || result?.error || message;
            if (response.status !== 404) break;
          }

          if (!deleted) {
            throw new Error(message);
          }

          setCompanyDirectorData((prev) => ({
            ...prev,
            counts: Math.max(prev.counts - 1, 0),
            directors: prev.directors.filter((item) => item.id !== id),
          }));

          setNotify({
            isOpen: true,
            message: "ลบข้อมูลคณะกรรมการสำเร็จ",
            type: "success",
          });
        } catch (error) {
          setNotify({
            isOpen: true,
            message:
              error instanceof Error
                ? error.message
                : "ลบข้อมูลคณะกรรมการไม่สำเร็จ",
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
            <TextButton onClick={handleAddItemClick}>
              เพิ่มคณะกรรมการ
            </TextButton>

            <TextButton variant="outlined" onClick={handleMoveItemClick}>
              เรียงลำดับคณะกรรมการ
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
          <ComponentsCompanyDirectorTableView
            companyDirectorData={companyDirectorData}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            setPage={setPage}
            setRowsPerPage={setRowsPerPage}
            handleStatusChange={handleStatusChange}
            handleEdit={handleEditItemClick}
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

export default AboutCompanyDirectorpage;
