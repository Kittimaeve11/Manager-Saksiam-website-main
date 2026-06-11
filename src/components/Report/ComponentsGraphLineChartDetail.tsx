"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatmonnynumber } from "../../utils/Format/format-number";

type ChartDataProps = {
  chartData: {
    labels: string[];
    labels_type?: string;
    total_views: number[];
  };
};

const ComponentsGraphLineChartDetail = ({ chartData }: ChartDataProps) => {
  const theme = useTheme();
  const cleanedViews = chartData.total_views.map((value) => Number(value) || 0);
  const labels = chartData.labels.length > 0 ? chartData.labels : ["-"];
  const values = cleanedViews.length > 0 ? cleanedViews : [0];
  const data = labels.map((label, index) => ({
    label,
    views: values[index] ?? 0,
  }));

  return (
    <Card
      variant="outlined"
      sx={{
        boxShadow: "0px 4px 14px rgba(15, 23, 42, 0.08)",
        borderRadius: 2,
        borderColor: "transparent",
        backgroundColor: theme.palette.mode === "dark" ? theme.palette.primary.darker : "#fff",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: "#0a6aaa", borderRadius: "50%" }} />
          <Typography variant="body2">ยอดการเข้าชม</Typography>
        </Box>

        <Box
          sx={{
            width: "100%",
            height: 300,
            "& .recharts-wrapper, & .recharts-surface": {
              outline: "none !important",
            },
          }}
        >
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              style={{ outline: "none" }}
            >
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d7daf1" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#f1f4fa" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={theme.palette.grey[300]} vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={formatmonnynumber} />
              <Tooltip
                formatter={(value) => [formatmonnynumber(Number(value)), "ยอดการเข้าชม"]}
                labelStyle={{ color: theme.palette.text.primary }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#0a6aaa"
                strokeWidth={2}
                fill="url(#viewsGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ComponentsGraphLineChartDetail;
