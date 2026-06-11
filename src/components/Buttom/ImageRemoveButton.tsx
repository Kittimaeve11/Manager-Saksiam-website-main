"use client";

import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import type { IconButtonProps, SxProps, Theme } from "@mui/material";
import type { MouseEvent, PointerEvent } from "react";

type ImageRemoveButtonProps = {
  onRemove: () => void;
  sx?: SxProps<Theme>;
  iconSx?: SxProps<Theme>;
  size?: IconButtonProps["size"];
};

const ImageRemoveButton = ({
  onRemove,
  sx,
  iconSx,
  size = "small",
}: ImageRemoveButtonProps) => {
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove();
  };

  return (
    <IconButton
      size={size}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      sx={[
        {
          position: "absolute",
          top: 8,
          right: 8,
          width: 26,
          height: 26,
          color: "white",
          backgroundColor: "grey.300",
          "&:hover": {
            backgroundColor: (theme) => theme.palette.error.main,
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <CloseIcon fontSize="small" sx={iconSx} />
    </IconButton>
  );
};

export default ImageRemoveButton;
