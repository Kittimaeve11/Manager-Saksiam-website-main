"use client";

import { useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  Box,
  TableCell,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { HiPencil } from "react-icons/hi";
import { AiFillDelete } from "react-icons/ai";

import ComponentTableModel from "../../Model/Table/ComponentTableModel";
import StyledTableCell from "../../Model/Table/StyledTableCell";
import ComponentsDateTable from "../../Model/Table/ComponentsDateTable";
import ActiveStatusSwitch from "../../Status/ActiveStatusSwitch";
import AppIconButton from "../../Buttom/IconButton";

import type { Column } from "../../../utils/types";
import NoImage from "../../../assets/Image/dastano.png";
import Loading from "../../../assets/Image/Loading.gif";

const PHOTO_BASE =
  import.meta.env.VITE_BASE_URL_API_PHOTO || import.meta.env.VITE_BASE_URL_API || "";

const buildPhotoUrl = (path?: string) => {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const base = String(PHOTO_BASE).replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  return `${base}/${cleanPath}`;
};

export type MissionItem = {
  id: number;
  titleTH: string;
  titleEN: string;
  topicTH?: string;
  topicEN?: string;
  picture?: string;
  active: number | string;
  savename?: string;
  createAt?: string;
  updateAt?: string | null;
};

type Props = {
  missionData: {
    counts: number;
    missions: MissionItem[];
  };
  loading: boolean;
  page: number;
  rowsPerPage: number;
  setPage: Dispatch<SetStateAction<number>>;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  handleStatusChange: (id: number, checked: boolean) => void;
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
};

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "6%", align: "center" },
  { id: 2, label: "หัวข้อพันธกิจภาษาไทย", width: "34%", align: "left" },
  { id: 3, label: "หัวข้อพันธกิจภาษาอังกฤษ", width: "24%", align: "left" },
  { id: 4, label: "ชื่อ/วันที่อัปโหลดข้อมูล", width: "18%", align: "center" },
  { id: 5, label: "สถานะ", width: "8%", align: "center" },
  { id: 6, label: "จัดการข้อมูล", width: "10%", align: "center" },
];

const clampThreeLineSx = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  lineHeight: 1.6,
  wordBreak: "break-word",
};

const ComponentsMissionTableView = ({
  missionData,
  loading,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  handleStatusChange,
  handleEdit,
  handleDelete,
}: Props) => {
  const theme = useTheme();
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [fadeOut, setFadeOut] = useState(false);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (id: number) => {
    setSelectedRow(id);
    setFadeOut(false);
    setTimeout(() => setFadeOut(true), 3000);
    setTimeout(() => setSelectedRow(null), 4000);
  };

  return (
    <Box>
      <ComponentTableModel columns={columns} largest="xl">
        {loading ? (
          <TableRow>
            <StyledTableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
              <img src={Loading} alt="Loading" style={{ width: "4%" }} />
            </StyledTableCell>
          </TableRow>
        ) : missionData.missions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
              <img src={NoImage} alt="No data" style={{ width: "20%" }} />
            </TableCell>
          </TableRow>
        ) : (
          missionData.missions.map((item, index) => {
            const isActive = String(item.active) === "1";
            const imageUrl = buildPhotoUrl(item.picture);

            return (
              <TableRow
                key={item.id}
                onClick={() => handleRowClick(item.id)}
                sx={{
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    cursor: "pointer",
                  },
                  borderBottom:
                    theme.palette.mode === "dark"
                      ? `1px solid ${theme.palette.grey[700]}`
                      : "1px solid #F0F2F4",
                  backgroundColor:
                    selectedRow === item.id
                      ? fadeOut
                        ? "rgba(238, 244, 252, 0)"
                        : theme.palette.mode === "dark"
                          ? theme.palette.grey[700]
                          : "#F0F2F4"
                      : "inherit",
                  transition: "background-color 1s ease-in-out",
                }}
              >
                <StyledTableCell align="center">
                  {page * rowsPerPage + index + 1}
                </StyledTableCell>



                <StyledTableCell>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {imageUrl ? (
                      <Box
                        component="img"
                        src={imageUrl}
                        alt={item.titleTH || "mission"}
                        sx={{
                          width: 64,
                          height: 64,
                          aspectRatio: "1 / 1",
                          objectFit: "cover",
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />
                    ) : null}

                    <Typography variant="body2" sx={clampThreeLineSx}>
                      {item.topicTH || "-"}
                    </Typography>
                  </Box>
                </StyledTableCell>

                <StyledTableCell>
                  <Typography variant="body2" sx={clampThreeLineSx}>
                    {item.topicEN || "-"}
                  </Typography>
                </StyledTableCell>

                <StyledTableCell align="center">
                  <ComponentsDateTable
                    fullname={item.savename || "-"}
                    startdate={item.createAt || ""}
                    updatedate={item.updateAt || null}
                  />
                </StyledTableCell>

                <StyledTableCell align="center">
                  <ActiveStatusSwitch
                    checked={isActive}
                    onChange={(checked) => handleStatusChange(item.id, checked)}
                  />
                </StyledTableCell>

                <StyledTableCell
                  align="center"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {!isActive ? (
                    <>
                      <AppIconButton
                        title="แก้ไขข้อมูลพันธกิจ"
                        variant="filled"
                        customColor="#FFAA37"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEdit(item.id);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <HiPencil
                          style={{
                            fontSize: theme.typography.h6.fontSize,
                            color: "#fff",
                          }}
                        />
                      </AppIconButton>

                      <AppIconButton
                        title="ลบข้อมูลพันธกิจ"
                        variant="filled"
                        customColor={theme.palette.error.dark}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        <AiFillDelete
                          style={{
                            fontSize: theme.typography.h6.fontSize,
                            color: "#fff",
                          }}
                        />
                      </AppIconButton>
                    </>
                  ) : (
                    <Typography fontWeight={400}>-</Typography>
                  )}
                </StyledTableCell>
              </TableRow>
            );
          })
        )}
      </ComponentTableModel>

      <TablePagination
        component="div"
        count={missionData.counts}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[15, 25, 50]}
        labelRowsPerPage="จำนวนแสดงข้อมูลต่อหน้า"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
      />
    </Box>
  );
};

export default ComponentsMissionTableView;
