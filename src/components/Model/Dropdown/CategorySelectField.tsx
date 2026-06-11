"use client";

import type { ChangeEvent } from "react";
import {
  Box,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

type CategoryOption = {
  id: number;
  nameTH: string;
  active?: string | number;
};

type CategorySelectFieldProps = {
  label: string;
  placeholder: string;
  value: number | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  options: CategoryOption[];
  error?: string;
  required?: boolean;
};

const CategorySelectField = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  error,
  required = false,
}: CategorySelectFieldProps) => {
  const theme = useTheme();
  const hasError = Boolean(error);

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="body1" component="label" sx={{ display: "block" }}>
        {label}{" "}
        {required && <span style={{ color: theme.palette.error.main }}>*</span>}
      </Typography>

      <TextField
        select
        size="small"
        fullWidth
        value={value ?? 0}
        onChange={onChange}
        error={hasError}
        helperText={error}
        sx={{
          mt: 1,
          "& .MuiOutlinedInput-root": {
            height: 40,
            borderRadius: 1,
            backgroundColor: "#fff",
            fontSize: theme.typography.body2.fontSize,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: hasError ? theme.palette.error.main : theme.palette.divider,
          },
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: hasError ? theme.palette.error.main : theme.palette.text.primary,
          },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: hasError ? theme.palette.error.main : theme.palette.primary.main,
            borderWidth: 2,
          },
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            py: 0,
            fontWeight: 300,
            color: hasError
              ? theme.palette.error.main
              : value
                ? theme.palette.text.primary
                : theme.palette.grey[500],
          },
          "& .MuiFormHelperText-root": {
            fontSize: theme.typography.caption.fontSize,
            fontWeight: 400,
          },
        }}
        SelectProps={{
          displayEmpty: true,
          renderValue: (selected) => {
            const selectedId = Number(selected);
            const selectedOption = options.find((item) => item.id === selectedId);

            return (
              <Typography
                component="span"
                sx={{
                  color: hasError
                    ? theme.palette.error.main
                    : selectedOption
                      ? theme.palette.text.primary
                      : theme.palette.grey[500],
                  fontSize: theme.typography.body2.fontSize,
                  fontWeight: 300,
                }}
              >
                {selectedOption?.nameTH || placeholder}
              </Typography>
            );
          },
          MenuProps: {
            PaperProps: {
              sx: {
                mt: 0.5,
                borderRadius: 1,
                backgroundColor: "#fff",
                maxHeight: 300,
                boxShadow: "0 6px 18px rgba(15, 23, 42, 0.16)",
                "& .MuiMenuItem-root": {
                  minHeight: 40,
                  fontSize: theme.typography.body2.fontSize,
                  fontWeight: 300,
                  backgroundColor: "#F5F5F5",
                  "&:nth-of-type(even)": {
                    backgroundColor: "#E9E9E9",
                  },
                  "&:hover": {
                    backgroundColor: "#E0E0E0",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#E9E9E9",
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "#E0E0E0",
                  },
                },
              },
            },
          },
        }}
      >
        {options.map((item) => (
          <MenuItem
            key={item.id}
            value={item.id}
            disabled={String(item.active) === "0"}
          >
            {item.nameTH}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default CategorySelectField;
