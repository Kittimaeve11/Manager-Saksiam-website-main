import React from "react";
import {
  IconButton as MuiIconButton,
  Tooltip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import type { IconButtonProps } from "@mui/material";
import { lighten, darken } from "@mui/material/styles";

interface AppIconButtonProps extends IconButtonProps {
  title?: string;
  loading?: boolean;
  customColor?: string;
  variant?: "filled" | "outline" | "ghost";
}

const AppIconButton: React.FC<AppIconButtonProps> = ({
  children,
  title,
  loading = false,
  customColor,
  variant = "outline",
  sx,
  ...props
}) => {
  const theme = useTheme();

  // 🎯 default color
  const defaultColor =
    theme.palette.mode === "dark"
      ? theme.palette.grey[300]
      : theme.palette.grey[800];

  // 🎯 adaptive color function
  const getAdaptiveColor = (color: string) => {
    return theme.palette.mode === "dark"
      ? darken(color, 0.6) // dark mode → สว่างขึ้น
      : lighten(color, 0.2) ; // light mode → เข้มขึ้น
  };

  // 🎯 final color
  const adaptiveColor = customColor
    ? getAdaptiveColor(customColor)
    : undefined;

  // 🎯 background / border
  const bgColor =
    variant === "filled"
      ? adaptiveColor || theme.palette.primary.main
      : "transparent";

  const borderColor =
    adaptiveColor || theme.palette.grey[500];

  return (
    <Tooltip title={title || ""} arrow>
      <span>
        <MuiIconButton
          disabled={loading || props.disabled}
          sx={{
            borderRadius: "8px",
            padding: "10px",
            mx:1,

            // 🔹 outline
            ...(variant === "outline" && {
              border: "1px solid",
              borderColor: borderColor,
              color: adaptiveColor || defaultColor,
            }),

            // 🔹 filled
            ...(variant === "filled" && {
              backgroundColor: bgColor,
              color: "#fff",
            }),

            // 🔹 ghost
            ...(variant === "ghost" && {
              backgroundColor: "transparent",
              color: adaptiveColor || defaultColor,
            }),

            // 🔥 hover effect
            "&:hover": {
              backgroundColor:
                variant === "filled"
                  ? theme.palette.mode === "dark"
                    ? darken(bgColor, 0.1) 
                    : lighten(bgColor, 0.1)
                  : "transparent",

              borderColor:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[300]
                  : theme.palette.grey[700],
            },

            ...sx,
          }}
          {...props}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            children
          )}
        </MuiIconButton>
      </span>
    </Tooltip>
  );
};

export default AppIconButton;