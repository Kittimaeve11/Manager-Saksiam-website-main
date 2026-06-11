import { Box, Typography, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

type ComponentsDatePickerFieldProps = {
  label: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disabled?: boolean;
  sx?: SxProps<Theme>;
};

const ComponentsDatePickerField = ({
  label,
  value,
  onChange,
  required = false,
  error,
  placeholder = "วัน เดือน ปี",
  minDate,
  maxDate,
  disabled = false,
  sx,
}: ComponentsDatePickerFieldProps) => {
  const theme = useTheme();

  return (
    <Box sx={[{ width: "100%" }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      <Typography variant="body1" component="label" sx={{ mb: 0.5, display: "block" }}>
        {label} {required && <span style={{ color: theme.palette.error.main }}>*</span>}
      </Typography>

      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="th"
        localeText={{
          fieldDayPlaceholder: () => "วัน",
          fieldMonthPlaceholder: () => "เดือน",
          fieldYearPlaceholder: () => "ปี",
        }}
      >
        <DesktopDatePicker
          value={value}
          onChange={onChange}
          format="DD MMMM YYYY"
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
              error: Boolean(error),
              placeholder,
              sx: {
                "& .MuiOutlinedInput-root": {
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: "#fff",
                  "& fieldset": {
                    borderColor: error ? theme.palette.error.main : "#E5E5E5",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: error ? theme.palette.error.main : "#E5E5E5",
                  },
                  "&:hover fieldset": {
                    borderColor: error ? theme.palette.error.main : "#E5E5E5",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: error ? theme.palette.error.main : "#E5E5E5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
                    borderWidth: 2,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
                  },
                },
                "& .MuiInputBase-input": {
                  color: error ? theme.palette.error.main : theme.palette.text.primary,
                  fontWeight: 300,
                },
                "& .MuiInputBase-input::placeholder": {
                  color: error ? theme.palette.error.main : theme.palette.grey[500],
                  opacity: 1,
                },
                "& .MuiIconButton-root": {
                  color: error ? theme.palette.error.main : theme.palette.primary.main,
                },
              },
            },
            openPickerButton: {
              sx: {
                color: error ? theme.palette.error.main : theme.palette.primary.main,
              },
            },
            day: {
              sx: {
                "&.Mui-selected": {
                  color: "#fff",
                  backgroundColor: theme.palette.primary.main,
                },
              },
            },
            yearButton: {
              sx: {
                "&.Mui-selected": {
                  color: "#fff",
                },
              },
            },
          }}
        />
      </LocalizationProvider>

      {error && (
        <Typography
          variant="body2"
          color={theme.palette.error.main}
          sx={{ mt: 1, ml: 2, fontSize: theme.typography.caption.fontSize, fontWeight: 400 }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ComponentsDatePickerField;

