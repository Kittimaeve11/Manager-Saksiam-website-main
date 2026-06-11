"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  Fade,
  Grid,
  IconButton,
  Paper,
  Stack,
  TableCell,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { FiDownload, FiX } from "react-icons/fi";

import TextButton from "../Buttom/TextButton";
import ComponentTableModel from "../Model/Table/ComponentTableModel";
import StyledTableCell from "../Model/Table/StyledTableCell";
import ComponentsGraphLineChartDetail from "./ComponentsGraphLineChartDetail";
import type { Column } from "../../utils/types";

export type ViewCountReportItem = {
  id: number;
  code?: string;
  image?: string;
  images?: string[];
  titleTH: string;
  typeNameTH: string;
  createAt?: string;
  savename?: string;
  approveName?: string;
  approveDate?: string | null;
  views?: number | string;
  viewCount?: number | string;
  totalViews?: number | string;
  total_views?: number | string;
  visit?: number | string;
  visits?: number | string;
  stats?: {
    labels?: string[];
    total_views?: number[];
  };
};

export type ViewCountReportCriteria = {
  typeName?: string;
  startDate?: string | null;
  endDate?: string | null;
};

type ComponentsViewCountReportPanelProps = {
  rows: ViewCountReportItem[];
  fileName?: string;
  criteria?: ViewCountReportCriteria;
  onExportReport?: () => void | Promise<void>;
};

const PHOTO_BASE =
  import.meta.env.VITE_BASE_URL_API_PHOTO || import.meta.env.VITE_BASE_URL_API || "";

const columns: Column[] = [
  { id: 1, label: "ลำดับ", width: "8%", align: "center" },
  { id: 2, label: "ข่าวสารและกิจกรรม", width: "44%", align: "left" },
  { id: 3, label: "ประเภท", width: "28%", align: "left" },
  { id: 4, label: "ยอดการเข้าชม", width: "20%", align: "center" },
];

const monthLabels = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const thaiMonths = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const buildPhotoUrl = (path: string) => {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const base = String(PHOTO_BASE).replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  return `${base}/${cleanPath}`;
};

const getViews = (row: ViewCountReportItem) =>
  Number(
    row.views ??
      row.viewCount ??
      row.totalViews ??
      row.total_views ??
      row.visit ??
      row.visits ??
      0
  ) || 0;

const getChartData = (row: ViewCountReportItem) => {
  if (row.stats?.labels?.length && row.stats.total_views?.length) {
    return {
      labels: row.stats.labels,
      labels_type: "month",
      total_views: row.stats.total_views,
    };
  }

  const views = getViews(row);
  const currentMonthIndex = dayjs().month();
  const labels = monthLabels.slice(0, currentMonthIndex + 1);

  return {
    labels,
    labels_type: "month",
    total_views: labels.map((_label, index) =>
      index === currentMonthIndex ? views : 0
    ),
  };
};

const formatThaiDate = (value?: string | null) => {
  const date = dayjs(value);

  if (!value || !date.isValid()) return "-";

  return `${date.date()} ${thaiMonths[date.month()]} ${date.year() + 543}`;
};

const formatFileDate = () => dayjs().format("YYYYMMDD");

const escapeExcelCell = (value: unknown) =>
  String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const buildExcelCell = (
  value: unknown,
  options: { colspan?: number; style?: string } = {}
) => {
  const colspan = options.colspan ? ` colspan="${options.colspan}"` : "";
  const style = options.style ? ` style="${options.style}"` : "";

  return `<td${colspan}${style}>${escapeExcelCell(value)}</td>`;
};

const exportExcel = (
  rows: ViewCountReportItem[],
  criteria?: ViewCountReportCriteria
) => {
  const reportDate = formatThaiDate(dayjs().toISOString());
  const typeName = criteria?.typeName || "-";
  const startDate = formatThaiDate(criteria?.startDate);
  const endDate = formatThaiDate(criteria?.endDate);
  const header = ["ลำดับ", "รหัส", "ข่าวสารและกิจกรรม", "ประเภท", "ยอดการเข้าชม"];
  const body = rows.map((row, index) => [
    index + 1,
    row.code || row.id,
    row.titleTH || "-",
    row.typeNameTH || "-",
    getViews(row),
  ]);

  const conditionRows = [
    `<tr>${buildExcelCell("วันที่ออกรายงาน:", { style: "font-weight:700;" })}${buildExcelCell(reportDate, { colspan: 4 })}</tr>`,
    `<tr>${buildExcelCell("เงื่อนไขการค้นหา", { style: "font-weight:700;" })}${buildExcelCell(`ประเภทข่าวและกิจกรรม: ${typeName}`, { colspan: 2 })}${buildExcelCell(`จากวันที่: ${startDate}`)}${buildExcelCell(`ถึงวันที่: ${endDate}`)}</tr>`,
    `<tr>${buildExcelCell("", { colspan: 5 })}</tr>`,
  ].join("");

  const htmlRows = [
    `<tr>${header
      .map((cell) => buildExcelCell(cell, { style: "background:#e9eff8;color:#0b2b61;font-weight:700;" }))
      .join("")}</tr>`,
    ...body.map(
      (row) =>
        `<tr>${row.map((cell) => buildExcelCell(cell)).join("")}</tr>`
    ),
  ].join("");

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; font-family: Tahoma, Arial, sans-serif; width: 100%; }
          td { border: 1px solid #d7deea; padding: 8px; mso-number-format:"\\@"; vertical-align: top; }
        </style>
      </head>
      <body><table>${conditionRows}${htmlRows}</table></body>
    </html>
  `;

  const blob = new Blob(["\ufeff", html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `รายงานการเข้าชมข่าวและกิจกรรมศักดิ์สยาม_${formatFileDate()}.xls`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const ComponentsViewCountReportPanel = ({
  rows,
  criteria,
  onExportReport,
}: ComponentsViewCountReportPanelProps) => {
  const theme = useTheme();
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  useEffect(() => {
    setSelectedRowId((current) =>
      current && rows.some((row) => row.id === current) ? current : null
    );
    setPage(0);
  }, [rows]);

  const pagedRows = useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rows, rowsPerPage]
  );

  const selectedRow = rows.find((row) => row.id === selectedRowId) ?? null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: theme.palette.divider,
        backgroundColor:
          theme.palette.mode === "dark" ? theme.palette.primary.darker : "#fff",
      }}
    >
      <Stack direction="row" justifyContent="flex-start" sx={{ mb: 3 }}>
        <TextButton
          onClick={() => {
            exportExcel(rows, criteria);
            void onExportReport?.();
          }}
          disabled={rows.length === 0}
          startIcon={<FiDownload />}
          sx={{
            mx: 0,
            backgroundColor: "#0f9f5f",
            "&:hover": { backgroundColor: "#0b874f" },
          }}
        >
          ออกรายงาน Excel
        </TextButton>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: selectedRow ? 8 : 12 }}>
          <ComponentTableModel columns={columns} largest="900px">
            {pagedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row, index) => {
                const firstImage = row.image || row.images?.[0] || "";

                return (
                  <TableRow
                    key={row.id}
                    onClick={() => setSelectedRowId(row.id)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor:
                        selectedRow?.id === row.id
                          ? theme.palette.mode === "dark"
                            ? theme.palette.grey[800]
                            : "#F0F2F4"
                          : "inherit",
                      "&:hover": { backgroundColor: theme.palette.action.hover },
                    }}
                  >
                    <StyledTableCell align="center">
                      {page * rowsPerPage + index + 1}
                    </StyledTableCell>
                    <StyledTableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {firstImage && (
                          <Box
                            component="img"
                            src={buildPhotoUrl(firstImage)}
                            alt={row.titleTH}
                            sx={{
                              width: 52,
                              height: 38,
                              objectFit: "cover",
                              borderRadius: 1,
                            }}
                          />
                        )}
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>
                            {row.code || row.id}
                          </Typography>
                          <Typography variant="body2">{row.titleTH || "-"}</Typography>
                        </Box>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell>{row.typeNameTH || "-"}</StyledTableCell>
                    <StyledTableCell align="center">
                      {getViews(row).toLocaleString("th-TH")}
                    </StyledTableCell>
                  </TableRow>
                );
              })
            )}
          </ComponentTableModel>

          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={(_event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[15, 25]}
            labelRowsPerPage="จำนวนแสดงข้อมูลต่อหน้า"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
            }
          />
        </Grid>

        {selectedRow && (
          <Grid
            size={{ xs: 12, lg: 4 }}
            sx={{
              alignSelf: "flex-start",
              position: { xs: "static", lg: "sticky" },
              top: { lg: 24 },
              zIndex: 1,
            }}
          >
            <Fade in timeout={260}>
              <Stack spacing={2}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    boxShadow: "0px 4px 14px rgba(15, 23, 42, 0.08)",
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.primary.darker
                        : "#fff",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Typography
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: 1,
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? theme.palette.grey[800]
                            : "#EEF3FB",
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    >
                      {selectedRow.code || selectedRow.id}
                    </Typography>

                    <IconButton
                      onClick={() => setSelectedRowId(null)}
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      <FiX />
                    </IconButton>
                  </Stack>

                  <ComponentsGraphLineChartDetail chartData={getChartData(selectedRow)} />
                </Card>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    boxShadow: "0px 4px 14px rgba(15, 23, 42, 0.08)",
                    backgroundColor:
                      theme.palette.mode === "dark" ? theme.palette.grey[900] : "#fff",
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 0.75 }}>
                    วันที่อัปโหลดข้อมูล : {formatThaiDate(selectedRow.createAt)}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    อัปโหลดข้อมูลโดย : {selectedRow.savename || "-"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.75 }}>
                    วันที่อนุมัติ : {formatThaiDate(selectedRow.approveDate)}
                  </Typography>
                  <Typography variant="body2">
                    อนุมัติโดย : {selectedRow.approveName || "-"}
                  </Typography>
                </Paper>
              </Stack>
            </Fade>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default ComponentsViewCountReportPanel;
