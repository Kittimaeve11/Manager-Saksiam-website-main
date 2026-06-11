"use client";

import { Box, Typography } from "@mui/material";

type ApprovalReasonDisplayProps = {
  active: string | number | null | undefined;
  reason?: string | null;
  sx?: object;
};

export const firstApprovalReason = (...values: unknown[]) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;

    const text = String(value).trim();
    if (text) return text;
  }

  return "";
};

export const getApprovalReasonFromRecord = (
  active: string | number | null | undefined,
  record: Record<string, unknown> | null | undefined,
  prefix = ""
) => {
  if (!record) return "";

  const activeValue = String(active ?? "");
  const prefixed = (name: string) => (prefix ? `${prefix}_${name}` : name);
  const note = firstApprovalReason(
    record.note,
    record.rejectReason,
    record.reason,
    record[prefixed("note")]
  );

  if (activeValue === "4") {
    return firstApprovalReason(
      record.improvement,
      record.improvement_text,
      record.improvementText,
      record[prefixed("improvement")],
      record[prefixed("improvement_text")],
      note
    );
  }

  if (activeValue === "0") {
    return firstApprovalReason(
      record.cancellation,
      record.cancelReason,
      record[prefixed("cancellation")],
      note
    );
  }

  return note;
};

const getReasonTitle = (active: string) => {
  if (active === "4") return "เหตุผลที่ต้องแก้ไข";
  if (active === "0") return "เหตุผลที่ปิดเผยแพร่";
  return "เหตุผลที่ไม่อนุมัติ";
};

const getFallbackReason = (active: string) => {
  if (active === "4") return "ยังไม่มีการระบุเหตุผลที่ต้องแก้ไข";
  if (active === "0") return "ยังไม่มีการระบุเหตุผลที่ปิดเผยแพร่";
  return "ยังไม่มีการระบุเหตุผลที่ไม่อนุมัติ";
};

const ApprovalReasonDisplay = ({ active, reason, sx }: ApprovalReasonDisplayProps) => {
  const activeValue = String(active ?? "");

  if (!["0", "3", "4"].includes(activeValue)) {
    return null;
  }

  const title = getReasonTitle(activeValue);
  const displayReason = reason?.trim() || getFallbackReason(activeValue);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 0.75,
        flexWrap: "wrap",
        ...sx,
      }}
    >
      <Typography fontWeight={700} color="text.primary">
        {title} :
      </Typography>
      <Typography color="text.primary">{displayReason}</Typography>
    </Box>
  );
};

export default ApprovalReasonDisplay;
