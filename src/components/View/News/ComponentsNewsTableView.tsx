// “ตารางแสดงข้อมูลข่าวสารและกิจกรรม”

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
  IconButton,
  TableCell,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";

/* ======================================================
   IMPORT COMPONENT ตารางและ UI ที่ใช้งาน
====================================================== */

import ComponentTableModel from "../../Model/Table/ComponentTableModel";
import StyledTableCell from "../../Model/Table/StyledTableCell";
import ComponentsDateTable from "../../Model/Table/ComponentsDateTable";
import AppIconButton from "../../Buttom/IconButton";
import ApprovalStatusBadge from "../../Status/ApprovalStatusBadge";

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
import { MdPushPin } from "react-icons/md";

/* ======================================================
   BASE URL : สำหรับแสดงรูปภาพข่าว
====================================================== */

const PHOTO_BASE =
  import.meta.env.VITE_BASE_URL_API_PHOTO || import.meta.env.VITE_BASE_URL_API || "";

/* ======================================================
   FUNCTION : สร้าง path รูปภาพแบบเต็ม
====================================================== */

const buildPhotoUrl = (path: string) => {

  // กรณีเป็น URL เต็มอยู่แล้ว
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  // ตัด / ด้านท้าย base url
  const base = String(PHOTO_BASE).replace(/\/+$/, "");

  // ตัด / ด้านหน้าของ path
  const cleanPath = path.replace(/^\/+/, "");

  // รวม path รูปภาพ
  return `${base}/${cleanPath}`;
};

/* ======================================================
   TYPE : ข้อมูลข่าวสารและกิจกรรม
====================================================== */

export type NewsItem = {

  id: number; // รหัสข่าว

  code?: string; // code ข่าว

  image?: string; // รูปหลัก

  images?: string[]; // รูปภาพทั้งหมด

  typeNameTH: string; // ชื่อประเภทข่าวภาษาไทย

  typeNameEN?: string; // ชื่อประเภทข่าวภาษาอังกฤษ

  titleTH: string; // หัวข้อข่าวภาษาไทย

  titleEN: string; // หัวข้อข่าวภาษาอังกฤษ

  pageStatus?: string; // สถานะหน้า

  approveStatus?: string; // สถานะอนุมัติ

  active: number | string; // สถานะเปิดใช้งาน

  pin?: number | string; // สถานะปักหมุด

  startDate?: string | null; // วันที่เริ่มแสดง

  endDate?: string | null; // วันที่สิ้นสุด

  savename?: string; // ชื่อผู้บันทึก

  approveName?: string; // ชื่อผู้อนุมัติ

  approveDate?: string | null; // วันที่อนุมัติ

  createAt?: string; // วันที่สร้าง

  updateAt?: string | null; // วันที่แก้ไข

  updateName?: string; // ชื่อผู้แก้ไข

  views?: number | string; // ยอดเข้าชม

  viewCount?: number | string; // ยอดเข้าชม

  totalViews?: number | string; // ยอดเข้าชม

  total_views?: number | string; // ยอดเข้าชม

  visit?: number | string; // ยอดเข้าชม

  visits?: number | string; // ยอดเข้าชม

  stats?: {
    labels?: string[];
    total_views?: number[];
  }; // ข้อมูลกราฟยอดเข้าชม
};

/* ======================================================
   TYPE : Props ของ Component
====================================================== */

type Props = {

  newsData: {
    counts: number; // จำนวนข้อมูลทั้งหมด
    news: NewsItem[]; // list ข่าว
  };

  loading: boolean; // สถานะโหลดข้อมูล

  page: number; // หน้าปัจจุบัน

  rowsPerPage: number; // จำนวนข้อมูลต่อหน้า

  setPage: Dispatch<SetStateAction<number>>; // เปลี่ยนหน้า

  setRowsPerPage: Dispatch<SetStateAction<number>>; // เปลี่ยนจำนวนข้อมูลต่อหน้า

  handleEdit: (id: number, code?: string) => void; // แก้ไขข่าว

  handleView: (id: number, code?: string) => void; // ดูรายละเอียดข่าว

  handleApprove: (id: number, code?: string) => void; // อนุมัติข่าว

  handlePinChange: (id: number, checked: boolean) => void; // เปลี่ยนสถานะปักหมุด
};

/* ======================================================
   COLUMN : หัวตารางแสดงข้อมูลข่าวสารและกิจกรรม
====================================================== */

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "5%", align: "center" },
  { id: 3, label: "ข่าวสารและกิจกรรม", width: "32%", align: "left" },
  { id: 5, label: "ชื่อ/วันที่อัปโหลดข้อมูล", width: "14%", align: "center" },
  { id: 6, label: "ชื่อ/วันที่อนุมัติ", width: "14%", align: "center" },
  { id: 7, label: "สถานะ", width: "10%", align: "center" },
  { id: 8, label: "จัดการข้อมูล", width: "8%", align: "center" },
  { id: 9, label: "ปักหมุด", width: "6%", align: "center" },
];

/* ======================================================
   STYLE : จำกัดจำนวนบรรทัดข้อความหัวข้อข่าว
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
   COMPONENT : ตารางแสดงข้อมูลข่าวสารและกิจกรรม
====================================================== */

const ComponentsNewsTableView = ({
  newsData,
  loading,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  handleEdit,
  handleView,
  handleApprove,
  handlePinChange,
}: Props) => {

  /* ======================================================
     THEME : เรียกใช้งาน theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     STATE : row ที่ถูกเลือก
  ====================================================== */

  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  /* ======================================================
     STATE : ใช้สำหรับ fade animation ของ row
  ====================================================== */

  const [fadeOut, setFadeOut] = useState(false);

  /* ======================================================
     FUNCTION : เปลี่ยนหน้าของตาราง
  ====================================================== */

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /* ======================================================
     FUNCTION : เปลี่ยนจำนวนข้อมูลต่อหน้า
  ====================================================== */

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /* ======================================================
     FUNCTION : เมื่อกดเลือก row
  ====================================================== */

  const handleRowClick = (id: number) => {

    // กำหนด row ที่เลือก
    setSelectedRow(id);

    // reset fade animation
    setFadeOut(false);

    // เริ่ม fade หลัง 3 วินาที
    setTimeout(() => setFadeOut(true), 3000);

    // ล้าง row selection หลัง 4 วินาที
    setTimeout(() => setSelectedRow(null), 4000);
  };

  return (

    /* ======================================================
       CONTAINER : ตารางข้อมูลข่าวสารและกิจกรรม
    ====================================================== */

    <Box>

      {/* ======================================================
         TABLE : ตารางหลัก
      ====================================================== */}

      <ComponentTableModel columns={columns} largest="xl">

        {/* ======================================================
           LOADING : แสดงสถานะกำลังโหลดข้อมูล
        ====================================================== */}

        {loading ? (
          <TableRow>
            <StyledTableCell
              colSpan={columns.length}
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

          /* ======================================================
             EMPTY : ไม่มีข้อมูลข่าวสาร
          ====================================================== */

        ) : newsData.news.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
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

          /* ======================================================
             DATA : แสดงข้อมูลข่าวสาร
          ====================================================== */

        ) : (
          newsData.news.map((item, index) => {

            /* ======================================================
               แปลงสถานะ active เป็น string
            ====================================================== */

            const active = String(item.active);

            /* ======================================================
               ตรวจสอบว่ามีข้อมูลอนุมัติหรือไม่
            ====================================================== */

            const shouldShowApproveInfo =
              active === "0" ||
              active === "1" ||
              active === "3" ||
              active === "inactive" ||
              active === "approved" ||
              active === "active" ||
              active === "cancel";

            const hasApproveInfo =
              shouldShowApproveInfo &&
              Boolean(item.approveDate) &&
              Boolean(item.approveName) &&
              item.approveName !== "-";

            /* ======================================================
               ปิดการใช้งาน action บางปุ่ม
            ====================================================== */

            const actionDisabled = active === "1" || active === "3";

            /* ======================================================
               ดึงรูปแรกของข่าว
            ====================================================== */

            const firstImage = item.image || item.images?.[0] || "";

            return (

              /* ======================================================
                 ROW : ข้อมูลข่าวแต่ละรายการ
              ====================================================== */

              <TableRow
                key={item.id}

                // คลิกเลือก row
                onClick={() => handleRowClick(item.id)}

                // ดับเบิลคลิกเพื่อดูรายละเอียด
                onDoubleClick={() => handleView(item.id, item.code)}

                sx={{

                  // style ตอน hover
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    cursor: "pointer",
                    boxShadow: "0px rgba(0, 0, 0, 0.1)",
                  },

                  // border ล่างของ row
                  borderBottom:
                    theme.palette.mode === "dark"
                      ? `1px solid ${theme.palette.grey[700]}`
                      : "1px solid #F0F2F4",

                  // background row ตอนเลือก
                  backgroundColor:
                    selectedRow === item.id
                      ? fadeOut
                        ? "rgba(238, 244, 252, 0)"
                        : theme.palette.mode === "dark"
                          ? theme.palette.grey[700]
                          : "#F0F2F4"
                      : "inherit",

                  // animation transition
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
                   COLUMN : ข่าวสารและกิจกรรม
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
                       IMAGE : รูปภาพข่าว
                    ====================================================== */}

                    {firstImage ? (
                      <Box
                        component="img"
                        src={buildPhotoUrl(firstImage)}
                        alt={item.titleTH || "news"}
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
                         PLACEHOLDER : กรณีไม่มีรูปภาพ
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
                       TITLE : หัวข้อข่าวภาษาไทย
                    ====================================================== */}

                    <Typography
                      fontWeight={500}
                      variant="body2"
                      sx={{
                        ...titleTextClampSx,
                        fontSize: "0.95rem",
                      }}
                    >
                      {item.titleTH || "-"}
                    </Typography>
                  </Box>
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : ผู้สร้างและวันที่อัปโหลด
                ====================================================== */}

                <StyledTableCell align="center">
                  <ComponentsDateTable
                    fullname={item.savename || "-"}
                    startdate={item.createAt || ""}
                    updatedate={item.updateAt || null}
                  />
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : ผู้อนุมัติและวันที่อนุมัติ
                ====================================================== */}

                <StyledTableCell align="center">
                  {!hasApproveInfo ? (

                    /* ======================================================
                       กรณีไม่มีข้อมูลอนุมัติ
                    ====================================================== */

                    <Typography fontWeight={400}>-</Typography>
                  ) : (

                    /* ======================================================
                       แสดงข้อมูลผู้อนุมัติ
                    ====================================================== */

                    <ComponentsDateTable
                      fullname={item.approveName || "-"}
                      startdate={item.approveDate || ""}
                      updatedate={null}
                    />
                  )}
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : สถานะข่าว
                ====================================================== */}

                <StyledTableCell align="center">
                  <ApprovalStatusBadge
                    value={item.active}
                    blinkKey="newsStatusBlinking"

                    // คลิกเพื่อดูรายละเอียด
                    onClick={(event) => {
                      event.stopPropagation();
                      handleView(item.id, item.code);
                    }}

                    // คลิกเพื่ออนุมัติข่าว
                    onApproveClick={(event) => {
                      event.stopPropagation();
                      handleApprove(item.id, item.code);
                    }}
                  />
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : ปุ่มจัดการข้อมูล
                ====================================================== */}

                <StyledTableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >

                    {/* ======================================================
                       กรณีปิดการแก้ไข
                    ====================================================== */}

                    {actionDisabled ? (
                      <Typography fontWeight={500}>-</Typography>
                    ) : (

                      /* ======================================================
                         BUTTON : ปุ่มแก้ไขข่าว
                      ====================================================== */

                      <AppIconButton
                        title="แก้ไขข่าวสารและกิจกรรม"
                        variant="filled"
                        customColor="#FFAA37"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEdit(item.id, item.code);
                        }}
                        sx={{
                          opacity: 1,
                          cursor: "pointer",
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
                  </Box>
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : ปักหมุดข่าว
                ====================================================== */}

                <StyledTableCell align="center">

                  {/* ======================================================
                     ป้องกัน event bubbling
                  ====================================================== */}

                  <Box onClick={(event) => event.stopPropagation()}>

                    {(() => {

                      /* ======================================================
                         ตรวจสอบสถานะปักหมุด
                      ====================================================== */

                      const isPinned = String(item.pin ?? "0") !== "0";

                      /* ======================================================
                         แสดงปุ่มปักหมุดเฉพาะข่าวที่เผยแพร่
                      ====================================================== */

                      const showPin =
                        active === "1" || active === "approved" || active === "active";

                      return (

                        /* ======================================================
                           กรณีไม่สามารถปักหมุดได้
                        ====================================================== */

                        !showPin ? (
                          <Typography fontWeight={500}>-</Typography>
                        ) : (

                          /* ======================================================
                             BUTTON : ปุ่มปักหมุดข่าว
                          ====================================================== */

                          <IconButton
                            onClick={() => {

                              // เปลี่ยนสถานะปักหมุดข่าว
                              handlePinChange(item.id, !isPinned);
                            }}
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",

                              // สีพื้นหลังเมื่อปักหมุด
                              backgroundColor: isPinned ? "#ff3741" : "#eef2f7",

                              // สี icon
                              color: isPinned ? "#fff" : theme.palette.grey[400],

                              // สี border
                              border: "1px solid",
                              borderColor: isPinned ? "#ff3741" : "#d7dde8",

                              // shadow ปุ่ม
                              boxShadow: isPinned
                                ? "0 8px 18px rgba(255, 55, 65, 0.28)"
                                : "0 4px 12px rgba(15, 23, 42, 0.08)",

                              // style ตอน hover
                              "&:hover": {
                                backgroundColor: isPinned ? "#e62f38" : "#e4eaf2",
                              },

                              // style ตอน disabled
                              "&.Mui-disabled": {
                                backgroundColor: "#eef2f7",
                                color: theme.palette.text.disabled,
                              },
                            }}
                          >

                            {/* ======================================================
                               ICON : ไอคอนปักหมุด
                            ====================================================== */}

                            <MdPushPin style={{ fontSize: 20 }} />
                          </IconButton>
                        )
                      );
                    })()}
                  </Box>
                </StyledTableCell>
              </TableRow>
            );
          })
        )}
      </ComponentTableModel>

      {/* ======================================================
         PAGINATION : ตัวแบ่งหน้าตาราง
      ====================================================== */}

      <TablePagination
        component="div"
        count={newsData.counts}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[15, 25]}
        labelRowsPerPage="จำนวนแสดงข้อมูลต่อหน้า"

        // แสดงช่วงข้อมูลปัจจุบัน
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
        }
      />
    </Box>
  );
};

export default ComponentsNewsTableView;
