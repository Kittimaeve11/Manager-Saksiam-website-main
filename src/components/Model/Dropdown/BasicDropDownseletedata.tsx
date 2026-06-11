import React from "react";
import {
  Box,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

interface BasicDropDownseleteitem {
  titlename: string;
  selecte: number | null;
  setSelected: React.Dispatch<React.SetStateAction<number | null>>;
  topon: number;
  handleFieldChange: (fieldName: string, value: unknown) => void;
  error: string | undefined;
  fieldKey: string;
  specify: boolean;
  statusOptions: {
    id: number;
    valuename: string;
    labelname: string;
  }[];
  placeholder?: string;
  showPlaceholderOption?: boolean;
}

const BasicDropDownseletedata: React.FC<BasicDropDownseleteitem> = ({
  titlename,
  selecte,
  setSelected,
  topon,
  handleFieldChange,
  error,
  fieldKey,
  specify,
  statusOptions,
  placeholder,
  showPlaceholderOption = true,
}) => {
  const theme = useTheme();
  const placeholderText = placeholder ?? `เลือก${titlename}`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nextValue = Number(event.target.value);
    const selectedValue = nextValue || null;

    setSelected(selectedValue);
    handleFieldChange(fieldKey, selectedValue);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: { xs: "flex-start", md: "flex-end" },
        alignItems: "left",
        mb: { xs: 0.5, md: 0, xl: 0 },
        mr: { xs: 0, md: 2, xl: 2 },
        width: "100%",
        mt: topon,
      }}
    >
      <Typography variant="body1" component="span" sx={{ mr: 1, mb: 1 }}>
        {titlename}{" "}
        {specify && <span style={{ color: theme.palette.error.main }}>*</span>}
      </Typography>

      <TextField
        select
        size="small"
        value={selecte ?? 0}
        onChange={handleChange}
        error={Boolean(error)}
        helperText={error}
        sx={{
          borderRadius: "8px",
          width: "100%",
          "& .MuiOutlinedInput-root": {
            height: 40,
            borderRadius: 1,
            backgroundColor: "#fff",
            fontSize: theme.typography.body2.fontSize,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: error ? theme.palette.error.main : theme.palette.divider,
          },
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: error ? theme.palette.error.main : theme.palette.text.primary,
          },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
            borderWidth: 2,
          },
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            py: 0,
            fontWeight: 300,
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
            const selectedOption = statusOptions.find((item) => item.id === selectedId);

            return (
              <Typography
                component="span"
                sx={{
                  color: error
                    ? theme.palette.error.main
                    : selectedOption
                      ? theme.palette.text.primary
                      : theme.palette.grey[500],
                  fontSize: theme.typography.body2.fontSize,
                  fontWeight: 300,
                }}
              >
                {selectedOption?.labelname || placeholderText}
              </Typography>
            );
          },
          MenuProps: {
            PaperProps: {
              sx: {
                maxHeight: 300,
                overflowY: "auto",
                backgroundColor: "#fff",
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
        {showPlaceholderOption && (
          <MenuItem value={0}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: error ? theme.palette.error.main : theme.palette.grey[400],
                fontSize: theme.typography.body2.fontSize,
              }}
            >
              {placeholderText}
            </Box>
          </MenuItem>
        )}

        {statusOptions.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            <Typography>{item.labelname}</Typography>
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default BasicDropDownseletedata;
