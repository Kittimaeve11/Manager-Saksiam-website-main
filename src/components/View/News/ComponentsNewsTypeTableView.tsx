// “ตารางแสดงข้อมูลประเภทข่าวสารและกิจกรรม”

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
   IMPORT COMPONENT ที่ใช้งานภายในระบบ
====================================================== */

import ComponentTableModel from "../../Model/Table/ComponentTableModel";
import StyledTableCell from "../../Model/Table/StyledTableCell";
import NoImage from "../../../assets/Image/dastano.png";
import Loading from "../../../assets/Image/Loading.gif";
import ComponentsDateTable from "../../Model/Table/ComponentsDateTable";
import ActiveStatusSwitch from "../../Status/ActiveStatusSwitch";
import AppIconButton from "../../Buttom/IconButton";
import type { Column } from "../../../utils/types";

/* ======================================================
   IMPORT ICON
====================================================== */

import { HiPencil } from "react-icons/hi";
import { AiFillDelete } from "react-icons/ai";

/* ======================================================
   TYPE : ข้อมูลประเภทข่าวสารและกิจกรรม
====================================================== */

export type NewsTypeItem = {

  id: number; // id ประเภทข่าว

  nameTH: string; // ชื่อประเภทข่าวภาษาไทย

  nameEN: string; // ชื่อประเภทข่าวภาษาอังกฤษ

  active: number | string; // สถานะการใช้งาน

  savename?: string; // ชื่อผู้บันทึกข้อมูล

  createAt?: string; // วันที่สร้างข้อมูล

  updateAt?: string | null; // วันที่แก้ไขข้อมูล
};

/* ======================================================
   TYPE : Props ของ Component
====================================================== */

type Props = {

  newsTypeData: {
    counts: number; // จำนวนข้อมูลทั้งหมด
    newstypes: NewsTypeItem[]; // รายการประเภทข่าว
  };

  loading: boolean; // สถานะ loading

  page: number; // หน้าปัจจุบัน

  rowsPerPage: number; // จำนวนข้อมูลต่อหน้า

  setPage: Dispatch<SetStateAction<number>>; // เปลี่ยนหน้า

  setRowsPerPage: Dispatch<SetStateAction<number>>; // เปลี่ยนจำนวนข้อมูลต่อหน้า

  handleDelete: (id: number) => void; // ลบข้อมูล

  handleStatusChange: (id: number, checked: boolean) => void; // เปลี่ยนสถานะ

  handleEdit: (id: number) => void; // แก้ไขข้อมูล

  can: (slug: string) => boolean; // ตรวจสอบ permission
};

/* ======================================================
   TABLE COLUMN : หัวตาราง
====================================================== */

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "5%", align: "center" },
  { id: 2, label: "ชื่อประเภทข่าวภาษาไทย", width: "25%", align: "left" },
  { id: 3, label: "ชื่อประเภทข่าวภาษาอังกฤษ", width: "25%", align: "left" },
  { id: 4, label: "ชื่อ/วันที่อัปโหลดข้อมูล", width: "15%", align: "center" },
  { id: 5, label: "สถานะ", width: "15%", align: "center" },
  { id: 6, label: "จัดการข้อมูล", width: "15%", align: "center" },
];

/* ======================================================
   COMPONENT : ตารางแสดงข้อมูลประเภทข่าว
====================================================== */

const ComponentsNewsTypeTableView = ({
  newsTypeData,
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
     THEME : เรียกใช้งาน theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     STATE : row ที่ถูกเลือก
  ====================================================== */

  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  /* ======================================================
     STATE : ใช้ทำ effect fade row
  ====================================================== */

  const [fadeOut, setFadeOut] = useState(false);

  /* ======================================================
     PERMISSION : ตรวจสอบสิทธิ์การใช้งาน
  ====================================================== */

  const canUseNews = can("News") || can("New");

  const canEditNews = can("Edit News") || canUseNews;

  const canDeleteNews =
    can("Delete News") ||
    can("Edit News") ||
    canUseNews;

  const canStatusNews =
    can("Status News") ||
    canUseNews;

  const canManage = canEditNews || canDeleteNews;

  /* ======================================================
     FILTER : ซ่อน column ตาม permission
  ====================================================== */

  const columnsToShow = columns.filter((col) => {

    // ซ่อน column สถานะ
    if (col.id === 5 && !canStatusNews) return false;

    // ซ่อน column จัดการข้อมูล
    if (col.id === 6 && !canManage) return false;

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

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement>
  ) => {

    setRowsPerPage(parseInt(event.target.value, 10));

    // reset กลับหน้าแรก
    setPage(0);
  };

  /* ======================================================
     FUNCTION : highlight row เมื่อกดเลือก
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
     UI : ตารางแสดงข้อมูลประเภทข่าวสารและกิจกรรม
  ====================================================== */

  return (
    <Box>

      {/* ======================================================
       TABLE : ตารางข้อมูลหลัก
    ====================================================== */}

      <ComponentTableModel columns={columnsToShow} largest="xl">

        {/* ======================================================
         LOADING : แสดง loading ระหว่างโหลดข้อมูล
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

          /* ======================================================
             EMPTY : กรณีไม่มีข้อมูล
          ====================================================== */

        ) : newsTypeData.newstypes.length === 0 ? (
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

          /* ======================================================
             DATA : แสดงรายการประเภทข่าว
          ====================================================== */

        ) : (
          newsTypeData.newstypes.map((item, index) => {

            /* ======================================================
               CHECK : ตรวจสอบสถานะ active
            ====================================================== */

            const isActive = String(item.active) === "1";

            return (
              <TableRow
                key={item.id}

                /* ======================================================
                   EVENT : เมื่อคลิก row
                ====================================================== */

                onClick={() => handleRowClick(item.id)}

                sx={{

                  /* ======================================================
                     STYLE : hover row
                  ====================================================== */

                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    cursor: "pointer",
                    boxShadow: "0px rgba(0, 0, 0, 0.1)",
                  },

                  /* ======================================================
                     STYLE : border row
                  ====================================================== */

                  borderBottom:
                    theme.palette.mode === "dark"
                      ? `1px solid ${theme.palette.grey[700]}`
                      : "1px solid #F0F2F4",

                  /* ======================================================
                     STYLE : highlight row ที่เลือก
                  ====================================================== */

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

                {/* ======================================================
                 COLUMN : ลำดับข้อมูล
              ====================================================== */}

                <StyledTableCell align="center">
                  {page * rowsPerPage + index + 1}
                </StyledTableCell>

                {/* ======================================================
                 COLUMN : ชื่อประเภทข่าวภาษาไทย
              ====================================================== */}

                <StyledTableCell>
                  <Typography
                    fontWeight={400}
                    variant="body2"
                  >
                    {item.nameTH}
                  </Typography>
                </StyledTableCell>

                {/* ======================================================
                 COLUMN : ชื่อประเภทข่าวภาษาอังกฤษ
              ====================================================== */}

                <StyledTableCell>
                  <Typography
                    fontWeight={400}
                    variant="body2"
                  >
                    {item.nameEN}
                  </Typography>
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : ชื่อผู้บันทึก และ วันที่อัปโหลดข้อมูล
                ====================================================== */}

                <StyledTableCell align="center">
                  <ComponentsDateTable
                    fullname={item.savename || "-"}
                    startdate={item.createAt || ""}
                    updatedate={item.updateAt || null}
                  />
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : สถานะการใช้งาน
                ====================================================== */}

                {canStatusNews && (
                  <StyledTableCell align="center">

                    {/* ======================================================
                       SWITCH : เปิด / ปิดสถานะการใช้งาน
                    ====================================================== */}

                    <ActiveStatusSwitch
                      checked={isActive}
                      onChange={(checked) =>
                        handleStatusChange(item.id, checked)
                      }
                    />
                  </StyledTableCell>
                )}

                {/* ======================================================
                   COLUMN : จัดการข้อมูล
                ====================================================== */}

                {canManage && (
                  <StyledTableCell
                    align="center"
                    component="th"
                    scope="row"
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                  >

                    {/* ======================================================
                       CHECK : ถ้ายังไม่ active ให้แสดงปุ่มจัดการ
                    ====================================================== */}

                    {!isActive ? (
                      <>

                        {/* ======================================================
                           BUTTON : ปุ่มแก้ไขข้อมูล
                        ====================================================== */}

                        {canEditNews && (
                          <AppIconButton
                            title="แก้ไขประเภทข่าวและกิจกรรม"
                            variant="filled"
                            customColor="#FFAA37"
                            onClick={(e) => {

                              // ป้องกัน event row
                              e.stopPropagation();

                              // เปิดหน้าแก้ไขข้อมูล
                              handleEdit(item.id);
                            }}
                            sx={{
                              opacity: 1,
                              cursor: "pointer",
                              mr: 1,
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

                        {/* ======================================================
                           BUTTON : ปุ่มลบข้อมูล
                        ====================================================== */}

                        {canDeleteNews && (
                          <AppIconButton
                            title="ลบประเภทข่าวและกิจกรรม"
                            variant="filled"
                            customColor={theme.palette.error.dark}
                            onClick={(e) => {

                              // ป้องกัน event row
                              e.stopPropagation();

                              // ลบข้อมูล
                              handleDelete(item.id);
                            }}
                            sx={{
                              opacity: 1,
                              cursor: "pointer",
                            }}
                          >

                            {/* ======================================================
                               ICON : ไอคอนลบข้อมูล
                            ====================================================== */}

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

                      /* ======================================================
                         UI : ถ้า active แล้วจะไม่สามารถจัดการได้
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
         PAGINATION : ตัวแบ่งหน้าตารางข้อมูล
      ====================================================== */}
      
      <TablePagination
        component="div"
        count={newsTypeData.counts}
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

export default ComponentsNewsTypeTableView;
