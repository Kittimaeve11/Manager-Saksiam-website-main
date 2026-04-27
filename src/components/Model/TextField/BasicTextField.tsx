import React from 'react'
import type { ComponentsTextModelProps } from '../../../utils/types'
import { Box, TextField, Typography, useTheme } from '@mui/material';

const BasicTextField: React.FC<ComponentsTextModelProps> = ({
    name,
    titlename,
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
            <Typography variant="body1" component="label" sx={{ alignItems: 'left' }}>
                {name}  {specify && <span style={{ color: theme.palette.error.main }}>*</span>}
            </Typography>
            <TextField
                required
                size="small"
                variant="outlined"
                placeholder={titlename}
                fullWidth
                value={subject ?? ""}
                onChange={(e) => {
                    setsubject(e.target.value)
                    handleFieldChange(fieldKey, e.target.value)
                }}
                InputProps={{
                    sx: {
                        fontSize: theme.typography.body2.fontSize,
                    },
                }}
                sx={{
                    '& .MuiInputLabel-root': {
                        color: theme.palette.primary.main
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: theme.palette.primary.main
                    },
                    '& .MuiInputBase-input': {
                        fontWeight: 300,
                        color: error ? theme.palette.error.main : theme.palette.text.primary
                    },
                    '& .MuiInputBase-input::placeholder': {
                        color: error ? theme.palette.error.main : theme.palette.grey[500],
                        opacity: 1
                    },
                    mt:1
                }}
                error={Boolean(error)}
                helperText={error}
                FormHelperTextProps={{
                    sx: {
                        fontSize: theme.typography.caption.fontSize,
                        fontWeight: 400
                    }
                }}
            />
        </Box>
    )
}

export default BasicTextField
