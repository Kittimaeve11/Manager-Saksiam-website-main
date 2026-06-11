import { Box, MenuItem, TextField, Typography } from '@mui/material';
import React from 'react';

interface MenuDropdownSeleteProps {
  selectedType: number | null;
  setSelectedType: React.Dispatch<React.SetStateAction<number | null>>;
  titlename: string;
  statusOptions: {
    id: number;
    valuename: string;
    labelname: string;
  }[];
}

const MenuDropdownSelete: React.FC<MenuDropdownSeleteProps> = ({
  selectedType,
  setSelectedType,
  statusOptions,
  titlename,
}) => {

  const handleFileTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    if (value === '') {
      setSelectedType(null);
      return;
    }

    setSelectedType(Number(value));
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
        minWidth:'150px'
      }}
    >
      <Typography variant="body1" sx={{ mb: 0.5 }}>
        {titlename}
      </Typography>

      <TextField
        select
        size="small"
        value={selectedType === null ? "0" : String(selectedType)}
        onChange={handleFileTypeChange}
        fullWidth
      >
        <MenuItem value={0}>แสดงทั้งหมด</MenuItem>

        {statusOptions.map((item) => (
          <MenuItem key={item.id} value={String(item.id)}>
            {item.labelname}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default MenuDropdownSelete;