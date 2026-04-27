"use client";

import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import type { Dispatch, FC, SetStateAction } from "react";

import { apiFetch } from "../../../API/client";
import BasicTextField from "../../Model/TextField/BasicTextField";
import TextButton from "../../Model/Buttom/TextButton";
import ConfirmDialog from "../../Model/Pop_up/ConfirmDialog";

type NotifyType = "success" | "error" | "warning" | "info";

interface Props {
  fullnamePer: string;
  IDPer?: string;
  typeUser?: string;
  setOpenPopup: Dispatch<SetStateAction<boolean>>;
  setNotify: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      message: string;
      type: NotifyType;
    }>
  >;
  fetchFaqType: () => void;
  page: number;
  rowsPerPage: number;
  id: number | null;
}

const ComponentsFaqTypeEditForm: FC<Props> = ({
  fullnamePer,
  setOpenPopup,
  setNotify,
  fetchFaqType,
  id,
}) => {
  const theme = useTheme();

  const [nameTH, setNameTH] = useState("");
  const [nameEN, setNameEN] = useState("");
  const [error, setError] = useState({
    nameTH: "",
    nameEN: "",
  });
  const [originalData, setOriginalData] = useState({
    nameTH: "",
    nameEN: "",
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    isLoading: false,
    onConfirm: () => {},
  });

  const handleFieldChange = (fieldName: string, value: unknown) => {
    if (fieldName === "nameTH") {
      setError((prev) => ({ ...prev, nameTH: value ? "" : prev.nameTH }));
    }

    if (fieldName === "nameEN") {
      setError((prev) => ({ ...prev, nameEN: value ? "" : prev.nameEN }));
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;

      try {
        const res = await apiFetch(`/api/auther/showFaqTypeIDAPI/${id}`, {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        const data = json.data || {};
        const detail = {
          nameTH:
            data.faqtypenameTH || data.int_saksiam_typefqa_nameTH || "",
          nameEN:
            data.faqtypenameEN || data.int_saksiam_typefqa_nameEN || "",
        };

        setNameTH(detail.nameTH);
        setNameEN(detail.nameEN);
        setOriginalData(detail);
      } catch (error) {
        console.error("Error fetching FAQ type detail:", error);
        setNotify({
          isOpen: true,
          message: "ไม่สามารถโหลดข้อมูลสำหรับแก้ไขได้",
          type: "error",
        });
      }
    };

    fetchDetail();
  }, [id, setNotify]);

  const hasChanges = () =>
    nameTH !== originalData.nameTH || nameEN !== originalData.nameEN;

  const buildUpdatePayload = () => {
    return {
      nameTH,
      nameEN,
      updatename: fullnamePer,
    };
  };

  const handleSubmit = async () => {
    if (!nameTH || !nameEN) {
      setError({
        nameTH: !nameTH ? "กรุณากรอกชื่อภาษาไทย" : "",
        nameEN: !nameEN ? "กรุณากรอกชื่อภาษาอังกฤษ" : "",
      });
      return;
    }

    if (!hasChanges()) {
      setNotify({
        isOpen: true,
        message: "ไม่มีการเปลี่ยนแปลงข้อมูล",
        type: "info",
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
          const response = await apiFetch(`/api/auther/updateFaqTypeAPI/${id}`, {
            method: "PUT",
            body: JSON.stringify(buildUpdatePayload()),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || errorData.error || "ไม่สามารถแก้ไขข้อมูลได้"
            );
          }

          fetchFaqType();
          setNotify({
            isOpen: true,
            message: "แก้ไขข้อมูลสำเร็จ",
            type: "success",
          });
          setOpenPopup(false);
        } catch (error) {
          setNotify({
            isOpen: true,
            message:
              error instanceof Error ? error.message : "ไม่สามารถแก้ไขข้อมูลได้",
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
    <Paper
      elevation={0}
      sx={{
        mt: 5,
        py: 2,
        borderRadius: 3,
        width: "100%",
        backgroundColor:
          theme.palette.mode === "dark" ? theme.palette.primary.darker : "white",
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 5 }, mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          ฟอร์มแก้ไขประเภทคำถาม
        </Typography>

        <Grid container spacing={2} mt={1}>
          <Grid size={{ xs: 12, md: 5 }}>
            <BasicTextField
              name="ชื่อประเภทคำถาม (TH)"
              titlename="กรุณากรอกชื่อภาษาไทย"
              subject={nameTH}
              setsubject={setNameTH}
              topon={0}
              handleFieldChange={handleFieldChange}
              error={error.nameTH}
              fieldKey="nameTH"
              specify
            />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <BasicTextField
              name="ชื่อประเภทคำถาม (EN)"
              titlename="กรุณากรอกชื่อภาษาอังกฤษ"
              subject={nameEN}
              setsubject={setNameEN}
              topon={0}
              handleFieldChange={handleFieldChange}
              error={error.nameEN}
              fieldKey="nameEN"
              specify
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <Box display="flex" justifyContent="flex-end" mt={4}>
              <TextButton
                onClick={handleSubmit}
                sx={{ backgroundColor: theme.palette.warning.main }}
              >
                บันทึก
              </TextButton>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <ConfirmDialog
        type="edit"
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
    </Paper>
  );
};

export default ComponentsFaqTypeEditForm;
