"use client";

import { useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { Box, TableCell, TablePagination, TableRow, Typography, useTheme } from "@mui/material";

import ComponentTableModel from "../../Model/Table/ComponentTableModel";
import StyledTableCell from "../../Model/Table/StyledTableCell";
import NoImage from "../../../assets/Image/dastano.png";
import Loading from "../../../assets/Image/Loading.gif";
import ComponentsDateTable from "../../Model/Table/ComponentsDateTable";
import SwitchButton from "../../Model/Buttom/SwitchButton";
import AppIconButton from "../../Model/Buttom/IconButton";
import type { Column } from "../../../utils/types";

import { HiPencil } from "react-icons/hi";
import { AiFillDelete } from "react-icons/ai";

type FaqTypeItem = {
  int_saksiam_typefqa_id: number;
  int_saksiam_typefqa_nameTH: string;
  int_saksiam_typefqa_nameEN: string;
  int_saksiam_typefqa_active: number | string;
  int_saksiam_typefqa_savename?: string;
  int_saksiam_typefqa_createAt?: string;
  int_saksiam_typefqa_updateAt?: string | null;
};

type Props = {
  faqTypeData: {
    counts: number;
    faqtypes: FaqTypeItem[];
  };
  loading: boolean;
  page: number;
  rowsPerPage: number;
  setPage: Dispatch<SetStateAction<number>>;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  handleDelete: (id: number) => void;
  handleStatusChange: (id: number, checked: boolean) => void;
  handleEdit: (id: number) => void;
  can: (slug: string) => boolean;
};

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "5%", align: "center" },
  { id: 2, label: "ชื่อประเภทคำถามภาษาไทย", width: "25%", align: "left" },
  { id: 3, label: "ชื่อประเภทคำถามภาษาอังกฤษ", width: "25%", align: "left" },
  { id: 4, label: "ชื่อ/วันที่อัปโหลดข้อมูล", width: "15%", align: "center" },
  { id: 5, label: "สถานะ", width: "15%", align: "center" },
  { id: 6, label: "จัดการข้อมูล", width: "15%", align: "center" },
];

const ComponentsFaqTypeTableView = ({
  faqTypeData,
  loading,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  handleDelete,
  handleStatusChange,
  handleEdit,
  can,
}: Props) => {
  const theme = useTheme();
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [fadeOut, setFadeOut] = useState(false);

  const canManage = can("Edit FAQ") || can("Delete FAQ");
  const columnsToShow = columns.filter((col) => {
    if (col.id === 5 && !can("Status FAQ")) return false;
    if (col.id === 6 && !canManage) return false;
    return true;
  });

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
      <ComponentTableModel columns={columnsToShow} largest="xl">
        {loading ? (
          <TableRow>
            <StyledTableCell colSpan={columnsToShow.length} align="center" sx={{ py: 3 }}>
              <img src={Loading} alt="Loading" style={{ width: "4%" }} />
            </StyledTableCell>
          </TableRow>
        ) : faqTypeData.faqtypes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columnsToShow.length} align="center" sx={{ py: 3 }}>
              <img src={NoImage} alt="No data" style={{ width: "20%" }} />
            </TableCell>
          </TableRow>
        ) : (
          faqTypeData.faqtypes.map((item, index) => {
            const isActive = String(item.int_saksiam_typefqa_active) === "1";

            return (
              <TableRow
                key={item.int_saksiam_typefqa_id}
                onClick={() => handleRowClick(item.int_saksiam_typefqa_id)}
                sx={{
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    cursor: "pointer",
                    boxShadow: "0px rgba(0, 0, 0, 0.1)",
                  },
                  borderBottom:
                    theme.palette.mode === "dark"
                      ? `1px solid ${theme.palette.grey[700]}`
                      : "1px solid #F0F2F4",
                  backgroundColor:
                    selectedRow === item.int_saksiam_typefqa_id
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
                  <Typography fontWeight={400} variant="body2">
                    {item.int_saksiam_typefqa_nameTH}
                  </Typography>
                </StyledTableCell>

                <StyledTableCell>
                  <Typography fontWeight={400} variant="body2">
                    {item.int_saksiam_typefqa_nameEN}
                  </Typography>
                </StyledTableCell>

                <StyledTableCell align="center">
                  <ComponentsDateTable
                    fullname={item.int_saksiam_typefqa_savename || "-"}
                    startdate={item.int_saksiam_typefqa_createAt || ""}
                    updatedate={item.int_saksiam_typefqa_updateAt || null}
                  />
                </StyledTableCell>

                {can("Status FAQ") && (
                  <StyledTableCell align="center">
                    <SwitchButton
                      checked={isActive}
                      handleChange={(event) =>
                        handleStatusChange(
                          item.int_saksiam_typefqa_id,
                          event.target.checked
                        )
                      }
                    />
                  </StyledTableCell>
                )}

                {canManage && (
                  <StyledTableCell
                    align="center"
                    component="th"
                    scope="row"
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                  >
                    {!isActive ? (
                      <>
                        {can("Edit FAQ") && (
                          <AppIconButton
                            title="แก้ไขประเภทคำถามที่พบบ่อย"
                            variant="filled"
                            customColor="#FFAA37"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item.int_saksiam_typefqa_id);
                            }}
                            sx={{
                              opacity: 1,
                              cursor: "pointer",
                              mr: 1,
                            }}
                          >
                            <HiPencil
                              style={{
                                fontSize: theme.typography.h6.fontSize,
                                color: "#fff",
                              }}
                            />
                          </AppIconButton>
                        )}

                        {can("Delete FAQ") && (
                          <AppIconButton
                            title="ลบประเภทคำถามที่พบบ่อย"
                            variant="filled"
                            customColor={theme.palette.error.dark}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.int_saksiam_typefqa_id);
                            }}
                            sx={{
                              opacity: 1,
                              cursor: "pointer",
                            }}
                          >
                            <AiFillDelete
                              style={{
                                fontSize: theme.typography.h6.fontSize,
                                color: "#fff",
                              }}
                            />
                          </AppIconButton>
                        )}
                      </>
                    ) : (
                      <Typography fontWeight={400}>-</Typography>
                    )}
                  </StyledTableCell>
                )}
              </TableRow>
            );
          })
        )}
      </ComponentTableModel>

      <TablePagination
        component="div"
        count={faqTypeData.counts}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[15, 25]}
        labelRowsPerPage="จำนวนแสดงข้อมูลต่อหน้า"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
        }
      />
    </Box>
  );
};

export default ComponentsFaqTypeTableView;
