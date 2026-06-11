"use client";

import { useEffect, useState } from "react";
import { Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../API/client";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../Context/PageTitleContext";
import ConfirmDialog from "../../components/Model/Pop_up/ConfirmDialog";
import Notifications from "../../components/Model/Pop_up/Notifications";
import ComponentsPolicyForm, {
  type PolicyFormValue,
} from "../../components/View/Policy/ComponentsPolicyForm";
import { encodePolicyDetailForApi } from "../../utils/policyDetail";

type NotifyType = "success" | "error" | "warning" | "info";

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
  createname: fullName,
  savename: fullName,
});

const PolicyCreatepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();
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
    setTitle("เพิ่มนโยบาย");
  }, [setTitle]);

  const fullName = `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim() || "Unknown";

  const handleSubmit = (value: PolicyFormValue) => {
    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
          const response = await apiFetch("/api/auther/createPolicyAPI", {
            method: "POST",
            body: JSON.stringify(buildPolicyPayload(value, fullName)),
          });

          const result = await response.json().catch(() => ({}));
          if (!response.ok || result?.status === false) {
            throw new Error(result?.message || result?.error || "บันทึกข้อมูลนโยบายไม่สำเร็จ");
          }

          navigate("/Policy", {
            state: {
              notify: {
                message: "บันทึกข้อมูลนโยบายสำเร็จ",
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
                : "บันทึกข้อมูลนโยบายไม่สำเร็จ",
            type: "error",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      },
    });
  };

  return (
    <Container maxWidth="xl">
      <ComponentsPolicyForm
        formTitle="ฟอร์มการบันทึกนโยบาย"
        buttonText="บันทึกข้อมูล"
        onSubmit={handleSubmit}
      />
      <ConfirmDialog type="add" confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
      <Notifications notify={notify} setNotify={setNotify} />
    </Container>
  );
};

export default PolicyCreatepage;
