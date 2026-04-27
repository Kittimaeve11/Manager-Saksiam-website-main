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

import TextButton from "../../components/Model/Buttom/TextButton";
import AppIconButton from "../../components/Model/Buttom/IconButton";
import { FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../API/client";

import Notifications from "../../components/Model/Pop_up/Notifications";
import ConfirmDialog from "../../components/Model/Pop_up/ConfirmDialog";

import ComponentsFaqTypeTableView from "../../components/View/Faq/ComponentsFaqTypeTableView";
import ComponentsFaqTypeAddForm from "../../components/View/Faq/ComponentsFaqTypeAddForm";
import ComponentsFaqTypeEditForm from "../../components/View/Faq/ComponentsFaqTypeEditForm";

type FileType = "all" | "active" | "inactive";
type NotifyType = "success" | "error" | "warning" | "info";

type FaqTypeItem = {
  int_saksiam_typefqa_id: number;
  int_saksiam_typefqa_nameTH: string;
  int_saksiam_typefqa_nameEN: string;
  int_saksiam_typefqa_active: number | string;
  int_saksiam_typefqa_savename?: string;
  int_saksiam_typefqa_createAt?: string;
  int_saksiam_typefqa_updateAt?: string | null;
  int_saksiam_typefqa_order?: number;
};

type FaqTypeData = {
  counts: number;
  faqtypes: FaqTypeItem[];
};

const emptyFaqTypeData: FaqTypeData = {
  counts: 0,
  faqtypes: [],
};

const FaqTypepage = () => {
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
  const [faqTypeData, setFaqTypeData] = useState<FaqTypeData>(emptyFaqTypeData);

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

  useEffect(() => {
    setTitle("การจัดการประเภทคำถามที่พบบ่อย");
  }, [setTitle]);

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

  const fetchFaqType = useCallback(async () => {
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

      const response = await apiFetch(`/api/auther/showFaqTypeAPI?${query}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setFaqTypeData(result.data || emptyFaqTypeData);
    } catch (error) {
      console.error("Error fetching FAQ type data:", error);
      setFaqTypeData(emptyFaqTypeData);
      setNotify({
        isOpen: true,
        message: "ไม่สามารถโหลดข้อมูลประเภทคำถามได้",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchFileType, page, rowsPerPage]);

  useEffect(() => {
    fetchFaqType();
  }, [fetchFaqType]);

  const handleAddItemClick = () => {
    setEditForm(false);
    setShowForm(true);
  };

  const handleMoveItemClick = () => {
    navigate("/faq/type/rank");
  };

  const handleEditItemClick = (id: number) => {
    setEditId(id);
    setEditForm(true);
    setShowForm(false);
  };

  const handleStatusChange = async (id: number, checked: boolean) => {
    const active = checked ? "1" : "0";

    try {
      const response = await apiFetch(`/api/auther/updateFaqTypeAPI/${id}`, {
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
        setFaqTypeData((prev) => ({
          ...prev,
          faqtypes: prev.faqtypes.map((item) =>
            item.int_saksiam_typefqa_id === id
              ? { ...item, int_saksiam_typefqa_active: active }
              : item
          ),
        }));
      } else {
        fetchFaqType();
      }

      setNotify({
        isOpen: true,
        message: "อัปเดตสถานะสำเร็จ",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating FAQ type status:", error);
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
          const response = await apiFetch(`/api/auther/updateFaqTypeAPI/${id}`, {
            method: "PUT",
            body: JSON.stringify({
              active: "0",
              changename: fullName || "Unknown",
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Delete failed");
          }

          if (fetchFileType === "all") {
            setFaqTypeData((prev) => ({
              ...prev,
              faqtypes: prev.faqtypes.map((item) =>
                item.int_saksiam_typefqa_id === id
                  ? { ...item, int_saksiam_typefqa_active: "0" }
                  : item
              ),
            }));
          } else {
            fetchFaqType();
          }

          setNotify({
            isOpen: true,
            message: "ปิดใช้งานข้อมูลสำเร็จ",
            type: "success",
          });
        } catch (error) {
          console.error("Error deleting FAQ type:", error);
          setNotify({
            isOpen: true,
            message: "ไม่สามารถปิดใช้งานข้อมูลได้",
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
            <ComponentsFaqTypeAddForm
              fullnamePer={fullName || "Unknown"}
              IDPer={`${user?.id ?? ""}`}
              typeUser={user?.role_name ?? ""}
              setOpenPopup={setShowForm}
              setNotify={setNotify}
              fetchshowTopics={fetchFaqType}
              page={page}
              rowsPerPage={rowsPerPage}
            />
          </Box>
        </Fade>
      )}

      {showEditForm && (
        <Fade in={showEditForm} timeout={400}>
          <Box pt={5}>
            <ComponentsFaqTypeEditForm
              id={editId}
              fullnamePer={fullName || "Unknown"}
              IDPer={`${user?.id ?? ""}`}
              typeUser={user?.role_name ?? ""}
              setOpenPopup={setEditForm}
              setNotify={setNotify}
              fetchFaqType={fetchFaqType}
              page={page}
              rowsPerPage={rowsPerPage}
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
              gap: 2,
            }}
          >
            {can("FAQ") && (
              <TextButton onClick={handleAddItemClick}>
                เพิ่มประเภทคำถาม
              </TextButton>
            )}

            {can("FAQ") && (
              <TextButton
                variant="outlined"
                sx={{
                  color: "black",
                  borderColor: theme.palette.grey[900],
                  backgroundColor: "white",
                }}
                onClick={handleMoveItemClick}
              >
                เรียงลำดับประเภทคำถามที่พบบ่อย
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
          <ComponentsFaqTypeTableView
            faqTypeData={faqTypeData}
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

export default FaqTypepage;
