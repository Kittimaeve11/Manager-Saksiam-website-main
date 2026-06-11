"use client";

import type { ReactNode } from "react";
import { Box, Fade } from "@mui/material";

type ComponentsFadeSwapViewProps = {
  viewKey: string;
  children: ReactNode;
};

const ComponentsFadeSwapView = ({
  viewKey,
  children,
}: ComponentsFadeSwapViewProps) => (
  <Fade key={viewKey} in timeout={260}>
    <Box>{children}</Box>
  </Fade>
);

export default ComponentsFadeSwapView;
