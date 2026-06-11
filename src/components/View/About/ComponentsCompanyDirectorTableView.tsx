// “ตารางแสดงข้อมูลคณะกรรมการบริษัท”

"use client";

/* ======================================================
   IMPORT REACT HOOK และ TYPE
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
   IMPORT COMPONENT CUSTOM
====================================================== */

import ComponentTableModel from "../../Model/Table/ComponentTableModel";
import StyledTableCell from "../../Model/Table/StyledTableCell";
import ComponentsDateTable from "../../Model/Table/ComponentsDateTable";
import ActiveStatusSwitch from "../../Status/ActiveStatusSwitch";
import AppIconButton from "../../Buttom/IconButton";

/* ======================================================
   IMPORT รูปภาพ
====================================================== */

import NoImage from "../../../assets/Image/dastano.png";
import Loading from "../../../assets/Image/Loading.gif";

/* ======================================================
   IMPORT TYPE และ ICON
====================================================== */

import type { Column } from "../../../utils/types";
import { HiPencil } from "react-icons/hi";
import { AiFillDelete } from "react-icons/ai";

/* ======================================================
   BASE URL สำหรับรูปภาพ
====================================================== */

const PHOTO_BASE =
  import.meta.env.VITE_BASE_URL_API_PHOTO || import.meta.env.VITE_BASE_URL_API || "";

/* ======================================================
   FUNCTION : buildPhotoUrl
------------------------------------------------------
   แปลง path รูปภาพให้เป็น URL สมบูรณ์
====================================================== */

const buildPhotoUrl = (path?: string) => {
  // ถ้าไม่มี path
  if (!path) return "";

  // ถ้าเป็น URL เต็มอยู่แล้ว
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  // ตัด / ด้านท้าย base url
  const base = String(PHOTO_BASE).replace(/\/+$/, "");

  // ตัด / ด้านหน้าของ path
  const cleanPath = path.replace(/^\/+/, "");

  // รวม URL
  return `${base}/${cleanPath}`;
};

/* ======================================================
   TYPE : ข้อมูลคณะกรรมการ
====================================================== */

export type CompanyDirectorItem = {
  id: number; // รหัสข้อมูล
  image?: string; // รูปภาพ
  nameTH: string; // ชื่อภาษาไทย
  positionTH: string; // ตำแหน่งภาษาไทย
  directorTag?: string; // กลุ่มคณะกรรมการ
  active: number | string; // สถานะเปิดใช้งาน
  savename?: string; // ชื่อผู้บันทึก
  createAt?: string; // วันที่สร้างข้อมูล
  updateAt?: string | null; // วันที่อัปเดต
};

/* ======================================================
   TYPE : Props ของ Table
====================================================== */

type Props = {
  companyDirectorData: {
    counts: number; // จำนวนข้อมูลทั้งหมด
    directors: CompanyDirectorItem[]; // รายการข้อมูล
  };

  loading: boolean; // loading state
  page: number; // หน้าปัจจุบัน
  rowsPerPage: number; // จำนวนข้อมูลต่อหน้า

  setPage: Dispatch<SetStateAction<number>>;
  setRowsPerPage: Dispatch<SetStateAction<number>>;

  // callback เปลี่ยนสถานะ
  handleStatusChange: (id: number, checked: boolean) => void;

  // callback แก้ไขข้อมูล
  handleEdit: (id: number) => void;

  // callback ลบข้อมูล
  handleDelete: (id: number) => void;
};

/* ======================================================
   COLUMN ของตาราง
====================================================== */

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "5%", align: "center" },
  { id: 3, label: "ชื่อคณะกรรม", width: "18%", align: "left" },
  { id: 4, label: "ตำแหน่ง", width: "22%", align: "left" },
  { id: 5, label: "คณะกรรมการชุดย่อย", width: "22%", align: "left" },
  { id: 6, label: "ชื่อ/วันที่อัปโหลดข้อมูล", width: "15%", align: "center" },
  { id: 7, label: "สถานะ", width: "8%", align: "center" },
  { id: 8, label: "จัดการข้อมูล", width: "10%", align: "center" },
];

/* ======================================================
   STYLE : จำกัดข้อความ 3 บรรทัด
------------------------------------------------------
   ใช้สำหรับข้อความยาวใน table
====================================================== */

const clampThreeLineSx = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  lineHeight: 1.6,
  wordBreak: "break-word",
};

/* ======================================================
   COMPONENT : ตารางข้อมูลคณะกรรมการ
====================================================== */

const ComponentsCompanyDirectorTableView = ({
  companyDirectorData,
  loading,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  handleStatusChange,
  handleEdit,
  handleDelete,
}: Props) => {
  /* ======================================================
     เรียกใช้งาน theme ของ MUI
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     STATE : row ที่ถูกเลือก
  ====================================================== */

  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  /* ======================================================
     STATE : animation fade out
  ====================================================== */

  const [fadeOut, setFadeOut] = useState(false);

  /* ======================================================
     FUNCTION : เปลี่ยนหน้า pagination
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
    // เปลี่ยนจำนวน row ต่อหน้า
    setRowsPerPage(
      parseInt(event.target.value, 10)
    );

    // reset กลับหน้าแรก
    setPage(0);
  };

  /* ======================================================
     FUNCTION : click row
------------------------------------------------------
     ใช้แสดง effect highlight row
  ====================================================== */

  const handleRowClick = (
    id: number
  ) => {
    // กำหนด row ที่ถูกเลือก
    setSelectedRow(id);

    // reset fade effect
    setFadeOut(false);

    // เริ่ม fade out หลัง 3 วินาที
    setTimeout(
      () => setFadeOut(true),
      3000
    );

    // ล้าง selected row หลัง 4 วินาที
    setTimeout(
      () => setSelectedRow(null),
      4000
    );
  };

  /* ======================================================
     FUNCTION : renderCapsules
------------------------------------------------------
     แสดง tag แบบ capsule / chip
====================================================== */

  const renderCapsules = (
    value: string | undefined,
    color: string,
    borderColor: string
  ) => {
    /* ======================================================
       แปลง string -> array
    ====================================================== */

    const items = (value || "")
      .split("/")
      .map((item) => item.trim())
      .filter(Boolean);

    /* ======================================================
       ถ้าไม่มีข้อมูล
    ====================================================== */

    if (!items.length) {
      return (
        <Typography variant="body2">
          -
        </Typography>
      );
    }

    /* ======================================================
       render capsule tag
    ====================================================== */

    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.75,
          maxHeight: 88,
          overflow: "hidden",
        }}
      >
        {/* ======================================================
          loop แสดง tag
        ====================================================== */}

        {items.map((item, index) => (
          <Box
            key={`${item}-${index}`}
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              maxWidth: "100%",
              px: 1.25,
              py: 0.45,

              /* ======================================================
                 capsule shape
              ====================================================== */

              borderRadius: 999,
              border: `1px solid ${borderColor}`,
              backgroundColor:
                theme.palette.common.white,
              color,
              fontSize:
                theme.typography.caption
                  .fontSize,
              fontWeight: 500,
              lineHeight: 1.35,
              wordBreak: "break-word",
            }}
          >
            {item}
          </Box>
        ))}
      </Box>
    );
  };

  /* ======================================================
     ส่วนแสดงผล UI
  ====================================================== */

  return (
    <Box>
      {/* ======================================================
       Table หลัก
    ====================================================== */}

      <ComponentTableModel
        columns={columns}
        largest="xl"
      >
        {/* ======================================================
         loading state
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
        ) : /* ======================================================
             ไม่มีข้อมูล
          ====================================================== */

          companyDirectorData.directors
            .length === 0 ? (
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
          ) : (
            /* ======================================================
               loop ข้อมูลคณะกรรมการ
            ====================================================== */

            companyDirectorData.directors.map(
              (item, index) => {
                /* ======================================================
                   สถานะ active
                ====================================================== */

                const isActive =
                  String(item.active) ===
                  "1";

                /* ======================================================
                   URL รูปภาพ
                ====================================================== */

                const imageUrl =
                  buildPhotoUrl(
                    item.image
                  );

                return (
                  <TableRow
                    key={item.id}

                    /* ======================================================
                       click row
                    ====================================================== */

                    onClick={() =>
                      handleRowClick(
                        item.id
                      )
                    }

                    sx={{
                      /* ======================================================
                         hover effect
                      ====================================================== */

                      "&:hover": {
                        backgroundColor:
                          theme.palette
                            .action.hover,

                        cursor: "pointer",
                      },

                      /* ======================================================
                         border bottom
                      ====================================================== */

                      borderBottom:
                        theme.palette.mode ===
                          "dark"
                          ? `1px solid ${theme.palette.grey[700]}`
                          : "1px solid #F0F2F4",

                      /* ======================================================
                         highlight row ที่เลือก
                      ====================================================== */

                      backgroundColor:
                        selectedRow ===
                          item.id
                          ? fadeOut
                            ? "rgba(238, 244, 252, 0)"
                            : theme.palette
                              .mode ===
                              "dark"
                              ? theme
                                .palette
                                .grey[700]
                              : "#F0F2F4"
                          : "inherit",

                      transition:
                        "background-color 1s ease-in-out",
                    }}
                  >
                    {/* ======================================================
                        ลำดับข้อมูล
                    ====================================================== */}

                    {/* ======================================================
                        ลำดับข้อมูล
                    ====================================================== */}

                    <StyledTableCell align="center">
                      {page * rowsPerPage + index + 1}
                    </StyledTableCell>

                    {/* ======================================================
                        ชื่อคณะกรรมการ + รูปภาพ
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
                            กรณีมีรูปภาพ
                        ====================================================== */}

                        {imageUrl ? (
                          <Box
                            component="img"
                            src={imageUrl}
                            alt={item.nameTH || "director"}
                            sx={{
                              width: "15%",
                              height: "15%",
                              objectFit: "cover",
                              borderRadius: 1,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          /* ======================================================
                              placeholder รูปภาพ
                          ====================================================== */

                          <Box
                            sx={{
                              width: 72,
                              height: 72,
                              borderRadius: 2,
                              backgroundColor: "#E5E7EB",
                              flexShrink: 0,
                            }}
                          />
                        )}

                        {/* ======================================================
                            ชื่อคณะกรรมการ
                        ====================================================== */}

                        <Typography variant="body2"
                          sx={clampThreeLineSx}
                        >
                          {item.nameTH || "-"}
                        </Typography>
                      </Box>
                    </StyledTableCell>

                    {/* ======================================================
                        ตำแหน่งคณะกรรมการ
                    ====================================================== */}

                    <StyledTableCell>
                      {renderCapsules(
                        item.positionTH,
                        theme.palette.primary.main,
                        theme.palette.primary.lighter
                      )}
                    </StyledTableCell>

                    {/* ======================================================
                        คณะกรรมการชุดย่อย
                    ====================================================== */}

                    <StyledTableCell>
                      {renderCapsules(
                        item.directorTag,
                        theme.palette.secondary.main,
                        theme.palette.secondary.lighter
                      )}
                    </StyledTableCell>

                    {/* ======================================================
                        วันที่อัปโหลดข้อมูล
                    ====================================================== */}

                    <StyledTableCell align="center">
                      <ComponentsDateTable
                        fullname={item.savename || "-"}
                        startdate={item.createAt || ""}
                        updatedate={item.updateAt || null}
                      />
                    </StyledTableCell>

                    {/* ======================================================
                        สถานะเปิด / ปิดการใช้งาน
                    ====================================================== */}

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

                    {/* ======================================================
                        ปุ่มจัดการข้อมูล
                    ====================================================== */}

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
                          ถ้าสถานะ inactive แสดงปุ่มจัดการ
                      ====================================================== */}

                      {!isActive ? (
                        <>
                          {/* ======================================================
                          ปุ่มแก้ไข
                          ====================================================== */}

                          <AppIconButton
                            title="แก้ไขข้อมูลคณะกรรมการ"
                            variant="filled"
                            customColor="#FFAA37"
                            onClick={(event) => {
                              // ป้องกัน trigger row click
                              event.stopPropagation();

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
                                  theme.typography.h6
                                    .fontSize,

                                color: "#fff",
                              }}
                            />
                          </AppIconButton>

                          {/* ======================================================
                              ปุ่มลบ
                          ====================================================== */}

                          <AppIconButton
                            title="ลบข้อมูลคณะกรรมการ"
                            variant="filled"
                            customColor={
                              theme.palette.error.dark
                            }
                            onClick={(event) => {
                              // ป้องกัน trigger row click
                              event.stopPropagation();
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
                                  theme.typography.h6
                                    .fontSize,

                                color: "#fff",
                              }}
                            />
                          </AppIconButton>
                        </>
                      ) : (
                        /* ======================================================
                           ถ้า active
                           ไม่แสดงปุ่มจัดการ
                        ====================================================== */

                        <Typography fontWeight={400}>
                          -
                        </Typography>
                      )}
                    </StyledTableCell>
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
        count={companyDirectorData.counts}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={
          handleChangeRowsPerPage
        }

        rowsPerPageOptions={[15, 25]}
        labelRowsPerPage="จำนวนแสดงข้อมูลต่อหน้า"
        labelDisplayedRows={({
          from,
          to,
          count,
        }) =>
          `${from}-${to} จาก ${count !== -1
            ? count
            : `มากกว่า ${to}`
          }`
        }
      />
    </Box>
  );
};


export default ComponentsCompanyDirectorTableView;