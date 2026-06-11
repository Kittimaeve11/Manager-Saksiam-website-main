// “ตารางแสดงข้อมูลวิดีโอ”

"use client";

/* ======================================================
   IMPORT React Hook และ TYPE ที่จำเป็น
====================================================== */

import { useState } from "react";
import type {
  ChangeEvent,
  Dispatch,
  SetStateAction,
} from "react";

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
   IMPORT ICON
====================================================== */

import { HiPencil } from "react-icons/hi";

/* ======================================================
   IMPORT COMPONENT ภายในระบบ
====================================================== */

import ComponentTableModel from "../../Model/Table/ComponentTableModel";
import StyledTableCell from "../../Model/Table/StyledTableCell";
import ComponentsDateTable from "../../Model/Table/ComponentsDateTable";
import AppIconButton from "../../Buttom/IconButton";
import ApprovalStatusBadge from "../../Status/ApprovalStatusBadge";
import NoImage from "../../../assets/Image/dastano.png";
import Loading from "../../../assets/Image/Loading.gif";
import type { Column } from "../../../utils/types";

/* ======================================================
   TYPE : ข้อมูลวิดีโอ
====================================================== */

export type VedioItem = {

  id: number; // id วิดีโอ

  nameTH: string; // ชื่อวิดีโอภาษาไทย

  link: string; // ลิงก์วิดีโอ

  youtubeID: string; // youtube id

  active: string | number; // สถานะข้อมูล

  savename?: string; // ชื่อผู้บันทึกข้อมูล

  approveName?: string; // ชื่อผู้อนุมัติ

  approveDate?: string | null; // วันที่อนุมัติ

  createAt?: string; // วันที่สร้างข้อมูล

  updateAt?: string | null; // วันที่แก้ไขข้อมูล

  videoCreated?: string; // วันที่วิดีโอ
};

/* ======================================================
   TYPE : Props ของ Component
====================================================== */

type Props = {

  vedioData: {
    counts: number; // จำนวนข้อมูลทั้งหมด
    vedios: VedioItem[]; // รายการวิดีโอ
  };

  loading: boolean; // สถานะ loading

  page: number; // หน้าปัจจุบัน

  rowsPerPage: number; // จำนวนข้อมูลต่อหน้า

  setPage: Dispatch<SetStateAction<number>>; // เปลี่ยนหน้า

  setRowsPerPage: Dispatch<SetStateAction<number>>; // เปลี่ยนจำนวนข้อมูลต่อหน้า

  handleEdit: (id: number) => void; // แก้ไขข้อมูล

  handleDelete: (id: number) => void; // ลบข้อมูล

  handleApprove?: (id: number) => void; // อนุมัติข้อมูล

  can: (slug: string) => boolean; // ตรวจสอบ permission
};

/* ======================================================
   TABLE COLUMN : หัวตารางข้อมูลวิดีโอ
====================================================== */

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "5%", align: "center" },
  { id: 2, label: "วิดีโอ", width: "34%", align: "left" },
  { id: 3, label: "วันที่วิดีโอ", width: "10%", align: "center" },
  { id: 4, label: "ชื่อ/วันที่อัปโหลดข้อมูล", width: "16%", align: "center" },
  { id: 5, label: "ชื่อ/วันที่อนุมัติ", width: "16%", align: "center" },
  { id: 6, label: "สถานะ", width: "10%", align: "center" },
  { id: 7, label: "จัดการข้อมูล", width: "8%", align: "center" },
];

/* ======================================================
   STYLE : จำกัดจำนวนบรรทัด title
====================================================== */

const titleTextClampSx = {

  display: "-webkit-box",

  WebkitBoxOrient: "vertical",

  WebkitLineClamp: 3,

  overflow: "hidden",

  textOverflow: "ellipsis",

  lineHeight: 1.6,
};

/* ======================================================
   COMPONENT : ตารางแสดงข้อมูลวิดีโอ
====================================================== */

const ComponentsVedioTableView = ({
  vedioData,
  loading,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  handleEdit,
  handleApprove,
  can,
}: Props) => {

  /* ======================================================
     THEME : เรียกใช้งาน theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     STATE : row ที่ถูกเลือก
  ====================================================== */

  const [selectedRow, setSelectedRow] =
    useState<number | null>(null);

  /* ======================================================
     STATE : effect fade row
  ====================================================== */

  const [fadeOut, setFadeOut] =
    useState(false);

  /* ======================================================
     PERMISSION : ตรวจสอบสิทธิ์แก้ไขข้อมูล
  ====================================================== */

  const canEdit =
    can("Edit Vedio") ||
    can("Vedio");

  /* ======================================================
     FILTER : ซ่อน column จัดการข้อมูล
  ====================================================== */

  const columnsToShow = columns.filter(
    (col) => col.id !== 7 || canEdit
  );

  /* ======================================================
     FUNCTION : เปลี่ยนหน้า table
  ====================================================== */

  const handleChangePage = (
    _event: unknown,
    newPage: number
  ) => {

    setPage(newPage);
  };

  /* ======================================================
     FUNCTION : เปลี่ยนจำนวนข้อมูลต่อหน้า
  ====================================================== */

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement>
  ) => {

    setRowsPerPage(
      parseInt(event.target.value, 10)
    );

    // reset กลับหน้าแรก
    setPage(0);
  };

  /* ======================================================
     FUNCTION : highlight row เมื่อเลือก
  ====================================================== */

  const handleRowClick = (id: number) => {

    setSelectedRow(id);

    setFadeOut(false);

    // เริ่ม fade row
    setTimeout(() => setFadeOut(true), 3000);

    // reset row ที่เลือก
    setTimeout(() => setSelectedRow(null), 4000);
  };

  /* ======================================================
     UI : ตารางแสดงข้อมูลวิดีโอ
  ====================================================== */

  return (
    <Box>

      {/* ======================================================
         TABLE : ตารางข้อมูลวิดีโอ
      ====================================================== */}

      <ComponentTableModel
        columns={columnsToShow}
        largest="xl"
      >

        {/* ======================================================
           CONDITION : ตรวจสอบสถานะการโหลดข้อมูล
        ====================================================== */}

        {loading ? (

          /* ======================================================
             LOADING : แสดง loading ขณะดึงข้อมูล
          ====================================================== */

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

        ) : vedioData.vedios.length === 0 ? (

          /* ======================================================
             EMPTY : กรณีไม่มีข้อมูลวิดีโอ
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
             DATA : วนลูปแสดงข้อมูลวิดีโอ
          ====================================================== */

          vedioData.vedios.map((item, index) => {

            /* ======================================================
               CHECK : แปลงสถานะเป็น string
            ====================================================== */

            const active = String(item.active);

            /* ======================================================
               CHECK : ตรวจสอบว่ามีข้อมูลผู้อนุมัติหรือไม่
            ====================================================== */

            const hasApproveInfo =
              (active === "0" ||
                active === "1" ||
                active === "3" ||
                active === "inactive" ||
                active === "approved" ||
                active === "active" ||
                active === "cancel") &&
              Boolean(item.approveDate) &&
              Boolean(item.approveName) &&
              item.approveName !== "-";

            /* ======================================================
               CHECK : ปิดปุ่มแก้ไขเมื่อข้อมูลถูกอนุมัติ
            ====================================================== */

            const actionDisabled =
              active === "1" ||
              active === "3";

            /* ======================================================
               FUNCTION : เปิดหน้าอนุมัติข้อมูล
            ====================================================== */

            const openApprovePage = (
              event: React.MouseEvent<HTMLElement>
            ) => {

              // ป้องกัน event bubbling ของ row
              event.stopPropagation();

              // เปิดหน้า approve
              handleApprove?.(item.id);
            };


            return (

              /* ======================================================
                 ROW : แถวข้อมูลวิดีโอ
              ====================================================== */

              <TableRow
                key={item.id}

                /* ======================================================
                   EVENT : เมื่อคลิก row
                ====================================================== */

                onClick={() => handleRowClick(item.id)}

                sx={{

                  /* ======================================================
                     STYLE : hover effect ของ row
                  ====================================================== */

                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    cursor: "pointer",
                  },

                  /* ======================================================
                     STYLE : เส้นแบ่ง row
                  ====================================================== */

                  borderBottom:
                    theme.palette.mode === "dark"
                      ? `1px solid ${theme.palette.grey[700]}`
                      : "1px solid #F0F2F4",

                  /* ======================================================
                     STYLE : highlight row ที่ถูกเลือก
                  ====================================================== */

                  backgroundColor:
                    selectedRow === item.id
                      ? fadeOut
                        ? "rgba(238, 244, 252, 0)"
                        : theme.palette.mode === "dark"
                          ? theme.palette.grey[700]
                          : "#F0F2F4"
                      : "inherit",

                  /* ======================================================
                     STYLE : animation transition
                  ====================================================== */

                  transition: "background-color 1s ease-in-out",
                }}
              >

                {/* ======================================================
                   COLUMN : ลำดับข้อมูล
                ====================================================== */}

                <StyledTableCell align="center">
                  {page * rowsPerPage + index + 1}
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : ข้อมูลวิดีโอ
                ====================================================== */}

                <StyledTableCell>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >

                    {/* ======================================================
                       THUMBNAIL : รูปตัวอย่างวิดีโอจาก YouTube
                    ====================================================== */}

                    {item.youtubeID ? (

                      <Box
                        component="img"
                        src={`https://img.youtube.com/vi/${item.youtubeID}/mqdefault.jpg`}
                        alt={item.nameTH || "video"}
                        sx={{
                          width: 110,
                          height: 70,
                          objectFit: "cover",
                          borderRadius: 1.5,
                          flexShrink: 0,
                        }}
                      />

                    ) : (

                      /* ======================================================
                         UI : placeholder กรณีไม่มีรูป thumbnail
                      ====================================================== */

                      <Box
                        sx={{
                          width: 110,
                          height: 70,
                          borderRadius: 2,
                          backgroundColor: "#E5E7EB",
                          flexShrink: 0,
                        }}
                      />
                    )}

                    {/* ======================================================
                       TEXT : ชื่อวิดีโอ
                    ====================================================== */}

                    <Typography
                      fontWeight={500}
                      variant="body2"
                      sx={{
                        ...titleTextClampSx,
                        fontSize: "0.95rem",
                      }}
                    >
                      {item.nameTH || "-"}
                    </Typography>
                  </Box>
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : วันที่วิดีโอ
                ====================================================== */}

                <StyledTableCell align="center">

                  <Typography variant="body2">

                    {item.videoCreated
                      ? new Intl.DateTimeFormat("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(item.videoCreated))
                      : "-"}

                  </Typography>
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : ผู้บันทึก และ วันที่อัปโหลดข้อมูล
                ====================================================== */}

                <StyledTableCell align="center">

                  <ComponentsDateTable
                    fullname={item.savename || "-"}
                    startdate={item.createAt || ""}
                    updatedate={item.updateAt || null}
                  />
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : ผู้อนุมัติ และ วันที่อนุมัติ
                ====================================================== */}

                <StyledTableCell align="center">

                  {!hasApproveInfo ? (

                    /* ======================================================
                       UI : กรณียังไม่มีข้อมูลอนุมัติ
                    ====================================================== */

                    <Typography fontWeight={400}>
                      -
                    </Typography>

                  ) : (

                    /* ======================================================
                       COMPONENT : แสดงข้อมูลผู้อนุมัติ
                    ====================================================== */

                    <ComponentsDateTable
                      fullname={item.approveName || "-"}
                      startdate={item.approveDate || ""}
                      updatedate={null}
                    />
                  )}
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : สถานะวิดีโอ
                ====================================================== */}

                <StyledTableCell align="center">

                  <ApprovalStatusBadge
                    value={item.active}
                    blinkKey="vedioStatusBlinking"

                    /* ======================================================
                       EVENT : คลิก badge เพื่อเปิดหน้าอนุมัติ
                    ====================================================== */

                    onClick={openApprovePage}
                    onApproveClick={openApprovePage}
                  />
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : จัดการข้อมูล
                ====================================================== */}

                {canEdit && (

                  <StyledTableCell align="center">

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >

                      {/* ======================================================
                         CHECK : ปิดปุ่มแก้ไขเมื่อข้อมูลถูกอนุมัติ
                      ====================================================== */}

                      {actionDisabled ? (

                        <Typography fontWeight={500}>
                          -
                        </Typography>

                      ) : (

                        /* ======================================================
                           BUTTON : ปุ่มแก้ไขข้อมูลวิดีโอ
                        ====================================================== */

                        <AppIconButton
                          title="แก้ไขวิดีโอ"
                          variant="filled"
                          customColor="#FFAA37"

                          onClick={(event) => {

                            // ป้องกัน event row
                            event.stopPropagation();

                            // เปิดหน้าแก้ไขข้อมูล
                            handleEdit(item.id);
                          }}

                          sx={{
                            opacity: 1,
                            cursor: "pointer",
                          }}
                        >

                          {/* ======================================================
                             ICON : ไอคอนแก้ไข
                          ====================================================== */}

                          <HiPencil
                            style={{
                              fontSize: theme.typography.h6.fontSize,
                              color: "#fff",
                            }}
                          />
                        </AppIconButton>
                      )}
                    </Box>
                  </StyledTableCell>
                )}
              </TableRow>
            );
          })
        )}
      </ComponentTableModel>

      {/* ======================================================
         PAGINATION : ตัวแบ่งหน้าตารางข้อมูล
      ====================================================== */}

      <TablePagination
        component="div"
        count={vedioData.counts}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[15, 25]}
        labelRowsPerPage="จำนวนแสดงข้อมูลต่อหน้า"

        /* ======================================================
           TEXT : ข้อความแสดงจำนวนข้อมูล
        ====================================================== */

        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
        }
      />
    </Box>
  );
};

export default ComponentsVedioTableView;
