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

type CompanyDirectorRankItem = {
  directorID: number;
  image?: string;
  nameTH: string;
  positionTH: string;
  positionEN: string;
  active?: number | string;
  order?: number;
};

const PHOTO_BASE =
  import.meta.env.VITE_BASE_URL_API_PHOTO || import.meta.env.VITE_BASE_URL_API || "";

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "10%", align: "center" },
  { id: 2, label: "รูปภาพ", width: "12%", align: "center" },
  { id: 3, label: "ชื่อคณะกรรมการ", width: "38%", align: "left" },
  { id: 4, label: "ตำแหน่ง", width: "35%", align: "left" },
  { id: 6, label: "", width: "5%", align: "center" },
];

const buildPhotoUrl = (path?: string) => {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const base = String(PHOTO_BASE).replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${base}/${cleanPath}`;
};

const normalizeDirector = (item: any): CompanyDirectorRankItem => ({
  directorID: Number(
    item.team_ID ??
      item.teamID ??
      item.directorID ??
      item.companydirectorID ??
      item.int_saksiam_team_id ??
      item.int_saksiam_companydirector_id ??
      item.id ??
      0
  ),
  image:
    item.team_image ??
    item.team_picture ??
    item.picture ??
    item.image ??
    item.photo ??
    "",
  nameTH:
    item.team_nameTH ??
    item.nameTH ??
    item.directorNameTH ??
    item.int_saksiam_team_nameTH ??
    item.int_saksiam_companydirector_nameTH ??
    "",
  positionTH:
    item.team_positionTH ??
    item.positionTH ??
    item.directorPositionTH ??
    item.int_saksiam_team_positionTH ??
    item.int_saksiam_companydirector_positionTH ??
    "",
  positionEN:
    item.team_positionEN ??
    item.positionEN ??
    item.directorPositionEN ??
    item.int_saksiam_team_positionEN ??
    item.int_saksiam_companydirector_positionEN ??
    "",
  active:
    item.team_active ??
    item.active ??
    item.directorActive ??
    item.int_saksiam_team_active ??
    item.int_saksiam_companydirector_active,
  order: Number(
    item.team_order ??
      item.directorOrder ??
      item.companydirectorOrder ??
      item.order ??
      item.int_saksiam_team_order ??
      item.int_saksiam_companydirector_order ??
      0
  ),
});

const getDirectorsFromResponse = (data: any) => {
  const result =
    data?.result ??
    data?.data?.companydirectorcounts ??
    data?.data?.companyDirectors ??
    data?.data?.directors ??
    data?.data?.teams ??
    data?.directors ??
    data?.teams ??
    [];

  return Array.isArray(result) ? result : [];
};

const AboutCompanyDirectorRankpage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTitle } = usePageTitle();

  const [loading, setLoading] = useState(true);
  const [directors, setDirectors] = useState<CompanyDirectorRankItem[]>([]);
  const [originalDirectors, setOriginalDirectors] = useState<CompanyDirectorRankItem[]>([]);
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
    setTitle("เรียงลำดับคณะกรรมการ");

    const fetchInitialData = async () => {
      try {
        const response = await apiFetch("/api/auther/showcompanydirectorAPI?active=&offset=0&limit=1000", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("โหลดข้อมูลคณะกรรมการไม่สำเร็จ");
        }

        const data = await response.json();
        const items = getDirectorsFromResponse(data)
          .map(normalizeDirector)
          .filter((item: CompanyDirectorRankItem) => item.directorID)
          .sort((a: CompanyDirectorRankItem, b: CompanyDirectorRankItem) => {
            const orderA = Number(a.order || 0);
            const orderB = Number(b.order || 0);

            if (orderA && orderB) return orderA - orderB;
            if (orderA) return -1;
            if (orderB) return 1;
            return a.directorID - b.directorID;
          });

        setDirectors(items);
        setOriginalDirectors(items);
      } catch (error) {
        console.error("Error fetching company director order data:", error);
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

    const oldIndex = directors.findIndex((item) => item.directorID === active.id);
    const newIndex = directors.findIndex((item) => item.directorID === over.id);
    setDirectors(arrayMove(directors, oldIndex, newIndex));
  };

  const hasChanges = () => JSON.stringify(directors) !== JSON.stringify(originalDirectors);

  const getOrderChanges = () => {
    const changes = directors
      .map((item, index) => {
        const oldIndex = originalDirectors.findIndex(
          (orig) => orig.directorID === item.directorID
        );

        if (oldIndex !== index) {
          return `ID: ${item.directorID} (${oldIndex + 1} -> ${index + 1})`;
        }

        return null;
      })
      .filter(Boolean);

    return changes.length > 0 ? changes.join(", ") : "ไม่มีการเปลี่ยนแปลง";
  };

  const updateEachDirectorOrder = async (fullName: string) => {
    await Promise.all(
      directors.map((item, index) => {
        const formData = new FormData();
        const order = String(index + 1);

        formData.append("teamorder", order);
        formData.append("teamOrder", order);
        formData.append("order", order);
        formData.append("int_saksiam_team_order", order);
        formData.append("int_saksiam_companydirector_order", order);
        formData.append("updatename", fullName || "Unknown");

        return apiFetch(`/api/auther/updatecompanydirectorIDAPI/${item.directorID}`, {
          method: "POST",
          body: formData,
        });
      })
    );
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
      newOrder: directors.map((item, index) => ({
        team_ID: item.directorID,
        team_order: index + 1,
        int_saksiam_team_id: item.directorID,
        int_saksiam_team_order: index + 1,
        int_saksiam_companydirector_id: item.directorID,
        int_saksiam_companydirector_order: index + 1,
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
            "/api/auther/updatecompanydirectorMoveAPI",
            "/api/auther/updateCompanyDirectorMoveAPI",
            "/api/author/updatecompanydirectorMoveAPI",
          ];
          let saved = false;
          let message = "ไม่สามารถบันทึกลำดับได้";

          for (const endpoint of endpoints) {
            const response = await apiFetch(endpoint, {
              method: "POST",
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
            await updateEachDirectorOrder(fullName);
          }

          await apiFetch("/api/auther/log", {
            method: "POST",
            body: JSON.stringify({
              actionType: 12,
              actionDetail: `จัดลำดับคณะกรรมการ ${getOrderChanges()}`,
              typeUser: user?.role_name,
              datatype: "คณะกรรมการ",
              IDPer: user?.id,
              FullPer: fullName,
            }),
          });

          navigate("/About/Company_Director", {
            state: {
              notify: {
                message: "บันทึกการจัดลำดับสำเร็จ",
                type: "success",
              },
            },
          });
        } catch (error) {
          console.error("Error saving company director order:", error);
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
            เรียงลำดับคณะกรรมการ
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
                  ) : directors.length > 0 ? (
                    <Box sx={rankScrollSx}>
                      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <ComponentTableModel columns={columns} largest="md">
                          <SortableContext
                            items={directors.map((item) => item.directorID)}
                            strategy={rectSortingStrategy}
                          >
                            {directors.map((item, index) => (
                              <SortDirectorTableRow
                                key={item.directorID}
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

const SortDirectorTableRow: FC<{ item: CompanyDirectorRankItem; index: number }> = ({
  item,
  index,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: item.directorID,
  });
  const theme = useTheme();
  const inactive = String(item.active ?? "1") === "0";
  const imageUrl = buildPhotoUrl(item.image);

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
              alt={item.nameTH || "director"}
              sx={{
                width: 64,
                height: 64,
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
            {item.nameTH || "-"}
          </Typography>
        </StyledTableCell>
        <StyledTableCell>
          <Typography
            fontWeight={400}
            variant="body2"
            sx={{ color: inactive ? "text.disabled" : "text.primary" }}
          >
            {item.positionTH || item.positionEN || "-"}
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

export default AboutCompanyDirectorRankpage;
