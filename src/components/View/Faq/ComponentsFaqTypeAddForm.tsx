"use client";

import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";

import { apiFetch } from "../../../API/client";
import TextButton from "../../Model/Buttom/TextButton";
import BasicTextField from "../../Model/TextField/BasicTextField";
import ConfirmDialog from "../../Model/Pop_up/ConfirmDialog";

type NotifyType = "success" | "error" | "warning" | "info";

type Props = {
  fullnamePer: string;
  setOpenPopup: Dispatch<SetStateAction<boolean>>;
  setNotify: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      message: string;
      type: NotifyType;
    }>
  >;
  fetchshowTopics: () => void;
  page: number;
  rowsPerPage: number;
  IDPer?: string;
  typeUser?: string;
};

const ComponentsFaqTypeAddForm = ({
  fullnamePer,
  setOpenPopup,
  setNotify,
  fetchshowTopics,
}: Props) => {
  const theme = useTheme();

  const [nameTH, setNameTH] = useState("");
  const [nameEN, setNameEN] = useState("");
  const [error, setError] = useState({
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

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!nameTH || !nameEN) {
      setError({
        nameTH: !nameTH ? "กรุณากรอกชื่อภาษาไทย" : "",
        nameEN: !nameEN ? "กรุณากรอกชื่อภาษาอังกฤษ" : "",
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
          const response = await apiFetch(`/api/auther/createFaqTypeAPI`, {
            method: "POST",
            body: JSON.stringify({
              nameTH,
              nameEN,
              savename: fullnamePer,
              active: "1",
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || errorData.error || "ไม่สามารถบันทึกข้อมูลได้"
            );
          }

          fetchshowTopics();
          setNotify({
            isOpen: true,
            message: "บันทึกข้อมูลสำเร็จ",
            type: "success",
          });
          setOpenPopup(false);
        } catch (error) {
          setNotify({
            isOpen: true,
            message:
              error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้",
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
    <Paper elevation={0} sx={{ mt: 5, py: 2, borderRadius: 3 }}>
      <Box px={{ xs: 2, sm: 5 }} mb={2}>
        <Typography variant="h6" fontWeight={600}>
          ฟอร์มเพิ่มประเภทคำถาม
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
                sx={{ backgroundColor: theme.palette.secondary.main }}
              >
                บันทึกข้อมูล
              </TextButton>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <ConfirmDialog
        type="add"
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
    </Paper>
  );
};

export default ComponentsFaqTypeAddForm;
