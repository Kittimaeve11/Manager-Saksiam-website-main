"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Box,
  Container,
  Fade,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { usePageTitle } from "../../Context/PageTitleContext";
import { usePermission } from "../../hooks/usePermission";
import { useAuth } from "../../Context/AuthContext";

import MenuDropdownstatus from "../../components/Model/Dropdown/MenuDropdownstatus";
import { datastatusType } from "../../API/StausData";

import TextButton from "../../components/Buttom/TextButton";
import AppIconButton from "../../components/Buttom/IconButton";
import { FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../API/client";

import Notifications from "../../components/Model/Pop_up/Notifications";
import ConfirmDialog from "../../components/Model/Pop_up/ConfirmDialog";

import ComponentsNewsTypeAddForm from "../../components/View/News/ComponentsNewsTypeAddForm";
import ComponentsNewsTypeEditForm from "../../components/View/News/ComponentsNewsTypeEditForm";
import ComponentsNewsTypeTableView, {
  type NewsTypeItem,
} from "../../components/View/News/ComponentsNewsTypeTableView";

type FileType = "all" | "active" | "inactive";
type NotifyType = "success" | "error" | "warning" | "info";

type NewsTypeData = {
  counts: number;
  newstypes: NewsTypeItem[];
};

const emptyNewsTypeData: NewsTypeData = {
  counts: 0,
  newstypes: [],
};

const normalizeNewsType = (item: any): NewsTypeItem => ({
  id: Number(
    item.id ??
      item.newstypeID ??
      item.editorialtypeID ??
      item.editorialTypeID ??
      item.newsTypeID ??
      item.int_saksiam_typeeditorial_id ??
      item.int_saksiam_typenews_id ??
      item.int_saksiam_typenew_id ??
      0
  ),
  nameTH:
    item.nameTH ??
    item.newstypenameTH ??
    item.editorialtypenameTH ??
    item.editorialTypeNameTH ??
    item.newsTypeNameTH ??
    item.int_saksiam_typeeditorial_nameTH ??
    item.int_saksiam_typenews_nameTH ??
    item.int_saksiam_typenew_nameTH ??
    "",
  nameEN:
    item.nameEN ??
    item.newstypenameEN ??
    item.editorialtypenameEN ??
    item.editorialTypeNameEN ??
    item.newsTypeNameEN ??
    item.int_saksiam_typeeditorial_nameEN ??
    item.int_saksiam_typenews_nameEN ??
    item.int_saksiam_typenew_nameEN ??
    "",
  active:
    item.active ??
    item.newstypeactive ??
    item.editorialtypeactive ??
    item.editorialTypeActive ??
    item.newsTypeActive ??
    item.int_saksiam_typeeditorial_active ??
    item.int_saksiam_typenews_active ??
    item.int_saksiam_typenew_active ??
    1,
  savename:
    item.savename ??
    item.newstypesavename ??
    item.editorialtypesavename ??
    item.editorialTypeSavename ??
    item.newsTypeSavename ??
    item.int_saksiam_typeeditorial_savename ??
    item.int_saksiam_typenews_savename ??
    item.int_saksiam_typenew_savename ??
    "-",
  createAt:
    item.createAt ??
    item.newstypecreateAt ??
    item.editorialtypecreateAt ??
    item.editorialTypeCreateAt ??
    item.newsTypeCreateAt ??
    item.int_saksiam_typeeditorial_createAt ??
    item.int_saksiam_typenews_createAt ??
    item.int_saksiam_typenew_createAt ??
    "",
  updateAt:
    item.updateAt ??
    item.newstypeupdateAt ??
    item.editorialtypeupdateAt ??
    item.editorialTypeUpdateAt ??
    item.newsTypeUpdateAt ??
    item.int_saksiam_typeeditorial_updateAt ??
    item.int_saksiam_typenews_updateAt ??
    item.int_saksiam_typenew_updateAt ??
    null,
});

const normalizeResponse = (result: any): NewsTypeData => {
  const data = result?.data ?? result;
  const rawTypes =
    data?.newstypes ??
    data?.editorialtypes ??
    data?.editorialTypes ??
    data?.newsTypes ??
    data?.typenews ??
    data?.typeeditorials ??
    data?.types ??
    result?.result ??
    [];

  const newstypes = Array.isArray(rawTypes)
    ? rawTypes.map(normalizeNewsType).filter((item) => item.id)
    : [];

  return {
    counts: Number(data?.counts ?? data?.count ?? newstypes.length),
    newstypes,
  };
};

const newsTypeListEndpoints = [
  "/api/auther/showEditorialTypelistAPI",
  "/api/auther/showEditorialTypeAPI",
  "/api/auther/showEditorialTypeDataAPI",
  "/api/auther/showNewsTypeAPI",
  "/api/auther/showNewsTypelistAPI",
];

const NewsTypepage = () => {
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("xl", 1800));
  const { can } = usePermission();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setEditForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const [fileType, setFileType] = useState<FileType>("all");
  const [fetchFileType, setFetchFileType] = useState<FileType>("all");
  const [newsTypeData, setNewsTypeData] =
    useState<NewsTypeData>(emptyNewsTypeData);

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
    onConfirm: () => {},
  });

  const fullName = `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim();
  const canUseNews = can("News") || can("New");

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

  const fetchNewsType = useCallback(async () => {
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

      let response: Response | null = null;
      let result: any = null;

      for (const endpoint of newsTypeListEndpoints) {
        const nextResponse = await apiFetch(`${endpoint}?${query}`, {
          method: "GET",
        });

        if (nextResponse.ok) {
          response = nextResponse;
          result = await nextResponse.json();
          break;
        }

        if (nextResponse.status !== 404) {
          response = nextResponse;
          result = await nextResponse.json().catch(() => null);
          break;
        }
      }

      if (!response?.ok) {
        throw new Error(
          `Error: ${response?.status ?? 404} ${response?.statusText ?? "Not Found"}`
        );
      }

      setNewsTypeData(normalizeResponse(result));
    } catch (error) {
      console.error("Error fetching news type data:", error);
      setNewsTypeData(emptyNewsTypeData);
      setNotify({
        isOpen: true,
        message: "ไม่สามารถโหลดข้อมูลประเภทข่าวได้",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchFileType, page, rowsPerPage]);

  useEffect(() => {
    setTitle("การจัดการประเภทข่าวและกิจกรรม");
    fetchNewsType();
  }, [fetchNewsType, setTitle]);

  const handleAddItemClick = () => {
    setEditForm(false);
    setShowForm(true);
  };

  const handleMoveItemClick = () => {
    navigate("/News_Type/rank");
  };

  const handleEditItemClick = (id: number) => {
    setEditId(id);
    setEditForm(true);
    setShowForm(false);
  };

  const handleStatusChange = async (id: number, checked: boolean) => {
    const active = checked ? "1" : "0";

    try {
      const response = await apiFetch(`/api/auther/updateEditorialTypeAPI/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          active,
          changename: fullName || "Unknown",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }

      if (fetchFileType === "all") {
        setNewsTypeData((prev) => ({
          ...prev,
          newstypes: prev.newstypes.map((item) =>
            item.id === id ? { ...item, active } : item
          ),
        }));
      } else {
        fetchNewsType();
      }

      setNotify({
        isOpen: true,
        message: "อัปเดตสถานะสำเร็จ",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating news type status:", error);
      setNotify({
        isOpen: true,
        message: "ไม่สามารถอัปเดตสถานะได้",
        type: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
          const response = await apiFetch(`/api/auther/deleteEditorialTypeAPI/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Delete failed");
          }

          setNewsTypeData((prev) => ({
            ...prev,
            counts: Math.max(prev.counts - 1, 0),
            newstypes: prev.newstypes.filter((item) => item.id !== id),
          }));

          setNotify({
            isOpen: true,
            message: "ลบข้อมูลสำเร็จ",
            type: "success",
          });
        } catch (error) {
          console.error("Error deleting news type:", error);
          setNotify({
            isOpen: true,
            message: "ไม่สามารถลบข้อมูลได้",
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
      {showForm && (
        <Fade in={showForm} timeout={400}>
          <Box pt={5}>
            <ComponentsNewsTypeAddForm
              fullnamePer={fullName || "Unknown"}
              setOpenPopup={setShowForm}
              setNotify={setNotify}
              fetchNewsType={fetchNewsType}
            />
          </Box>
        </Fade>
      )}

      {showEditForm && (
        <Fade in={showEditForm} timeout={400}>
          <Box pt={5}>
            <ComponentsNewsTypeEditForm
              id={editId}
              fullnamePer={fullName || "Unknown"}
              setOpenPopup={setEditForm}
              setNotify={setNotify}
              fetchNewsType={fetchNewsType}
            />
          </Box>
        </Fade>
      )}

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
              alignItems: "center",
              flexDirection: { xs: "column", md: "row" },
              width: { xs: "100%", md: "auto" },
              mx: { xs: 1, md: 0, xl: 0 },
            }}
          >
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
              flexDirection: { xs: "column", md: "row" },
              justifyContent: { xs: "flex-start", md: "flex-end" },
              mx: { xs: 1, md: 0, xl: 0 },
              mt: { xs: 1, md: 3 },
              width: "100%",
            }}
          >
            {canUseNews && (
              <TextButton onClick={handleAddItemClick}>
                เพิ่มประเภทข่าวและกิจกรรม
              </TextButton>
            )}

            {canUseNews && (
              <TextButton
                variant="outlined"
                sx={{
                  color: "black",
                  borderColor: theme.palette.grey[900],
                  backgroundColor: "white",
                }}
                onClick={handleMoveItemClick}
              >
                เรียงลำดับประเภทข่าวและกิจกรรม
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
          <ComponentsNewsTypeTableView
            newsTypeData={newsTypeData}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            setPage={setPage}
            setRowsPerPage={setRowsPerPage}
            handleStatusChange={handleStatusChange}
            handleDelete={handleDelete}
            handleEdit={handleEditItemClick}
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

export default NewsTypepage;
