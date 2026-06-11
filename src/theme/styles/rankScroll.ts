import type { SxProps, Theme } from "@mui/material/styles";

export const rankScrollSx: SxProps<Theme> = {
  overflowX: "hidden",
  overflowY: "auto",
  maxHeight: 500,
  position: "relative",
  pr: 0.5,
  scrollbarWidth: "thin",
  scrollbarColor: "transparent transparent",
  overscrollBehavior: "contain",
  "&:hover": {
    scrollbarColor: "rgba(96, 96, 96, 0.75) transparent",
  },
  "&::-webkit-scrollbar": {
    width: 8,
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "transparent",
    borderRadius: 999,
    border: "2px solid transparent",
    backgroundClip: "padding-box",
  },
  "&:hover::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(96, 96, 96, 0.55)",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "rgba(96, 96, 96, 0.8)",
  },
  "&::-webkit-scrollbar-button": {
    display: "none",
    width: 0,
    height: 0,
  },
  "&::-webkit-scrollbar-corner": {
    backgroundColor: "transparent",
  },
};
