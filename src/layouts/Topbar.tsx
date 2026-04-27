import { Box, Typography, TextField, Button } from "@mui/material";

export default function Topbar() {
  return (
    <Box
      sx={{
        height: 70,
        bgcolor: "#3f5170",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        color: "white"
      }}
    >
      <Typography variant="h6">CRM</Typography>

      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          size="small"
          placeholder="Type here..."
          sx={{ bgcolor: "white", borderRadius: 1 }}
        />
        <Button variant="contained">Sign In</Button>
      </Box>
    </Box>
  );
}