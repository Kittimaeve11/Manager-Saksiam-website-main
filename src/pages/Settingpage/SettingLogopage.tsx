"use client";

import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  FormControlLabel,
  Paper,
  Switch,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import type { SwitchProps } from "@mui/material";

import { apiFetch } from "../../API/client";
import { usePageTitle } from "../../Context/PageTitleContext";
import Notifications from "../../components/Model/Pop_up/Notifications";
import PreviewImage from "../../assets/Image/c9c7000e-0247-452f-bd1b-6d4986b6ce80.png";

type ThemeMode = "normal" | "grayscale";
type NotifyType = "success" | "error" | "warning" | "info";

const SettingLogopage = () => {
  const theme = useTheme();
  const { setTitle } = usePageTitle();
  const [checked, setChecked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notify, setNotify] = useState({
    isOpen: false,
    message: "",
    type: "success" as NotifyType,
  });

  useEffect(() => {
    setTitle("ธีมเว็บไซต์");

    const fetchThemeMode = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/api/website/theme-mode", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("โหลดข้อมูลธีมเว็บไซต์ไม่สำเร็จ");
        }

        const result = await response.json();
        const mode: ThemeMode = result?.mode === "grayscale" ? "grayscale" : "normal";
        setChecked(mode === "normal");
      } catch (error) {
        setNotify({
          isOpen: true,
          message:
            error instanceof Error
              ? error.message
              : "โหลดข้อมูลธีมเว็บไซต์ไม่สำเร็จ",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchThemeMode();
  }, [setTitle]);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextChecked = event.target.checked;
    const nextMode: ThemeMode = nextChecked ? "normal" : "grayscale";
    const previousChecked = checked;

    setChecked(nextChecked);
    setSaving(true);

    try {
      const response = await apiFetch("/api/website/theme-mode", {
        method: "POST",
        body: JSON.stringify({ mode: nextMode }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.message || "เปลี่ยนธีมเว็บไซต์ไม่สำเร็จ");
      }

      setNotify({
        isOpen: true,
        message: "บันทึกธีมเว็บไซต์สำเร็จ",
        type: "success",
      });
    } catch (error) {
      setChecked(previousChecked);
      setNotify({
        isOpen: true,
        message:
          error instanceof Error
            ? error.message
            : "เปลี่ยนธีมเว็บไซต์ไม่สำเร็จ",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Paper
        elevation={0}
        sx={{
          mt: 5,
          py: 5,
          px: { xs: 2, sm: 5 },
          borderRadius: 3,
          width: "100%",
          backgroundColor:
            theme.palette.mode === "dark" ? theme.palette.primary.darker : "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              ธีมเว็บไซต์
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              เปิดเป็นธีมปกติ หรือปิดเพื่อแสดงเว็บไซต์แบบธีมไว้อาลัย
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <IOSSwitch
                checked={checked}
                onChange={handleChange}
                disabled={loading || saving}
              />
            }
            label={checked ? "ธีมปกติ" : "ธีมไว้อาลัย"}
            labelPlacement="start"
            sx={{
              m: 0,
              gap: 1.5,
              "& .MuiFormControlLabel-label": {
                fontWeight: 600,
              },
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={40} thickness={4} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              ... กำลังโหลดข้อมูล ...
            </Typography>
          </Box>
        ) : (
          <Box
            component="img"
            src={PreviewImage}
            alt="theme preview"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            sx={{
              display: "block",
              width: "100%",
              aspectRatio: "16 / 9",
              objectFit: "cover",
              borderRadius: 2,
              boxShadow: "0 18px 35px rgba(15, 23, 42, 0.14)",
              transition: "filter 0.3s ease-in-out",
              filter: checked ? "none" : "grayscale(100%)",

              userSelect: "none",
              WebkitUserDrag: "none",
            }}
          />
        )}

      </Paper>

      <Notifications notify={notify} setNotify={setNotify} />
    </Container>
  );
};

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
      },
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.5,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 13,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export default SettingLogopage;
