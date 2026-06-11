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

import ComponentTableModel from "../../Model/Table/ComponentTableModel";
import StyledTableCell from "../../Model/Table/StyledTableCell";
import ComponentsDateTable from "../../Model/Table/ComponentsDateTable";
import AppIconButton from "../../Buttom/IconButton";
import ApprovalStatusBadge from "../../Status/ApprovalStatusBadge";
import NoImage from "../../../assets/Image/dastano.png";
import Loading from "../../../assets/Image/Loading.gif";
import type { Column } from "../../../utils/types";

/* ======================================================
   TYPE : ข้อมูลนโยบาย
====================================================== */

export type PolicyItem = {
  id: number;
  code?: string;
  nameTH: string;
  nameEN: string;
  detailTH?: string;
  detailEN?: string;
  active: number | string;
  createname?: string;
  updatename?: string;
  createAt?: string;
  updateAt?: string | null;
  approvedName?: string;
  approvedDate?: string | null;
  order?: number;
};

/* ======================================================
   TYPE : Props ของ ComponentsPolicyTableView
====================================================== */

type Props = {
  policyData: {
    counts: number;
    policies: PolicyItem[];
  };
  loading: boolean;
  page: number;
  rowsPerPage: number;
  setPage: Dispatch<SetStateAction<number>>;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  handleEdit: (id: number) => void;
  handleView: (id: number, code?: string) => void;
  handleApprove: (id: number, code?: string) => void;
};

/* ======================================================
   TABLE COLUMN : หัวตารางข้อมูลนโยบาย
====================================================== */

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "7%", align: "center" },
  { id: 2, label: "ชื่อนโยบายภาษาไทย", width: "24%", align: "left" },
  { id: 3, label: "ชื่อนโยบายภาษาอังกฤษ", width: "24%", align: "left" },
  { id: 4, label: "ชื่อ/วันที่อัปโหลดข้อมูล", width: "18%", align: "center" },
  { id: 5, label: "ชื่อ/วันที่อนุมัติ", width: "18%", align: "center" },
  { id: 6, label: "สถานะ", width: "10%", align: "center" },
  { id: 7, label: "จัดการข้อมูล", width: "9%", align: "center" },
];

/* ======================================================
   COMPONENT : ตารางแสดงข้อมูลนโยบาย
====================================================== */

const ComponentsPolicyTableView = ({
  policyData,
  loading,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  handleEdit,
  handleView,
  handleApprove,
}: Props) => {

  // theme ของ MUI
  const theme = useTheme();

  // state เก็บ row ที่ถูกเลือก
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // state fade animation ของ row
  const [fadeOut, setFadeOut] = useState(false);

  /* ======================================================
     FUNCTION : เปลี่ยนหน้า pagination
  ====================================================== */

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /* ======================================================
     FUNCTION : เปลี่ยนจำนวนแถวต่อหน้า
  ====================================================== */

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /* ======================================================
     FUNCTION : เลือก row และแสดง effect highlight
  ====================================================== */

  const handleRowClick = (id: number) => {
    setSelectedRow(id);
    setFadeOut(false);

    // เริ่ม fade out หลัง 3 วินาที
    setTimeout(() => setFadeOut(true), 3000);

    // reset row หลัง 4 วินาที
    setTimeout(() => setSelectedRow(null), 4000);
  };


  return (
    <Box>

      {/* ======================================================
         TABLE : ตารางแสดงข้อมูลนโยบาย
      ====================================================== */}

      <ComponentTableModel columns={columns} largest="xl">

        {/* ======================================================
           LOADING : แสดงสถานะกำลังโหลดข้อมูล
        ====================================================== */}

        {loading ? (
          <TableRow>
            <StyledTableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
              <img src={Loading} alt="Loading" style={{ width: "4%" }} />
            </StyledTableCell>
          </TableRow>

        ) : policyData.policies.length === 0 ? (

          /* ======================================================
             EMPTY : กรณีไม่มีข้อมูลในตาราง
          ====================================================== */

          <TableRow>
            <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
              <img src={NoImage} alt="No data" style={{ width: "20%" }} />
            </TableCell>
          </TableRow>

        ) : (

          /* ======================================================
             MAP : วนลูปข้อมูลนโยบาย
          ====================================================== */

          policyData.policies.map((item, index) => {

            // แปลงสถานะข้อมูลเป็น string
            const active = String(item.active);

            // ตรวจสอบว่ามีข้อมูลผู้อนุมัติหรือไม่
            const hasApproveInfo =
              (active === "0" ||
                active === "1" ||
                active === "3" ||
                active === "inactive" ||
                active === "approved" ||
                active === "active" ||
                active === "cancel") &&
              Boolean(item.approvedDate) &&
              Boolean(item.approvedName) &&
              item.approvedName !== "-";

            // ปิดปุ่มแก้ไขเมื่อสถานะเป็นอนุมัติหรือไม่อนุมัติ
            const actionDisabled = active === "1" || active === "3";

            return (

              /* ======================================================
                 ROW : แถวข้อมูลนโยบาย
              ====================================================== */

              <TableRow
                key={item.id}

                // คลิกเพื่อ highlight row
                onClick={() => handleRowClick(item.id)}

                // ดับเบิลคลิกเพื่อดูรายละเอียด
                onDoubleClick={() => handleView(item.id, item.code)}

                sx={{

                  // hover effect ของ row
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    cursor: "pointer",
                  },

                  // เส้นแบ่ง row
                  borderBottom:
                    theme.palette.mode === "dark"
                      ? `1px solid ${theme.palette.grey[700]}`
                      : "1px solid #F0F2F4",

                  // background row ตอนถูกเลือก
                  backgroundColor:
                    selectedRow === item.id
                      ? fadeOut
                        ? "rgba(238, 244, 252, 0)"
                        : theme.palette.mode === "dark"
                          ? theme.palette.grey[700]
                          : "#F0F2F4"
                      : "inherit",

                  // transition effect
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
                   COLUMN : ชื่อนโยบายภาษาไทย
                ====================================================== */}

                <StyledTableCell>
                  <Typography variant="body2">
                    {item.nameTH || "-"}
                  </Typography>
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : ชื่อนโยบายภาษาอังกฤษ
                ====================================================== */}

                <StyledTableCell>
                  <Typography variant="body2">
                    {item.nameEN || "-"}
                  </Typography>
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : ผู้สร้าง / วันที่สร้าง
                ====================================================== */}

                <StyledTableCell align="center">
                  <ComponentsDateTable
                    fullname={item.createname || "-"}
                    startdate={item.createAt || ""}
                    updatedate={item.updateAt || null}
                  />
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : ผู้อนุมัติ / วันที่อนุมัติ
                ====================================================== */}

                <StyledTableCell align="center">
                  {!hasApproveInfo ? (
                    <Typography fontWeight={400}>-</Typography>
                  ) : (
                    <ComponentsDateTable
                      fullname={item.approvedName || "-"}
                      startdate={item.approvedDate || ""}
                      updatedate={null}
                    />
                  )}
                </StyledTableCell>

                {/* ======================================================
                   COLUMN : สถานะข้อมูล
                ====================================================== */}

                <StyledTableCell align="center">
                  <ApprovalStatusBadge
                    value={item.active}
                    blinkKey="policyStatusBlinking"

                    // คลิก badge เพื่อดูรายละเอียด
                    onClick={(event) => {
                      event.stopPropagation();
                      handleView(item.id, item.code);
                    }}

                    // คลิก badge เพื่ออนุมัติข้อมูล
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

                  {/* ======================================================
                     STATUS : ตรวจสอบสถานะปุ่มแก้ไข
                  ====================================================== */}

                  {actionDisabled ? (

                    <Typography fontWeight={500}>-</Typography>

                  ) : (

                    <>
                      {/* ======================================================
                         BUTTON : ปุ่มแก้ไขนโยบาย
                      ====================================================== */}

                      <AppIconButton
                        title="แก้ไขนโยบาย"
                        variant="filled"
                        customColor="#FFAA37"

                        // คลิกปุ่มแก้ไข
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEdit(item.id);
                        }}
                      >
                        <HiPencil
                          style={{
                            fontSize: theme.typography.h6.fontSize,
                            color: "#fff",
                          }}
                        />
                      </AppIconButton>
                    </>
                  )}
                </StyledTableCell>
              </TableRow>
            );
          })
        )}
      </ComponentTableModel>

      {/* ======================================================
         PAGINATION : เปลี่ยนหน้าและจำนวนข้อมูลต่อหน้า
      ====================================================== */}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
        <TablePagination
          component="div"
          count={policyData.counts}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="จำนวนแสดงข้อมูลต่อหน้า"
          rowsPerPageOptions={[15, 25, 50]}
        />
      </Box>
    </Box>
  );
};

export default ComponentsPolicyTableView;
