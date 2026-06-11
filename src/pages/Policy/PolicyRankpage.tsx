"use client";

import { useEffect, useState } from "react";
import type { FC } from "react";
import { Box, Container, Fade, Grid, Paper, TableRow, Typography, useTheme } from "@mui/material";
import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";
import { FaExpandArrowsAlt } from "react-icons/fa";

import { apiFetch } from "../../API/client";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../Context/PageTitleContext";
import type { Column } from "../../utils/types";
import ComponentTableModel from "../../components/Model/Table/ComponentTableModel";
import StyledTableCell from "../../components/Model/Table/StyledTableCell";
import TextButton from "../../components/Buttom/TextButton";
import ConfirmDialog from "../../components/Model/Pop_up/ConfirmDialog";
import Notifications from "../../components/Model/Pop_up/Notifications";
import { rankScrollSx } from "../../theme/styles/rankScroll";

type PolicyRankItem = {
  policyID: number;
  policynameTH: string;
  policynameEN: string;
  policyactive?: number | string;
  policyorder?: number;
};

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "10%", align: "center" },
  { id: 2, label: "ชื่อนโยบายภาษาไทย", width: "35%", align: "left" },
  { id: 3, label: "ชื่อนโยบายภาษาอังกฤษ", width: "35%", align: "left" },
  { id: 4, label: "", width: "20%", align: "center" },
];

const normalizePolicy = (item: any): PolicyRankItem => ({
  policyID: Number(
    item.policyID ??
      item.id ??
      item.int_saksiam_policy_id ??
      0
  ),
  policynameTH:
    item.policynameTH ??
    item.nameTH ??
    item.int_saksiam_policy_nameTH ??
    "",
  policynameEN:
    item.policynameEN ??
    item.nameEN ??
    item.int_saksiam_policy_nameEN ??
    "",
  policyactive:
    item.policyactive ??
    item.active ??
    item.int_saksiam_policy_active,
  policyorder: Number(
    item.policyorder ??
      item.policyOrder ??
      item.order ??
      item.int_saksiam_policy_order ??
      0
  ),
});

const getPoliciesFromResponse = (data: any) => {
  const result =
    data?.result ??
    data?.data?.policies ??
    data?.data?.policy ??
    data?.policies ??
    data?.items ??
    [];

  return Array.isArray(result) ? result : [];
};

const PolicyRankpage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();

  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<PolicyRankItem[]>([]);
  const [originalPolicies, setOriginalPolicies] = useState<PolicyRankItem[]>([]);
  const [notify, setNotify] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error" | "warning" | "info",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    isLoading: false,
    onConfirm: () => {},
  });

  useEffect(() => {
    setTitle("เรียงลำดับนโยบาย");

    const fetchInitialData = async () => {
      try {
        const response = await apiFetch("/api/auther/showPolicyAPI?active=&offset=0&limit=1000", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Error fetching policy data");
        }

        const data = await response.json();
        const items = getPoliciesFromResponse(data)
          .map(normalizePolicy)
          .filter((item: PolicyRankItem) => item.policyID)
          .sort((a: PolicyRankItem, b: PolicyRankItem) => {
            const orderA = Number(a.policyorder || 0);
            const orderB = Number(b.policyorder || 0);

            if (orderA && orderB) return orderA - orderB;
            if (orderA) return -1;
            if (orderB) return 1;
            return a.policyID - b.policyID;
          });

        setPolicies(items);
        setOriginalPolicies(items);
      } catch (error) {
        console.error("Error fetching policy order data:", error);
        setNotify({
          isOpen: true,
          message: "ไม่สามารถโหลดข้อมูลสำหรับเรียงลำดับได้",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [setTitle]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = policies.findIndex((item) => item.policyID === active.id);
    const newIndex = policies.findIndex((item) => item.policyID === over.id);
    setPolicies(arrayMove(policies, oldIndex, newIndex));
  };

  const hasChanges = () => {
    return JSON.stringify(policies) !== JSON.stringify(originalPolicies);
  };

  const getOrderChanges = () => {
    const changes = policies
      .map((item, index) => {
        const oldIndex = originalPolicies.findIndex(
          (orig) => orig.policyID === item.policyID
        );

        if (oldIndex !== index) {
          return `ID: ${item.policyID} (${oldIndex + 1} -> ${index + 1})`;
        }

        return null;
      })
      .filter(Boolean);

    return changes.length > 0 ? changes.join(", ") : "ไม่มีการเปลี่ยนแปลง";
  };

  const handleSaveOrder = async () => {
    if (!hasChanges()) {
      setNotify({
        isOpen: true,
        message: "ไม่มีการเปลี่ยนแปลงข้อมูล",
        type: "info",
      });
      return;
    }

    const orderData = {
      newOrder: policies.map((item, index) => ({
        int_saksiam_policy_id: item.policyID,
        int_saksiam_policy_order: index + 1,
      })),
    };
    const fullName = `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim();

    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
          const response = await apiFetch("/api/auther/updatePolicyMoveAPI", {
            method: "POST",
            body: JSON.stringify(orderData),
          });

          if (!response.ok) {
            if (response.status === 404) {
              await Promise.all(
                policies.map((item, index) =>
                  apiFetch(`/api/auther/updatePolicyAPI/${item.policyID}`, {
                    method: "PUT",
                    body: JSON.stringify({
                      order: index + 1,
                      policyorder: index + 1,
                      int_saksiam_policy_order: index + 1,
                      updatename: fullName || "Unknown",
                    }),
                  })
                )
              );
            } else {
            const result = await response.json();
            throw new Error(result?.message || "ไม่สามารถบันทึกลำดับได้");
            }
          }

          await apiFetch("/api/auther/log", {
            method: "POST",
            body: JSON.stringify({
              actionType: 12,
              actionDetail: `จัดลำดับนโยบาย ${getOrderChanges()}`,
              typeUser: user?.role_name,
              datatype: "นโยบาย",
              IDPer: user?.id,
              FullPer: `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim(),
            }),
          });

          navigate("/Policy", {
            state: {
              notify: {
                message: "บันทึกการจัดลำดับสำเร็จ",
                type: "success",
              },
            },
          });
        } catch (error) {
          console.error("Error saving policy order:", error);
          setNotify({
            isOpen: true,
            message:
              error instanceof Error
                ? error.message
                : "เกิดข้อผิดพลาดในการเรียงลำดับข้อมูล",
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
            flexDirection: "column",
            alignItems: "flex-start",
            width: "100%",
            gap: 2,
            px: 3,
            pb: 2,
          }}
        >
          <Typography
            variant="h6"
            component="label"
            sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 600, mb: 2 }}
          >
            เรียงลำดับนโยบาย
          </Typography>

          <Box width="100%" sx={{ px: { xs: 2, sm: 5 } }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ width: "100%" }}>
                  {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center">
                      <Typography variant="body1" color={theme.palette.grey[300]} fontWeight={300}>
                        ... กำลังโหลด ...
                      </Typography>
                    </Box>
                  ) : policies.length > 0 ? (
                    <Box sx={rankScrollSx}>
                      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <ComponentTableModel columns={columns} largest="md">
                          <SortableContext
                            items={policies.map((item) => item.policyID)}
                            strategy={rectSortingStrategy}
                          >
                            {policies.map((item, index) => (
                              <SortPolicyTableRow
                                key={item.policyID}
                                item={item}
                                index={index}
                              />
                            ))}
                          </SortableContext>
                        </ComponentTableModel>
                      </DndContext>
                    </Box>
                  ) : (
                    <Typography variant="h6" color="textSecondary" align="center" sx={{ mt: 4 }}>
                      ไม่พบข้อมูล
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 7 }}>
              <TextButton
                onClick={handleSaveOrder}
                sx={{ backgroundColor: theme.palette.secondary.main }}
              >
                บันทึกการจัดลำดับ
              </TextButton>
            </Box>
          </Box>
        </Box>
      </Paper>

      <ConfirmDialog
        type="alternate"
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
      <Notifications notify={notify} setNotify={setNotify} />
    </Container>
  );
};

const SortPolicyTableRow: FC<{ item: PolicyRankItem; index: number }> = ({
  item,
  index,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: item.policyID,
  });
  const theme = useTheme();
  const inactive = String(item.policyactive ?? "1") === "0";

  return (
    <Fade in timeout={1000}>
      <TableRow
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        sx={{
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
            cursor: "pointer",
          },
          borderBottom:
            theme.palette.mode === "dark"
              ? `1px solid ${theme.palette.grey[700]}`
              : "1px solid #F0F2F4",
          cursor: "grab",
          transform: CSS.Transform.toString(transform) || undefined,
          touchAction: "none",
        }}
      >
        <StyledTableCell align="center">{index + 1}</StyledTableCell>
        <StyledTableCell>
          <Typography
            fontWeight={400}
            variant="body2"
            sx={{ color: inactive ? "text.disabled" : "text.primary" }}
          >
            {item.policynameTH}
          </Typography>
        </StyledTableCell>
        <StyledTableCell>
          <Typography
            fontWeight={400}
            variant="body2"
            sx={{ color: inactive ? "text.disabled" : "text.primary" }}
          >
            {item.policynameEN}
          </Typography>
        </StyledTableCell>
        <StyledTableCell align="left">
          <FaExpandArrowsAlt
            style={{
              fontSize: theme.typography.h4.fontSize,
              color: theme.palette.grey[600],
            }}
          />
        </StyledTableCell>
      </TableRow>
    </Fade>
  );
};

export default PolicyRankpage;
