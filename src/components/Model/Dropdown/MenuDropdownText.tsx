import { Box, MenuItem, TextField, Typography } from '@mui/material';
import React from 'react'

interface MenuDropdownTextProps {
    selectedType: string | null; setSelectedType: React.Dispatch<React.SetStateAction<string | null>>
    titlename: string;
    statusOptions: {
        valuename: string;
        labelname: string;
    }[];
}


const MenuDropdownText: React.FC<MenuDropdownTextProps> = ({
    selectedType,
    setSelectedType,
    statusOptions,
    titlename,
}) => {

    const handleFileTypeChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;

        // 🔥 ถ้าเลือก "0" ให้กลับเป็น null
        if (value === "0") {
            setSelectedType(null);
        } else {
            setSelectedType(value);
        }
    };
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                alignItems: 'flex-start',
                mr: { xs: 0, md: 2, xl: 2 },
                mb: { xs: 0.5, md: 0, xl: 0 },
                width: '100%',
                minWidth: '150px'
            }}
        >
            <Typography variant="body1" sx={{ mb: 0.5 }}>
                {titlename}
            </Typography>

            <TextField
                select
                size="small"
                value={selectedType === null ? "all" : String(selectedType)}
                onChange={handleFileTypeChange}
                fullWidth
            >
                {statusOptions.map((item, index) => (
                    <MenuItem key={index + 1} value={item.valuename}>
                        {item.labelname}
                    </MenuItem>
                ))}
            </TextField>
        </Box>
    )
}

export default MenuDropdownText
