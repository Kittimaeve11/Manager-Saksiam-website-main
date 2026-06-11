"use client";

import { useEffect, useState } from "react";
import { Box, CircularProgress, Container, Paper } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../../API/client";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../Context/PageTitleContext";
import ConfirmDialog from "../../components/Model/Pop_up/ConfirmDialog";
import Notifications from "../../components/Model/Pop_up/Notifications";
import ComponentsPolicyForm, {
  type PolicyFormValue,
} from "../../components/View/Policy/ComponentsPolicyForm";
import {
  decodePolicyDetailFromApi,
  encodePolicyDetailForApi,
} from "../../utils/policyDetail";

type NotifyType = "success" | "error" | "warning" | "info";

const normalizePolicy = (data: any): PolicyFormValue => ({
  nameTH: data.nameTH ?? data.int_saksiam_policy_nameTH ?? "",
  nameEN: data.nameEN ?? data.int_saksiam_policy_nameEN ?? "",
  detailTH: decodePolicyDetailFromApi(data.detailTH ?? data.int_saksiam_policy_detailTH ?? ""),
  detailEN: decodePolicyDetailFromApi(data.detailEN ?? data.int_saksiam_policy_detailEN ?? ""),
});

const buildPolicyPayload = (value: PolicyFormValue, fullName: string) => ({
  ...(() => {
    const detailTH = encodePolicyDetailForApi(value.detailTH);
    const detailEN = encodePolicyDetailForApi(value.detailEN);

    return {
      detailTH,
      detailEN,
      policyDetailTH: detailTH,
      policyDetailEN: detailEN,
      int_saksiam_policy_detailTH: detailTH,
      int_saksiam_policy_detailEN: detailEN,
    };
  })(),
  nameTH: value.nameTH,
  nameEN: value.nameEN,
  policynameTH: value.nameTH,
  policynameEN: value.nameEN,
  int_saksiam_policy_nameTH: value.nameTH,
  int_saksiam_policy_nameEN: value.nameEN,
  active: 2,
  updatename: fullName,
});

const PolicyEditpage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialValue, setInitialValue] = useState<PolicyFormValue | null>(null);
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

useEffect(() => {
  /* ======================================================
     INIT PAGE + FETCH POLICY
     ====================================================== */

  // ตั้งชื่อหน้า
  setTitle("แก้ไขนโยบาย");

  // โหลดข้อมูล
  const fetchPolicy = async () => {
    if (!id) {
      navigate("/Policy");
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch(
        `/api/auther/showPolicyIDAPI/${id}`,
        { method: "GET" }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message || result?.error || "ไม่พบข้อมูลนโยบาย"
        );
      }

      setInitialValue(
        normalizePolicy(result?.data ?? result ?? {})
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

  fetchPolicy();

}, [id, navigate, setTitle]);

  const fullName = `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim() || "Unknown";

  const handleSubmit = (value: PolicyFormValue) => {
    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        if (!id) return;
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        setSaving(true);

        try {
          const response = await apiFetch(`/api/auther/updatePolicyAPI/${id}`, {
            method: "PUT",
            body: JSON.stringify(buildPolicyPayload(value, fullName)),
          });

          const result = await response.json().catch(() => ({}));
          if (!response.ok || result?.status === false) {
            throw new Error(result?.message || result?.error || "แก้ไขข้อมูลนโยบายไม่สำเร็จ");
          }

          navigate("/Policy", {
            state: {
              notify: {
                message: "แก้ไขข้อมูลนโยบายสำเร็จ และส่งรออนุมัติแล้ว",
                type: "success",
              },
            },
          });
        } catch (error) {
          setNotify({
            isOpen: true,
            message:
              error instanceof Error
                ? error.message
                : "แก้ไขข้อมูลนโยบายไม่สำเร็จ",
            type: "error",
          });
        } finally {
          setSaving(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      },
    });
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
      {initialValue && (
        <ComponentsPolicyForm
          initialValue={initialValue}
          loading={saving}
          formTitle="ฟอร์มแก้ไขข้อมูลนโยบาย"
          buttonText="แก้ไขข้อมูล"
          buttonColor="warning"
          preventNoChange
          onNoChange={() =>
            setNotify({
              isOpen: true,
              message: "ไม่มีการเปลี่ยนแปลงข้อมูล",
              type: "info",
            })
          }
          onSubmit={handleSubmit}
        />
      )}
      <ConfirmDialog type="edit" confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
      <Notifications notify={notify} setNotify={setNotify} />
    </Container>
  );
};

export default PolicyEditpage;
