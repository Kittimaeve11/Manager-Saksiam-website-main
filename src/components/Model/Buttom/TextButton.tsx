import {
  Button,
  CircularProgress,
  useTheme
} from "@mui/material";

import type { ButtonProps } from "@mui/material";
import { lighten, darken } from "@mui/material/styles";

interface AppButtonProps extends ButtonProps {
  loading?: boolean;
  customColor?: string;
}

const TextButton: React.FC<AppButtonProps> = ({
  children,
  loading = false,
  customColor,
  variant = "contained",
  sx,
  ...props
}) => {
  const theme = useTheme();

  // 🎯 default color
  const defaultBg =
    theme.palette.mode === "dark"
      ? theme.palette.primary.dark
      : theme.palette.primary.main;

  // 🔥 adaptive color
  const getAdaptiveColor = (color: string) => {
    return theme.palette.mode === "dark"
      ? lighten(color, 0.2)   // hdark → สว่างขึ้น
      : darken(color, 0.1);   // ligt → เข้มขึ้น
  };

  const adaptiveColor = customColor
    ? getAdaptiveColor(customColor)
    : undefined;

  const finalColor = adaptiveColor?.toString() || defaultBg;

  return (
    <Button
      variant={variant}
      disabled={loading || props.disabled}
      sx={{
        fontWeight: 600,
        textTransform: "none",
        borderRadius: 1,
        mx: { xs: 0, sm: 1 },
        whiteSpace: "nowrap",

        // 🔹 contained
        ...(variant === "contained" && {
          backgroundColor: finalColor,
          color: "#fff",
        }),

        // 🔹 outlined
        ...(variant === "outlined" && {
          borderColor: finalColor,
          color: finalColor,
        }),

        // 🔹 text
        ...(variant === "text" && {
          color: finalColor,
        }),

        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <CircularProgress size={20} color="inherit" />
      ) : (
        children
      )}
    </Button>
  );
};

export default TextButton;