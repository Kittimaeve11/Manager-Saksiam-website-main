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

type NewsTypeRankItem = {
  newstypeID: number;
  newstypenameTH: string;
  newstypenameEN: string;
  newstypeactive?: number | string;
  newstypeorder?: number;
};

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "10%", align: "center" },
  { id: 2, label: "ชื่อประเภทข่าวภาษาไทย", width: "35%", align: "left" },
  { id: 3, label: "ชื่อประเภทข่าวภาษาอังกฤษ", width: "35%", align: "left" },
  { id: 4, label: "", width: "20%", align: "center" },
];

const normalizeNewsType = (item: any): NewsTypeRankItem => ({
  newstypeID: Number(
    item.newstypeID ??
    item.editorialtypeID ??
    item.editorialTypeID ??
    item.newsTypeID ??
    item.int_saksiam_typeeditorial_id ??
    item.int_saksiam_typenews_id ??
    item.int_saksiam_typenew_id ??
    0
  ),
  newstypenameTH:
    item.newstypenameTH ??
    item.editorialtypenameTH ??
    item.editorialTypeNameTH ??
    item.newsTypeNameTH ??
    item.int_saksiam_typeeditorial_nameTH ??
    item.int_saksiam_typenews_nameTH ??
    item.int_saksiam_typenew_nameTH ??
    "",
  newstypenameEN:
    item.newstypenameEN ??
    item.editorialtypenameEN ??
    item.editorialTypeNameEN ??
    item.newsTypeNameEN ??
    item.int_saksiam_typeeditorial_nameEN ??
    item.int_saksiam_typenews_nameEN ??
    item.int_saksiam_typenew_nameEN ??
    "",
  newstypeactive:
    item.newstypeactive ??
    item.editorialtypeactive ??
    item.editorialTypeActive ??
    item.newsTypeActive ??
    item.int_saksiam_typeeditorial_active ??
    item.int_saksiam_typenews_active ??
    item.int_saksiam_typenew_active,
  newstypeorder: Number(
    item.newstypeorder ??
    item.editorialtypeorder ??
    item.editorialTypeOrder ??
    item.newsTypeOrder ??
    item.int_saksiam_typeeditorial_order ??
    item.int_saksiam_typenews_order ??
    item.int_saksiam_typenew_order ??
    0
  ),
});

const NewsTypeRankpage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();

  const [loading, setLoading] = useState(true);
  const [newsTypes, setNewsTypes] = useState<NewsTypeRankItem[]>([]);
  const [originalNewsTypes, setOriginalNewsTypes] = useState<NewsTypeRankItem[]>([]);
  const [notify, setNotify] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error" | "warning" | "info",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    isLoading: false,
    onConfirm: () => { },
  });

  useEffect(() => {
    /* ======================================================
       INIT PAGE + FETCH NEWS TYPE
       ====================================================== */

    // ตั้งชื่อหน้า
    setTitle("เรียงลำดับประเภทข่าวและกิจกรรม");

    // โหลดข้อมูล
    const fetchInitialData = async () => {
      try {
        const response = await apiFetch(
          "/api/auther/showEditorialTypelistAPI",
          { method: "GET" }
        );

        if (!response.ok) {
          throw new Error("Error fetching news type data");
        }

        const data = await response.json();

        const result = Array.isArray(data?.result)
          ? data.result
          : Array.isArray(data?.data?.editorialtypes)
            ? data.data.editorialtypes
            : Array.isArray(data?.data?.newstypes)
              ? data.data.newstypes
              : [];

        const items = result
          .map(normalizeNewsType)
          .filter((item: NewsTypeRankItem) => item.newstypeID);

        setNewsTypes(items);
        setOriginalNewsTypes(items);

      } catch (error) {
        console.error("Error fetching news type order data:", error);

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

    const oldIndex = newsTypes.findIndex((item) => item.newstypeID === active.id);
    const newIndex = newsTypes.findIndex((item) => item.newstypeID === over.id);
    setNewsTypes(arrayMove(newsTypes, oldIndex, newIndex));
  };

  const hasChanges = () =>
    JSON.stringify(newsTypes) !== JSON.stringify(originalNewsTypes);

  const getOrderChanges = () => {
    const changes = newsTypes
      .map((item, index) => {
        const oldIndex = originalNewsTypes.findIndex(
          (orig) => orig.newstypeID === item.newstypeID
        );

        if (oldIndex !== index) {
          return `ID: ${item.newstypeID} (${oldIndex + 1} -> ${index + 1})`;
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
      newOrder: newsTypes.map((item, index) => ({
        int_saksiam_typenews_id: item.newstypeID,
        int_saksiam_typenews_order: index + 1,
        int_saksiam_typeeditorial_id: item.newstypeID,
        int_saksiam_typeeditorial_order: index + 1,
      })),
    };

    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
          const response = await apiFetch("/api/auther/updateEditorialTypeMoveAPI", {
            method: "POST",
            body: JSON.stringify(orderData),
          });

          if (!response.ok) {
            const result = await response.json();
            throw new Error(result?.message || "ไม่สามารถบันทึกลำดับได้");
          }

          await apiFetch("/api/auther/log", {
            method: "POST",
            body: JSON.stringify({
              actionType: 12,
              actionDetail: `จัดลำดับประเภทข่าวและกิจกรรม ${getOrderChanges()}`,
              typeUser: user?.role_name,
              datatype: "ประเภทข่าวและกิจกรรม",
              IDPer: user?.id,
              FullPer: `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim(),
            }),
          });

          navigate("/News_Type", {
            state: {
              notify: {
                message: "บันทึกการจัดลำดับสำเร็จ",
                type: "success",
              },
            },
          });
        } catch (error) {
          console.error("Error saving news type order:", error);
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
            onConfirm: () => { },
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
            เรียงลำดับประเภทข่าวและกิจกรรม
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
                  ) : newsTypes.length > 0 ? (
                    <Box sx={rankScrollSx}>
                      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <ComponentTableModel columns={columns} largest="md">
                          <SortableContext
                            items={newsTypes.map((item) => item.newstypeID)}
                            strategy={rectSortingStrategy}
                          >
                            {newsTypes.map((item, index) => (
                              <SortNewsTypeTableRow
                                key={item.newstypeID}
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

const SortNewsTypeTableRow: FC<{ item: NewsTypeRankItem; index: number }> = ({
  item,
  index,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: item.newstypeID,
  });
  const theme = useTheme();
  const inactive = String(item.newstypeactive ?? "1") === "0";

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
            {item.newstypenameTH}
          </Typography>
        </StyledTableCell>
        <StyledTableCell>
          <Typography
            fontWeight={400}
            variant="body2"
            sx={{ color: inactive ? "text.disabled" : "text.primary" }}
          >
            {item.newstypenameEN}
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

export default NewsTypeRankpage;
