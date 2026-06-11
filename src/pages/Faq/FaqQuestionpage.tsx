"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Box,
  Container,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { usePageTitle } from "../../Context/PageTitleContext";
import { usePermission } from "../../hooks/usePermission";
import { useAuth } from "../../Context/AuthContext";
import { apiFetch } from "../../API/client";
import { datastatusType } from "../../API/StausData";

import MenuDropdownstatus from "../../components/Model/Dropdown/MenuDropdownstatus";
import TextButton from "../../components/Buttom/TextButton";
import AppIconButton from "../../components/Buttom/IconButton";
import ConfirmDialog from "../../components/Model/Pop_up/ConfirmDialog";
import Notifications from "../../components/Model/Pop_up/Notifications";
import ComponentsFaqQuestionTableView, {
  type FaqQuestionItem,
} from "../../components/View/Faq/ComponentsFaqQuestionTableView";

type FileType = "all" | "active" | "inactive";
type NotifyType = "success" | "error" | "warning" | "info";

type FaqQuestionData = {
  counts: number;
  questions: FaqQuestionItem[];
};

type FaqTypeOption = {
  id: number;
  nameTH: string;
  nameEN: string;
  active: string | number;
};

const emptyFaqQuestionData: FaqQuestionData = {
  counts: 0,
  questions: [],
};

const isFaqQuestionApiReady =
  import.meta.env.VITE_ENABLE_FAQ_QUESTION_API === "true";

const normalizeQuestion = (item: any): FaqQuestionItem => ({
  id: Number(
    item.id ??
      item.faqID ??
      item.fqaID ??
      item.faq_id ??
      item.int_saksiam_faq_id ??
      item.int_saksiam_fqa_id ??
      0
  ),
  typeNameTH:
    item.typeNameTH ??
    item.faqtypeNameTH ??
    item.faqtypenameTH ??
    item.int_saksiam_typefqa_nameTH ??
    "-",
  typeNameEN:
    item.typeNameEN ??
    item.faqtypeNameEN ??
    item.faqtypenameEN ??
    item.int_saksiam_typefqa_nameEN ??
    "",
  questionTH:
    item.questionTH ??
    item.faqquestionTH ??
    item.nameTH ??
    item.int_saksiam_faq_questionTH ??
    item.int_saksiam_fqa_questionTH ??
    "",
  questionEN:
    item.questionEN ??
    item.faqquestionEN ??
    item.nameEN ??
    item.int_saksiam_faq_questionEN ??
    item.int_saksiam_fqa_questionEN ??
    "",
  answerTH:
    item.answerTH ??
    item.faqanswerTH ??
    item.int_saksiam_faq_answerTH ??
    item.int_saksiam_fqa_answerTH ??
    "",
  answerEN:
    item.answerEN ??
    item.faqanswerEN ??
    item.int_saksiam_faq_answerEN ??
    item.int_saksiam_fqa_answerEN ??
    "",
  active:
    item.active ??
    item.faqactive ??
    item.int_saksiam_faq_active ??
    item.int_saksiam_fqa_active ??
    1,
  savename:
    item.savename ??
    item.faqsavename ??
    item.int_saksiam_faq_savename ??
    item.int_saksiam_fqa_savename ??
    "-",
  createAt:
    item.createAt ??
    item.faqcreateAt ??
    item.int_saksiam_faq_createAt ??
    item.int_saksiam_fqa_createAt ??
    "",
  updateAt:
    item.updateAt ??
    item.faqupdateAt ??
    item.int_saksiam_faq_updateAt ??
    item.int_saksiam_fqa_updateAt ??
    null,
});

const normalizeResponse = (result: any): FaqQuestionData => {
  const data = result?.data ?? result;
  const rawQuestions =
    data?.questions ??
    data?.fqas ??
    data?.faqs ??
    data?.faqquestions ??
    data?.faqQuestion ??
    result?.result ??
    [];

  const questions = Array.isArray(rawQuestions)
    ? rawQuestions.map(normalizeQuestion).filter((item) => item.id)
    : [];

  return {
    counts: Number(data?.counts ?? data?.count ?? questions.length),
    questions,
  };
};

const normalizeFaqType = (item: any): FaqTypeOption => ({
  id: Number(item.faqtypeID ?? item.int_saksiam_typefqa_id ?? 0),
  nameTH: item.faqtypenameTH ?? item.int_saksiam_typefqa_nameTH ?? "",
  nameEN: item.faqtypenameEN ?? item.int_saksiam_typefqa_nameEN ?? "",
  active: item.faqtypeactive ?? item.int_saksiam_typefqa_active ?? "1",
});

const FaqQuestionpage = () => {
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("xl", 1800));
  const { can } = usePermission();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [fileType, setFileType] = useState<FileType>("all");
  const [fetchFileType, setFetchFileType] = useState<FileType>("all");
  const [selectedType, setSelectedType] = useState("all");
  const [faqTypes, setFaqTypes] = useState<FaqTypeOption[]>([]);
  const [faqQuestionData, setFaqQuestionData] =
    useState<FaqQuestionData>(emptyFaqQuestionData);

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

  const handleFileTypeChange = (event: ChangeEvent<{ value: unknown }>) => {
    const newType = event.target.value as FileType;
    setFileType(newType);
    setFetchFileType(newType);
    setPage(0);
  };

  const handleTypeChange = (event: ChangeEvent<{ value: unknown }>) => {
    setSelectedType(String(event.target.value));
    setPage(0);
  };

  const handleRefresh = () => {
    setFileType("all");
    setFetchFileType("all");
    setSelectedType("all");
    setPage(0);
  };

  const fetchFaqQuestions = useCallback(async () => {
    if (!isFaqQuestionApiReady) {
      setFaqQuestionData(emptyFaqQuestionData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let activeFilter = "";
      if (fetchFileType === "active") activeFilter = "1";
      if (fetchFileType === "inactive") activeFilter = "0";

      const offset = page * rowsPerPage;
      const query = new URLSearchParams({
        active: activeFilter,
        typeID: selectedType === "all" ? "" : selectedType,
        offset: String(offset),
        limit: String(rowsPerPage),
      }).toString();

      const response = await apiFetch(`/api/auther/showFqaAPI?${query}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setFaqQuestionData(normalizeResponse(result));
    } catch (error) {
      console.error("Error fetching FAQ question data:", error);
      setFaqQuestionData(emptyFaqQuestionData);
    } finally {
      setLoading(false);
    }
  }, [fetchFileType, page, rowsPerPage, selectedType]);

  useEffect(() => {
    setTitle("การจัดการคำถามที่พบบ่อย");

    const fetchFaqTypes = async () => {
      try {
        const response = await apiFetch("/api/auther/showFaqTypelistAPI", {
          method: "GET",
        });

        if (!response.ok) return;

        const result = await response.json();
        const options = Array.isArray(result?.result)
          ? result.result.map(normalizeFaqType).filter((item: FaqTypeOption) => item.id)
          : [];

        setFaqTypes(options);
      } catch (error) {
        console.error("Error fetching FAQ types:", error);
      }
    };

    fetchFaqTypes();
    fetchFaqQuestions();
  }, [fetchFaqQuestions, setTitle]);

  const handleAddItemClick = () => {
    navigate("/Faq_Question/create");
  };

  const handleMoveItemClick = () => {
    navigate("/Faq_Question/rank");
  };

  const handleEditItemClick = (id: number) => {
    navigate(`/Faq_Question/edit/${id}`);
  };

  const handleStatusChange = async (id: number, checked: boolean) => {
    const active = checked ? "1" : "0";

    try {
      const response = await apiFetch(`/api/auther/updateFqaAPI/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          active,
          changename: fullName || "Unknown",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update status failed");
      }

      setFaqQuestionData((prev) => ({
        ...prev,
        questions: prev.questions.map((item) =>
          item.id === id ? { ...item, active } : item
        ),
      }));
    } catch (error) {
      console.error("Error updating FAQ question status:", error);
      setNotify({
        isOpen: true,
        message: "ไม่สามารถเปลี่ยนสถานะได้",
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
          const response = await apiFetch(`/api/auther/deleteFqaAPI/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Delete failed");
          }

          setFaqQuestionData((prev) => ({
            ...prev,
            counts: Math.max(prev.counts - 1, 0),
            questions: prev.questions.filter((item) => item.id !== id),
          }));

          setNotify({
            isOpen: true,
            message: "ลบข้อมูลสำเร็จ",
            type: "success",
          });
        } catch (error) {
          console.error("Error deleting FAQ question:", error);
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
              justifyContent: { xs: "space-between", md: "flex-start" },
              flexDirection: "row",
              flexWrap: "nowrap",
              gap: 2,
              width: { xs: "100%", md: "auto" },
              mx: { xs: 1, md: 0, xl: 0 },
            }}
          >
            <Box sx={{ width: { xs: 140, md: 140 }, flexShrink: 0 }}>
              <MenuDropdownstatus
                titlename="ประเภท"
                handleFileTypeChange={handleTypeChange}
                fileType={selectedType as any}
                statusOptions={[
                  { valuename: "all", labelname: "แสดงทั้งหมด" },
                  ...faqTypes.map((item) => ({
                    valuename: String(item.id),
                    labelname: item.nameTH,
                  })),
                ]}
              />
            </Box>

            <Box sx={{ width: { xs: 140, md: 140 }, flexShrink: 0 }}>
              <MenuDropdownstatus
                titlename="สถานะ"
                handleFileTypeChange={handleFileTypeChange}
                fileType={fileType}
                statusOptions={datastatusType}
              />
            </Box>
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
            {can("FAQ") && (
              <TextButton onClick={handleAddItemClick}>
                เพิ่มคำถามที่พบบ่อย
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
                เรียงลำดับคำถามที่พบบ่อย
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
          <ComponentsFaqQuestionTableView
            faqQuestionData={faqQuestionData}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            setPage={setPage}
            setRowsPerPage={setRowsPerPage}
            handleDelete={handleDelete}
            handleStatusChange={handleStatusChange}
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

export default FaqQuestionpage;
