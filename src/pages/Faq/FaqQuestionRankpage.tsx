"use client";

import { useEffect, useState } from "react";
import type { FC } from "react";
import {
  Box,
  Container,
  Fade,
  Grid,
  Paper,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
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

type FaqQuestionRankItem = {
  fqaID: number;
  faqtypeID?: number;
  questionTH: string;
  questionEN: string;
  active?: number | string;
  fqaorder?: number;
};

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "10%", align: "center" },
  { id: 2, label: "หัวข้อคำถามภาษาไทย", width: "35%", align: "left" },
  { id: 3, label: "หัวข้อคำถามภาษาอังกฤษ", width: "35%", align: "left" },
  { id: 4, label: "", width: "20%", align: "center" },
];

const normalizeFaqQuestion = (item: any): FaqQuestionRankItem => ({
  fqaID: Number(
    item.fqaID ??
      item.fqaId ??
      item.id ??
      item.int_saksiam_fqa_id ??
      0
  ),
  faqtypeID: Number(
    item.faqtypeID ??
      item.typeID ??
      item.int_saksiam_fqa_type ??
      0
  ),
  questionTH:
    item.questionTH ??
    item.int_saksiam_fqa_questionTH ??
    "",
  questionEN:
    item.questionEN ??
    item.int_saksiam_fqa_questionEN ??
    "",
  active:
    item.active ??
    item.int_saksiam_fqa_active ??
    "1",
  fqaorder: Number(
    item.fqaorder ??
      item.int_saksiam_fqa_order ??
      0
  ),
});

const FaqQuestionRankpage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<FaqQuestionRankItem[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<FaqQuestionRankItem[]>([]);
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
    setTitle("เรียงลำดับคำถามที่พบบ่อย");

    const fetchInitialData = async () => {
      try {
        const response = await apiFetch("/api/auther/showLageMoveFqaAPI", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Error fetching FAQ question order data");
        }

        const data = await response.json();
        const result = Array.isArray(data?.result)
          ? data.result
          : Array.isArray(data?.data?.fqas)
            ? data.data.fqas
            : Array.isArray(data?.data?.questions)
              ? data.data.questions
              : [];

        const items = result
          .map(normalizeFaqQuestion)
          .filter((item: FaqQuestionRankItem) => item.fqaID);

        setQuestions(items);
        setOriginalQuestions(items);
      } catch (error) {
        console.error("Error fetching FAQ question order data:", error);
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

    const oldIndex = questions.findIndex((item) => item.fqaID === active.id);
    const newIndex = questions.findIndex((item) => item.fqaID === over.id);

    setQuestions(arrayMove(questions, oldIndex, newIndex));
  };

  const hasChanges = () =>
    JSON.stringify(questions) !== JSON.stringify(originalQuestions);

  const getOrderChanges = () => {
    const changes = questions
      .map((item, index) => {
        const oldIndex = originalQuestions.findIndex(
          (orig) => orig.fqaID === item.fqaID
        );

        if (oldIndex !== index) {
          return `ID: ${item.fqaID} (${oldIndex + 1} -> ${index + 1})`;
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
      newOrder: questions.map((item, index) => ({
        int_saksiam_fqa_id: item.fqaID,
        int_saksiam_fqa_order: index + 1,
      })),
    };

    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
          const response = await apiFetch("/api/auther/updateLageMoveFqaAPI", {
            method: "PUT",
            body: JSON.stringify(orderData),
          });

          if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result?.message || "ไม่สามารถบันทึกลำดับได้");
          }

          await apiFetch("/api/auther/log", {
            method: "POST",
            body: JSON.stringify({
              actionType: 12,
              actionDetail: `จัดลำดับคำถามที่พบบ่อย ${getOrderChanges()}`,
              typeUser: user?.role_name,
              datatype: "คำถามที่พบบ่อย",
              IDPer: user?.id,
              FullPer: `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim(),
            }),
          });

          navigate("/Faq_Question", {
            state: {
              notify: {
                message: "บันทึกการจัดลำดับสำเร็จ",
                type: "success",
              },
            },
          });
        } catch (error) {
          console.error("Error saving FAQ question order:", error);
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
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: 600,
              mb: 2,
            }}
          >
            เรียงลำดับคำถามที่พบบ่อย
          </Typography>

          <Box width="100%" sx={{ px: { xs: 2, sm: 5 } }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ width: "100%" }}>
                  {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center">
                      <Typography
                        variant="body1"
                        color={theme.palette.grey[300]}
                        fontWeight={300}
                      >
                        ... กำลังโหลด ...
                      </Typography>
                    </Box>
                  ) : questions.length > 0 ? (
                    <Box sx={rankScrollSx}>
                      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <ComponentTableModel columns={columns} largest="md">
                          <SortableContext
                            items={questions.map((item) => item.fqaID)}
                            strategy={rectSortingStrategy}
                          >
                            {questions.map((item, index) => (
                              <SortFaqQuestionTableRow
                                key={item.fqaID}
                                item={item}
                                index={index}
                              />
                            ))}
                          </SortableContext>
                        </ComponentTableModel>
                      </DndContext>
                    </Box>
                  ) : (
                    <Typography
                      variant="h6"
                      color="textSecondary"
                      align="center"
                      sx={{ mt: 4 }}
                    >
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

const SortFaqQuestionTableRow: FC<{
  item: FaqQuestionRankItem;
  index: number;
}> = ({ item, index }) => {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: item.fqaID,
  });
  const theme = useTheme();
  const inactive = String(item.active ?? "1") === "0";

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
            {item.questionTH}
          </Typography>
        </StyledTableCell>
        <StyledTableCell>
          <Typography
            fontWeight={400}
            variant="body2"
            sx={{ color: inactive ? "text.disabled" : "text.primary" }}
          >
            {item.questionEN}
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

export default FaqQuestionRankpage;
