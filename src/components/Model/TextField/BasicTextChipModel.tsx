import React, { useState } from 'react'
import type { ComponentsTextModelProps } from '../../../utils/types'
import { Box, Chip, InputBase, Typography, useTheme } from '@mui/material';

const BasicTextChipModel: React.FC<ComponentsTextModelProps> = ({
    name,
    titlename,
    subject,
    setsubject,
    topon,
    error,
    handleFieldChange,
    fieldKey,
    specify
}) => {
    const theme = useTheme();
    const [inputValue, setInputValue] = useState('');

    const phoneList = (subject)
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p !== '');

    const handleDelete = (indexToDelete: number) => {
        const updatedPhones = phoneList.filter((_, index) => index !== indexToDelete);
        setsubject(updatedPhones.join(' , '));
    };

    const handleAdd = () => {
        const newPhone = inputValue.trim();
        if (newPhone && !phoneList.includes(newPhone)) {
            const updatedPhones = [...phoneList, newPhone];
            setsubject(updatedPhones.join(' , '));
        }
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const hasError = Boolean(error);
    return (
        <Box sx={{ mt: topon }}>
            <Typography variant="body1" component="label" sx={{ alignItems: 'left' }}>
                {name}  {specify && <span style={{ color: theme.palette.error.main }}>*</span>}
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    border: hasError
                        ? `1px solid ${theme.palette.error.main}`
                        : `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    mt:1,
                    p: 0.5,
                    px: 1.5,
                    minHeight: '40px',
                    transition: 'border-color 0.2s ease-in-out',
                    '&:hover': {
                        borderColor: hasError
                            ? theme.palette.error.main
                            : theme.palette.mode === 'dark'
                                ? 'white'
                                : 'black'
                    },
                    '&:focus-within': {
                        border: `2px solid ${hasError ? theme.palette.error.main : theme.palette.primary.main}`
                    }
                }}
            >
                {phoneList.map((phone, index) => (
                    <Chip key={index} label={phone} onDelete={() => handleDelete(index)} />
                ))}
                <InputBase
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value)
                        handleFieldChange(fieldKey, e.target.value)
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={titlename}
                    size="small"
                    sx={{
                        width: '300px',
                        '& .MuiInputBase-input': {
                            fontWeight: 300
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: hasError ? theme.palette.error.main : theme.palette.grey[500],
                            opacity: 1
                        },
                        fontSize: theme.typography.body2.fontSize,
                        color: hasError ? theme.palette.error.main : theme.palette.text.primary
                    }}
                />
            </Box>

            {/* แสดงข้อความ error ด้านล่าง */}
            {hasError && (
                <Typography
                    variant="caption"
                    sx={{
                        color: theme.palette.error.main,
                        fontSize: theme.typography.caption.fontSize,
                        fontWeight: 400,
                        mt: 0.5,
                        ml: 1
                    }}
                >
                    {error}
                </Typography>
            )}
        </Box>
    )
}

export default BasicTextChipModel
