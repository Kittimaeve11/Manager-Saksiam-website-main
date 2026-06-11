import React from 'react'
import type { BasicDatePickerProps } from '../../../utils/types'
import { Box, Typography, useTheme } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

dayjs.locale('th');

const BasicDatePicker: React.FC<BasicDatePickerProps> = ({
    name,
    subject,
    setsubject,
    topon,
    handleFieldChange,
    error,
    fieldKey,
    specify
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ mt: topon }}>
            <Typography variant="body1" component="label" sx={{ mb: 1, display: 'block' }}>
                {name} {specify && <span style={{ color: theme.palette.error.main }}>*</span>}
            </Typography>
            <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="th"
                localeText={{
                    fieldDayPlaceholder: () => 'วัน',
                    fieldMonthPlaceholder: () => 'เดือน',
                    fieldYearPlaceholder: () => 'ปี',
                }}
            >
                <DesktopDatePicker
                    value={subject ? dayjs(subject) : null}
                    onChange={(newValue) => {
                        const value = newValue ? dayjs(newValue) : null;
                        setsubject(value);
                        handleFieldChange(fieldKey, value);
                    }}
                    format="DD MMMM YYYY"
                    aria-hidden={true}
                    sx={{
                        width: '100%',
                        '& .MuiPickersYear-yearButton.Mui-selected': {
                            color: '#fff',
                        },
                        '& .MuiInputBase-input': {
                            fontWeight: 300,
                            color: error ? theme.palette.error.main : theme.palette.text.primary,
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: error ? theme.palette.error.main : theme.palette.grey[500],
                            opacity: 1,
                        },
                        '& .MuiIconButton-root': {
                            color: error ? theme.palette.error.main : theme.palette.primary.main,
                        },
                        '& .MuiOutlinedInput-root': {
                            height: 40,
                            borderRadius: 1,
                            backgroundColor: '#fff',
                            '& fieldset': {
                                borderColor: error ? theme.palette.error.main : '#E5E5E5',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: error ? theme.palette.error.main : '#E5E5E5',
                            },
                            '&:hover fieldset': {
                                borderColor: error ? theme.palette.error.main : '#E5E5E5',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: error ? theme.palette.error.main : '#E5E5E5',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
                                borderWidth: 2,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
                            },
                        },
                    }}
                    slotProps={{
                        textField: {
                            size: 'small',
                            fullWidth: true,
                            error: Boolean(error),
                            placeholder: 'วัน เดือน ปี',
                        },
                        day: {
                            sx: {
                                color: theme.palette.primary.light,
                                '&.Mui-selected': {
                                    color: '#fff',
                                },
                            },
                        },
                        yearButton: {
                            sx: {
                                color: '#1565c0',
                                '&.Mui-selected': {
                                    color: '#fff',
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
                    sx={{
                        mt: 1,
                        ml: 2,
                        fontSize: theme.typography.caption.fontSize,
                        fontWeight: 400,
                    }}
                >
                    {error}
                </Typography>
            )}
        </Box>
    )
}

export default BasicDatePicker

