// “ตารางแสดงข้อมูลคำถามที่พบบ่อย”

"use client";

/* ======================================================
   IMPORT React Hook และ TYPE ที่จำเป็น
====================================================== */

import { useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";

/* ======================================================
   IMPORT COMPONENT จาก MUI
====================================================== */

import {
  Box,
  TableCell,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";

/* ======================================================
   IMPORT COMPONENT ตาราง
====================================================== */

import ComponentTableModel from "../../Model/Table/ComponentTableModel";
import StyledTableCell from "../../Model/Table/StyledTableCell";
import ComponentsDateTable from "../../Model/Table/ComponentsDateTable";

/* ======================================================
   IMPORT COMPONENT สถานะ และปุ่มจัดการ
====================================================== */

import ActiveStatusSwitch from "../../Status/ActiveStatusSwitch";
import AppIconButton from "../../Buttom/IconButton";

/* ======================================================
   IMPORT รูปภาพ
====================================================== */

import NoImage from "../../../assets/Image/dastano.png";
import Loading from "../../../assets/Image/Loading.gif";

/* ======================================================
   IMPORT TYPE
====================================================== */

import type { Column } from "../../../utils/types";

/* ======================================================
   IMPORT ICON
====================================================== */

import { HiPencil } from "react-icons/hi";
import { AiFillDelete } from "react-icons/ai";

/* ======================================================
   TYPE ของข้อมูลคำถามที่พบบ่อย
====================================================== */

export type FaqQuestionItem = {
  id: number;

  typeNameTH: string;

  typeNameEN?: string;

  questionTH: string;

  questionEN: string;

  answerTH?: string;

  answerEN?: string;

  active: number | string;

  savename?: string;

  createAt?: string;

  updateAt?: string | null;
};

/* ======================================================
   TYPE ของ Props ที่ Component รับเข้ามา
====================================================== */

type Props = {
  faqQuestionData: {
    counts: number;

    questions: FaqQuestionItem[];
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

/* ======================================================
   กำหนด columns ของตาราง
====================================================== */

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "5%", align: "center" },
  { id: 2, label: "หัวข้อคำถามภาษาไทย", width: "30%", align: "left" },
  { id: 3, label: "หัวข้อคำถามภาษาอังกฤษ", width: "30%", align: "left" },
  { id: 4, label: "ชื่อ/วันที่อัปโหลดข้อมูล", width: "20%", align: "center" },
  { id: 5, label: "สถานะ", width: "10%", align: "center" },
  { id: 6, label: "จัดการข้อมูล", width: "15%", align: "center" },
];

/* ======================================================
   COMPONENT : ตารางแสดงข้อมูลคำถามที่พบบ่อย
====================================================== */

const ComponentsFaqQuestionTableView = ({
  faqQuestionData,
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
     STATE สำหรับจัดการ row ที่ถูกเลือก
  ====================================================== */

  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const [fadeOut, setFadeOut] = useState(false);

  /* ======================================================
     ตรวจสอบสิทธิ์การแก้ไขข้อมูล
  ====================================================== */

  const canEditFaq = can("Edit FAQ") || can("FAQ");

  /* ======================================================
     ตรวจสอบสิทธิ์การลบข้อมูล
  ====================================================== */

  const canDeleteFaq = can("Delete FAQ") || can("Edit FAQ") || can("FAQ");

  /* ======================================================
     ตรวจสอบว่ามีสิทธิ์จัดการข้อมูลหรือไม่
  ====================================================== */

  const canManage = canEditFaq || canDeleteFaq;

  /* ======================================================
     กรอง columns ตามสิทธิ์ของผู้ใช้งาน
  ====================================================== */

  const columnsToShow = columns.filter((col) => {

    // ซ่อน column สถานะ หากไม่มีสิทธิ์
    if (col.id === 5 && !can("Status FAQ")) return false;

    // ซ่อน column จัดการข้อมูล หากไม่มีสิทธิ์
    if (col.id === 6 && !canManage) return false;

    return true;
  });

  /* ======================================================
     เปลี่ยนหน้า Table Pagination
  ====================================================== */

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /* ======================================================
     เปลี่ยนจำนวนข้อมูลต่อหน้า
  ====================================================== */

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /* ======================================================
     จัดการ effect highlight row เมื่อถูกเลือก
  ====================================================== */

  const handleRowClick = (id: number) => {
    setSelectedRow(id);

    setFadeOut(false);

    setTimeout(() => setFadeOut(true), 3000);

    setTimeout(() => setSelectedRow(null), 4000);
  };

  return (
    <Box>

      {/* ======================================================
         ตารางแสดงข้อมูลคำถามที่พบบ่อย
      ====================================================== */}

      <ComponentTableModel columns={columnsToShow} largest="xl">

        {/* ======================================================
           แสดง loading ขณะกำลังโหลดข้อมูล
        ====================================================== */}

        {loading ? (
          <TableRow>
            <StyledTableCell
              colSpan={columnsToShow.length}
              align="center"
              sx={{ py: 3 }}
            >
              <img
                src={Loading}
                alt="Loading"
                style={{ width: "4%" }}
              />
            </StyledTableCell>
          </TableRow>

        ) : faqQuestionData.questions.length === 0 ? (

          /* ======================================================
             แสดงรูป No Data เมื่อไม่มีข้อมูล
          ====================================================== */

          <TableRow>
            <TableCell
              colSpan={columnsToShow.length}
              align="center"
              sx={{ py: 3 }}
            >
              <img
                src={NoImage}
                alt="No data"
                style={{ width: "20%" }}
              />
            </TableCell>
          </TableRow>

        ) : (

          /* ======================================================
             วนลูปแสดงข้อมูลคำถามที่พบบ่อย
          ====================================================== */

          faqQuestionData.questions.map((item, index) => {

            // ตรวจสอบสถานะการใช้งาน
            const isActive =
              String(item.active) === "1";

            return (
              <TableRow
                key={item.id}

                // เมื่อคลิก row
                onClick={() =>
                  handleRowClick(item.id)
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

                  // เส้น border ด้านล่าง
                  borderBottom:
                    theme.palette.mode === "dark"
                      ? `1px solid ${theme.palette.grey[700]}`
                      : "1px solid #F0F2F4",

                  // highlight row ที่ถูกเลือก
                  backgroundColor:
                    selectedRow === item.id
                      ? fadeOut
                        ? "rgba(238, 244, 252, 0)"
                        : theme.palette.mode === "dark"
                          ? theme.palette.grey[700]
                          : "#F0F2F4"
                      : "inherit",

                  // animation ตอน fade
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
                   หัวข้อคำถามภาษาไทย
                ====================================================== */}

                <StyledTableCell>
                  <Typography
                    fontWeight={400}
                    variant="body2"
                  >
                    {item.questionTH}
                  </Typography>
                </StyledTableCell>

                {/* ======================================================
                   หัวข้อคำถามภาษาอังกฤษ
                ====================================================== */}

                <StyledTableCell>
                  <Typography
                    fontWeight={400}
                    variant="body2"
                  >
                    {item.questionEN}
                  </Typography>
                </StyledTableCell>

                {/* ======================================================
                   แสดงชื่อผู้บันทึก และวันที่อัปโหลดข้อมูล
                ====================================================== */}

                <StyledTableCell align="center">
                  <ComponentsDateTable
                    fullname={item.savename || "-"}
                    startdate={item.createAt || ""}
                    updatedate={item.updateAt || null}
                  />
                </StyledTableCell>

                {/* ======================================================
                   แสดงสถานะการใช้งาน
                ====================================================== */}

                {can("Status FAQ") && (
                  <StyledTableCell align="center">
                    <ActiveStatusSwitch
                      checked={isActive}

                      onChange={(checked) =>
                        handleStatusChange(
                          item.id,
                          checked
                        )
                      }
                    />
                  </StyledTableCell>
                )}

                {/* ======================================================
                   คอลัมน์จัดการข้อมูล
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
                       แสดงปุ่มจัดการเมื่อข้อมูลอยู่ในสถานะปิดใช้งาน
                    ====================================================== */}

                    {!isActive ? (
                      <>

                        {/* ======================================================
                           ปุ่มแก้ไขข้อมูล
                        ====================================================== */}

                        {canEditFaq && (
                          <AppIconButton
                            title="แก้ไขคำถามที่พบบ่อย"
                            variant="filled"
                            customColor="#FFAA37"

                            onClick={(e) => {

                              // ป้องกัน trigger row click
                              e.stopPropagation();

                              // เรียกฟังก์ชันแก้ไข
                              handleEdit(item.id);
                            }}

                            sx={{
                              opacity: 1,
                              cursor: "pointer",
                              mr: 1,
                            }}
                          >
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
                            title="ลบคำถามที่พบบ่อย"
                            variant="filled"
                            customColor={
                              theme.palette.error.dark
                            }

                            onClick={(e) => {

                              // ป้องกัน trigger row click
                              e.stopPropagation();

                              // เรียกฟังก์ชันลบข้อมูล
                              handleDelete(item.id);
                            }}

                            sx={{
                              opacity: 1,
                              cursor: "pointer",
                            }}
                          >
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
                         หากข้อมูลเปิดใช้งานอยู่ จะไม่แสดงปุ่มจัดการ
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
         Pagination สำหรับเปลี่ยนหน้าและจำนวนข้อมูลต่อหน้า
      ====================================================== */}

      <TablePagination
        component="div"
        count={faqQuestionData.counts}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[15, 25]}
        labelRowsPerPage="จำนวนแสดงข้อมูลต่อหน้า"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} จาก ${count !== -1
            ? count
            : `มากกว่า ${to}`
          }`
        }
      />
    </Box>
  );
};

export default ComponentsFaqQuestionTableView;