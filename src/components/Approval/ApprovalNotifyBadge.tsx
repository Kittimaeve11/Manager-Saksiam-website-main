"use client";

import { Box } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "../../API/client";

type ApprovalModule = "news" | "policy" | "vedio";

type ApprovalNotifyBadgeProps = {
  module: ApprovalModule;
};

const moduleEndpoints: Record<ApprovalModule, string[]> = {
  news: [
    "/api/auther/showEditorialAPI",
    "/api/auther/showEditorialDataAPI",
    "/api/auther/showNewsAPI",
    "/api/auther/showNewsDataAPI",
  ],
  policy: ["/api/auther/showPolicyAPI"],
  vedio: ["/api/auther/showVedioAPI"],
};

const moduleQuery: Record<ApprovalModule, string> = {
  news:
    "?typeID=&status=&active=&startDate=&endDate=&postStartDate=&postEndDate=&createStartDate=&createEndDate=&offset=0&limit=1000",
  policy: "?active=&offset=0&limit=1000",
  vedio: "?active=&offset=0&limit=1000",
};

const getItems = (result: any): any[] => {
  const data = result?.data ?? result;
  const rawItems =
    data?.editorias ??
    data?.editorials ??
    data?.editorial ??
    data?.articles ??
    data?.news ??
    data?.policies ??
    data?.policy ??
    data?.vedio ??
    data?.vedios ??
    data?.reviews ??
    data?.items ??
    result?.result ??
    [];

  return Array.isArray(rawItems) ? rawItems : [];
};

const getActiveStatus = (item: any) =>
  String(
    item?.active ??
      item?.status ??
      item?.editoriaactive ??
      item?.editorialActive ??
      item?.policyactive ??
      item?.vedio_active ??
      item?.int_saksiam_editorial_active ??
      item?.int_saksiam_policy_active ??
      item?.int_saksiam_vedio_active ??
      ""
  );

const ApprovalNotifyBadge = ({ module }: ApprovalNotifyBadgeProps) => {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    for (const endpoint of moduleEndpoints[module]) {
      try {
        const response = await apiFetch(`${endpoint}${moduleQuery[module]}`, {
          method: "GET",
        });

        if (!response.ok) {
          if (response.status === 404) continue;
          return;
        }

        const result = await response.json();
        const waitingCount = getItems(result).filter(
          (item) => getActiveStatus(item) === "2"
        ).length;

        setCount(waitingCount);
        return;
      } catch {
        continue;
      }
    }

    setCount(0);
  }, [module]);

  useEffect(() => {
    fetchCount();

    const intervalId = window.setInterval(fetchCount, 60000);
    window.addEventListener("focus", fetchCount);
    window.addEventListener("approval-count-refresh", fetchCount);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", fetchCount);
      window.removeEventListener("approval-count-refresh", fetchCount);
    };
  }, [fetchCount]);

  if (count <= 0) return null;

  return (
    <Box
      component="span"
      aria-label={`รออนุมัติ ${count} รายการ`}
      sx={{
        minWidth: 22,
        height: 22,
        px: 0.75,
        borderRadius: "5px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ff3741",
        color: "#fff",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        ml: 1,
      }}
    >
      {count > 99 ? "99+" : count}
    </Box>
  );
};

export default ApprovalNotifyBadge;
