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

type MissionRankItem = {
  id: number;
  picture?: string;
  topicTH: string;
  topicEN: string;
  active?: number | string;
  order?: number;
};

const PHOTO_BASE =
  import.meta.env.VITE_BASE_URL_API_PHOTO || import.meta.env.VITE_BASE_URL_API || "";

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "8%", align: "center" },
  { id: 2, label: "รูปภาพ", width: "12%", align: "center" },
  { id: 3, label: "หัวข้อพันธกิจภาษาไทย", width: "35%", align: "left" },
  { id: 4, label: "หัวข้อพันธกิจภาษาอังกฤษ", width: "40%", align: "left" },
  { id: 5, label: "", width: "5%", align: "center" },
];

const buildPhotoUrl = (path?: string) => {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const base = String(PHOTO_BASE).replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${base}/${cleanPath}`;
};

const normalizeMission = (item: any): MissionRankItem => ({
  id: Number(
    item.mission_ID ??
      item.missionID ??
      item.int_saksiam_mission_ID ??
      item.id ??
      0
  ),
  picture:
    item.picture ??
    item.missionPicture ??
    item.int_saksiam_mission_picture ??
    "",
  topicTH:
    item.topicTH ??
    item.missionTopicTH ??
    item.int_saksiam_mission_topicTH ??
    "",
  topicEN:
    item.topicEN ??
    item.missionTopicEN ??
    item.int_saksiam_mission_topicEN ??
    "",
  active:
    item.active ??
    item.missionActive ??
    item.int_saksiam_mission_active,
  order: Number(
    item.missionOrder ??
      item.mission_order ??
      item.order ??
      item.int_saksiam_mission_order ??
      0
  ),
});

const getMissionsFromResponse = (data: any) => {
  const result =
    data?.data?.missions ??
    data?.data?.mission ??
    data?.result ??
    data?.missions ??
    [];

  return Array.isArray(result) ? result : [];
};

const AboutMissionRankpage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();

  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState<MissionRankItem[]>([]);
  const [originalMissions, setOriginalMissions] = useState<MissionRankItem[]>([]);
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
    setTitle("เรียงลำดับพันธกิจ");

    const fetchInitialData = async () => {
      try {
        const response = await apiFetch("/api/auther/showMissionAPI?active=&offset=0&limit=1000", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("โหลดข้อมูลพันธกิจไม่สำเร็จ");
        }

        const data = await response.json();
        const items = getMissionsFromResponse(data)
          .map(normalizeMission)
          .filter((item: MissionRankItem) => Number.isFinite(item.id))
          .sort((a: MissionRankItem, b: MissionRankItem) => {
            const orderA = Number(a.order || 0);
            const orderB = Number(b.order || 0);

            if (orderA && orderB) return orderA - orderB;
            if (orderA) return -1;
            if (orderB) return 1;
            return a.id - b.id;
          });

        setMissions(items);
        setOriginalMissions(items);
      } catch (error) {
        console.error("Error fetching mission order data:", error);
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

    const oldIndex = missions.findIndex((item) => String(item.id) === String(active.id));
    const newIndex = missions.findIndex((item) => String(item.id) === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    setMissions(arrayMove(missions, oldIndex, newIndex));
  };

  const hasChanges = () =>
    JSON.stringify(missions.map((item) => item.id)) !==
    JSON.stringify(originalMissions.map((item) => item.id));

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
      newOrder: missions.map((item, index) => ({
        mission_ID: item.id,
        missionID: item.id,
        int_saksiam_mission_ID: item.id,
        mission_order: index + 1,
        order: index + 1,
        int_saksiam_mission_order: index + 1,
      })),
      updatename: fullName || "Unknown",
    };

    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
          const endpoints = [
            "/api/auther/updateMissionMoveAPI",
            "/api/auther/updateLageMoveMissionAPI",
            "/api/auther/updatemisstionMoveAPI",
          ];
          let saved = false;
          let message = "ยังไม่มี API สำหรับบันทึกการเรียงลำดับพันธกิจ";

          for (const endpoint of endpoints) {
            const response = await apiFetch(endpoint, {
              method: "PUT",
              body: JSON.stringify(orderData),
            });
            const result = await response.json().catch(() => ({}));

            if (response.ok && result?.status !== false) {
              saved = true;
              break;
            }

            message = result?.message || result?.error || message;
            if (response.status !== 404) break;
          }

          if (!saved) {
            throw new Error(message);
          }

          navigate("/About/Mission", {
            state: {
              notify: {
                message: "บันทึกการจัดลำดับสำเร็จ",
                type: "success",
              },
            },
          });
        } catch (error) {
          console.error("Error saving mission order:", error);
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
            เรียงลำดับพันธกิจ
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
                  ) : missions.length > 0 ? (
                    <Box sx={rankScrollSx}>
                      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <ComponentTableModel columns={columns} largest="md">
                          <SortableContext
                            items={missions.map((item) => String(item.id))}
                            strategy={rectSortingStrategy}
                          >
                            {missions.map((item, index) => (
                              <SortMissionTableRow
                                key={item.id}
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

const SortMissionTableRow: FC<{ item: MissionRankItem; index: number }> = ({
  item,
  index,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: String(item.id),
  });
  const theme = useTheme();
  const inactive = String(item.active ?? "1") === "0";
  const imageUrl = buildPhotoUrl(item.picture);

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
        <StyledTableCell align="center">
          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt={item.topicTH || "mission"}
              sx={{
                width: 72,
                height: 72,
                aspectRatio: "1 / 1",
                objectFit: "cover",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                display: "block",
                mx: "auto",
              }}
            />
          ) : (
            <Typography fontWeight={500}>-</Typography>
          )}
        </StyledTableCell>
        <StyledTableCell>
          <Typography
            fontWeight={400}
            variant="body2"
            sx={{ color: inactive ? "text.disabled" : "text.primary" }}
          >
            {item.topicTH || "-"}
          </Typography>
        </StyledTableCell>
        <StyledTableCell>
          <Typography
            fontWeight={400}
            variant="body2"
            sx={{ color: inactive ? "text.disabled" : "text.primary" }}
          >
            {item.topicEN || "-"}
          </Typography>
        </StyledTableCell>
        <StyledTableCell align="center">
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

export default AboutMissionRankpage;
