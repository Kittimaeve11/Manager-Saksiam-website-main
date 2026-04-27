import {
  Snackbar,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import React from "react";
import type { NotificationProps } from "../../../utils/types";

export default function Notifications({ notify, setNotify }: NotificationProps) {
  //   const theme = useTheme();

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;

    setNotify({
      ...notify,
      isOpen: false,
    });
  };

  const config = {
    success: {
      color: "#5DC695",
      bg: "#EEFAF6",
      icon: <CheckCircleIcon />,
      title: "ดำเนินการสำเร็จ",
    },
    error: {
      color: "#F23E39",
      bg: "#FDEDED",
      icon: <ErrorIcon />,
      title: "ระบบเกิดข้อผิดพลาด",
    },
    warning: {
      color: "#F9B85D",
      bg: "#FEF9ED",
      icon: <WarningAmberIcon />,
      title: "คำเตือน",
    },
    info: {
      color: "#3EB6F0",
      bg: "#E8F6FF",
      icon: <InfoIcon />,
      title: "ข้อมูลเพิ่มเติม",
    },
  };

  const current = config[notify.type];

  return (
    <Snackbar
      open={notify.isOpen}
      autoHideDuration={5000}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      onClose={handleClose}
      sx={{
        "&.MuiSnackbar-root": { top: "10%" },
      }}
    >
      <Box
        sx={{
          position: "relative", // 🔥 สำคัญ
          display: "flex",
          alignItems: "left",
          gap: 2,
          minWidth: 350,
          p: 2,
          borderRadius: 2, // โค้งขึ้น
          border: "1px solid #fff", // ✅ ขอบขาว
          backgroundColor: current.bg,
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)", // ให้ลอยนิดๆ
        }}
      >
        {/* ICON */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: current.color,
            flexShrink: 0,
          }}
        >
          {current.icon}
        </Box>

        {/* TEXT */}
        <Box sx={{ flex: 1, color: "black", textAlign: "left" }}>
          <Typography fontWeight={600} sx={{ textAlign: "left" }}>
            {current.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{ opacity: 0.7, textAlign: "left" }}
          >
            {notify.message}
          </Typography>
        </Box>

        {/* CLOSE (fix position) */}
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            position: "absolute", // ✅ ดันไปมุม
            top: 8,
            right: 8,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Snackbar>
  );
}