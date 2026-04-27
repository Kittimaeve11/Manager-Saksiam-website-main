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
import TextButton from "../../components/Model/Buttom/TextButton";
import ConfirmDialog from "../../components/Model/Pop_up/ConfirmDialog";
import Notifications from "../../components/Model/Pop_up/Notifications";

type FaqTypeRankItem = {
  faqtypeID: number;
  faqtypenameTH: string;
  faqtypenameEN: string;
  faqtypeactive?: number | string;
  faqtypeorder?: number;
};

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "10%", align: "center" },
  { id: 2, label: "ชื่อประเภทคำถามภาษาไทย", width: "35%", align: "left" },
  { id: 3, label: "ชื่อประเภทคำถามภาษาอังกฤษ", width: "35%", align: "left" },
  { id: 4, label: "", width: "20%", align: "center" },
];

const normalizeFaqType = (item: any): FaqTypeRankItem => ({
  faqtypeID: Number(item.faqtypeID ?? item.int_saksiam_typefqa_id),
  faqtypenameTH: item.faqtypenameTH ?? item.int_saksiam_typefqa_nameTH ?? "",
  faqtypenameEN: item.faqtypenameEN ?? item.int_saksiam_typefqa_nameEN ?? "",
  faqtypeactive: item.faqtypeactive ?? item.int_saksiam_typefqa_active,
  faqtypeorder: Number(item.faqtypeorder ?? item.int_saksiam_typefqa_order ?? 0),
});

const FaqTypeRankpage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();

  const [loading, setLoading] = useState(true);
  const [faqTypes, setFaqTypes] = useState<FaqTypeRankItem[]>([]);
  const [originalFaqTypes, setOriginalFaqTypes] = useState<FaqTypeRankItem[]>([]);
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
    setTitle("เรียงลำดับประเภทคำถามที่พบบ่อย");
  }, [setTitle]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await apiFetch(`/api/auther/showFaqTypelistAPI`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Error fetching FAQ type data");
        }

        const data = await response.json();
        const result = Array.isArray(data?.result) ? data.result : [];
        const items = result.map(normalizeFaqType);

        setFaqTypes(items);
        setOriginalFaqTypes(items);
      } catch (error) {
        console.error("Error fetching FAQ type order data:", error);
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
  }, []);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = faqTypes.findIndex((item) => item.faqtypeID === active.id);
    const newIndex = faqTypes.findIndex((item) => item.faqtypeID === over.id);
    setFaqTypes(arrayMove(faqTypes, oldIndex, newIndex));
  };

  const hasChanges = () => {
    return JSON.stringify(faqTypes) !== JSON.stringify(originalFaqTypes);
  };

  const getOrderChanges = () => {
    const changes = faqTypes
      .map((item, index) => {
        const oldIndex = originalFaqTypes.findIndex(
          (orig) => orig.faqtypeID === item.faqtypeID
        );

        if (oldIndex !== index) {
          return `ID: ${item.faqtypeID} (${oldIndex + 1} -> ${index + 1})`;
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
      newOrder: faqTypes.map((item, index) => ({
        int_saksiam_typefqa_id: item.faqtypeID,
        int_saksiam_typefqa_order: index + 1,
      })),
    };

    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
          const response = await apiFetch(`/api/auther/updateFaqTypeMoveAPI`, {
            method: "POST",
            body: JSON.stringify(orderData),
          });

          if (!response.ok) {
            const result = await response.json();
            throw new Error(result?.message || "ไม่สามารถบันทึกลำดับได้");
          }

          await apiFetch(`/api/auther/log`, {
            method: "POST",
            body: JSON.stringify({
              actionType: 12,
              actionDetail: `จัดลำดับประเภทคำถามที่พบบ่อย ${getOrderChanges()}`,
              typeUser: user?.role_name,
              datatype: "ประเภทคำถามที่พบบ่อย",
              IDPer: user?.id,
              FullPer: `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim(),
            }),
          });

          navigate("/faq/type", {
            state: {
              notify: {
                message: "บันทึกการจัดลำดับสำเร็จ",
                type: "success",
              },
            },
          });
        } catch (error) {
          console.error("Error saving FAQ type order:", error);
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
            เรียงลำดับประเภทคำถามที่พบบ่อย
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
                  ) : faqTypes.length > 0 ? (
                    <Box sx={{ overflowX: "hidden", overflowY: "auto", maxHeight: 500, position: "relative" }}>
                      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <ComponentTableModel columns={columns} largest="md">
                          <SortableContext
                            items={faqTypes.map((item) => item.faqtypeID)}
                            strategy={rectSortingStrategy}
                          >
                            {faqTypes.map((item, index) => (
                              <SortFaqTypeTableRow
                                key={item.faqtypeID}
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

const SortFaqTypeTableRow: FC<{ item: FaqTypeRankItem; index: number }> = ({
  item,
  index,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: item.faqtypeID,
  });
  const theme = useTheme();
  const inactive = String(item.faqtypeactive ?? "1") === "0";

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
            {item.faqtypenameTH}
          </Typography>
        </StyledTableCell>
        <StyledTableCell>
          <Typography
            fontWeight={400}
            variant="body2"
            sx={{ color: inactive ? "text.disabled" : "text.primary" }}
          >
            {item.faqtypenameEN}
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

export default FaqTypeRankpage;
