import { Box, MenuItem, TextField, Typography } from '@mui/material';
import React from 'react'

interface MenuDropdownSeletetextProps {
    selectedType: string | null;
    setSelectedType: React.Dispatch<React.SetStateAction<string | null>>; // ✅ string
    titlename: string;
    statusOptions: {
        valuename: string;
        labelname: string;
    }[];
}

const MenuDropdownSeletetext: React.FC<MenuDropdownSeletetextProps> = ({
    selectedType,
    setSelectedType,
    statusOptions,
    titlename,
}) => {

    const handleFileTypeChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;
        setSelectedType(value === "all" ? null : value); 
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
                minWidth: '200px'
            }}
        >
            <Typography variant="body1" sx={{ mb: 0.5 }}>
                {titlename}
            </Typography>

            <TextField
                select
                size="small"
                value={selectedType ?? "all"}
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

export default MenuDropdownSeletetext
