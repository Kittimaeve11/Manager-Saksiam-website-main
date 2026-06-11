import React from "react";
import { Chip, Box, useTheme, type ChipProps } from "@mui/material";
import { lighten, darken } from "@mui/material/styles";
import { statusConfig } from "../../API/StausData";

type StatusType = keyof typeof statusConfig;

interface ChipButtonProps extends ChipProps {
  status: StatusType;
}

const ChipButton: React.FC<ChipButtonProps> = ({
  status,
  sx,
  ...props
}) => {
  const theme = useTheme();

  const config = statusConfig[status];

  const getHoverColor = (color: string) => {
    return theme.palette.mode === "dark"
      ? lighten(color, 0.15)
      : darken(color, 0.08);
  };

  return (
    <Chip
      label={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            fontWeight: 400,
            color: config.text,
          }}
        >
          {config.label}
        </Box>
      }
      sx={{
        fontSize: theme.typography.body2.fontSize,
        backgroundColor: config.bg,
        borderRadius: "10px",
        transition: "all 0.25s ease",
        "&:hover": {
          backgroundColor: getHoverColor(config.bg),
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default ChipButton;