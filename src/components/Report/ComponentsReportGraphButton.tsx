"use client";

import { FiTrendingUp } from "react-icons/fi";
import { useTheme } from "@mui/material";

import AppIconButton from "../Buttom/IconButton";

type ComponentsReportGraphButtonProps = {
  active?: boolean;
  title?: string;
  activeTitle?: string;
  onClick: () => void;
};

const ComponentsReportGraphButton = ({
  active = false,
  title = "กราฟ",
  activeTitle = "กลับไปตารางข้อมูล",
  onClick,
}: ComponentsReportGraphButtonProps) => {
  const theme = useTheme();

  return (
    <AppIconButton
      title={active ? activeTitle : title}
      onClick={onClick}
      sx={{
        backgroundColor: active ? theme.palette.error.lighter : "#D6E8FF",
        borderColor: "transparent",
        color: active ?  theme.palette.error.main : theme.palette.primary.main,
        "&:hover": {
          backgroundColor: active ? "#fce8e9" : "#C7DFFF",
          borderColor: "transparent",
        },
      }}
    >
      <FiTrendingUp
        style={{
          fontSize: theme.typography.h6.fontSize,
          strokeWidth: 2.5,
        }}
      />
    </AppIconButton>
  );
};

export default ComponentsReportGraphButton;
