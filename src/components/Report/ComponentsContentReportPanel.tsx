"use client";

import { Box, Divider, Paper, Stack, Typography, useTheme } from "@mui/material";
import { FiBarChart2, FiDownload } from "react-icons/fi";

import TextButton from "../Buttom/TextButton";

export type ContentReportStatus = {
  value: string | number;
  label: string;
  color?: string;
  bg?: string;
};

export type ContentReportColumn<T> = {
  header: string;
  getValue: (row: T, index: number) => string | number | null | undefined;
};

type ComponentsContentReportPanelProps<T> = {
  title: string;
  fileName: string;
  rows: T[];
  statusOptions: ContentReportStatus[];
  getStatus: (row: T) => string | number | null | undefined;
  columns: ContentReportColumn<T>[];
};

const escapeHtml = (value: string | number | null | undefined) =>
  String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getStatusConfig = (
  statusOptions: ContentReportStatus[],
  value: string | number | null | undefined
) =>
  statusOptions.find((item) => String(item.value) === String(value)) ?? {
    value: String(value ?? ""),
    label: "-",
    color: "#6b7280",
    bg: "#f3f4f6",
  };

const ComponentsContentReportPanel = <T,>({
  title,
  fileName,
  rows,
  statusOptions,
  getStatus,
  columns,
}: ComponentsContentReportPanelProps<T>) => {
  const theme = useTheme();
  const total = rows.length;

  const summary = statusOptions.map((status) => {
    const count = rows.filter((row) => String(getStatus(row)) === String(status.value)).length;
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;

    return {
      ...status,
      count,
      percent,
    };
  });

  const handleExportExcel = () => {
    const headerRow = columns
      .map((column) => `<th>${escapeHtml(column.header)}</th>`)
      .join("");

    const bodyRows = rows
      .map((row, rowIndex) => {
        const cells = columns
          .map((column) => `<td>${escapeHtml(column.getValue(row, rowIndex))}</td>`)
          .join("");

        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Tahoma, Arial, sans-serif; }
            th { background: #e9eff8; color: #0b2b61; font-weight: 700; }
            th, td { border: 1px solid #d7deea; padding: 8px; vertical-align: top; mso-number-format:"\\@"; }
          </style>
        </head>
        <body>
          <table>
            <thead><tr>${headerRow}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", html], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `${fileName}_${date}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.mode === "dark" ? theme.palette.primary.darker : "#fff",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <FiBarChart2 color={theme.palette.primary.main} size={22} />
          <Box>
            <Typography sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              จำนวนข้อมูลที่แสดง {total.toLocaleString("th-TH")} รายการ
            </Typography>
          </Box>
        </Stack>

        <TextButton
          onClick={handleExportExcel}
          disabled={rows.length === 0}
          startIcon={<FiDownload />}
          sx={{ mx: 0, alignSelf: { xs: "flex-start", md: "center" } }}
        >
          ออกรายงาน Excel
        </TextButton>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1.5}>
        {summary.map((item) => {
          const barColor = item.color ?? theme.palette.primary.main;
          const barBg = item.bg ?? theme.palette.action.hover;

          return (
            <Box key={String(item.value)}>
              <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.count.toLocaleString("th-TH")} รายการ ({item.percent}%)
                </Typography>
              </Stack>
              <Box
                sx={{
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: barBg,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${item.percent}%`,
                    height: "100%",
                    borderRadius: 999,
                    backgroundColor: barColor,
                    transition: "width 200ms ease",
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

export { getStatusConfig };
export default ComponentsContentReportPanel;
