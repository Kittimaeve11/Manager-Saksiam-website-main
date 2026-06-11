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

type VedioRankItem = {
  vedioID: number;
  nameTH: string;
  youtubeID: string;
  active?: number | string;
  vedioorder?: number;
};

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "10%", align: "center" },
  { id: 2, label: "วิดีโอ", width: "20%", align: "center" },
  { id: 3, label: "ชื่อวิดีโอภาษาไทย", width: "50%", align: "left" },
  { id: 4, label: "", width: "20%", align: "center" },
];

const extractYoutubeId = (url: string) => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "";

  try {
    const parsedUrl = new URL(trimmedUrl);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (hostname.includes("youtube.com")) {
      const watchId = parsedUrl.searchParams.get("v");
      if (watchId) return watchId;

      const [type, id] = parsedUrl.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live", "v"].includes(type) && id) return id;
    }
  } catch {
    const fallbackMatch = trimmedUrl.match(
      /(?:[?&]v=|youtu\.be\/|embed\/|shorts\/|live\/|\/v\/)([A-Za-z0-9_-]{6,})/
    );

    if (fallbackMatch?.[1]) return fallbackMatch[1];
  }

  return "";
};

const normalizeVedio = (item: any): VedioRankItem => {
  const link = item.vedio_link ?? item.linkURL ?? item.int_saksiam_vedio_link ?? "";
  const youtubeID =
    item.vedio_youtubeID ??
    item.youtubeID ??
    item.int_saksiam_vedio_youtubeID ??
    extractYoutubeId(link);

  return {
    vedioID: Number(
      item.vedio_id ??
        item.vedioID ??
        item.id ??
        item.int_saksiam_vedio_id ??
        0
    ),
    nameTH:
      item.nameTH_Vedio ??
      item.nameTH ??
      item.vedio_nameTH ??
      item.int_saksiam_vedio_nameTH ??
      "",
    youtubeID,
    active: item.vedio_active ?? item.active ?? item.int_saksiam_vedio_active,
    vedioorder: Number(
      item.vedioorder ??
        item.vedioOrder ??
        item.order ??
        item.int_saksiam_vedio_order ??
        0
    ),
  };
};

const getVediosFromResponse = (data: any) => {
  const result =
    data?.result ??
    data?.data?.vedio ??
    data?.data?.vedios ??
    data?.vedio ??
    data?.vedios ??
    data?.reviews ??
    data?.items ??
    [];

  return Array.isArray(result) ? result : [];
};

const VedioRankpage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();

  const [loading, setLoading] = useState(true);
  const [vedios, setVedios] = useState<VedioRankItem[]>([]);
  const [originalVedios, setOriginalVedios] = useState<VedioRankItem[]>([]);
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
    setTitle("เรียงลำดับวิดีโอ");

    const fetchInitialData = async () => {
      try {
        const response = await apiFetch("/api/auther/showVedioAPI?active=&offset=0&limit=1000", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("โหลดข้อมูลวิดีโอไม่สำเร็จ");
        }

        const data = await response.json();
        const items = getVediosFromResponse(data)
          .map(normalizeVedio)
          .filter((item: VedioRankItem) => item.vedioID)
          .sort((a: VedioRankItem, b: VedioRankItem) => {
            const orderA = Number(a.vedioorder || 0);
            const orderB = Number(b.vedioorder || 0);

            if (orderA && orderB) return orderA - orderB;
            if (orderA) return -1;
            if (orderB) return 1;
            return a.vedioID - b.vedioID;
          });

        setVedios(items);
        setOriginalVedios(items);
      } catch (error) {
        console.error("Error fetching video order data:", error);
        setNotify({
          isOpen: true,
          message:
            error instanceof Error
              ? error.message
              : "ไม่สามารถโหลดข้อมูลสำหรับเรียงลำดับได้",
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

    const oldIndex = vedios.findIndex((item) => item.vedioID === active.id);
    const newIndex = vedios.findIndex((item) => item.vedioID === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    setVedios(arrayMove(vedios, oldIndex, newIndex));
  };

  const hasChanges = () =>
    JSON.stringify(vedios.map((item) => item.vedioID)) !==
    JSON.stringify(originalVedios.map((item) => item.vedioID));

  const getOrderChanges = () => {
    const changes = vedios
      .map((item, index) => {
        const oldIndex = originalVedios.findIndex(
          (orig) => orig.vedioID === item.vedioID
        );

        if (oldIndex !== index) {
          return `ID: ${item.vedioID} (${oldIndex + 1} -> ${index + 1})`;
        }

        return null;
      })
      .filter(Boolean);

    return changes.length > 0 ? changes.join(", ") : "ไม่มีการเปลี่ยนแปลง";
  };

  const saveByMoveEndpoint = async (orderData: any) => {
    const endpoints = [
      { url: "/api/auther/updateVedioMoveAPI", method: "POST" },
      { url: "/api/auther/updateLageMoveVedioAPI", method: "PUT" },
    ];

    for (const endpoint of endpoints) {
      const response = await apiFetch(endpoint.url, {
        method: endpoint.method,
        body: JSON.stringify(orderData),
      });

      if (response.ok) return true;
      if (response.status !== 404) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.message || "ไม่สามารถบันทึกลำดับได้");
      }
    }

    return false;
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

    const fullName = `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim();
    const orderData = {
      newOrder: vedios.map((item, index) => ({
        int_saksiam_vedio_id: item.vedioID,
        int_saksiam_vedio_order: index + 1,
        vedioID: item.vedioID,
        vedioorder: index + 1,
        order: index + 1,
      })),
    };

    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
          const savedByEndpoint = await saveByMoveEndpoint(orderData);

          if (!savedByEndpoint) {
            throw new Error("ยังไม่มี API สำหรับบันทึกการเรียงลำดับวิดีโอ");
          }

          await apiFetch("/api/auther/log", {
            method: "POST",
            body: JSON.stringify({
              actionType: 12,
              actionDetail: `จัดลำดับวิดีโอ ${getOrderChanges()}`,
              typeUser: user?.role_name,
              datatype: "วิดีโอ",
              IDPer: user?.id,
              FullPer: fullName,
            }),
          });

          navigate("/Vedio", {
            state: {
              notify: {
                message: "บันทึกการจัดลำดับสำเร็จ",
                type: "success",
              },
            },
          });
        } catch (error) {
          console.error("Error saving video order:", error);
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
            เรียงลำดับวิดีโอ
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
                  ) : vedios.length > 0 ? (
                    <Box sx={rankScrollSx}>
                      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <ComponentTableModel columns={columns} largest="md">
                          <SortableContext
                            items={vedios.map((item) => item.vedioID)}
                            strategy={rectSortingStrategy}
                          >
                            {vedios.map((item, index) => (
                              <SortableVideoRow
                                key={item.vedioID}
                                row={item}
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

type SortableVideoRowProps = {
  row: VedioRankItem;
  index: number;
};

const SortableVideoRow: FC<SortableVideoRowProps> = ({ row, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.vedioID });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
    cursor: "move",
  };

  const thumbnail = row.youtubeID
    ? `https://img.youtube.com/vi/${row.youtubeID}/mqdefault.jpg`
    : "";

  return (
    <Fade in timeout={250}>
      <TableRow ref={setNodeRef} style={style} hover>
        <StyledTableCell align="center">
          <Typography variant="body2">{index + 1}</Typography>
        </StyledTableCell>

        <StyledTableCell align="center">
          {thumbnail ? (
            <Box
              component="img"
              src={thumbnail}
              alt={row.nameTH}
              sx={{
                width: 120,
                height: 68,
                objectFit: "cover",
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
              }}
            />
          ) : (
            <Typography variant="body2">-</Typography>
          )}
        </StyledTableCell>

        <StyledTableCell align="left">
          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
            {row.nameTH || "-"}
          </Typography>
        </StyledTableCell>

        <StyledTableCell align="center">
          <Grid container justifyContent="center">
            <Grid
              component="span"
              {...attributes}
              {...listeners}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
                cursor: "grab",
                "&:active": {
                  cursor: "grabbing",
                },
              }}
            >
              <FaExpandArrowsAlt />
            </Grid>
          </Grid>
        </StyledTableCell>
      </TableRow>
    </Fade>
  );
};

export default VedioRankpage;
