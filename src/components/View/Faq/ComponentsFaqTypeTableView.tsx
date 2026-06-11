// “ตารางแสดงข้อมูลประเภทคำถามที่พบบ่อย”

"use client";

/* ======================================================
   IMPORT React Hook และ TYPE ที่จำเป็น
====================================================== */

import { useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";

/* ======================================================
   IMPORT COMPONENT จาก MUI
====================================================== */

import { Box, TableCell, TablePagination, TableRow, Typography, useTheme } from "@mui/material";

/* ======================================================
   IMPORT COMPONENT TABLE และ UI ที่ใช้งาน
====================================================== */

// Table หลักสำหรับแสดงข้อมูล
import ComponentTableModel from "../../Model/Table/ComponentTableModel";

// Styled Table Cell
import StyledTableCell from "../../Model/Table/StyledTableCell";

// รูปกรณีไม่มีข้อมูล
import NoImage from "../../../assets/Image/dastano.png";

// รูป loading
import Loading from "../../../assets/Image/Loading.gif";

// Component แสดงชื่อผู้บันทึกและวันที่
import ComponentsDateTable from "../../Model/Table/ComponentsDateTable";

// Switch เปิด / ปิดสถานะ
import ActiveStatusSwitch from "../../Status/ActiveStatusSwitch";

// ปุ่ม icon สำหรับจัดการข้อมูล
import AppIconButton from "../../Buttom/IconButton";

// TYPE ของ column table
import type { Column } from "../../../utils/types";

/* ======================================================
   IMPORT ICON
====================================================== */

// icon แก้ไขข้อมูล
import { HiPencil } from "react-icons/hi";

// icon ลบข้อมูล
import { AiFillDelete } from "react-icons/ai";

/* ======================================================
   TYPE : ข้อมูลประเภทคำถามที่พบบ่อย
====================================================== */

type FaqTypeItem = {
  int_saksiam_typefqa_id: number; // รหัสประเภท FAQ
  int_saksiam_typefqa_nameTH: string; // ชื่อประเภท FAQ ภาษาไทย
  int_saksiam_typefqa_nameEN: string; // ชื่อประเภท FAQ ภาษาอังกฤษ
  int_saksiam_typefqa_active: number | string; // สถานะการใช้งาน
  int_saksiam_typefqa_savename?: string; // ชื่อผู้บันทึกข้อมูล
  int_saksiam_typefqa_createAt?: string; // วันที่สร้างข้อมูล
  int_saksiam_typefqa_updateAt?: string | null; // วันที่แก้ไขข้อมูล
};

/* ======================================================
   TYPE : Props ที่ Component รับเข้ามา
====================================================== */

type Props = {
  faqTypeData: {
    counts: number; // จำนวนข้อมูลทั้งหมด
    faqtypes: FaqTypeItem[]; // รายการประเภท FAQ
  };

  loading: boolean; // สถานะ loading

  page: number; // หน้าปัจจุบัน

  rowsPerPage: number; // จำนวนข้อมูลต่อหน้า

  setPage: Dispatch<SetStateAction<number>>; // function เปลี่ยนหน้า

  setRowsPerPage: Dispatch<SetStateAction<number>>; // function เปลี่ยนจำนวนข้อมูลต่อหน้า

  handleDelete: (id: number) => void; // function ลบข้อมูล

  handleStatusChange: (id: number, checked: boolean) => void; // function เปลี่ยนสถานะ

  handleEdit: (id: number) => void; // function แก้ไขข้อมูล

  can: (slug: string) => boolean; // function ตรวจสอบ permission
};

/* ======================================================
   COLUMN ของ Table
====================================================== */

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "5%", align: "center" },
  { id: 2, label: "ชื่อประเภทคำถามภาษาไทย", width: "25%", align: "left" },
  { id: 3, label: "ชื่อประเภทคำถามภาษาอังกฤษ", width: "25%", align: "left" },
  { id: 4, label: "ชื่อ/วันที่อัปโหลดข้อมูล", width: "15%", align: "center" },
  { id: 5, label: "สถานะ", width: "15%", align: "center" },
  { id: 6, label: "จัดการข้อมูล", width: "15%", align: "center" },
];

/* ======================================================
   COMPONENT : ตารางแสดงข้อมูลประเภท FAQ
====================================================== */

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

  /* ======================================================
     เรียกใช้งาน Theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     STATE : เก็บ row ที่ถูกเลือก
  ====================================================== */

  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  /* ======================================================
     STATE : ควบคุม animation fade out
  ====================================================== */

  const [fadeOut, setFadeOut] = useState(false);

  /* ======================================================
     ตรวจสอบ permission การแก้ไขข้อมูล
  ====================================================== */

  const canEditFaq = can("Edit FAQ");

  /* ======================================================
     ตรวจสอบ permission การลบข้อมูล
  ====================================================== */

  const canDeleteFaq = can("Delete FAQ") || can("Edit FAQ");

  /* ======================================================
     ตรวจสอบว่ามีสิทธิ์จัดการข้อมูลหรือไม่
  ====================================================== */

  const canManage = canEditFaq || canDeleteFaq;

  /* ======================================================
     Filter column ตาม permission
  ====================================================== */

  const columnsToShow = columns.filter((col) => {
    if (col.id === 5 && !can("Status FAQ")) return false; // ซ่อน column สถานะ
    if (col.id === 6 && !canManage) return false; // ซ่อน column จัดการข้อมูล
    return true;
  });

  /* ======================================================
     FUNCTION : เปลี่ยนหน้า table
  ====================================================== */

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /* ======================================================
     FUNCTION : เปลี่ยนจำนวนข้อมูลต่อหน้า
  ====================================================== */

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // reset กลับหน้าแรก
  };

  /* ======================================================
     FUNCTION : เลือก row พร้อม animation
  ====================================================== */

  const handleRowClick = (id: number) => {
    setSelectedRow(id); // set row ที่ถูกเลือก
    setFadeOut(false); // reset fade out

    setTimeout(() => setFadeOut(true), 3000); // เริ่ม fade out
    setTimeout(() => setSelectedRow(null), 4000); // ล้าง selected row
  };

  /* ======================================================
     ส่วนแสดงผล UI
  ====================================================== */

  return (
    <Box>

      {/* ======================================================
         TABLE แสดงข้อมูลประเภท FAQ
      ====================================================== */}

      <ComponentTableModel columns={columnsToShow} largest="xl">

        {/* ======================================================
           กรณีกำลังโหลดข้อมูล
        ====================================================== */}

        {loading ? (
          <TableRow>
            <StyledTableCell
              colSpan={columnsToShow.length}
              align="center"
              sx={{ py: 3 }}
            >

              {/* รูป loading */}
              <img
                src={Loading}
                alt="Loading"
                style={{ width: "4%" }}
              />
            </StyledTableCell>
          </TableRow>

        ) : faqTypeData.faqtypes.length === 0 ? (

          /* ======================================================
             กรณีไม่มีข้อมูล
          ====================================================== */

          <TableRow>
            <TableCell
              colSpan={columnsToShow.length}
              align="center"
              sx={{ py: 3 }}
            >

              {/* รูป no data */}
              <img
                src={NoImage}
                alt="No data"
                style={{ width: "20%" }}
              />
            </TableCell>
          </TableRow>

        ) : (

          /* ======================================================
             วนลูปแสดงรายการข้อมูลประเภท FAQ
          ====================================================== */

          faqTypeData.faqtypes.map((item, index) => {

            // ตรวจสอบสถานะ active
            const isActive =
              String(item.int_saksiam_typefqa_active) === "1";

            return (
              <TableRow
                key={item.int_saksiam_typefqa_id}

                // เมื่อกด row
                onClick={() =>
                  handleRowClick(
                    item.int_saksiam_typefqa_id
                  )
                }

                sx={{

                  // style ตอน hover
                  "&:hover": {
                    backgroundColor:
                      theme.palette.action.hover,

                    cursor: "pointer",

                    boxShadow:
                      "0px rgba(0, 0, 0, 0.1)",
                  },

                  // border ด้านล่าง
                  borderBottom:
                    theme.palette.mode === "dark"
                      ? `1px solid ${theme.palette.grey[700]}`
                      : "1px solid #F0F2F4",

                  // background row ที่ถูกเลือก
                  backgroundColor:
                    selectedRow === item.int_saksiam_typefqa_id
                      ? fadeOut
                        ? "rgba(238, 244, 252, 0)"
                        : theme.palette.mode === "dark"
                          ? theme.palette.grey[700]
                          : "#F0F2F4"
                      : "inherit",

                  // animation เปลี่ยนสี background
                  transition:
                    "background-color 1s ease-in-out",
                }}
              >

                {/* ======================================================
                   ลำดับข้อมูล
                ====================================================== */}

                <StyledTableCell align="center">
                  {page * rowsPerPage + index + 1}
                </StyledTableCell>

                {/* ======================================================
                   ชื่อประเภท FAQ ภาษาไทย
                ====================================================== */}

                <StyledTableCell>
                  <Typography
                    fontWeight={400}
                    variant="body2"
                  >
                    {item.int_saksiam_typefqa_nameTH}
                  </Typography>
                </StyledTableCell>

                {/* ======================================================
                   ชื่อประเภท FAQ ภาษาอังกฤษ
                ====================================================== */}

                <StyledTableCell>
                  <Typography
                    fontWeight={400}
                    variant="body2"
                  >
                    {item.int_saksiam_typefqa_nameEN}
                  </Typography>
                </StyledTableCell>

                {/* ======================================================
                   ชื่อผู้บันทึก และวันที่อัปโหลด
                ====================================================== */}

                <StyledTableCell align="center">
                  <ComponentsDateTable
                    fullname={
                      item.int_saksiam_typefqa_savename || "-"
                    }

                    startdate={
                      item.int_saksiam_typefqa_createAt || ""
                    }

                    updatedate={
                      item.int_saksiam_typefqa_updateAt || null
                    }
                  />
                </StyledTableCell>

                {/* ======================================================
                   Column สถานะการใช้งาน
                ====================================================== */}

                {can("Status FAQ") && (
                  <StyledTableCell align="center">

                    {/* Switch เปิด / ปิดสถานะ */}
                    <ActiveStatusSwitch
                      checked={isActive}

                      onChange={(checked) =>
                        handleStatusChange(
                          item.int_saksiam_typefqa_id,
                          checked
                        )
                      }
                    />
                  </StyledTableCell>
                )}

                {/* ======================================================
                   Column จัดการข้อมูล
                ====================================================== */}

                {canManage && (
                  <StyledTableCell
                    align="center"
                    component="th"
                    scope="row"

                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >

                    {/* ======================================================
                       แสดงปุ่มเมื่อข้อมูลยังไม่ active
                    ====================================================== */}

                    {!isActive ? (
                      <>

                        {/* ======================================================
                           ปุ่มแก้ไขข้อมูล
                        ====================================================== */}

                        {canEditFaq && (
                          <AppIconButton
                            title="แก้ไขประเภทคำถามที่พบบ่อย"

                            variant="filled"

                            customColor="#FFAA37"

                            onClick={(e) => {

                              // ป้องกัน event row
                              e.stopPropagation();

                              // เปิดหน้าแก้ไข
                              handleEdit(
                                item.int_saksiam_typefqa_id
                              );
                            }}

                            sx={{
                              opacity: 1,
                              cursor: "pointer",
                              mr: 1,
                            }}
                          >

                            {/* icon แก้ไข */}
                            <HiPencil
                              style={{
                                fontSize:
                                  theme.typography.h6.fontSize,

                                color: "#fff",
                              }}
                            />
                          </AppIconButton>
                        )}

                        {/* ======================================================
                           ปุ่มลบข้อมูล
                        ====================================================== */}

                        {canDeleteFaq && (
                          <AppIconButton
                            title="ลบประเภทคำถามที่พบบ่อย"

                            variant="filled"

                            customColor={
                              theme.palette.error.dark
                            }

                            onClick={(e) => {

                              // ป้องกัน event row
                              e.stopPropagation();

                              // ลบข้อมูล
                              handleDelete(
                                item.int_saksiam_typefqa_id
                              );
                            }}

                            sx={{
                              opacity: 1,
                              cursor: "pointer",
                            }}
                          >

                            {/* icon ลบ */}
                            <AiFillDelete
                              style={{
                                fontSize:
                                  theme.typography.h6.fontSize,

                                color: "#fff",
                              }}
                            />
                          </AppIconButton>
                        )}
                      </>
                    ) : (

                      /* ======================================================
                         กรณี active แล้ว
                      ====================================================== */

                      <Typography fontWeight={400}>
                        -
                      </Typography>
                    )}
                  </StyledTableCell>
                )}
              </TableRow>
            );
          })
        )}
      </ComponentTableModel>

      {/* ======================================================
         Pagination Table
      ====================================================== */}

      <TablePagination
        component="div"

        // จำนวนข้อมูลทั้งหมด
        count={faqTypeData.counts}

        // หน้าปัจจุบัน
        page={page}

        // เปลี่ยนหน้า
        onPageChange={handleChangePage}

        // จำนวนข้อมูลต่อหน้า
        rowsPerPage={rowsPerPage}

        // เปลี่ยนจำนวนข้อมูลต่อหน้า
        onRowsPerPageChange={handleChangeRowsPerPage}

        // ตัวเลือก rows per page
        rowsPerPageOptions={[15, 25]}

        // label จำนวนข้อมูลต่อหน้า
        labelRowsPerPage="จำนวนแสดงข้อมูลต่อหน้า"

        // label ช่วงข้อมูล
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
        }
      />
    </Box>
  );
};


export default ComponentsFaqTypeTableView;